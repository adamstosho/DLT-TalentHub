const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && 
        process.env.CLOUDINARY_API_KEY && 
        process.env.CLOUDINARY_API_SECRET) {
      await cloudinary.api.ping();
      logger.info('✅ Cloudinary connected successfully');
    } else {
      logger.warn('⚠️ Cloudinary credentials not found. File uploads will be disabled.');
    }
  } catch (error) {
    logger.error('❌ Cloudinary connection failed:', error.message);
  }
};

// Upload file to Cloudinary
const uploadToCloudinary = async (file, folder = 'dlt-talenthub') => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary not configured');
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      size: result.bytes
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw new Error('File upload failed');
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (public_id) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return;
    }

    await cloudinary.uploader.destroy(public_id);
    logger.info(`File deleted from Cloudinary: ${public_id}`);
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
  }
};

module.exports = {
  cloudinary,
  testCloudinaryConnection,
  uploadToCloudinary,
  deleteFromCloudinary
}; 