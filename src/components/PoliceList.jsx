import React, { useState } from "react";
import { useLanguageContext } from "../contexts/LanguageContext";
import data from "../../data";
import "./PoliceList.css";

// Danh sách cảnh sát mẫu, mỗi người có id, tên, quân hàm, chức vụ, ảnh, khu vực, số điện thoại
const policeList = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    rank: "Thượng úy",
    position: "traffic",
    img: "https://randomuser.me/api/portraits/men/1.jpg",
    area: "Phường Bến Nghé",
    phone: "0901234567",
  },
  {
    id: 2,
    name: "Trần Thị B",
    rank: "Đại úy",
    position: "criminal",
    img: "https://randomuser.me/api/portraits/women/2.jpg",
    area: "Phường Thạnh Mỹ Tây",
    phone: "0902345678",
  },
  {
    id: 3,
    name: "Lê Văn C",
    rank: "Thiếu tá",
    position: "traffic",
    img: "https://randomuser.me/api/portraits/men/3.jpg",
    area: "Phường Tân Định",
    phone: "0903456789",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    rank: "Trung úy",
    position: "mobile",
    img: "https://randomuser.me/api/portraits/women/4.jpg",
    area: "Phường Linh Trung",
    phone: "0904567890",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    rank: "Đại tá",
    position: "traffic",
    img: "https://randomuser.me/api/portraits/men/5.jpg",
    area: "Phường Thảo Điền",
    phone: "0905678901",
  },
  {
    id: 6,
    name: "Vũ Thị F",
    rank: "Thượng tá",
    position: "mobile",
    img: "https://randomuser.me/api/portraits/women/6.jpg",
    area: "Phường Phú Mỹ",
    phone: "0906789012",
  },
  {
    id: 7,
    name: "Bùi Văn G",
    rank: "Trung tá",
    position: "mobile",
    img: "https://randomuser.me/api/portraits/men/7.jpg",
    area: "Phường An Lạc",
    phone: "0907890123",
  },
  {
    id: 8,
    name: "Ngô Thị H",
    rank: "Đại úy",
    position: "criminal",
    img: "https://randomuser.me/api/portraits/women/8.jpg",
    area: "Phường Hiệp Bình Chánh",
    phone: "0908901234",
  },
  {
    id: 9,
    name: "Phan Văn I",
    rank: "Thiếu tá",
    position: "traffic",
    img: "https://randomuser.me/api/portraits/men/9.jpg",
    area: "Phường Tân Phú",
    phone: "0909012345",
  },
  {
    id: 10,
    name: "Đỗ Thị J",
    rank: "Trung úy",
    position: "traffic",
    img: "https://randomuser.me/api/portraits/women/10.jpg",
    area: "Phường Cát Lái",
    phone: "0910123456",
  },
];

// Component hiển thị card thông tin từng cảnh sát
function PoliceCard({ police, onCardClick, onContact, onNotify }) {
  const { t } = useLanguageContext();

  return (
    <div className="police-card" onClick={() => onCardClick(police)}>
      {/* Ảnh cảnh sát */}
      <img src={police.img} alt={police.name} className="police-img" />

      {/* Tên cảnh sát */}
      <h4 className="police-name">{police.name}</h4>

      {/* Quân hàm */}
      <p className="police-rank">{police.rank}</p>

      {/* Chức vụ, lấy từ ngôn ngữ */}
      <p className="police-position">
        {t(`police.position.${police.position}`)}
      </p>

      {/* Khu vực làm việc */}
      <p className="police-area">{police.area}</p>

      {/* Số điện thoại, nếu không có sẽ hiển thị thông báo chưa cập nhật */}
      <p className="police-phone">
        <b>{t("police.phone")}</b> {police.phone || t("police.phoneNotUpdated")}
      </p>

      {/* Hai nút hành động: liên hệ và gửi thông báo */}
      <div className="action-buttons">
        <button
          className="contact-btn"
          onClick={(e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài div cha
            onContact(police);
          }}
        >
          {t("police.contact")}
        </button>
        <button
          className="notify-btn"
          onClick={(e) => {
            e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài div cha
            onNotify(police);
          }}
        >
          {t("police.notify")}
        </button>
      </div>
    </div>
  );
}

