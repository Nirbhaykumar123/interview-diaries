import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from '../utils/errors';

// Ensure the local uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files (JPEG, PNG, WEBP) are allowed'), false);
  }
};

const uploadAvatarMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
}).single('avatar');

/**
 * Express middleware to handle avatar image uploading via Multer.
 * Maps Multer errors to client-friendly BadRequestErrors.
 */
export const uploadAvatar = (req: Request, res: Response, next: NextFunction) => {
  uploadAvatarMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new BadRequestError('File size is too large. Max limit is 2MB'));
      }
      return next(new BadRequestError(err.message));
    } else if (err) {
      return next(err);
    }
    next();
  });
};
