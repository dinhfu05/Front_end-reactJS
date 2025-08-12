import React, { useEffect, useState } from "react";
import "./ViolationList.css";

function formatDate(dateStr) {
  if (!dateStr) return "Không có dữ liệu";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Không có dữ liệu" : d.toLocaleString();
}

function ViolationRow({ violation, onClick }) {
  let firstError = "Không xác định";
  if (violation.violationDetails && violation.violationDetails.length > 0) {
    firstError = violation.violationDetails[0].violationType;
  }
  return (
    <tr onClick={() => onClick(violation)} style={{ cursor: "pointer" }}>
      <td>{violation.id}</td>
      <td className="violation-plate">{violation.licensePlate}</td>
      <td>{firstError}</td>
      <td className="violation-status">
        {violation.resolutionStatus ? "Đã xử lý" : "Chưa xử lý"}
      </td>
    </tr>
  );
}

function ViolationDetailPopup({ violation, onClose }) {
  if (!violation) return null;
  return (
    <div className="violation-popup-overlay" onClick={onClose}>
      <div className="violation-popup" onClick={(e) => e.stopPropagation()}>
        <h3 className="violation-popup__title">
          Chi tiết biên bản #{violation.id}
        </h3>
        <p className="violation-popup__field">
          <strong>Biển số:</strong> {violation.licensePlate}
        </p>
        <p className="violation-popup__field">
          <strong>Tên người vi phạm:</strong> {violation.violatorName}
        </p>
        <p className="violation-popup__field">
          <strong>CCCD người vi phạm:</strong> {violation.violatorId}
        </p>
        <p className="violation-popup__field">
          <strong>Tên cảnh sát lập biên bản:</strong> {violation.officerName}
        </p>
        <p className="violation-popup__field">
          <strong>Mã cảnh sát lập biên bản:</strong> {violation.officerId}
        </p>
        <p className="violation-popup__field">
          <strong>Thời gian lập biên bản:</strong>{" "}
          {formatDate(violation.reportTime)}
        </p>
        <p className="violation-popup__field">
          <strong>Địa điểm:</strong> {violation.reportLocation}
        </p>
        <p className="violation-popup__field_hinh_thuc">
          <strong>Hình thức phạt:</strong> {violation.penaltyType}
        </p>
        <p className="violation-popup__field">
          <strong>Hạn xử lý:</strong> {violation.resolutionDeadline}
        </p>
        <p className="violation-popup__field_status">
          <strong>Trạng thái xử lý:</strong>{" "}
          {violation.resolutionStatus ? "Đã xử lý" : "Chưa xử lý"}
        </p>
        <p className="violation-popup__field">
          <strong>Hiệu xe:</strong>{" "}
          {violation.carBrand ||
            violation.motorcycleBrand ||
            "Không có thông tin"}
        </p>
        <p className="violation-popup__field">
          <strong>Màu xe:</strong>{" "}
          {violation.carColor ||
            violation.motorcycleColor ||
            "Không có thông tin"}
        </p>
        {violation.violationDetails?.length > 0 && (
          <div className="violation-popup__details">
            <strong>Danh sách vi phạm:</strong>
            <ul className="violation-popup__list">
              {violation.violationDetails.map((detail) => (
                <li className="violation-popup__list-item" key={detail.id}>
                  {detail.violationType} - Số tiền phạt:{" "}
                  {detail.fineAmount.toLocaleString()}đ
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="violation-popup__close-btn" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
}

function ViolationList() {
  const [violations, setViolations] = useState([]);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicleType, setVehicleType] = useState("all");
  const [motorbikeList, setMotorbikeList] = useState([]);
  const [carList, setCarList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const licensePlateMoto = "71B199526";
    const licensePlateCar = "71A45678";

    const fetchMotorbike = fetch(
      `http://localhost:8087/quet/api/motorcycle-violations/license-plate/${licensePlateMoto}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    ).then(async (res) => {
      if (!res.ok) throw new Error(`Motorbike API error: ${res.status}`);
      return res.json();
    });

    const fetchCar = fetch(
      `http://localhost:8087/quet/api/car-violations/license-plate/${licensePlateCar}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    ).then(async (res) => {
      if (!res.ok) throw new Error(`Car API error: ${res.status}`);
      return res.json();
    });

    Promise.all([fetchMotorbike, fetchCar])
      .then(([motorbikeData, carData]) => {
        const toArray = (d) =>
          Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];

        let motorList = toArray(motorbikeData).map((v, idx) => ({
          ...v,
          vehicle: "motorcycle",
          id: `m-${v.id ?? idx}`,
        }));

        let carListData = toArray(carData).map((v, idx) => ({
          ...v,
          vehicle: "car",
          id: `c-${v.id ?? idx}`,
        }));

        const combined = [...motorList, ...carListData];
        const map = new Map();
        combined.forEach((item, idx) => {
          const key =
            item.id ||
            `${item.licensePlate ?? "noPlate"}-${item.reportTime ?? idx}`;
          if (!map.has(key)) map.set(key, item);
        });
        const deduped = Array.from(map.values());

        setMotorbikeList(motorList);
        setCarList(carListData);
        setViolations(deduped);
        setLoading(false);
      })
      .catch((err) => {
        setViolations([]);
        setMotorbikeList([]);
        setCarList([]);
        setLoading(false);
        if (err.message.includes("401")) {
          alert(
            "Bạn chưa đăng nhập hoặc token đã hết hạn. Vui lòng đăng nhập lại!"
          );
        } else {
          alert("Lỗi lấy dữ liệu vi phạm: " + err.message);
        }
      });
  }, []);

  let filteredViolations = violations.filter((v) =>
    vehicleType === "all" ? true : v.vehicle === vehicleType
  );

  const term = searchTerm.trim().toLowerCase();
  if (term !== "") {
    filteredViolations = filteredViolations.filter((v) => {
      const idStr = (v.id ?? "").toString().toLowerCase();
      const plate = (v.licensePlate ?? "").toLowerCase();
      return idStr.includes(term) || plate.includes(term);
    });
  }

  if (loading)
    return <div className="violation-list__loading">Đang tải dữ liệu...</div>;

  return (
    <div className="violation-list-container">
      <h2 className="violation-list__title">Danh sách biên bản vi phạm</h2>

      <input
        type="text"
        placeholder="Tìm theo ID hoặc biển số..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="violation-search"
      />

      <div className="violation-filter">
        <label className="violation-filter__option">
          <input
            type="radio"
            name="vehicleType"
            value="all"
            checked={vehicleType === "all"}
            onChange={() => setVehicleType("all")}
          />
          Tất cả
        </label>
        <label className="violation-filter__option">
          <input
            type="radio"
            name="vehicleType"
            value="motorcycle"
            checked={vehicleType === "motorcycle"}
            onChange={() => setVehicleType("motorcycle")}
          />
          Xe máy
        </label>
        <label className="violation-filter__option">
          <input
            type="radio"
            name="vehicleType"
            value="car"
            checked={vehicleType === "car"}
            onChange={() => setVehicleType("car")}
          />
          Xe hơi
        </label>
      </div>

      <table className="violation-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Biển số</th>
            <th>Lỗi vi phạm</th>
            <th>Tình trạng xử lý</th>
          </tr>
        </thead>
        <tbody>
          {filteredViolations.map((v) => (
            <ViolationRow
              key={v.id}
              violation={v}
              onClick={setSelectedViolation}
            />
          ))}
          {filteredViolations.length === 0 && (
            <tr>
              <td colSpan="4" className="violation-list__no-data">
                Không tìm thấy biên bản phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ViolationDetailPopup
        violation={selectedViolation}
        onClose={() => setSelectedViolation(null)}
      />
    </div>
  );
}

export default ViolationList;
