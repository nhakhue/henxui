import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to store templates
const DATA_DIR = path.join(process.cwd(), "data");
const TEMPLATES_FILE = path.join(DATA_DIR, "templates.json");

// Ensure data directory and templates file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(TEMPLATES_FILE)) {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify({}), "utf8");
}

// Helper to read templates
interface Template {
  id: string;
  segments: { text: string; color: string }[];
  title?: string;
  copies: number;
  password?: string;
  createdAt: string;
}

function readTemplates(): Record<string, Template> {
  try {
    const data = fs.readFileSync(TEMPLATES_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Helper to generate a 4-character randomized alphanumeric code
function generate4CharId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to write templates
function writeTemplates(templates: Record<string, Template>) {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing templates database:", err);
  }
}

// API Routes
// 1. Create a dynamic shareable template
app.post("/api/templates", (req, res) => {
  try {
    const { segments, title, customId, password } = req.body;
    if (!segments || !Array.isArray(segments)) {
       res.status(400).json({ error: "Segments are required and must be an array" });
       return;
    }

    const templates = readTemplates();
    
    // Normalize customId to lowercase Alphanumeric
    let id = (customId || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // If no customId or invalid/empty pattern, generate random 4-char
    if (!id) {
      let attempts = 0;
      do {
        id = generate4CharId();
        attempts++;
      } while (templates[id] && attempts < 100);
    }

    // Check password if template already exists and has a password
    const existing = templates[id];
    if (existing && existing.password) {
      if (existing.password !== password) {
         res.status(403).json({ error: "Mật khẩu chỉnh sửa không chính xác! Hãy nhập đúng mật khẩu để cập nhật." });
         return;
      }
    }

    let isAutoPassword = false;
    let savedPassword = password;
    if (!savedPassword || savedPassword.trim() === "") {
      // Generate standard 5-digit code if user didn't enter a password
      savedPassword = Math.floor(10000 + Math.random() * 90000).toString();
      isAutoPassword = true;
    }

    // Upsert or create template mapping
    templates[id] = {
      id,
      segments,
      title: title || "Vòng quay tùy chỉnh",
      copies: existing ? (existing.copies || 0) : 0,
      password: savedPassword,
      createdAt: existing ? (existing.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    writeTemplates(templates);
    res.json({ id, password: savedPassword, isAutoPassword });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 2. Fetch template by ID & increment COPY COUNT
app.get("/api/templates/:id", (req, res) => {
  try {
    const { id } = req.params;
    const templates = readTemplates();

    if (!templates[id]) {
       res.status(404).json({ error: "Không tìm thấy vòng quay này!" });
       return;
    }

    // Increment Copy Count
    templates[id].copies = (templates[id].copies || 0) + 1;
    writeTemplates(templates);

    // Filter out password from response payload
    const responsePayload = {
      id: templates[id].id,
      segments: templates[id].segments,
      title: templates[id].title,
      copies: templates[id].copies,
      hasPassword: !!templates[id].password,
      createdAt: templates[id].createdAt
    };

    res.json(responsePayload);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
