import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  FaInfoCircle,
  FaCarCrash,
  FaUserShield,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Label.css";

export function TabButton({ onselect, children, icon }) {
  return (
    <li className="sidebar-item">
      <button onClick={onselect}>
        {icon && <span className="icon">{icon}</span>}
        <span>{children}</span>
      </button>
    </li>
  );
}

function Column({ onLogout }) {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutPopup(false);
    onLogout();
    navigate("/login");
  };

  const handleCancelLogout = () => {
    setShowLogoutPopup(false);
  };

  return (
    <>
      <div className="column">
        <div className="logo">
          <img className="sidebar-logo" src="/ic_logo.png" alt="Logo" />
        </div>

        <ul className="sidebar-menu">
          <TabButton onselect={() => navigate("/info")} icon={<FaInfoCircle />}>
            Thông tin
          </TabButton>
          <TabButton
            onselect={() => navigate("/accident")}
            icon={<FaCarCrash />}
          >
            Tai nạn
          </TabButton>
          <TabButton
            onselect={() => navigate("/PoliceList")}
            icon={<FaUserShield />}
          >
            Danh sách cảnh sát
          </TabButton>
          <TabButton onselect={() => navigate("/setting")} icon={<FaCog />}>
            Cài đặt
          </TabButton>
          <TabButton
            onselect={() => setShowLogoutPopup(true)}
            icon={<FaSignOutAlt />}
          >
            Đăng xuất
          </TabButton>
        </ul>
      </div>

      {showLogoutPopup &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup">
              <p>Bạn có chắc chắn muốn đăng xuất không?</p>
              <div className="popup-buttons">
                <button onClick={handleConfirmLogout}>Xác nhận</button>
                <button onClick={handleCancelLogout}>Hủy</button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Column;
