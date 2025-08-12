import React, { useEffect, useState } from "react";
import { FaCheck, FaDesktop, FaEnvelope, FaBell } from "react-icons/fa";
import { FiSun, FiMoon } from "react-icons/fi";
import { useLanguageContext } from "../contexts/LanguageContext";
import "./Setting.css";

// Mảng màu accent để người dùng chọn
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
  // Lấy ngôn ngữ hiện tại và hàm đổi ngôn ngữ từ context
  const { currentLanguage, changeLanguage, t: tCurrent } = useLanguageContext();

  // State lưu theme, accent lấy từ localStorage hoặc mặc định
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const [currentAccent, setCurrentAccent] = useState(
    () => localStorage.getItem("accent") || "#2b59c3"
  );

  // State giữ các thay đổi tạm thời trong form
  const [draftTheme, setDraftTheme] = useState(currentTheme);
  const [draftAccent, setDraftAccent] = useState(currentAccent);
  const [draftLanguage, setDraftLanguage] = useState(currentLanguage);

  // Các tùy chọn thông báo
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [notifySms, setNotifySms] = useState(false);

  // Trạng thái đã lưu thành công hay chưa
  const [hasSaved, setHasSaved] = useState(false);

  // Cập nhật thuộc tính theme và accent lên document khi draft thay đổi
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", draftTheme);
    document.documentElement.style.setProperty("--accent", draftAccent);
  }, [draftTheme, draftAccent]);

  // Đồng bộ draftLanguage với currentLanguage khi currentLanguage thay đổi
  useEffect(() => {
    setDraftLanguage(currentLanguage);
  }, [currentLanguage]);

  // Xử lý khi người dùng chọn ngôn ngữ
  const handleSelectLanguage = (lang) => {
    setDraftLanguage(lang);
    changeLanguage(lang);
  };

  // Xử lý lưu cài đặt: cập nhật state chính, lưu vào localStorage và thông báo
  const handleSave = () => {
    setCurrentTheme(draftTheme);
    setCurrentAccent(draftAccent);

    localStorage.setItem("theme", draftTheme);
    localStorage.setItem("accent", draftAccent);
    localStorage.setItem("lang", draftLanguage);

    setHasSaved(true);
    alert(tCurrent("actions.saveSuccess"));
  };

  // Reset tất cả về mặc định (dark theme, accent mặc định, thông báo)
  const resetToDefault = () => {
    setDraftTheme("dark");
    setDraftAccent("#2b59c3");

    setNotifyPush(true);
    setNotifyEmail(false);
    setNotifySms(false);
  };

  // Hủy các thay đổi hiện tại, khôi phục về giá trị lưu trong state chính
  const cancelChanges = () => {
    setDraftTheme(currentTheme);
    setDraftAccent(currentAccent);
    setDraftLanguage(currentLanguage);
    changeLanguage(currentLanguage);
    setHasSaved(false);
  };

  return (
    <div className="setting-page">
      {/* Phần giới thiệu và tiêu đề */}
      <div className="setting-hero">
        <h1>{tCurrent("settings.title")}</h1>
        <p>{tCurrent("settings.subtitle")}</p>
      </div>

      {/* Lưới các phần cấu hình */}
      <div className="setting-grid">
        {/* Phần chọn theme */}
        <section className="setting-card">
          <div className="setting-card__header">
            <h2>{tCurrent("theme.title")}</h2>
            <span className="setting-card__subtitle">
              {tCurrent("theme.subtitle")}
            </span>
          </div>
          <div className="theme-toggle">
            {/* Nút chọn Light theme */}
            <button
              className={`theme-toggle__btn ${
                draftTheme === "light" ? "active" : ""
              }`}
              onClick={() => setDraftTheme("light")}
            >
              <FiSun /> <span>{tCurrent("theme.light")}</span>
            </button>
            {/* Nút chọn Dark theme */}
            <button
              className={`theme-toggle__btn ${
                draftTheme === "dark" ? "active" : ""
              }`}
              onClick={() => setDraftTheme("dark")}
            >
              <FiMoon /> <span>{tCurrent("theme.dark")}</span>
            </button>
          </div>
        </section>

        {/* Phần chọn màu accent */}
        <section className="setting-card">
          <div className="setting-card__header">
            <h2>{tCurrent("accent.title")}</h2>
            <span className="setting-card__subtitle">
              {tCurrent("accent.subtitle")}
            </span>
          </div>
          <div className="accent-swatches">
            {/* Hiển thị từng màu trong ACCENT_PRESETS để chọn */}
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                className={`accent-swatch ${draftAccent === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => setDraftAccent(c)}
                aria-label={`${tCurrent("accent.select")} ${c}`}
              >
                {/* Hiển thị icon check nếu màu đang chọn */}
                {draftAccent === c && <FaCheck />}
              </button>
            ))}
          </div>
        </section>

        {/* Phần thông báo */}
        <section className="setting-card">
          <div className="setting-card__header">
            <h2>{tCurrent("notifications.title")}</h2>
            <span className="setting-card__subtitle">
              {tCurrent("notifications.subtitle")}
            </span>
          </div>
          <div className="toggle-list">
            {/* Toggle thông báo Push */}
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifyPush}
                onChange={(e) => setNotifyPush(e.target.checked)}
              />
              <span className="toggle__slider"></span>
              <span className="toggle__label">
                <FaDesktop /> {tCurrent("notifications.push")}
              </span>
            </label>
            {/* Toggle thông báo Email */}
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
              <span className="toggle__slider"></span>
              <span className="toggle__label">
                <FaEnvelope /> {tCurrent("notifications.email")}
              </span>
            </label>
            {/* Toggle thông báo SMS */}
            <label className="toggle">
              <input
                type="checkbox"
                checked={notifySms}
                onChange={(e) => setNotifySms(e.target.checked)}
              />
              <span className="toggle__slider"></span>
              <span className="toggle__label">
                <FaBell /> {tCurrent("notifications.sms")}
              </span>
            </label>
          </div>
        </section>

        {/* Phần chọn ngôn ngữ */}
        <section className="setting-card">
          <div className="setting-card__header">
            <h2>{tCurrent("language.title")}</h2>
            <span className="setting-card__subtitle">
              {tCurrent("language.subtitle")}
            </span>
          </div>
          <div className="language-switcher">
            <div className="language-switcher__buttons">
              {/* Nút chọn tiếng Việt */}
              <button
                className={`language-btn ${
                  draftLanguage === "vi" ? "active" : ""
                }`}
                onClick={() => handleSelectLanguage("vi")}
              >
                🇻🇳 {tCurrent("language.vietnamese")}
              </button>
              {/* Nút chọn tiếng Anh */}
              <button
                className={`language-btn ${
                  draftLanguage === "en" ? "active" : ""
                }`}
                onClick={() => handleSelectLanguage("en")}
              >
                🇺🇸 {tCurrent("language.english")}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Các nút hành động phía dưới: reset, hủy, lưu */}
      <div className="setting-actions">
        <button className="btn btn-secondary" onClick={resetToDefault}>
          {tCurrent("actions.reset")}
        </button>
        <button className="btn" onClick={cancelChanges}>
          {tCurrent("actions.cancel")}
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          {tCurrent("actions.save")}
        </button>
      </div>
    </div>
  );
}

export default Setting;
