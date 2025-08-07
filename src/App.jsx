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
    const token = localStorage.getItem("token");
    const savedId = localStorage.getItem("userId");
    if (token && savedId) {
      setIsLoggedIn(true);
      setUserId(savedId);
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
        onLogin={({ id }) => {
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
            localStorage.removeItem("username");
            localStorage.removeItem("id");
            setIsLoggedIn(false);
            setActiveTab("accident");
          }}
        />
      </div>
      <div className="content-right">{renderTabContent()}</div>
    </div>
  );
}

export default App;
