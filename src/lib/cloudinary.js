import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dsampcjez",
  api_key: "126813576679148",
  api_secret: "gQELpe2kHgzuAiMGgAOwtb8IKjw",
});

export const uploadImages = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      public_id: `product_images_${Date.now()}`,
      resource_type: "auto",
    });
  
    return result.url;
  } catch (err) {
    throw new Error(err)
  }
}

export default cloudinary;
