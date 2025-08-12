// Component quản lý danh sách tai nạn, hiển thị bảng và popup chi tiết tai nạn

import { useState } from "react";
import { useLanguageContext } from "../contexts/LanguageContext";
import data from "../../data";
import "./Accident.css";

function Accident() {
  const { t } = useLanguageContext();
  // State lưu tai nạn được chọn để hiển thị chi tiết
  const [selectedAccident, setSelectedAccident] = useState(null);

  // Xử lý click vào 1 dòng trong bảng để mở popup chi tiết
  const handleRowClick = (item) => {
    setSelectedAccident(item);
  };

  return (
    <div className="accident">
      <div className="table-container">
        {/* Bảng danh sách tai nạn */}
        <table>
          <thead>
            <tr>
              <th>{t("accident.table.id")}</th>
              <th>{t("accident.table.road")}</th>
              <th>{t("accident.table.time")}</th>
              <th>{t("accident.table.image")}</th>
              <th>{t("accident.table.user")}</th>
              <th>{t("accident.table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {/* Render từng dòng tai nạn */}
            {data.map((item) => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td className="clickable-id">{item.id}</td>
                <td>{item.road}</td>
                <td>{item.time}</td>
                <td>
                  <img src={item.image} alt="Accident" />
                </td>
                <td>{item.user}</td>
                <td
                  className={
                    item.status === "Open" ? "status-open" : "status-closed"
                  }
                >
                  {/* Hiển thị trạng thái với ngôn ngữ */}
                  {item.status === "Open"
                    ? t("accident.status.open")
                    : t("accident.status.closed")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Popup chi tiết tai nạn khi 1 dòng được chọn */}
        {selectedAccident && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedAccident(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{t("accident.detailTitle")}</h2>
              <p>
                <strong>{t("accident.table.id")}:</strong> {selectedAccident.id}
              </p>
              <p>
                <strong>{t("accident.road")}</strong> {selectedAccident.road}
              </p>
              <p>
                <strong>{t("accident.time")}</strong> {selectedAccident.time}
              </p>
              <p>
                <strong>{t("accident.reporter")}</strong>{" "}
                {selectedAccident.user}
              </p>
              <p>
                <strong>{t("accident.status")}</strong>{" "}
                {selectedAccident.status}
              </p>
              <img src={selectedAccident.image} alt="Accident Detail" />
              <button onClick={() => setSelectedAccident(null)}>
                {t("accident.close")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Accident;
