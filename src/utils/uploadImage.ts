import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Alternative upload method using Firebase Storage
 * This approach may work better with CORS
 */
export async function uploadProductImage(file: File): Promise<string> {
  try {
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const imageRef = ref(storage, `products/${fileName}`);
    
    // Using uploadBytes with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      }
    };
    
    const snapshot = await uploadBytes(imageRef, file, metadata);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // More helpful error messages
    if (error.code === 'storage/unauthorized') {
      throw new Error('Upload failed: Storage permissions not configured. Please enable Firebase Storage in the console.');
    } else if (error.message?.includes('CORS')) {
      throw new Error('Upload failed: CORS not configured. See CORS_ALTERNATIVES.md for solutions.');
    }
    
    throw error;
  }
}

/**
 * Alternative: Upload using base64 data URL
 * This can sometimes bypass CORS issues
 */
export async function uploadProductImageAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const dataUrl = e.target?.result as string;
        
        // For now, return data URL directly (stored in Firestore)
        // This bypasses Storage entirely for development
        resolve(dataUrl);
        
        // TODO: In production, upload the data URL to Storage
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
