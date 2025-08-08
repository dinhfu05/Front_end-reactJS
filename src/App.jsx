import { useState, useEffect } from "react";
import Login from "./components/Login";
import Label from "./components/Label";
import Accident from "./components/Accident";
import Info from "./components/Info";
import Setting from "./components/Setting";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("accident");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // token dùng để gọi API
    const sessionId = sessionStorage.getItem("userId"); // id chỉ dùng để xác định người đăng nhập trong phiên

    if (token && sessionId) {
      setIsLoggedIn(true);
      setUserId(sessionId);
    }
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return <Info userId={userId} />;
      case "accident":
        return <Accident />;
      case "setting":
        return <Setting />;
      default:
        return <Accident />;
    }
  };

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={({ token, id }) => {
          localStorage.setItem("token", token); // lưu lâu dài
          sessionStorage.setItem("userId", id); // chỉ dùng trong phiên
          setIsLoggedIn(true);
          setUserId(id);
          setActiveTab("accident");
        }}
      />
    );
  }

  return (
    <div className="main">
      <div className="conten-left">
        <Label
          setActiveTab={setActiveTab}
          onLogout={() => {
            localStorage.removeItem("token");
            sessionStorage.removeItem("userId");
            setIsLoggedIn(false);
            setUserId(null);
            setActiveTab("accident");
          }}
        />
      </div>
      <div className="content-right">{renderTabContent()}</div>
    </div>
  );
}

export default App;
