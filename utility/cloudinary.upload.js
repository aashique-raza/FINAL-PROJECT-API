
import { v2 as cloudinary } from 'cloudinary';

// console.log(process.env.CLOUD_API_KEY,process.env.CLOUD_NAME,process.env.CLOUD_API_SECRET)

// Cloudinary configuration
cloudinary.config({
  cloud_name: 'dhj7ys0nn',
  api_key: '973758911928742',
  api_secret: 'bC3reHCcAsKdfNVdcaVBZEdaagM'
});

// Function to upload files to Cloudinary
const uploadImagesToCloudinary = async (files, userId) => {
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
  



// uploadImagesToCloudinary(userId, images)
//   .then(uploadedUrls => {
//     console.log('Uploaded image URLs:', uploadedUrls);
//     // Handle uploaded image URLs as needed
//   })
//   .catch(error => {
//     // Handle error if any
//     console.error('Error uploading images:', error);
//   });

  export default uploadImagesToCloudinary
