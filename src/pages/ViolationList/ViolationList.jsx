import React, { useEffect, useState } from "react";
import { useLanguageContext } from "../../contexts/LanguageContext";
import "./ViolationList.css";

// Hàm định dạng ngày tháng, nếu không có dữ liệu trả về "Không có dữ liệu"
function formatDate(dateStr) {
  if (!dateStr) return "Không có dữ liệu";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "Không có dữ liệu" : d.toLocaleString();
}

// Component hàng trong bảng danh sách vi phạm
function ViolationRow({ violation, onClick, t }) {
  // Lấy lỗi vi phạm đầu tiên hoặc hiển thị "Không xác định" nếu không có
  let firstError = t("violations.unknown");
  if (violation.violationDetails && violation.violationDetails.length > 0) {
    firstError = violation.violationDetails[0].violationType;
  }
  return (
    <tr onClick={() => onClick(violation)} style={{ cursor: "pointer" }}>
      <td>{violation.id}</td>
      <td className="violation-plate">{violation.licensePlate}</td>
      <td>{firstError}</td>
      <td className="violation-status">
        {violation.resolutionStatus
          ? t("violations.processed")
          : t("violations.notProcessed")}
      </td>
    </tr>
  );
}

// Popup hiển thị chi tiết vi phạm khi click vào hàng
function ViolationDetailPopup({ violation, onClose, t }) {
  if (!violation) return null; // Nếu không có vi phạm được chọn thì không hiển thị
  return (
    <div className="violation-popup-overlay" onClick={onClose}>
      {/* Ngăn chặn sự kiện click lan ra ngoài popup */}
      <div className="violation-popup" onClick={(e) => e.stopPropagation()}>
        <h3 className="violation-popup__title">
          {t("violations.detailTitle")} #{violation.id}
        </h3>
        {/* Hiển thị các trường thông tin vi phạm */}
        <p className="violation-popup__field">
          <strong>{t("violations.licensePlate")}:</strong>{" "}
          {violation.licensePlate}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.violatorName")}:</strong>{" "}
          {violation.violatorName}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.violatorId")}:</strong> {violation.violatorId}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.officerName")}:</strong>{" "}
          {violation.officerName}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.officerId")}:</strong> {violation.officerId}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.reportTime")}:</strong>{" "}
          {formatDate(violation.reportTime)}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.reportLocation")}:</strong>{" "}
          {violation.reportLocation}
        </p>
        <p className="violation-popup__field_hinh_thuc">
          <strong>{t("violations.penaltyType")}:</strong>{" "}
          {violation.penaltyType}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.resolutionDeadline")}:</strong>{" "}
          {violation.resolutionDeadline}
        </p>
        <p className="violation-popup__field_status">
          <strong>{t("violations.processingStatus")}:</strong>{" "}
          {violation.resolutionStatus
            ? t("violations.processed")
            : t("violations.notProcessed")}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.vehicleBrand")}:</strong>{" "}
          {violation.carBrand ||
            violation.motorcycleBrand ||
            t("violations.noInfo")}
        </p>
        <p className="violation-popup__field">
          <strong>{t("violations.vehicleColor")}:</strong>{" "}
          {violation.carColor ||
            violation.motorcycleColor ||
            t("violations.noInfo")}
        </p>
        {/* Hiển thị danh sách chi tiết vi phạm nếu có */}
        {violation.violationDetails?.length > 0 && (
          <div className="violation-popup__details">
            <strong>{t("violations.violationList")}:</strong>
            <ul className="violation-popup__list">
              {violation.violationDetails.map((detail) => (
                <li className="violation-popup__list-item" key={detail.id}>
                  {detail.violationType} - {t("violations.fineAmount")}:{" "}
                  {detail.fineAmount.toLocaleString()}đ
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Nút đóng popup */}
        <button className="violation-popup__close-btn" onClick={onClose}>
          {t("violations.close")}
        </button>
      </div>
    </div>
  );
}

function ViolationList() {
  // Lấy hàm dịch ngôn ngữ từ context
  const { t } = useLanguageContext();

  // State chứa danh sách vi phạm, vi phạm được chọn, trạng thái loading...
  const [violations, setViolations] = useState([]);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicleType, setVehicleType] = useState("all"); // Lọc theo loại xe
  const [motorbikeList, setMotorbikeList] = useState([]);
  const [carList, setCarList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Gọi API lấy dữ liệu vi phạm khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token"); // Lấy token lưu trong localStorage
    const licensePlateMoto = "71B199526"; // Biển số xe mô tô mẫu
    const licensePlateCar = "71A45678"; // Biển số xe ô tô mẫu

    // Fetch API vi phạm xe mô tô
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

    // Fetch API vi phạm xe ô tô
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

    // Chờ cả 2 API trả về
    Promise.all([fetchMotorbike, fetchCar])
      .then(([motorbikeData, carData]) => {
        // Hàm chuyển dữ liệu trả về thành mảng nếu không phải mảng
        const toArray = (d) =>
          Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];

        // Chuẩn hóa danh sách vi phạm mô tô, thêm thuộc tính vehicle và id độc nhất
        let motorList = toArray(motorbikeData).map((v, idx) => ({
          ...v,
          vehicle: "motorcycle",
          id: `m-${v.id ?? idx}`,
        }));

        // Chuẩn hóa danh sách vi phạm ô tô
        let carListData = toArray(carData).map((v, idx) => ({
          ...v,
          vehicle: "car",
          id: `c-${v.id ?? idx}`,
        }));

        // Kết hợp 2 danh sách
        const combined = [...motorList, ...carListData];

        // Loại bỏ trùng lặp dựa trên id hoặc biển số + thời gian báo cáo
        const map = new Map();
        combined.forEach((item, idx) => {
          const key =
            item.id ||
            `${item.licensePlate ?? "noPlate"}-${item.reportTime ?? idx}`;
          if (!map.has(key)) map.set(key, item);
        });
        const deduped = Array.from(map.values());

        // Lưu dữ liệu vào state
        setMotorbikeList(motorList);
        setCarList(carListData);
        setViolations(deduped);
        setLoading(false);
      })
      .catch((err) => {
        // Xử lý lỗi, báo lỗi khi chưa đăng nhập hoặc token hết hạn
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

  // Lọc danh sách vi phạm theo loại xe (all, motorcycle, car)
  let filteredViolations = violations.filter((v) =>
    vehicleType === "all" ? true : v.vehicle === vehicleType
  );

  // Lọc tiếp theo từ khóa tìm kiếm biển số hoặc id
  const term = searchTerm.trim().toLowerCase();
  if (term !== "") {
    filteredViolations = filteredViolations.filter((v) => {
      const idStr = (v.id ?? "").toString().toLowerCase();
      const plate = (v.licensePlate ?? "").toLowerCase();
      return idStr.includes(term) || plate.includes(term);
    });
  }

  // Hiển thị loading nếu đang chờ API
  if (loading)
    return (
      <div className="violation-list__loading">{t("violations.loading")}</div>
    );

  // JSX trả về UI danh sách vi phạm
  return (
    <div className="violation-list-container">
      <h2 className="violation-list__title">{t("violations.title")}</h2>

      {/* Input tìm kiếm */}
      <input
        type="text"
        placeholder={t("violations.searchPlaceholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="violation-search"
      />

      {/* Bộ lọc loại xe */}
      <div className="violation-filter">
        <label className="violation-filter__option">
          <input
            type="radio"
            name="vehicleType"
            value="all"
            checked={vehicleType === "all"}
            onChange={() => setVehicleType("all")}
          />
          {t("violations.all")}
        </label>
        <label className="violation-filter__option">
          <input
            type="radio"
            name="vehicleType"
            value="motorcycle"
            checked={vehicleType === "motorcycle"}
            onChange={() => setVehicleType("motorcycle")}
          />
          {t("violations.motorcycle")}
        </label>
        <label className="violation-filter__option">
          <input
            type="radio"
            name="vehicleType"
            value="car"
            checked={vehicleType === "car"}
            onChange={() => setVehicleType("car")}
          />
          {t("violations.car")}
        </label>
      </div>

      {/* Bảng danh sách vi phạm */}
      <table className="violation-table">
        <thead>
          <tr>
            <th>{t("violations.table.id")}</th>
            <th>{t("violations.table.licensePlate")}</th>
            <th>{t("violations.table.violation")}</th>
            <th>{t("violations.table.processingStatus")}</th>
          </tr>
        </thead>
        <tbody>
          {filteredViolations.map((v) => (
            <ViolationRow
              key={v.id}
              violation={v}
              onClick={setSelectedViolation}
              t={t}
            />
          ))}
          {/* Nếu không có dữ liệu vi phạm thì hiện thông báo */}
          {filteredViolations.length === 0 && (
            <tr>
              <td colSpan="4" className="violation-list__no-data">
                {t("violations.noData")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Popup chi tiết vi phạm */}
      <ViolationDetailPopup
        violation={selectedViolation}
        onClose={() => setSelectedViolation(null)}
        t={t}
      />
    </div>
  );
}

export default ViolationList;
