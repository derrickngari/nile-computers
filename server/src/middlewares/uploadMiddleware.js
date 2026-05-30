import multer from "multer";
import path from "path";
import mime from "mime-types";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

  // Try original extension
  let ext = path.extname(file.originalname);

  // Fallback to mime type
  if (!ext) {
    ext = mime.extension(file.mimetype)
      ? `.${mime.extension(file.mimetype)}`
      : "";
  }

  cb(null, `${uniqueSuffix}${ext}`);
},

});

// File filter
const fileFilter = (req, file, cb) => {
  // WhatsApp supported formats
  const allowedFormats = [
    // Images
    "image/jpeg",
    "image/png",
    "image/jpg",
    // Documents
    "application/pdf",
  ];
  
  let mimetype = file.mimetype;
  if (mimetype === "application/octet-stream") {
    mimetype = mime.lookup(file.originalname) || "application/octet-stream";
  }

  if (allowedFormats.includes(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file format: ${mimetype}`), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024, fieldSize: 50 * 1024 * 1024 } });

export { upload };