// Component danh sách cảnh sát chính
export default function PoliceList() {
  const { t } = useLanguageContext();

  // State lưu cảnh sát được chọn để xem chi tiết
  const [selectedPolice, setSelectedPolice] = useState(null);

  // State lưu cảnh sát được chọn để liên hệ
  const [contactPolice, setContactPolice] = useState(null);

  // State lưu cảnh sát được chọn để gửi thông báo
  const [notifyPolice, setNotifyPolice] = useState(null);

  // State lưu id vụ tai nạn được chọn để gửi thông báo
  const [selectedAccidentId, setSelectedAccidentId] = useState("");

  // Dữ liệu vụ tai nạn (import từ file data)
  const accidents = data || [];

  // Hàm gọi điện thoại trực tiếp đến cảnh sát đang chọn liên hệ
  const handleCallPhone = () => {
    if (!contactPolice?.phone) {
      alert(t("police.noPhoneAlert")); // Nếu không có số điện thoại, báo lỗi
      return;
    }
    // Gọi điện thoại qua url tel:
    window.location.href = `tel:${contactPolice.phone}`;
  };

  // Hàm gọi hệ thống (giả lập alert)
  const handleCallSystem = () => {
    alert(
      `${t("police.callingSystem")} ${
        contactPolice?.name || t("police.officer")
      }...`
    );
  };

  // Hàm gửi thông báo cho cảnh sát về vụ tai nạn đã chọn
  const handleSendNotification = () => {
    if (!selectedAccidentId) {
      alert(t("police.selectAccidentAlert")); // Nếu chưa chọn vụ tai nạn, báo lỗi
      return;
    }
    // Tìm vụ tai nạn theo id được chọn
    const acc = accidents.find(
      (a) => String(a.id) === String(selectedAccidentId)
    );
    // Hiển thị thông báo gửi thành công
    alert(
      `${t("police.notificationSent")} ${
        notifyPolice?.name || t("police.officer")
      } ${t("police.forAccident")} #${acc?.id} (${acc?.road || ""} - ${
        acc?.time || ""
      }).`
    );
    // Reset state gửi thông báo
    setNotifyPolice(null);
    setSelectedAccidentId("");
  };

  return (
    <div className="police-container">
      {/* Tiêu đề trang */}
      <h2 className="police-title">{t("police.title")}</h2>

      {/* Lưới hiển thị danh sách các card cảnh sát */}
      <div className="police-grid">
        {policeList.map((p) => (
          <PoliceCard
            key={p.id}
            police={p}
            onCardClick={setSelectedPolice} // Chọn xem chi tiết cảnh sát
            onContact={setContactPolice} // Chọn cảnh sát liên hệ
            onNotify={setNotifyPolice} // Chọn cảnh sát gửi thông báo
          />
        ))}
      </div>

      {/* Popup chi tiết cảnh sát khi click card */}
      {selectedPolice && (
        <div className="modal-overlay" onClick={() => setSelectedPolice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Ảnh và tên */}
            <img
              src={selectedPolice.img}
              alt={selectedPolice.name}
              className="modal-img"
            />
            <h3>{selectedPolice.name}</h3>
            <p>
              <b>{t("police.rank")}</b> {selectedPolice.rank}
            </p>
            <p>
              <b>{t("police.position")}</b>{" "}
              {t(`police.position.${selectedPolice.position}`)}
            </p>
            {/* Nút đóng popup */}
            <button
              className="close-btn"
              onClick={() => setSelectedPolice(null)}
            >
              {t("police.close")}
            </button>
          </div>
        </div>
      )}

      {/* Popup liên hệ cảnh sát */}
      {contactPolice && (
        <div
          className="police-modal-overlay"
          onClick={() => setContactPolice(null)}
        >
          <div
            className="police-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {t("police.contactTitle")} {contactPolice.name}
            </h3>
            <p>
              <b>{t("police.phone")}</b>{" "}
              {contactPolice.phone || t("police.phoneNotUpdated")}
            </p>
            <div className="modal-actions">
              {/* Nút gọi điện thoại */}
              <button className="contact-btn" onClick={handleCallPhone}>
                {t("police.callPhone")}
              </button>
              {/* Nút gọi hệ thống */}
              <button className="notify-btn" onClick={handleCallSystem}>
                {t("police.callSystem")}
              </button>
            </div>
            {/* Nút đóng popup */}
            <button
              className="close-btn"
              onClick={() => setContactPolice(null)}
            >
              {t("police.close")}
            </button>
          </div>
        </div>
      )}

      {/* Popup gửi thông báo vụ tai nạn */}
      {notifyPolice && (
        <div
          className="police-modal-overlay"
          onClick={() => setNotifyPolice(null)}
        >
          <div
            className="police-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {t("police.notifyTitle")} {notifyPolice.name}
            </h3>
            {/* Chọn vụ tai nạn để gửi thông báo */}
            <div className="field">
              <label htmlFor="acc-select">{t("police.selectAccident")}</label>
              <select
                id="acc-select"
                value={selectedAccidentId}
                onChange={(e) => setSelectedAccidentId(e.target.value)}
              >
                <option value="">
                  {t("police.selectAccidentPlaceholder")}
                </option>
                {accidents.map((a) => (
                  <option
                    key={a.id}
                    value={a.id}
                  >{`#${a.id} - ${a.road} - ${a.time}`}</option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              {/* Nút gửi thông báo */}
              <button className="notify-btn" onClick={handleSendNotification}>
                {t("police.confirmSend")}
              </button>
            </div>
            {/* Nút đóng popup */}
            <button className="close-btn" onClick={() => setNotifyPolice(null)}>
              {t("police.close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
