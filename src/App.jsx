import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./components/Login";
import Label from "./components/Label";
import Accident from "./components/Accident";
import Info from "./components/Info";
import Setting from "./components/Setting";
import PoliceList from "./components/PoliceList";
import ViolationList from "./components/ViolationList";
import "./App.css";

// Layout hiển thị label ở trên mọi trang
function MainLayout({ children, onLogout }) {
  return (
    <>
      <Label onLogout={onLogout} />
      <div className="content-right">{children}</div>
    </>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const sessionId = sessionStorage.getItem("userId");
    if (token && sessionId) {
      setIsLoggedIn(true);
      setUserId(sessionId);
    }
    setCheckingAuth(false);
  }, []);

  const handleLogin = ({ token, id }) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("userId", id);
    setIsLoggedIn(true);
    setUserId(id);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserId(null);
  };
  if (checkingAuth) {
    // Hiển thị loading hoặc gì đó trong lúc chờ xác thực
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Trang login */}
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/accident" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        {/* Các route có layout chung */}
        <Route
          path="/accident"
          element={
            isLoggedIn ? (
              <MainLayout onLogout={handleLogout}>
                <Accident />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/info"
          element={
            isLoggedIn ? (
              <MainLayout onLogout={handleLogout}>
                <Info userId={userId} />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/setting"
          element={
            isLoggedIn ? (
              <MainLayout onLogout={handleLogout}>
                <Setting />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/PoliceList"
          element={
            isLoggedIn ? (
              <MainLayout onLogout={handleLogout}>
                <PoliceList />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Trang danh sách biên bản vi phạm */}
        <Route
          path="/violations"
          element={
            isLoggedIn ? (
              <MainLayout onLogout={handleLogout}>
                <ViolationList />
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Mặc định */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/accident" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
