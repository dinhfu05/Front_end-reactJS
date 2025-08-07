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
  return (
    <div className="column">
      <div className="logo">
        <img className="sidebar-logo" src="/ic_logo.png" alt="Logo" />
      </div>
      <TabButton onselect={() => setActiveTab("info")}>Thông tin</TabButton>
      <TabButton onselect={() => setActiveTab("accident")}>Tai nạn</TabButton>
      <TabButton onselect={() => setActiveTab("setting")}>Cài đặt</TabButton>
      <TabButton onselect={onLogout}>Đăng xuất</TabButton>{" "}
      {/* ✅ Gọi logout đúng */}
    </div>
  );
}

export default Column;
