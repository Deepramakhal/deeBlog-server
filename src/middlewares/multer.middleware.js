import multer from "multer";

import fs from 'fs';

const storage = multer.diskStorage({
destination: function (req, file, cb) {
  const dir = './public/temp';
  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) {
      return cb(err);
    }
    cb(null, dir);
  });
},
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
  
export const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 20 },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed!'), false);
    }
    cb(null, true);
  }
});
   