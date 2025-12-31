import axios from 'axios';
import api from '@/lib/api'; // Your backend API client

export const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video' = 'image') => {
  try {
    // 1. Get Signature from Backend
    const sigRes = await api.get('/upload/signature');
    const { signature, timestamp, cloudName, apiKey, folder } = sigRes.data.data;

    // 2. Prepare Upload Data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey); 
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('folder', folder);

    // 3. Upload directly to Cloudinary
    // Note: We send to the specific resource type endpoint (image or video)
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          // Optional: You can implement a progress bar here later
          // const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // console.log(percentCompleted);
        }
      }
    );

    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Upload failed');
  }
};