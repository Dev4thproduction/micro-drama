const cloudinary = require('../config/cloudinary');
const { sendSuccess } = require('../utils/response');

const getUploadSignature = async (req, res, next) => {
  try {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const folder = 'micro_drama_content';

    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: folder,
    }, process.env.CLOUDINARY_API_SECRET);

    return sendSuccess(res, {
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder
    });
  } catch (err) {
    return next(err);
  }
};

module.exports = { getUploadSignature };