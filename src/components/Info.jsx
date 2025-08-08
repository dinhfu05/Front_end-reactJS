import React, { useEffect, useState } from "react";
import "./Info.css";

function Info({ onLogout }) {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    console.log("Token từ localStorage:", token); // 🧪 kiểm tra token

    if (!token) {
      console.error("Không tìm thấy token. Hãy đăng nhập lại.");
      return;
    }

    const id = sessionStorage.getItem("userId");
    fetch(`http://localhost:8087/quet/api/person/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        console.log("Status code:", res.status);
        if (!res.ok) {
          throw new Error("Không thể lấy thông tin người dùng");
        }
        return res.json();
      })
      .then((data) => {
        // if (Array.isArray(data) && data.length > 0) {
        if (data) {
          setUserInfo(data); // ✅ Lấy phần tử đầu tiên trong mảng
        } else {
          console.error("Dữ liệu người dùng không hợp lệ:", data);
        }
      })
      .catch((err) => {
        console.error("Lỗi khi lấy thông tin người dùng:", err);
      });
  }, []);

  return (
    <div className="profile-bg">
      <div className="profile-form-container">
        <div className="profile-sidebar">
          <img src="/phu.jpg" alt="avatar" className="profile-avatar-big" />
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
              <label>Quân hàm</label>
              <input value="Đại tá" readOnly />
            </div>
          </div>

          <div className="profile-form-row">
            <div>
              <label>Chức vụ</label>
              <input value="Trưởng phòng CSGT" readOnly />
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
    </div>
  );
}

export default Info;
