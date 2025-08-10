import React, { useState } from "react";
import "./PoliceList.css";

const policeList = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    rank: "Thượng úy",
    position: "Cảnh sát giao thông",
    img: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    name: "Trần Thị B",
    rank: "Đại úy",
    position: "Cảnh sát hình sự",
    img: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 3,
    name: "Lê Văn C",
    rank: "Thiếu tá",
    position: "Cảnh sát điều tra",
    img: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    rank: "Trung úy",
    position: "Cảnh sát quản lý hành chính",
    img: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    rank: "Đại tá",
    position: "Cảnh sát phòng cháy chữa cháy",
    img: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    id: 6,
    name: "Vũ Thị F",
    rank: "Thượng tá",
    position: "Cảnh sát môi trường",
    img: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    id: 7,
    name: "Bùi Văn G",
    rank: "Trung tá",
    position: "Cảnh sát cơ động",
    img: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    id: 8,
    name: "Ngô Thị H",
    rank: "Đại úy",
    position: "Cảnh sát hình sự",
    img: "https://randomuser.me/api/portraits/women/8.jpg",
  },
  {
    id: 9,
    name: "Phan Văn I",
    rank: "Thiếu tá",
    position: "Cảnh sát điều tra",
    img: "https://randomuser.me/api/portraits/men/9.jpg",
  },
  {
    id: 10,
    name: "Đỗ Thị J",
    rank: "Trung úy",
    position: "Cảnh sát quản lý hành chính",
    img: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    id: 11,
    name: "Trịnh Văn K",
    rank: "Đại tá",
    position: "Cảnh sát phòng cháy chữa cháy",
    img: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: 12,
    name: "Lâm Thị L",
    rank: "Thượng úy",
    position: "Cảnh sát giao thông",
    img: "https://randomuser.me/api/portraits/women/12.jpg",
  },
];

function PoliceCard({ police, onClick }) {
  return (
    <div className="police-card" onClick={() => onClick(police)}>
      <img src={police.img} alt={police.name} className="police-img" />
      <h4 className="police-name">{police.name}</h4>
      <p className="police-rank">{police.rank}</p>
      <p className="police-position">{police.position}</p>
    </div>
  );
}

export default function PoliceList() {
  const [selectedPolice, setSelectedPolice] = useState(null);

  return (
    <div className="police-container">
      <h2 className="police-title">Danh Sách Cảnh Sát</h2>
      <div className="police-grid">
        {policeList.map((p) => (
          <PoliceCard key={p.id} police={p} onClick={setSelectedPolice} />
        ))}
      </div>

      {/* Popup hiển thị chi tiết */}
      {selectedPolice && (
        <div className="modal-overlay" onClick={() => setSelectedPolice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPolice.img}
              alt={selectedPolice.name}
              className="modal-img"
            />
            <h3>{selectedPolice.name}</h3>
            <p>
              <b>Cấp bậc:</b> {selectedPolice.rank}
            </p>
            <p>
              <b>Chức vụ:</b> {selectedPolice.position}
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
