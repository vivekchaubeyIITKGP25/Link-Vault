import { promises as fs } from 'fs';
import path from 'path';

const uploadsDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

const sanitizeFileName = (name) => {
  const base = path.basename(name || '');
  if (!base || base === '.' || base === '..') {
    return 'file';
  }
  return base.replace(/[^\w.\-() ]+/g, '_');
};

export const ensureUploadsDir = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
};

export const getUploadsDir = () => uploadsDir;

export const buildFileUrl = (uniqueId, fileName) => {
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const safeName = encodeURIComponent(fileName);
  return `${baseUrl}/uploads/${uniqueId}/${safeName}`;
};

export const saveFileToLocal = async (file, uniqueId) => {
  await ensureUploadsDir();
  const safeName = sanitizeFileName(file.originalname);
  const fileDir = path.join(uploadsDir, uniqueId);
  await fs.mkdir(fileDir, { recursive: true });

  const filePath = path.join(fileDir, safeName);
  await fs.writeFile(filePath, file.buffer);

  return {
    fileName: safeName,
    filePath
  };
};

export const deleteLocalFile = async (filePath) => {
  if (!filePath) return;
  try {
    await fs.rm(filePath, { force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

export const deleteLocalDir = async (dirPath) => {
  if (!dirPath) return;
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};
