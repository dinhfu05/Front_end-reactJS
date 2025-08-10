import { useState } from "react";
import { MdPerson, MdLock } from "react-icons/md";
import "./Login.css";

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !pass) {
      setError("Vui lòng nhập Username và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
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
        throw new Error("Sai tài khoản hoặc mật khẩu");
      }

      const data = await res.json();

      if (!data.roles || !data.roles.includes("ADMIN")) {
        throw new Error(
          "Bạn không có quyền truy cập (chỉ Admin mới được đăng nhập)."
        );
      }

      // ✅ Lưu token và userId vào sessionStorage
      sessionStorage.setItem("userId", data.id);
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("email", data.email);
      localStorage.setItem("token", data.token);

      // ✅ Gọi lại App.js và truyền id để dùng ở Info
      onLogin({ id: data.id });
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background">
      <nav className="navbar">
        <img className="navbar-logo" src="/ic_logo.png" alt="Logo" />
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      </nav>
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
        <h2>LOGIN</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <span className="input-icon">
              <MdPerson size={20} color="white" />
            </span>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">
              <MdLock size={20} color="white" />
            </span>
            <input
              type="password"
              placeholder="Password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>
          {error && (
            <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
          )}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
