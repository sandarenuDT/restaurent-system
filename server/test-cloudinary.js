require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Config:', cloudinary.config());

cloudinary.uploader.upload('https://res.cloudinary.com/demo/image/upload/sample.jpg', { folder: 'restaurant-menu' })
  .then(result => console.log('SUCCESS:', result.secure_url))
  .catch(err => console.error('FAILED:', err));