import React, { useEffect, useState } from "react";
import "./Info.css";

function Info({ onLogout }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAvatar, setShowAvatar] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = sessionStorage.getItem("userId");

    if (!token || !id) {
      setError("Bạn chưa đăng nhập hoặc phiên đã hết hạn.");
      setLoading(false);
      return;
    }

    console.log("ID:", id);
    console.log("Token:", token);

    fetch(`http://localhost:8087/quet/api/person/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401)
            throw new Error("Token không hợp lệ hoặc đã hết hạn");
          throw new Error("Không thể lấy thông tin người dùng");
        }
        return res.json();
      })
      .then((data) => {
        setUserInfo(data);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy thông tin người dùng:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="profile-bg">
        <div className="loading-message">Đang tải thông tin...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-bg">
        <div style={{ color: "red", padding: "20px" }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="profile-bg">
      <div className="profile-form-container">
        <div className="profile-sidebar">
          <img
            src="/phu.jpg"
            alt="avatar"
            className="profile-avatar-big"
            onClick={() => setShowAvatar(true)}
            style={{ cursor: "pointer" }}
          />
          <div className="profile-sidebar-name">
            {sessionStorage.getItem("username") || "Khách"}
          </div>
        </div>
        <div className="profile-main-form">
          <h2 className="profile-form-title">Thông tin cá nhân</h2>

          <div className="profile-form-row">
            <div>
              <label>Họ tên</label>
              <input value={userInfo?.fullName || ""} readOnly />
            </div>
            <div>
              <label>Quân hàm - Chức vụ</label>
              <input value="Đại tá - Trưởng phòng CSGT" readOnly />
            </div>
          </div>

          <div className="profile-form-row">
            <div>
              <label>Email</label>
              <input value={sessionStorage.getItem("email") || ""} readOnly />
            </div>
            <div>
              <label>Ngày sinh</label>
              <input
                value={
                  userInfo?.birthDate
                    ? new Date(userInfo.birthDate).toLocaleDateString("vi-VN")
                    : ""
                }
                readOnly
              />
            </div>
          </div>

          <div className="profile-form-row">
            <div>
              <label>Giới tính</label>
              <input
                value={
                  userInfo?.gender === "MALE"
                    ? "Nam"
                    : userInfo?.gender === "FEMALE"
                    ? "Nữ"
                    : ""
                }
                readOnly
              />
            </div>
            <div>
              <label>Số điện thoại</label>
              <input value={userInfo?.phoneNumber || ""} readOnly />
            </div>
          </div>

          <div className="profile-form-row">
            <div>
              <label>Địa chỉ</label>
              <input value={userInfo?.address || ""} readOnly />
            </div>
          </div>
        </div>
      </div>

      {showAvatar && (
        <div className="modal-overlay" onClick={() => setShowAvatar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src="/phu.jpg" alt="Avatar" style={{ width: "100%", borderRadius: 12 }} />
            <button className="close-btn" onClick={() => setShowAvatar(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Info;
