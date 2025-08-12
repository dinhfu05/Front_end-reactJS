import React, { useEffect, useState } from "react";
import { useLanguageContext } from "../contexts/LanguageContext";
import "./Info.css";

// Component hiển thị thông tin cá nhân người dùng
function Info({ onLogout }) {
  const { t } = useLanguageContext();

  // State chứa thông tin người dùng, trạng thái loading, lỗi, trạng thái hiển thị avatar
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAvatar, setShowAvatar] = useState(false);

  // Lấy dữ liệu người dùng khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = sessionStorage.getItem("userId");

    // Kiểm tra token và id tồn tại, nếu không có thì báo lỗi
    if (!token || !id) {
      setError(t("info.notLoggedIn"));
      setLoading(false);
      return;
    }

    // Gọi API lấy thông tin người dùng
    fetch(`http://localhost:8087/quet/api/person/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) throw new Error(t("info.invalidToken"));
          throw new Error(t("info.cannotGetUserInfo"));
        }
        return res.json();
      })
      .then((data) => {
        setUserInfo(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Hiển thị trạng thái loading
  if (loading) {
    return (
      <div className="profile-bg">
        <div className="loading-message">{t("info.loading")}</div>
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="profile-bg">
        <div style={{ color: "red", padding: "20px" }}>{error}</div>
      </div>
    );
  }

  // Giao diện chính hiển thị thông tin cá nhân
  return (
    <div className="profile-bg">
      <div className="profile-form-container">
        {/* Sidebar avatar và tên */}
        <div className="profile-sidebar">
          <img
            src="/phu.jpg"
            alt={t("info.avatar")}
            className="profile-avatar-big"
            onClick={() => setShowAvatar(true)}
            style={{ cursor: "pointer" }}
          />
          <div className="profile-sidebar-name">
            {sessionStorage.getItem("username") || t("info.guest")}
          </div>
        </div>

        {/* Form thông tin cá nhân */}
        <div className="profile-main-form">
          <h2 className="profile-form-title">{t("info.personalInfo")}</h2>

          <div className="profile-form-row">
            <div>
              <label>{t("info.fullName")}</label>
              <input value={userInfo?.fullName || t("info.noData")} readOnly />
            </div>
            <div>
              <label>{t("info.rank")}</label>
              <input value={t("info.rankValue")} readOnly />
            </div>
          </div>

          <div className="profile-form-row">
            <div>
              <label>{t("info.email")}</label>
              <input
                value={sessionStorage.getItem("email") || t("info.noData")}
                readOnly
              />
            </div>
            <div>
              <label>{t("info.birthDate")}</label>
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
              <label>{t("info.gender")}</label>
              <input
                value={
                  userInfo?.gender === "MALE"
                    ? t("info.male")
                    : userInfo?.gender === "FEMALE"
                    ? t("info.female")
                    : t("info.unknownGender")
                }
                readOnly
              />
            </div>
            <div>
              <label>{t("info.phoneNumber")}</label>
              <input
                value={userInfo?.phoneNumber || t("info.noData")}
                readOnly
              />
            </div>
          </div>

          <div className="profile-form-row">
            <div>
              <label>{t("info.address")}</label>
              <input value={userInfo?.address || t("info.noData")} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Popup hiển thị ảnh đại diện to */}
      {showAvatar && (
        <div className="modal-overlay" onClick={() => setShowAvatar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src="/phu.jpg"
              alt={t("info.avatar")}
              style={{ width: "100%", borderRadius: 12 }}
            />
            <button className="close-btn" onClick={() => setShowAvatar(false)}>
              {t("info.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Info;
