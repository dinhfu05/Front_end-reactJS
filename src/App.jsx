import { useState } from "react";
import Login from "./components/Login";
import Label from "./components/Label";
import Accident from "./components/Accident";
import Home from "./components/Home";
import Info from "./components/Info";
import Setting from "./components/Setting";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "info":
        return <Info onLogout={() => setIsLoggedIn(false)} />;
      case "accident":
        return <Accident />;
      case "setting":
        return <Setting />;
      default:
        return <Home />;
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="main">
      <div className="conten-left">
        <Label setActiveTab={setActiveTab} />
      </div>
      <div className="content-right">{renderTabContent()}</div>
    </div>
  );
}

export default App;
