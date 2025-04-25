import { Storage } from '@aws-amplify/storage';

/**
 * Uploads a file to S3 and returns the URL
 * @param {File} file - The file to upload
 * @param {string} path - The path/key where the file should be stored in S3
 * @returns {Promise<string>} The URL of the uploaded file
 */
export const uploadFile = async (file, path) => {
  try {
    const result = await Storage.put(path, file, {
      contentType: file.type,
      level: 'public'
    });
    
    // Get the URL of the uploaded file
    const url = await Storage.get(result.key);
    return url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Uploads an image from a URL to S3
 * @param {string} imageUrl - The URL of the image to upload
 * @param {string} path - The path/key where the image should be stored in S3
 * @returns {Promise<string>} The URL of the uploaded image in S3
 */
export const uploadImageFromUrl = async (imageUrl, path) => {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create a File object from the blob
    const file = new File([blob], path.split('/').pop(), { type: blob.type });
    
    // Upload to S3
    return await uploadFile(file, path);
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
}; 