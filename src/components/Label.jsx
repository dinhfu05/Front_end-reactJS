import React, { useState } from "react";
import logo from "../image/logo.jpg";
import "./Label.css";

export function TabButton({ onselect, children }) {
  return (
    <li>
      <button onClick={onselect}>{children}</button>
    </li>
  );
}

function Column({ setActiveTab, onLogout }) {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutPopup(false);
    onLogout(); // Gọi logout
  };

  const handleCancelLogout = () => {
    setShowLogoutPopup(false); // Đóng popup
  };

  return (
    <div className="column">
      <div className="logo">
        <img className="sidebar-logo" src="/ic_logo.png" alt="Logo" />
      </div>
      <TabButton onselect={() => setActiveTab("info")}>Thông tin</TabButton>
      <TabButton onselect={() => setActiveTab("accident")}>Tai nạn</TabButton>
      <TabButton onselect={() => setActiveTab("setting")}>Cài đặt</TabButton>
      <TabButton onselect={() => setShowLogoutPopup(true)}>Đăng xuất</TabButton>

      {/* ✅ Popup xác nhận */}
      {showLogoutPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <p>Bạn có chắc chắn muốn đăng xuất không?</p>
            <div className="popup-buttons">
              <button onClick={handleConfirmLogout}>Xác nhận</button>
              <button onClick={handleCancelLogout}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Column;
