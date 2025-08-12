const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

// Danh sách thư mục cần fix
const targetDirs = ["contexts", "locales", "image"];

function fixPath(fromFile, importPath) {
  // Nếu import không trỏ tới các thư mục targetDirs thì bỏ qua
  if (!targetDirs.some((dir) => importPath.includes(dir))) {
    return importPath;
  }

  // Lấy đường dẫn tuyệt đối của file gốc
  const fromDir = path.dirname(fromFile);

  // Tính đường dẫn tuyệt đối của thư mục cần import
  let absTarget = path.join(srcDir, importPath.replace(/^(\.\/|\.\.\/)+/, ""));

  // Nếu là thư mục, tìm file index
  if (fs.existsSync(absTarget) && fs.statSync(absTarget).isDirectory()) {
    if (fs.existsSync(path.join(absTarget, "index.jsx"))) {
      absTarget = path.join(absTarget, "index.jsx");
    } else if (fs.existsSync(path.join(absTarget, "index.js"))) {
      absTarget = path.join(absTarget, "index.js");
    }
  }

  // Nếu là file không có đuôi, thử thêm
  if (!fs.existsSync(absTarget)) {
    if (fs.existsSync(absTarget + ".jsx")) absTarget += ".jsx";
    else if (fs.existsSync(absTarget + ".js")) absTarget += ".js";
  }

  if (!fs.existsSync(absTarget)) {
    return importPath; // Không tìm thấy file
  }

  // Tính lại đường dẫn tương đối
  let newRelPath = path.relative(fromDir, absTarget).replace(/\\/g, "/");

  // Bỏ đuôi file
  newRelPath = newRelPath.replace(/(\.jsx|\.js)$/, "");

  if (!newRelPath.startsWith(".")) {
    newRelPath = "./" + newRelPath;
  }

  return newRelPath;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  let changed = false;

  content = content.replace(
    /import\s+[^'"]+\s+from\s+['"]([^'"]+)['"]/g,
    (match, p1) => {
      const newPath = fixPath(filePath, p1);
      if (newPath !== p1) {
        changed = true;
        console.log(`✔ ${path.relative(srcDir, filePath)}: ${p1} → ${newPath}`);
        return match.replace(p1, newPath);
      }
      return match;
    }
  );

  if (changed) {
    fs.writeFileSync(filePath, content, "utf-8");
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith(".jsx") || fullPath.endsWith(".js")) {
      fixFile(fullPath);
    }
  }
}

walk(srcDir);
console.log("🎯 Hoàn tất cập nhật đường dẫn import");
