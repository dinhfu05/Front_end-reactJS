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
import { useLanguageContext } from "../../contexts/LanguageContext";
import "./Label.css";

// Component nút tab sidebar
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

// Component sidebar chính
function Column({ onLogout }) {
  const { t } = useLanguageContext(); // Hàm dịch ngôn ngữ
  const [showLogoutPopup, setShowLogoutPopup] = useState(false); // Hiện popup logout
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  ); // Theme tối/sáng
  const navigate = useNavigate(); // Điều hướng trang
  const location = useLocation(); // Lấy URL hiện tại

  // Cập nhật theme vào DOM và lưu localStorage khi thay đổi
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Xác nhận logout: xóa token, đóng popup, gọi callback, chuyển trang login
  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    setShowLogoutPopup(false);
    onLogout();
    navigate("/login");
  };

  // Hủy logout, đóng popup
  const handleCancelLogout = () => {
    setShowLogoutPopup(false);
  };

  return (
    <>
      <div className="column">
        {/* Logo sidebar */}
        <div className="logo">
          <img className="sidebar-logo" src="/ic_logo.png" alt="Logo" />
        </div>

        {/* Menu sidebar */}
        <ul className="sidebar-menu">
          <TabButton
            onselect={() => navigate("/info")}
            icon={<FaInfoCircle />}
            isActive={location.pathname === "/info"}
          >
            {t("navigation.info")}
          </TabButton>

          <TabButton
            onselect={() => navigate("/accident")}
            icon={<FaCarCrash />}
            isActive={location.pathname === "/accident"}
          >
            {t("navigation.accident")}
          </TabButton>

          <TabButton
            onselect={() => navigate("/PoliceList")}
            icon={<FaUserShield />}
            isActive={location.pathname === "/PoliceList"}
          >
            {t("navigation.policeList")}
          </TabButton>

          <TabButton
            onselect={() => navigate("/violations")}
            icon={<FaUserShield />}
            isActive={location.pathname === "/violations"}
          >
            {t("navigation.violationList")}
          </TabButton>

          <TabButton
            onselect={() => navigate("/setting")}
            icon={<FaCog />}
            isActive={location.pathname === "/setting"}
          >
            {t("navigation.settings")}
          </TabButton>
        </ul>

        {/* Nút logout */}
        <div className="sidebar-logout">
          <TabButton
            onselect={() => setShowLogoutPopup(true)}
            icon={<FaSignOutAlt />}
            isActive={false}
          >
            {t("navigation.logout")}
          </TabButton>
        </div>
      </div>

      {/* Popup xác nhận logout */}
      {showLogoutPopup &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <div className="popup">
              <p>{t("logout.confirmMessage")}</p>
              <div className="popup-buttons">
                <button onClick={handleConfirmLogout}>
                  {t("logout.confirm")}
                </button>
                <button onClick={handleCancelLogout}>
                  {t("logout.cancel")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Column;
