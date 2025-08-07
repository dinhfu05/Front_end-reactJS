import { useState } from "react";
import data from "../../data";
import "./Accident.css";

function Accident() {
  const [selectedAccident, setSelectedAccident] = useState(null);

  const handleRowClick = (item) => {
    setSelectedAccident(item);
  };

  return (
    <div className="accident">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Road</th>
              <th>Time</th>
              <th>Image</th>
              <th>User</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
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
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Popup Modal */}
        {selectedAccident && (
          <div
            className="modal-overlay"
            onClick={() => setSelectedAccident(null)}
          >
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Chi tiết tai nạn</h2>
              <p>
                <strong>ID:</strong> {selectedAccident.id}
              </p>
              <p>
                <strong>Đường:</strong> {selectedAccident.road}
              </p>
              <p>
                <strong>Thời gian:</strong> {selectedAccident.time}
              </p>
              <p>
                <strong>Người báo cáo:</strong> {selectedAccident.user}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedAccident.status}
              </p>
              <img src={selectedAccident.image} alt="Accident Detail" />
              <button onClick={() => setSelectedAccident(null)}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Accident;
