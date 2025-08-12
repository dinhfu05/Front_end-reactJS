import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./auth/Login";
import Label from "./components/Label/Label";
import Accident from "./pages/Accident/Accident";
import Info from "./pages/Info/Info";
import Setting from "./pages/Setting/Setting";
import PoliceList from "./pages/PoliceList/PoliceList";
import ViolationList from "./pages/ViolationList/ViolationList";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./App.css";

function MainLayout({ children, onLogout }) {
  return (
    <>
      <Label onLogout={onLogout} />
      <div className="content-right">{children}</div>
    </>
  );
}

function App() {
  // Luôn đăng nhập sẵn
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userId, setUserId] = useState("test-user");
  const [checkingAuth, setCheckingAuth] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const sessionId = sessionStorage.getItem("userId");
    if (token && sessionId) {
      setIsLoggedIn(true);
      setUserId(sessionId);
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedAccent = localStorage.getItem("accent");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    if (savedAccent) {
      document.documentElement.style.setProperty("--accent", savedAccent);
    }
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
    return <div>Loading...</div>;
  }

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Trang login (ẩn đi) */}
          {
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
          }

          {/* Các route có layout chung */}
          <Route
            path="/accident"
            element={
              <MainLayout onLogout={handleLogout}>
                <Accident />
              </MainLayout>
            }
          />
          <Route
            path="/info"
            element={
              <MainLayout onLogout={handleLogout}>
                <Info userId={userId} />
              </MainLayout>
            }
          />
          <Route
            path="/setting"
            element={
              <MainLayout onLogout={handleLogout}>
                <Setting />
              </MainLayout>
            }
          />
          <Route
            path="/PoliceList"
            element={
              <MainLayout onLogout={handleLogout}>
                <PoliceList />
              </MainLayout>
            }
          />
          <Route
            path="/violations"
            element={
              <MainLayout onLogout={handleLogout}>
                <ViolationList />
              </MainLayout>
            }
          />

          {/* Mặc định vào thẳng accident */}
          <Route path="*" element={<Navigate to="/accident" />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
