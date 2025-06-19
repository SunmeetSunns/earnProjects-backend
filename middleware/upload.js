const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'profilePic') {
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      return cb(new Error('Only .jpg, .jpeg, .png formats allowed for profile picture.'));
    }
  }
  if (file.fieldname === 'resume') {
    if (!['.pdf', '.doc', '.docx'].includes(ext)) {
      return cb(new Error('Only .pdf, .doc, .docx formats allowed for resume.'));
    }
  }
  cb(null, true);
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.parse(file.originalname).name;
    const isResume = file.fieldname === 'resume';
    const folder = isResume ? 'resumes' : 'profilePics';

    return {
      folder,
      resource_type: isResume ? 'raw' : 'image',
      format: isResume ? ext.replace('.', '') : undefined, // <-- ✅ this forces cloudinary to store it as pdf/doc/docx properly
      public_id: `${Date.now()}-${name}`, // <- ✅ no extension in public_id, let cloudinary handle it using 'format'
    };
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = upload;
