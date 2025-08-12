import React, { useEffect, useState } from "react";
import { FaBell, FaDesktop, FaEnvelope, FaCheck, FaPlus } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import "./Setting.css";

const ACCENT_PRESETS = [
  "#2563eb",
  "#60a5fa",
  "#0ea5e9",
  "#06b6d4",
  "#10b981",
  "#22c55e",
  "#84cc16",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#f43f5e",
  "#a855f7",
];

function Setting({ onLogout }) {
  // Trạng thái hiện đang áp dụng (persisted)
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [currentAccent, setCurrentAccent] = useState(
    () => localStorage.getItem("accent") || "#2b59c3"
  );
  const [currentLanguage, setCurrentLanguage] = useState(
    () => localStorage.getItem("lang") || "vi"
  );

  // Bản nháp (chỉ áp dụng khi Lưu)
  const [draftTheme, setDraftTheme] = useState(currentTheme);
  const [draftAccent, setDraftAccent] = useState(currentAccent);
  const [draftLanguage, setDraftLanguage] = useState(currentLanguage);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySms, setNotifySms] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Áp dụng trạng thái hiện tại một lần khi mở trang
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.documentElement.style.setProperty("--accent", currentAccent);
  }, []);

  // Preview theo bản nháp: áp dụng ngay nhưng KHÔNG lưu
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", draftTheme);
    document.body && document.body.setAttribute("data-theme", draftTheme);
  }, [draftTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", draftAccent);
    document.body && document.body.style.setProperty("--accent", draftAccent);
  }, [draftAccent]);

  // Nếu rời trang mà chưa Lưu, khôi phục theme hiện tại
  useEffect(() => {
    return () => {
      if (!hasSaved) {
        document.documentElement.setAttribute("data-theme", currentTheme);
        document.documentElement.style.setProperty("--accent", currentAccent);
      }
    };
  }, [currentTheme, currentAccent, hasSaved]);

  const handleSave = () => {
    // Lưu và áp dụng giao diện từ bản nháp
    setCurrentTheme(draftTheme);
    setCurrentAccent(draftAccent);
    setCurrentLanguage(draftLanguage);

    document.documentElement.setAttribute("data-theme", draftTheme);
    document.body && document.body.setAttribute("data-theme", draftTheme);
    document.documentElement.style.setProperty("--accent", draftAccent);
    document.body && document.body.style.setProperty("--accent", draftAccent);

    localStorage.setItem("theme", draftTheme);
    localStorage.setItem("accent", draftAccent);
    localStorage.setItem("lang", draftLanguage);

    setHasSaved(true);
    alert("Đã lưu cài đặt thành công!");
  };

  const resetToDefault = () => {
    setDraftTheme("dark");
    setDraftAccent("#2b59c3");
    setDraftLanguage("vi");
    setNotifyPush(true);
    setNotifyEmail(false);
    setNotifySms(false);
  };

  const cancelChanges = () => {
    setDraftTheme(currentTheme);
    setDraftAccent(currentAccent);
    setDraftLanguage(currentLanguage);
    // Khôi phục ngay preview về trạng thái hiện tại
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.documentElement.style.setProperty("--accent", currentAccent);
    setHasSaved(false);
  };

  return (
    <div className="setting-page">
      <div className="setting-hero">
        <h1>Cài đặt giao diện</h1>
        <p>
          Tùy biến trải nghiệm của bạn: chủ đề, màu nhấn, thông báo và ngôn ngữ.
        </p>
      </div>

      <div className="setting-grid">
        {/* Theme */}
        <section className="setting-card">
          <div className="setting-card__header">
            <h2>Chủ đề</h2>
            <span className="setting-card__subtitle">Áp dụng khi bấm Lưu</span>
          </div>
          <div className="theme-toggle">
            <button
              className={`theme-toggle__btn ${
                draftTheme === "light" ? "active" : ""
              }`}
              onClick={() => setDraftTheme("light")}
            >
              <FiSun /> <span>Light</span>
            </button>
            <button
              className={`theme-toggle__btn ${
                draftTheme === "dark" ? "active" : ""
              }`}
              onClick={() => setDraftTheme("dark")}
            >
              <FiMoon /> <span>Dark</span>
            </button>
          </div>
        </section>

        {/* Accent color */}
        <section className="setting-card">
          <div className="setting-card__header">
            <h2>Màu nhấn</h2>
            <span className="setting-card__subtitle">
              Chọn màu nổi bật cho hệ thống
            </span>
          </div>
          <div className="accent-swatches">
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                className={`accent-swatch ${draftAccent === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => setDraftAccent(c)}
                aria-label={`Chọn màu ${c}`}
              >
                {draftAccent === c && <FaCheck />}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section className="setting-card">
          <div className="setting-card__header">
            <h2>Thông báo</h2>
            <span className="setting-card__subtitle">
              Chọn cách nhận thông báo
            </span>
          </div>
          <div className="toggle-list">
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifyPush}
                onChange={(e) => setNotifyPush(e.target.checked)}
              />
              <span className="toggle__slider"></span>
              <span className="toggle__label">
                <FaDesktop /> Thông báo đẩy
              </span>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
              <span className="toggle__slider"></span>
              <span className="toggle__label">
                <FaEnvelope /> Email
              </span>
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
              />
              <span className="toggle__slider"></span>
              <span className="toggle__label">
                <FaBell /> SMS
              </span>
            </label>
          </div>
        </section>

        {/* Language */}
        <section className="setting-card">
          <div className="setting-card__header">
            <h2>Ngôn ngữ</h2>
            <span className="setting-card__subtitle">Language</span>
          </div>
          <div className="field">
            <select
              value={draftLanguage}
              onChange={(e) => setDraftLanguage(e.target.value)}
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </section>
      </div>

      <div className="setting-actions">
        <button className="btn btn-secondary" onClick={resetToDefault}>
          Khôi phục mặc định
        </button>
        <button className="btn" onClick={cancelChanges}>
          Hủy thay đổi
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

export default Setting;
