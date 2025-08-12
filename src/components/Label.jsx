import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaInfoCircle,
  FaCarCrash,
  FaUserShield,
  FaCog,
  FaSignOutAlt,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import "./Label.css";

export function TabButton({
  to,
  onselect,
  children,
  icon,
  className,
  isActive,
}) {
  return (
    <li
      className={`sidebar-item ${isActive ? "active" : ""} ${className || ""}`}
    >
      <button onClick={onselect}>
        {icon && <span className="icon">{icon}</span>}
        <span>{children}</span>
      </button>
    </li>
  );
}

function Column({ onLogout }) {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
          <TabButton
            onselect={() => navigate("/info")}
            icon={<FaInfoCircle />}
            isActive={location.pathname === "/info"}
          >
            Thông tin
          </TabButton>

          <TabButton
            onselect={() => navigate("/accident")}
            icon={<FaCarCrash />}
            isActive={location.pathname === "/accident"}
          >
            Tai nạn
          </TabButton>

          <TabButton
            onselect={() => navigate("/PoliceList")}
            icon={<FaUserShield />}
            isActive={location.pathname === "/PoliceList"}
          >
            Danh sách cảnh sát
          </TabButton>
          <TabButton
            onselect={() => navigate("/violations")}
            icon={<FaUserShield />}
            isActive={location.pathname === "/violations"}
          >
            Danh sách vi phạm
          </TabButton>

          <TabButton
            onselect={() => navigate("/setting")}
            icon={<FaCog />}
            isActive={location.pathname === "/setting"}
          >
            Cài đặt
          </TabButton>
        </ul>
        <div className="sidebar-logout">
          <TabButton
            onselect={() => setShowLogoutPopup(true)}
            icon={<FaSignOutAlt />}
            isActive={false}
          >
            Đăng xuất
          </TabButton>
        </div>
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
