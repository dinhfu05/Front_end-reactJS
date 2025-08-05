import React from "react";
import "./Info.css";

function Info({ onLogout }) {
  return (
    <div className="profile-bg">
      <div className="profile-form-container">
        <div className="profile-sidebar">
          <img src="/phu.jpg" alt="avatar" className="profile-avatar-big" />
          <div className="profile-sidebar-name">Hà Nguyễn Đình Phú</div>
          <div className="profile-sidebar-role">Đại tá - CSGT</div>
          <div className="profile-sidebar-email">phunhnd1449@ut.edu.vn</div>
          <button className="profile-logout-btn" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
        <div className="profile-main-form">
          <h2 className="profile-form-title">Thông tin cá nhân</h2>
          <form>
            <div className="profile-form-row">
              <div>
                <label>Họ tên</label>
                <input type="text" value="Hà Nguyễn Đình Phú" readOnly />
              </div>
              <div>
                <label>Chức vụ</label>
                <input
                  type="text"
                  value="Đại tá - Trưởng phòng CSGT"
                  readOnly
                />
              </div>
            </div>
            <div className="profile-form-row">
              <div>
                <label>Email</label>
                <input type="email" value="phunhnd1449@ut.edu.vn" readOnly />
              </div>
              <div>
                <label>Số điện thoại</label>
                <input type="text" value="0977968909" readOnly />
              </div>
            </div>
            <div className="profile-form-row">
              <div>
                <label>Ngày sinh</label>
                <input type="text" value="05/11/2005" readOnly />
              </div>
              <div>
                <label>Địa chỉ</label>
                <input type="text" value="TP.HCM, Việt Nam" readOnly />
              </div>
            </div>
          </form>
        </div>
        <div className="profile-experience">
          <h2 className="profile-form-title">Kinh nghiệm</h2>
          <div>
            <label>Chuyên môn</label>
            <input
              type="text"
              value="Chỉ huy giao thông, tuyên truyền pháp luật"
              readOnly
            />
          </div>
          <div>
            <label>Thành tích</label>
            <textarea
              value="20+ năm công tác, nhiều bằng khen, giảm mạnh tai nạn giao thông thành phố."
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Info;
