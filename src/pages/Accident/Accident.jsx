import { useEffect, useRef, useState } from "react";
import "./Accident.css";

const API_BASE = "http://localhost:8087";

const getRoad = (o) => o?.road_name ?? o?.road ?? o?.route ?? "—";
const getTs = (o) => o?.timestamp ?? o?.time ?? o?.ts ?? null;
const parseDate = (ts) => {
  if (!ts) return new Date(NaN);
  if (typeof ts === "number") return new Date(ts < 1e12 ? ts * 1000 : ts);
  const s = String(ts).trim();
  return new Date(s.includes("T") ? s : s.replace(" ", "T"));
};
const formatTime = (ts) => {
  const d = parseDate(ts);
  return isNaN(d)
    ? "—"
    : d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
};

const UNIT_LABELS = {
  ambulance: "Cấp cứu 115",
  police: "CSGT",
  fire: "Cứu hỏa",
  rescue: "Cứu nạn",
};

const getAccStatusText = (res = []) => {
  if (!res.length) return "chờ xác nhận";
  if (res.some((r) => r.status === "on_scene")) return "Đang xử lý";
  if (res.some((r) => r.status === "en_route")) return "Đang đến";
  if (res.every((r) => r.status === "cleared")) return "Đã xử lý";
  if (res.every((r) => r.status === "canceled")) return "Đã hủy";
  return "chờ xác nhận";
};
const getAccStatusClass = (res = []) => {
  if (!res.length) return "status-open";
  if (res.some((r) => r.status === "on_scene")) return "status-processing";
  if (res.some((r) => r.status === "en_route")) return "status-processing";
  if (res.every((r) => r.status === "cleared")) return "status-closed";
  if (res.every((r) => r.status === "canceled")) return "status-canceled";
  return "status-open";
};

// tránh setState thừa
const shallowEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export default function Accident() {
  const [accidents, setAccidents] = useState([]);
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    unit_type: "ambulance",
    status: "en_route",
  });

  const didInit = useRef(false);

  const fetchAccidents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/accidents`);
      const json = await res.json();
      const next = json?.data || [];
      setAccidents((prev) => (shallowEqual(prev, next) ? prev : next));

      if (selectedAccident) {
        const refreshed = next.find(
          (a) => a.accident_id === selectedAccident.accident_id
        );
        if (refreshed && !shallowEqual(refreshed, selectedAccident)) {
          setSelectedAccident(refreshed);
        }
      }
    } catch (e) {
      console.error("Fetch /api/accidents lỗi:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchAccidents();
  }, []);

  const handleRowClick = (item) => {
    setSelectedAccident(item);
    setShowAddForm(false);
  };

  const handleAddResponder = async (e) => {
    e.preventDefault();
    if (!selectedAccident || submitting) return;

    setSubmitting(true);
    try {
      // Gửi lên server
      await fetch(`${API_BASE}/api/responders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accident_id: selectedAccident.accident_id,
          unit_type: formData.unit_type,
          status: formData.status,
        }),
      });

      // Cập nhật UI (optimistic)
      const newResponder = {
        unit_type: formData.unit_type,
        status: formData.status,
      };

      setAccidents((prev) =>
        prev.map((a) =>
          a.accident_id === selectedAccident.accident_id
            ? { ...a, responder: [...(a.responder || []), newResponder] }
            : a
        )
      );
      setSelectedAccident((prev) =>
        prev
          ? { ...prev, responder: [...(prev.responder || []), newResponder] }
          : prev
      );

      setFormData({ unit_type: "ambulance", status: "en_route" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Lỗi thêm responder:", err);
      alert("Lỗi mạng khi thêm cán bộ xử lý");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="accident">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Road</th>
              <th>Time</th>
              <th>Image</th>
              <th>Responders</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accidents.map((item) => {
              const road = getRoad(item);
              const time = formatTime(getTs(item));
              const responders = item.responder || [];

              return (
                <tr key={item.accident_id} onClick={() => handleRowClick(item)}>
                  <td className="clickable-id">{item.accident_id}</td>
                  <td>{road}</td>
                  <td>{time}</td>
                  <td>
                    <img
                      src={item.image_url}
                      alt="Accident"
                      width="100"
                      loading="lazy"
                      onError={(e) => {
                        const el = e.currentTarget;
                        if (!el.dataset.fallback) {
                          el.dataset.fallback = "1";
                          el.src =
                            "https://via.placeholder.com/300x180?text=No+Image";
                        }
                      }}
                    />
                  </td>
                  <td>
                    {responders.length ? (
                      responders.map((r, idx) => (
                        <div key={idx}>
                          {UNIT_LABELS[r.unit_type] || r.unit_type}
                        </div>
                      ))
                    ) : (
                      <em>Chưa có</em>
                    )}
                  </td>
                  {/* Status: badge nằm giữa, đổi màu theo class */}
                  <td className="status-cell">
                    <span className={`badge ${getAccStatusClass(responders)}`}>
                      {getAccStatusText(responders)}
                    </span>
                  </td>
                </tr>
              );
            })}
            {!accidents.length && !loading && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", opacity: 0.7 }}>
                  Chưa có dữ liệu — hãy tạo qua Postman
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedAccident && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedAccident(null);
            setShowAddForm(false);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Chi tiết tai nạn</h2>
            <p>
              <strong>ID:</strong> {selectedAccident.accident_id}
            </p>
            <p>
              <strong>Đường:</strong> {getRoad(selectedAccident)}
            </p>
            <p>
              <strong>Thời gian:</strong> {formatTime(getTs(selectedAccident))}
            </p>
            <img
              src={selectedAccident.image_url}
              alt="Accident Detail"
              width="200"
              loading="lazy"
              onError={(e) => {
                const el = e.currentTarget;
                if (!el.dataset.fallback) {
                  el.dataset.fallback = "1";
                  el.src = "https://via.placeholder.com/300x180?text=No+Image";
                }
              }}
            />

            <h3>Responders</h3>
            <ul>
              {(selectedAccident.responder || []).map((r, idx) => (
                <li key={idx}>{UNIT_LABELS[r.unit_type] || r.unit_type}</li>
              ))}
            </ul>

            {showAddForm ? (
              <form
                onSubmit={handleAddResponder}
                className="add-responder-form"
              >
                <select
                  value={formData.unit_type}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, unit_type: e.target.value }))
                  }
                >
                  <option value="ambulance">Cấp cứu 115</option>
                  <option value="police">CSGT</option>
                  <option value="fire">Cứu hỏa</option>
                  <option value="rescue">Cứu nạn</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="en_route">Đang đến</option>
                  <option value="on_scene">Đang xử lý</option>
                  <option value="cleared">Đã xử lý</option>
                  <option value="canceled">Đã hủy</option>
                </select>
                <div className="actions">
                  <button type="submit" disabled={submitting}>
                    {submitting ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="secondary"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddForm(true)}>
                + Thêm cán bộ xử lý
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
