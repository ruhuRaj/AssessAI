import multer from 'multer';

const allowed = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/** Memory storage — file is uploaded to Cloudinary from the buffer */
export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.toLowerCase();
    if (
      allowed.has(file.mimetype) ||
      ['.jpg', '.jpeg', '.png', '.webp', '.gif'].some((e) => ext.endsWith(e))
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'));
    }
  },
}).single('avatar');
