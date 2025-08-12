import { useState } from "react";
import { MdPerson, MdLock } from "react-icons/md";
import { useLanguageContext } from "../contexts/LanguageContext";
import "./Login.css";

function Login({ onLogin }) {
  // Context ngôn ngữ và các state cục bộ cho form
  const { t, currentLanguage, changeLanguage } = useLanguageContext();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  // Xử lý đăng nhập khi submit form
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Kiểm tra nhập liệu cơ bản
    if (!username || !pass) {
      setError(t("login.error.enterCredentials"));
      return;
    }

    setLoading(true);
    try {
      // Gửi request đăng nhập tới backend
      const res = await fetch("http://localhost:8087/quet/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: pass,
        }),
      });

      if (!res.ok) {
        throw new Error(t("login.error.wrongCredentials"));
      }

      const data = await res.json();

      // Kiểm tra quyền ADMIN
      if (!data.roles || !data.roles.includes("ADMIN")) {
        throw new Error(t("login.error.noAccess"));
      }

      // Lưu dữ liệu người dùng và token
      sessionStorage.setItem("userId", data.id);
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("email", data.email);
      localStorage.setItem("token", data.token);

      // Gọi callback onLogin
      onLogin({ id: data.id });
    } catch (err) {
      setError(err.message || t("login.error.failed"));
    } finally {
      setLoading(false);
    }
  };

  // Chuyển đổi ngôn ngữ
  const toggleLanguage = () => {
    changeLanguage(currentLanguage === "vi" ? "en" : "vi");
  };

  // JSX giao diện đăng nhập
  return (
    <div className="background">
      {/* Thanh navbar với logo và menu */}
      <nav className="navbar">
        <img className="navbar-logo" src="/ic_logo.png" alt="Logo" />
        <ul>
          <li>{t("login.nav.home")}</li>
          <li>{t("login.nav.about")}</li>
          <li>{t("login.nav.services")}</li>
          <li>{t("login.nav.contact")}</li>
        </ul>
        {/* Nút chuyển đổi ngôn ngữ */}
        <button
          onClick={toggleLanguage}
          className="lang-btn"
          aria-label="Toggle Language"
        >
          <img
            src={currentLanguage === "vi" ? "VN.png" : "uk.png"}
            alt={currentLanguage === "vi" ? "Vietnamese" : "English"}
            style={{ width: 24, height: 16, marginRight: 5 }}
          />
          <span className="lang-code">{currentLanguage}</span>
        </button>
      </nav>

      {/* Form đăng nhập */}
      <div className="login-modal">
        <div className="login-avatar">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2" />
            <path
              d="M4 20c0-4 8-4 8-4s8 0 8 4"
              stroke="white"
              strokeWidth="2"
            />
          </svg>
        </div>
        <h2>{t("login.title")}</h2>
        <form onSubmit={handleLogin}>
          {/* Input username */}
          <div className="input-group">
            <span className="input-icon">
              <MdPerson size={20} color="white" />
            </span>
            <input
              type="text"
              placeholder={t("login.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          {/* Input password */}
          <div className="input-group">
            <span className="input-icon">
              <MdLock size={20} color="white" />
            </span>
            <input
              type="password"
              placeholder={t("login.password")}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
          )}

          {/* Nút submit */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : t("login.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
