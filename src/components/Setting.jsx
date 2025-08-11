import React, { useState } from "react";
import "./Setting.css";

function Setting({ onLogout }) {
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("vi");

  const handleSave = () => {
    alert("Đã lưu cài đặt thành công!");
    // Ở đây bạn có thể gửi dữ liệu lên backend nếu cần
  };

  return (
    <div className="setting-container">
      <h1>Cài đặt hệ thống</h1>

      {/* Giao diện */}
      <div className="setting-item">
        <label>Chế độ giao diện:</label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Sáng</option>
          <option value="dark">Tối</option>
        </select>
      </div>

      {/* Thông báo */}
      <div className="setting-item">
        <label>Bật thông báo:</label>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
      </div>

      {/* Ngôn ngữ */}
      <div className="setting-item">
        <label>Ngôn ngữ:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="vi">Tiếng Việt</option>
          <option value="en">Tiếng Anh</option>
        </select>
      </div>

      {/* Nút lưu */}
      <div className="setting-actions">
        <button className="save-btn" onClick={handleSave}>
          Lưu cài đặt
        </button>
        <button className="logout-btn" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default Setting;
