import data from "../../data";
import "./Accident.css";

function Accident() {
  return (
    <div className="accident">
      <div className="nav-bar">
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
              <tr key={item.id}>
                <td>{item.id}</td>
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
      </div>
    </div>
  );
}

export default Accident;
