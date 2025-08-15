import { useEffect, useState } from "react";
import { useLanguageContext } from "../../contexts/LanguageContext";
import "./Accident.css";

// tốc độ mặc định và ETA tối thiểu (phút)
const SPEED_KMH_DEFAULT = 50;
const MIN_ETA_MIN = 2;

// Helpers
function normalizeStatus(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  const map = {
    en_route: ["en_route", "đang đến"],
    cleared: ["cleared", "đã xử lý"],
    canceled: ["canceled", "đã hủy"],
  };
  for (const [k, arr] of Object.entries(map)) if (arr.includes(s)) return k;
  return "pending";
}

const VI_LABELS = {
  pending: "chờ xác nhận",
  en_route: "đang đến",
  cleared: "đã xử lý",
  canceled: "đã hủy",
};

function statusClass(code) {
  switch (code) {
    case "pending":
      return "status-open";
    case "en_route":
      return "status-processing";
    case "cleared":
      return "status-closed";
    case "canceled":
      return "status-canceled";
    default:
      return "status-open";
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function inferAccidentStatus(accident) {
  const responders = Array.isArray(accident.responder)
    ? accident.responder
    : [];
  const anyEnRoute = responders.some(
    (r) => normalizeStatus(r.status) === "en_route"
  );
  return anyEnRoute ? "en_route" : "pending";
}

function formatCamera(id) {
  if (!id) return "-";
  return `cam ${id}`;
}
function formatType(type) {
  const s = String(type || "").toLowerCase();
  if (s.startsWith("car")) return "car";
  return s.replace(/_.*/, "") || "-";
}

export default function Accident() {
  const { t } = useLanguageContext();
  const [accidents, setAccidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(""); // Thêm state search

  // Popups
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAcc, setDetailAcc] = useState(null);

  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [previewResponders, setPreviewResponders] = useState([]); // {unit_type,name,distance,eta}

  // Lấy danh sách tai nạn từ API thật
  const fetchAccidents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8087/quet/api/accidents", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const raw = Array.isArray(data) ? data : data?.data ?? [];
      const list = raw.map((a) => ({
        accident_id: a.accidentId,
        road_name: a.roadName,
        camera_id: a.cameraId,
        timestamp: a.timestamp,
        accident_type: a.accidentType,
        image_url: a.imageUrl,
        responder: Array.isArray(a.responder)
          ? a.responder.map((r) => ({
              unit_id: r.unitId,
              unit_type: r.unitType,
              status: r.status,
            }))
          : [],
        status: inferAccidentStatus(a),
        lat: a.lat,
        lng: a.lng,
      }));
      setAccidents(list);
    } catch {
      setAccidents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccidents();
  }, []);

  const openDetail = (acc) => {
    setDetailAcc(acc);
    setDetailOpen(true);
  };

  const openDispatch = (acc) => {
    if (normalizeStatus(acc.status) !== "pending") return;
    if (!(acc.lat && acc.lng)) {
      alert("Sự cố chưa có toạ độ GPS để điều động.");
      return;
    }

    const speedByType = { police: 50, ambulance: 50, firefighter: 50 };

    const nearest = MOCK_RESPONDERS.filter((r) => r.status === "available")
      .map((r) => {
        const distance = haversine(acc.lat, acc.lng, r.lat, r.lng); // km
        const speed = speedByType[r.unit_type] ?? SPEED_KMH_DEFAULT;
        const eta = Math.max(MIN_ETA_MIN, Math.ceil((distance / speed) * 60)); // phút
        return { unit_type: r.unit_type, name: r.name, distance, eta };
      })
      .filter((r) => r.distance <= 10.5)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3);

    if (!nearest.length) {
      alert("Không có đơn vị phù hợp trong bán kính 10km!");
      return;
    }
    setSelectedAccident(acc);
    setPreviewResponders(nearest);
    setDispatchOpen(true);
  };

  const confirmDispatch = async () => {
    try {
      const dispatched = previewResponders.map((r, idx) => ({
        unit_id: `disp_${idx + 1}`,
        unit_type: r.unit_type,
        status: "en_route",
        name: r.name,
      }));

      setAccidents((prev) =>
        prev.map((a) =>
          a.accident_id === selectedAccident.accident_id
            ? {
                ...a,
                status: "en_route",
                responder: [...(a.responder ?? []), ...dispatched],
              }
            : a
        )
      );

      // nếu popup chi tiết đang mở cùng vụ, cập nhật ngay trong modal
      setDetailAcc((prev) =>
        prev && prev.accident_id === selectedAccident.accident_id
          ? {
              ...prev,
              status: "en_route",
              responder: [...(prev.responder ?? []), ...dispatched],
            }
          : prev
      );

      setDispatchOpen(false);
      alert(
        `Đã điều động ${previewResponders.length} đơn vị đến sự cố #${selectedAccident.accident_id}`
      );
    } catch (e) {
      console.error(e);
      alert("Có lỗi khi điều động!");
    }
  };

  // Lọc danh sách theo search (theo id, road_name, camera_id, accident_type)
  const filteredAccidents = accidents.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      String(item.accident_id).toLowerCase().includes(q) ||
      (item.road_name || "").toLowerCase().includes(q) ||
      (item.camera_id ? String(item.camera_id).toLowerCase() : "").includes(
        q
      ) ||
      (item.accident_type || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="accident">
      <div className="table-container">
        <h2 className="accident-title">
          {t("accident.title") || "DANH SÁCH TAI NẠN"}
        </h2>
        <input
          className="accident-search"
          type="text"
          placeholder={
            t("accident.searchPlaceholder") ||
            "Tìm kiếm mã, đường, camera, loại..."
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <table>
          <thead>
            <tr>
              <th classname="table-title">{t("accident.table.id")}</th>
              <th classname="table-title">{t("accident.table.road")}</th>
              <th classname="table-title">{t("accident.table.time")}</th>
              <th classname="table-title">Camera</th>
              <th classname="table-title">{t("accident.table.type")}</th>
              <th className="center-col">{t("accident.table.status")}</th>
              <th className="center-col">
                {t("accident.confirmDispatchTitle")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAccidents.map((item) => {
              const id = item.accident_id;
              const code = normalizeStatus(item.status);
              const isPending = code === "pending";
              return (
                <tr key={id}>
                  <td>
                    <button
                      className="link-like"
                      onClick={() => openDetail(item)}
                    >
                      <b>{id}</b>
                    </button>
                  </td>
                  <td>
                    <button
                      className="link-like"
                      onClick={() => openDetail(item)}
                    >
                      {item.road_name || "-"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="link-like"
                      onClick={() => openDetail(item)}
                    >
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleString("vi-VN")
                        : "-"}
                    </button>
                  </td>
                  <td>
                    <button
                      className="link-like"
                      onClick={() => openDetail(item)}
                    >
                      {formatCamera(item.camera_id)}
                    </button>
                  </td>
                  <td>
                    <button
                      className="link-like"
                      onClick={() => openDetail(item)}
                    >
                      {formatType(item.accident_type)}
                    </button>
                  </td>
                  <td className="center-col">
                    <div className="cell-center">
                      <span className={`status-badge ${statusClass(code)}`}>
                        {VI_LABELS[code]}
                      </span>
                    </div>
                  </td>
                  <td className="center-col">
                    <div className="cell-center">
                      {isPending && (
                        <button
                          className="btn btn-primary"
                          onClick={() => openDispatch(item)}
                        >
                          Điều động
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredAccidents.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 16 }}>
                  {t("accident.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Popup Chi tiết (2 cột) */}
        {detailOpen && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onClick={() => setDetailOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setDetailOpen(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{t("accident.detailTitle")}</h3>
                <button
                  className="icon-button"
                  onClick={() => setDetailOpen(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                <p>
                  <strong>{t("accident.table.id")}:</strong>{" "}
                  {detailAcc?.accident_id}
                </p>
                <p>
                  <strong>{t("accident.road")}:</strong> {detailAcc?.road_name}
                </p>
                <p>
                  <strong>Camera:</strong> {formatCamera(detailAcc?.camera_id)}
                </p>
                <p>
                  <strong>Loại:</strong> {formatType(detailAcc?.accident_type)}
                </p>
                <p>
                  <strong>{t("accident.time")}:</strong>{" "}
                  {detailAcc?.timestamp
                    ? new Date(detailAcc.timestamp).toLocaleString("vi-VN")
                    : "-"}
                </p>
                <p>
                  <strong>{t("accident.status")}:</strong>{" "}
                  {VI_LABELS[normalizeStatus(detailAcc?.status)]}
                </p>

                {/* Hiện ảnh nếu có */}
                {detailAcc?.image_url && (
                  <img
                    src={detailAcc.image_url}
                    alt="Chi tiết tai nạn"
                    style={{ maxWidth: "100%", margin: "12px 0" }}
                  />
                )}

                <div className="responders-grid">
                  <strong>Đơn vị phản ứng:</strong>
                  <div className="space-y-2">
                    {(detailAcc?.responder ?? []).length === 0 && (
                      <div>Không có</div>
                    )}
                    {(detailAcc?.responder ?? []).map((r, idx) => (
                      <div key={idx} className="modal-row">
                        <div>
                          <div className="font-medium">{r.unit_id}</div>
                          <div className="text-xs" style={{ color: "#64748b" }}>
                            {r.unit_type}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {VI_LABELS[normalizeStatus(r.status)] || r.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn" onClick={() => setDetailOpen(false)}>
                  {t("accident.close")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Popup Điều động */}
        {dispatchOpen && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onClick={() => setDispatchOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setDispatchOpen(false)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Xác nhận điều động</h3>
                <button
                  className="icon-button"
                  onClick={() => setDispatchOpen(false)}
                  aria-label="Đóng"
                >
                  ×
                </button>
              </div>
              <div className="modal-body single-column">
                <p className="mb-2" style={{ gridColumn: "span 2" }}>
                  Sự cố <strong>#{selectedAccident?.accident_id}</strong> –{" "}
                  {selectedAccident?.road_name}
                </p>
                <div className="space-y-2" style={{ gridColumn: "span 2" }}>
                  {previewResponders.map((r, idx) => (
                    <div key={idx} className="modal-row">
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs" style={{ color: "#64748b" }}>
                          {r.unit_type}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-green-700">{r.eta} phút</div>
                        <div className="text-xs" style={{ color: "#64748b" }}>
                          ~{r.distance.toFixed(2)} km
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={() => setDispatchOpen(false)}>
                  Hủy
                </button>
                <button className="btn btn-success" onClick={confirmDispatch}>
                  Xác nhận điều động
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
