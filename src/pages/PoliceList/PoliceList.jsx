import React, { useState, useEffect } from "react";
import { useLanguageContext } from "../../contexts/LanguageContext";
import "./PoliceList.css";

const columns = [
  { key: "id", label: "police.id" },
  { key: "fullName", label: "police.fullName" },
  { key: "address", label: "police.address" },
  { key: "phoneNumber", label: "police.phoneNumber" },
  { key: "email", label: "police.email" },
  { key: "role", label: "police.role" },
];

export default function PoliceList() {
  const { t } = useLanguageContext();
  const [policeList, setPoliceList] = useState([]);
  const [selectedPolice, setSelectedPolice] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:8087/quet/api/account/staff", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.resolve(sampleData)))
      .then((data) => setPoliceList(data))
      .catch(() => setPoliceList(sampleData));
  }, []);

  // Lọc theo id hoặc tên
  const filteredList = policeList.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.fullName.toLowerCase().includes(search.toLowerCase())
  );

  // Sắp xếp
  const sortedList = [...filteredList].sort((a, b) => {
    const valA = a[sortBy] ? a[sortBy].toString().toLowerCase() : "";
    const valB = b[sortBy] ? b[sortBy].toString().toLowerCase() : "";
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Xử lý khi click vào tiêu đề cột
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  // Hiển thị mũi tên
  const renderArrow = (key) => {
    if (sortBy !== key) return null;
    return (
      <span className="sort-arrow">{sortOrder === "asc" ? "▲" : "▼"}</span>
    );
  };

  return (
    <div className="police-container">
      <h2 className="police-title">{t("police.title")}</h2>
      {/* Ô tìm kiếm */}
      <input
        type="text"
        placeholder={t("police.searchPlaceholder")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="police-search"
      />
      <table className="police-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                className="sortable"
                style={{ cursor: "pointer", userSelect: "none" }}
              >
                {t(col.label)}
                {renderArrow(col.key)}
              </th>
            ))}
            <th>{t("police.action")}</th>
          </tr>
        </thead>
        <tbody>
          {sortedList.map((p) => (
            <tr key={p.id}>
              {columns.map((col) => (
                <td key={col.key}>{p[col.key]}</td>
              ))}
              <td>
                <button onClick={() => setSelectedPolice(p)}>
                  {t("police.detail")}
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
              <b>{t("police.role")}:</b> {selectedPolice.role}
            </p>
            <p>
              <b>{t("police.username")}:</b> {selectedPolice.username}
            </p>
            <p>
              <b>{t("police.address")}:</b> {selectedPolice.address}
            </p>
            <p>
              <b>{t("police.phoneNumber")}:</b> {selectedPolice.phoneNumber}
            </p>
            <p>
              <b>{t("police.email")}:</b> {selectedPolice.email}
            </p>
            <button
              className="close-btn"
              onClick={() => setSelectedPolice(null)}
            >
              {t("police.close")}
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
