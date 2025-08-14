import { useEffect, useState } from "react";
import { useLanguageContext } from "../../contexts/LanguageContext";
import "./Accident.css";

import {
  normalizeStatus,
  inferAccidentStatusFromResponders,
  findNearestResponders,
} from "../../utils/dispatch";

/* ===== Cấu hình API ===== */
const BASE_URL = "http://localhost:8087/quet/api";
const AUTH_TOKEN = ""; // "Bearer <token>" nếu cần

/* ===== Tham số thuật toán ===== */
const SPEED_KMH_DEFAULT = 50;
const MIN_ETA_MIN = 2;

/* ===== Helpers UI ===== */
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
function formatCamera(id) {
  const m = String(id || "").match(/\d+/);
  return m ? `cam ${m[0]}` : "-";
}
function formatType(type) {
  const s = String(type || "").toLowerCase();
  if (s.startsWith("car")) return "car";
  return s.replace(/_.*/, "") || "-";
}

/* ===== API wrapper ===== */
async function apiCall(path, method = "GET", body) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json" };
  if (AUTH_TOKEN) {
    headers.Authorization = AUTH_TOKEN.startsWith("Bearer")
      ? AUTH_TOKEN
      : `Bearer ${AUTH_TOKEN}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = {};
  try {
    json = await res.json();
  } catch {
    /* empty */
  }
  if (!res.ok) throw new Error(json?.message || `HTTP ${res.status}`);
  return json;
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
  const [previewResponders, setPreviewResponders] = useState([]); // {unit_type,name,distance,eta}

  /* ===== Load danh sách sự cố ===== */
  const fetchAccidents = async () => {
    setLoading(true);
    try {
      const res = await apiCall("/accidents", "GET");
      const raw = Array.isArray(res) ? res : res?.data ?? [];
      const list = raw.map((a) => ({
        ...a,
        status: inferAccidentStatusFromResponders(a.responder),
      }));
      setAccidents(list);
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

  /* ===== Mở popup điều động: lấy responders thật từ API và tính gần nhất ===== */
  const openDispatch = async (acc) => {
    if (normalizeStatus(acc.status) !== "pending") return;
    if (!(acc.lat && acc.lng)) {
      alert("Sự cố chưa có toạ độ GPS để điều động.");
      return;
    }

    try {
      const respondersRes = await apiCall("/responders", "GET");
      const responders = Array.isArray(respondersRes)
        ? respondersRes
        : respondersRes?.data ?? [];

      const nearest = findNearestResponders(acc, responders, {
        radiusKm: 10.5,
        limit: 3,
        minEtaMin: MIN_ETA_MIN,
        speedByType: { police: 50, ambulance: 50, firefighter: 50 },
        defaultSpeedKmh: SPEED_KMH_DEFAULT,
      });

      if (!nearest.length) {
        alert("Không có đơn vị phù hợp trong bán kính 10km!");
        return;
      }

      setSelectedAccident(acc);
      setPreviewResponders(nearest);
      setDispatchOpen(true);
    } catch (e) {
      console.error(e);
      alert("Không tải được danh sách đơn vị phản ứng!");
    }
  };

  /* ===== Xác nhận điều động: gọi API để lưu (tuỳ backend) và cập nhật UI ===== */
  const confirmDispatch = async () => {
    try {
      const payload = {
        responders: previewResponders.map((r, idx) => ({
          unit_id: `disp_${idx + 1}`,
          unit_type: r.unit_type,
          status: "en_route",
          name: r.name,
          eta_min: r.eta,
          distance_km: Number(r.distance.toFixed(2)),
        })),
      };

      // Thử gọi endpoint lưu điều động (điều chỉnh cho khớp backend của bạn)
      try {
        await apiCall(
          `/accidents/${selectedAccident.accident_id}/dispatch`,
          "POST",
          payload
        );
      } catch (e) {
        console.warn("Fallback local update only:", e.message);
      }

      // Cập nhật UI local
      setAccidents((prev) =>
        prev.map((a) =>
          a.accident_id === selectedAccident.accident_id
            ? {
                ...a,
                status: "en_route",
                responder: [...(a.responder ?? []), ...payload.responders],
              }
            : a
        )
      );

      // nếu popup chi tiết đang mở cùng vụ, cập nhật ngay
      setDetailAcc((prev) =>
        prev && prev.accident_id === selectedAccident.accident_id
          ? {
              ...prev,
              status: "en_route",
              responder: [...(prev.responder ?? []), ...payload.responders],
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

                  {/* Status: căn giữa cả dọc & ngang */}
                  <td className="center-col">
                    <div className="cell-center">
                      <span className={`status-badge ${statusClass(code)}`}>
                        {VI_LABELS[code]}
                      </span>
                    </div>
                  </td>

                  {/* Nút điều động: căn giữa dọc & ngang */}
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
                  <strong>Đơn vị phản ứng:</strong>
                  <div className="space-y-2">
                    {(detailAcc?.responder ?? []).length === 0 && (
                      <div>Không có</div>
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
