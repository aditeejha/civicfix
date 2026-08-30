import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

const allowedExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
];

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const extension = path
    .extname(file.originalname)
    .toLowerCase();

  const validMimeType =
    allowedImageTypes.includes(file.mimetype);

  const validExtension =
    allowedExtensions.includes(extension);

  console.log(
    "Uploaded file:",
    file.originalname,
    file.mimetype,
    extension
  );

  if (validMimeType || validExtension) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;