
import { v2 as cloudinary } from 'cloudinary';

// console.log(process.env.CLOUD_API_KEY,process.env.CLOUD_NAME,process.env.CLOUD_API_SECRET)




// Function to upload files to Cloudinary
const uploadImagesToCloudinary = async (files, userId) => {
//   console.log('cloud api', process.env.CLOUD_API_KEY)
// console.log('cloud name',process.env.CLOUD_NAME)
// console.log('secret key',process.env.CLOUD_API_SECRET)
// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

    try {
      const urls = [];
      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: `user_${userId}` });
        urls.push(result.secure_url);
      }
      return urls;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };
  




  export default uploadImagesToCloudinary
