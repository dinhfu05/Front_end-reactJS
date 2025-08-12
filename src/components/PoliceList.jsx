import React, { useState } from "react";
import data from "../../data";
import "./PoliceList.css";

const policeList = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    rank: "Thượng úy",
    position: "Cảnh sát giao thông",
    img: "https://randomuser.me/api/portraits/men/1.jpg",
    area: "Phường Bến Nghé",
    phone: "0901234567",
  },
  {
    id: 2,
    name: "Trần Thị B",
    rank: "Đại úy",
    position: "Cảnh sát hình sự",
    img: "https://randomuser.me/api/portraits/women/2.jpg",
    area: "Phường Thạnh Mỹ Tây",
    phone: "0902345678",
  },
  {
    id: 3,
    name: "Lê Văn C",
    rank: "Thiếu tá",
    position: "Cảnh sát giao thông",
    img: "https://randomuser.me/api/portraits/men/3.jpg",
    area: "Phường Tân Định",
    phone: "0903456789",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    rank: "Trung úy",
    position: "Cảnh sát cơ động",
    img: "https://randomuser.me/api/portraits/women/4.jpg",
    area: "Phường Linh Trung",
    phone: "0904567890",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    rank: "Đại tá",
    position: "Cảnh sát giao thông",
    img: "https://randomuser.me/api/portraits/men/5.jpg",
    area: "Phường Thảo Điền",
    phone: "0905678901",
  },
  {
    id: 6,
    name: "Vũ Thị F",
    rank: "Thượng tá",
    position: "Cảnh sát cơ động",
    img: "https://randomuser.me/api/portraits/women/6.jpg",
    area: "Phường Phú Mỹ",
    phone: "0906789012",
  },
  {
    id: 7,
    name: "Bùi Văn G",
    rank: "Trung tá",
    position: "Cảnh sát cơ động",
    img: "https://randomuser.me/api/portraits/men/7.jpg",
    area: "Phường An Lạc",
    phone: "0907890123",
  },
  {
    id: 8,
    name: "Ngô Thị H",
    rank: "Đại úy",
    position: "Cảnh sát hình sự",
    img: "https://randomuser.me/api/portraits/women/8.jpg",
    area: "Phường Hiệp Bình Chánh",
    phone: "0908901234",
  },
  {
    id: 9,
    name: "Phan Văn I",
    rank: "Thiếu tá",
    position: "Cảnh sát giao thông",
    img: "https://randomuser.me/api/portraits/men/9.jpg",
    area: "Phường Tân Phú",
    phone: "0909012345",
  },
  {
    id: 10,
    name: "Đỗ Thị J",
    rank: "Trung úy",
    position: "Cảnh sát giao thông",
    img: "https://randomuser.me/api/portraits/women/10.jpg",
    area: "Phường Cát Lái",
    phone: "0910123456",
  },
];

function PoliceCard({ police, onCardClick, onContact, onNotify }) {
  return (
    <div className="police-card" onClick={() => onCardClick(police)}>
      <img src={police.img} alt={police.name} className="police-img" />
      <h4 className="police-name">{police.name}</h4>
      <p className="police-rank">{police.rank}</p>
      <p className="police-position">{police.position}</p>
      <p className="police-area">{police.area}</p>
      <p className="police-phone">
        <b>SĐT:</b> {police.phone || "Chưa cập nhật"}
      </p>
      <div className="action-buttons">
        <button
          className="contact-btn"
          onClick={(e) => {
            e.stopPropagation();
            onContact(police);
          }}
        >
          Liên hệ
        </button>
        <button
          className="notify-btn"
          onClick={(e) => {
            e.stopPropagation();
            onNotify(police);
          }}
        >
          Thông báo
        </button>
      </div>
    </div>
  );
}

export default function PoliceList() {
  const [selectedPolice, setSelectedPolice] = useState(null); // popup xem chi tiết
  const [contactPolice, setContactPolice] = useState(null); // popup liên hệ
  const [notifyPolice, setNotifyPolice] = useState(null); // popup thông báo
  const [selectedAccidentId, setSelectedAccidentId] = useState("");

  const accidents = data || [];

  const handleCallPhone = () => {
    if (!contactPolice?.phone) {
      alert("Không có số điện thoại để gọi");
      return;
    }
    window.location.href = `tel:${contactPolice.phone}`;
  };

  const handleCallSystem = () => {
    alert(
      `Đang thực hiện cuộc gọi qua hệ thống tới ${
        contactPolice?.name || "cán bộ"
      }...`
    );
  };

  const handleSendNotification = () => {
    if (!selectedAccidentId) {
      alert("Vui lòng chọn vụ tai nạn");
      return;
    }
    const acc = accidents.find(
      (a) => String(a.id) === String(selectedAccidentId)
    );
    alert(
      `Đã gửi thông báo tới ${notifyPolice?.name || "cán bộ"} cho vụ tai nạn #${
        acc?.id
      } (${acc?.road || ""} - ${acc?.time || ""}).`
    );
    setNotifyPolice(null);
    setSelectedAccidentId("");
  };

  return (
    <div className="police-container">
      <h2 className="police-title">Danh Sách Cảnh Sát</h2>
      <div className="police-grid">
        {policeList.map((p) => (
          <PoliceCard
            key={p.id}
            police={p}
            onCardClick={setSelectedPolice}
            onContact={setContactPolice}
            onNotify={setNotifyPolice}
          />
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

      {/* Popup Liên hệ */}
      {contactPolice && (
        <div
          className="police-modal-overlay"
          onClick={() => setContactPolice(null)}
        >
          <div
            className="police-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Liên hệ {contactPolice.name}</h3>
            <p>
              <b>SĐT:</b> {contactPolice.phone || "Chưa cập nhật"}
            </p>
            <div className="modal-actions">
              <button className="contact-btn" onClick={handleCallPhone}>
                Gọi qua SĐT
              </button>
              <button className="notify-btn" onClick={handleCallSystem}>
                Gọi qua hệ thống
              </button>
            </div>
            <button
              className="close-btn"
              onClick={() => setContactPolice(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Popup Thông báo */}
      {notifyPolice && (
        <div
          className="police-modal-overlay"
          onClick={() => setNotifyPolice(null)}
        >
          <div
            className="police-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Gửi thông báo tới {notifyPolice.name}</h3>
            <div className="field">
              <label htmlFor="acc-select">Chọn vụ tai nạn</label>
              <select
                id="acc-select"
                value={selectedAccidentId}
                onChange={(e) => setSelectedAccidentId(e.target.value)}
              >
                <option value="">-- Chọn vụ tai nạn --</option>
                {accidents.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                  >{`#${a.id} - ${a.road} - ${a.time}`}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="notify-btn" onClick={handleSendNotification}>
                Xác nhận gửi
              </button>
            </div>
            <button className="close-btn" onClick={() => setNotifyPolice(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
