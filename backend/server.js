const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8087;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let accidents = [];
let responders = [];

const nextId = (arr, key) =>
  (arr.length ? Math.max(...arr.map((x) => x[key])) : 0) + 1;
const toMs = (ts) =>
  typeof ts === "number" ? (ts < 1e12 ? ts * 1000 : ts) : ts;

app.get("/health", (_, res) => res.json({ status: "success", ok: true }));

// Accidents
app.get("/api/accidents", (_, res) => {
  res.json({ status: "success", data: accidents });
});
app.get("/api/accidents/:id", (req, res) => {
  const id = Number(req.params.id);
  const acc = accidents.find((a) => a.accident_id === id);
  if (!acc)
    return res
      .status(404)
      .json({ status: "error", message: "Không tìm thấy vụ tai nạn" });
  res.json({ status: "success", data: acc });
});
app.post("/api/accidents", (req, res) => {
  const b = req.body || {};
  const road_name = b.road_name ?? b.road ?? b.route;
  const tsRaw = b.timestamp ?? b.time ?? b.ts;
  const img = b.image_url || b.image || "";

  if (!road_name)
    return res
      .status(400)
      .json({ status: "error", message: "Thiếu road_name" });

  const acc = {
    accident_id: nextId(accidents, "accident_id"),
    road_name,
    timestamp: tsRaw !== undefined ? toMs(tsRaw) : Date.now(),
    image_url: img || "https://via.placeholder.com/300x180.png?text=Accident",
    responder: Array.isArray(b.responder)
      ? b.responder
      : Array.isArray(b.responders)
      ? b.responders
      : [],
  };

  accidents.push(acc);
  return res.status(201).json({ status: "success", data: acc });
});
app.patch("/api/accidents/:id", (req, res) => {
  const id = Number(req.params.id);
  const acc = accidents.find((a) => a.accident_id === id);
  if (!acc)
    return res
      .status(404)
      .json({ status: "error", message: "Không tìm thấy vụ tai nạn" });

  const b = req.body || {};
  if (b.road_name ?? b.road ?? b.route)
    acc.road_name = b.road_name ?? b.road ?? b.route;
  if (b.timestamp ?? b.time ?? b.ts)
    acc.timestamp = toMs(b.timestamp ?? b.time ?? b.ts);
  if (b.image_url ?? b.image) acc.image_url = b.image_url ?? b.image;

  res.json({ status: "success", data: acc });
});

// Responders
app.get("/api/responders", (_, res) => {
  res.json({ status: "success", data: responders });
});
app.post("/api/responders", (req, res) => {
  const { accident_id, unit_type, status, name } = req.body || {};
  if (!accident_id)
    return res
      .status(400)
      .json({ status: "error", message: "Thiếu accident_id" });
  if (!unit_type || !status)
    return res
      .status(400)
      .json({ status: "error", message: "Thiếu unit_type / status" });

  const acc = accidents.find((a) => a.accident_id === Number(accident_id));
  if (!acc)
    return res
      .status(404)
      .json({ status: "error", message: "Không tìm thấy vụ tai nạn" });

  const r = {
    id: nextId(responders, "id"),
    name: name || "",
    unit_type,
    status,
    accident_id: Number(accident_id),
  };
  responders.push(r);

  acc.responder = Array.isArray(acc.responder) ? acc.responder : [];
  acc.responder.push({
    unit_id: `unit_${r.id}`,
    name: r.name,
    unit_type,
    status,
  });

  return res.status(201).json({ status: "success", data: r });
});
app.patch("/api/responders/:id", (req, res) => {
  const id = Number(req.params.id);
  const r = responders.find((x) => x.id === id);
  if (!r)
    return res
      .status(404)
      .json({ status: "error", message: "Không tìm thấy responder" });

  const { name, unit_type, status } = req.body || {};
  if (name !== undefined) r.name = name;
  if (unit_type) r.unit_type = unit_type;
  if (status) r.status = status;

  const acc = accidents.find((a) => a.accident_id === r.accident_id);
  if (acc && Array.isArray(acc.responder)) {
    const i = acc.responder.findIndex(
      (x) => x.unit_id === `unit_${id}` || x.name === r.name
    );
    if (i > -1)
      acc.responder[i] = {
        ...(acc.responder[i] || {}),
        name: r.name,
        unit_type: r.unit_type,
        status: r.status,
      };
  }

  res.json({ status: "success", data: r });
});

// Reset
app.post("/__reset", (_, res) => {
  accidents = [];
  responders = [];
  res.json({ status: "success", message: "Đã xoá toàn bộ dữ liệu in-memory" });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
