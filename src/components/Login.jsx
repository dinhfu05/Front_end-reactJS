import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !pass) {
      setError("Vui lòng nhập email và mật khẩu.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(); // Gọi hàm này để báo login thành công
    }, 2000);
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
              <svg width="20" height="20" fill="white">
                <path d="M2 10a8 8 0 1116 0A8 8 0 012 10zm8-4a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <span className="input-icon">
              <svg width="20" height="20" fill="white">
                <path d="M5 10V8a5 5 0 1110 0v2" />
                <rect x="5" y="10" width="10" height="8" rx="2" />
              </svg>
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
          <div className="options"></div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? <span className="spinner"></span> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
