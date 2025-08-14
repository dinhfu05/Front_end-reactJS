import React, { useState, useEffect } from "react";
import { useLanguageContext } from "../../contexts/LanguageContext";
import "./PoliceList.css";

export default function PoliceList() {
  const { t } = useLanguageContext();
  const [policeList, setPoliceList] = useState([]);
  const [selectedPolice, setSelectedPolice] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8087/quet/api/account/staff", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPoliceList(data))
      .catch(() => setPoliceList([]));
  }, []);

  // Lọc theo id hoặc tên
  const filteredList = policeList.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="police-container">
      <h2 className="police-title">{t("police.title")}</h2>
      {/* Ô tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm theo ID hoặc tên cảnh sát..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="police-search"
      />
      {/* Bảng danh sách cảnh sát */}
      <table className="police-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Họ tên</th>
            <th>Quân hàm</th>
            <th>Chức vụ</th>
            <th>Địa chỉ</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.fullName}</td>
              <td>{p.role}</td>
              <td>{p.username}</td>
              <td>{p.address}</td>
              <td>{p.phoneNumber}</td>
              <td>{p.email}</td>
              <td>
                <button onClick={() => setSelectedPolice(p)}>
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Popup chi tiết cảnh sát */}
      {selectedPolice && (
        <div className="modal-overlay" onClick={() => setSelectedPolice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <PoliceAvatar facePath={selectedPolice.facePath} />
            <h3>{selectedPolice.fullName}</h3>
            <p>
              <b>Quân hàm:</b> {selectedPolice.role}
            </p>
            <p>
              <b>Chức vụ:</b> {selectedPolice.username}
            </p>
            <p>
              <b>Địa chỉ:</b> {selectedPolice.address}
            </p>
            <p>
              <b>Số điện thoại:</b> {selectedPolice.phoneNumber}
            </p>
            <p>
              <b>Email:</b> {selectedPolice.email}
            </p>
            <button
              className="close-btn"
              onClick={() => setSelectedPolice(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Component lấy ảnh cảnh sát qua API (có token)
function PoliceAvatar({ facePath }) {
  const [avatarUrl, setAvatarUrl] = useState("");
  useEffect(() => {
    if (!facePath) return;
    const token = localStorage.getItem("token");
    fetch(`http://localhost:8087/quet/api/images/${facePath}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => setAvatarUrl(URL.createObjectURL(blob)))
      .catch(() => setAvatarUrl(""));
  }, [facePath]);
  return <img src={avatarUrl} alt="Ảnh cảnh sát" className="police-avatar" />;
}
