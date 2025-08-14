import { useEffect, useState } from "react";
import { useLanguageContext } from "../../contexts/LanguageContext";
import "./Accident.css";

const USE_MOCK = true; // đổi false nếu muốn gọi API thật
const BASE_URL = "http://localhost:8087/quet/api";
const AUTH_TOKEN = "";

// tốc độ mặc định và ETA tối thiểu (phút)
const SPEED_KMH_DEFAULT = 50;
const MIN_ETA_MIN = 2;

/* ===== Fake API data (demo) ===== */
const MOCK_SERVER_RESPONSE = {
  data: [
    {
      accident_id: 1012,
      road_name: "QL1A",
      camera_id: "cam_12",
      timestamp: "2025-08-04T23:45:00Z",
      accident_type: "car_crash",
      image_url:
        "https://nld.mediacdn.vn/291774122806476800/2024/2/9/tainan-16831577744301894433461-1707472121000345252032.jpeg",
      responder: [
        {
          unit_id: "Trung tâm y tế",
          unit_type: "ambulance",
          status: "en_route",
        },
        { unit_id: "Nguyễn Văn Tèo", unit_type: "police", status: "cleared" },
      ],
      lat: 10.7779,
      lng: 106.7009,
    },
    {
      accident_id: 1013,
      road_name: "QL1A",
      camera_id: "cam_12",
      timestamp: "2025-08-04T23:45:00Z",
      accident_type: "car_crash",
      image_url:
        "https://th.bing.com/th/id/R.d8171a2d9653a2872981c77d28aefbe3?rik=kmuvoBX4K471iA&riu=http%3a%2f%2fpic1.hebei.com.cn%2f003%2f024%2f459%2f00302445993_e81a5abd.jpg&ehk=Wy7MQezsmvLlmxIdpJvPwEvpC6r5DSmRffnOWNf9G3c%3d&risl=&pid=ImgRaw&r=0",
      responder: [
        {
          unit_id: "Bệnh viện quận 1",
          unit_type: "ambulance",
          status: "en_route",
        },
      ],
      lat: 10.7792,
      lng: 106.7055,
    },
    {
      accident_id: 1014, // pending
      road_name: "QL51",
      camera_id: "cam_22",
      timestamp: "2025-08-05T08:30:00Z",
      accident_type: "car_crash",
      image_url:
        "https://nld.mediacdn.vn/291774122806476800/2024/2/9/tainan-16831577744301894433461-1707472121000345252032.jpeg",
      responder: [],
      lat: 10.7779,
      lng: 106.7009,
    },
  ],
};

/* ===== Responders có GPS để tính khoảng cách ===== */
const MOCK_RESPONDERS = [
  {
    unit_type: "police",
    name: "Nguyễn Văn A",
    lat: 10.7775,
    lng: 106.701,
    status: "available",
  },
  {
    unit_type: "police",
    name: "Trần Văn B",
    lat: 10.8679,
    lng: 106.7009,
    status: "available",
  }, // ~10km
  {
    unit_type: "ambulance",
    name: "Trạm 115 KV",
    lat: 10.779,
    lng: 106.704,
    status: "available",
  },
  {
    unit_type: "firefighter",
    name: "Đội PCCC 1",
    lat: 10.781,
    lng: 106.707,
    status: "busy",
  },
];

/* ===== Helpers ===== */
function normalizeStatus(raw) {
  const s = String(raw || "")
    .trim()
    .toLowerCase();
  const allowed = new Set(["en_route", "cleared", "canceled"]);
  return allowed.has(s) ? s : "pending";
}

const VI_LABELS = {
  pending: "chờ xác nhận",
  en_route: "đang đến",
  cleared: "đã đến",
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

async function apiCall(path, method = "GET", body) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (AUTH_TOKEN) headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try {
    json = await res.json();
  } catch {
    /* ignore empty body */
  }
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json;
}

/** Suy luận trạng thái vụ việc từ responders, theo mức ưu tiên: */
function inferAccidentStatus(accident) {
  const responders = Array.isArray(accident.responder)
    ? accident.responder
    : [];
  const codes = responders.map((r) => normalizeStatus(r.status));
  if (codes.includes("cleared")) return "cleared";
  if (codes.includes("en_route")) return "en_route";
  if (codes.includes("canceled")) return "canceled";
  return "pending";
}

function formatCamera(id) {
  const m = String(id || "").match(/\d+/);
  return m ? `cam ${m[0]}` : "-";
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

  // Popups
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailAcc, setDetailAcc] = useState(null);

  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [previewResponders, setPreviewResponders] = useState([]);

  const fetchAccidents = async () => {
    setLoading(true);
    try {
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 250));
        const list = (MOCK_SERVER_RESPONSE?.data ?? []).map((a) => ({
          ...a,
          status: inferAccidentStatus(a),
        }));
        setAccidents(list);
      } else {
        const res = await apiCall("/accidents", "GET");
        const raw = Array.isArray(res) ? res : res?.data ?? [];
        const list = raw.map((a) => ({ ...a, status: inferAccidentStatus(a) }));
        setAccidents(list);
      }
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

  return (
    <div className="accident">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t("accident.table.id")}</th>
              <th>{t("accident.table.road")}</th>
              <th>{t("accident.table.time")}</th>
              <th>{t("accident.table.image")}</th>
              <th>Camera</th>
              <th>Loại</th>
              <th className="center-col">{t("accident.table.status")}</th>
              <th className="center-col">Điều động</th>
            </tr>
          </thead>
          <tbody>
            {accidents.map((item) => {
              const id = item.accident_id ?? item.id;
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
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt="Tai nạn"
                        className="thumb"
                        onClick={() => openDetail(item)}
                        role="button"
                      />
                    ) : (
                      "-"
                    )}
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

                  {/* Status */}
                  <td className="center-col">
                    <div className="cell-center">
                      <span className={`status-badge ${statusClass(code)}`}>
                        {VI_LABELS[code]}
                      </span>
                    </div>
                  </td>

                  {/* Nút điều động (chỉ khi pending) */}
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
            {accidents.length === 0 && !loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 16 }}>
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Popup Chi tiết */}
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

                {detailAcc?.image_url && (
                  <img src={detailAcc.image_url} alt="Chi tiết tai nạn" />
                )}

                <div className="responders-grid">
                  <strong>Đơn vị tiếp nhận:</strong>
                  <div className="space-y-2">
                    {(detailAcc?.responder ?? []).length === 0 && (
                      <div>chưa có</div>
                    )}
                    {(detailAcc?.responder ?? []).map((r, idx) => (
                      <div key={idx} className="modal-row">
                        <div>
                          <div className="font-medium">
                            {r.name || r.unit_id}
                          </div>
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
