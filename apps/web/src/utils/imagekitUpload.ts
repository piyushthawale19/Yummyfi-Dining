/**
 * Upload image to ImageKit
 * This function uploads an image file to ImageKit and returns the URL
 * ImageKit provides on-the-fly image transformations and doesn't have CORS issues
 * 
 * @param file - The image file to upload
 * @returns Promise<string> - The ImageKit URL of the uploaded image
 */

export interface ImageKitUploadResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
  fileType: string;
}

/**
 * Generate authentication parameters for ImageKit using Private Key
 * This is done client-side (not recommended for production, but works for testing)
 */
const generateAuthParams = async (publicKey: string, privateKey: string) => {
  const token = Date.now().toString();
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now
  
  // Create signature: token + expire using private key
  const stringToSign = token + expire;
  
  // Use Web Crypto API to generate HMAC SHA-1 signature
  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const messageData = encoder.encode(stringToSign);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return {
    token,
    expire,
    signature: signatureHex
  };
};

export const uploadToImageKit = async (file: File): Promise<string> => {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const privateKey = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !urlEndpoint) {
    throw new Error(
      '❌ ImageKit configuration missing!\n\n' +
      'Required in .env:\n' +
      '• VITE_IMAGEKIT_PUBLIC_KEY\n' +
      '• VITE_IMAGEKIT_URL_ENDPOINT\n' +
      '• VITE_IMAGEKIT_PRIVATE_KEY (or enable unsigned uploads)\n\n' +
      'Get these from: https://imagekit.io/dashboard/developer/api-keys'
    );
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 10MB');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('publicKey', publicKey);
    formData.append('fileName', `${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
    formData.append('folder', '/yummyfi-products');
    formData.append('useUniqueFileName', 'true');
    
    // If private key is available, generate signed upload params
    if (privateKey) {
      console.log('🔐 Using signed upload with private key');
      const authParams = await generateAuthParams(publicKey, privateKey);
      formData.append('signature', authParams.signature);
      formData.append('expire', authParams.expire.toString());
      formData.append('token', authParams.token);
    } else {
      console.log('🔓 Attempting unsigned upload (requires dashboard setting)');
    }

    const uploadResponse = await fetch(
      'https://upload.imagekit.io/api/v1/files/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      console.error('ImageKit error response:', error);
      
      // Provide helpful error messages
      if (error.message?.includes('authorization parameters')) {
        throw new Error(
          '❌ ImageKit Authorization Failed!\n\n' +
          'OPTION 1 (Recommended): Add private key to .env\n' +
          'VITE_IMAGEKIT_PRIVATE_KEY=private_your_key_here\n\n' +
          'OPTION 2: Enable unsigned uploads:\n' +
          '1. Go to: https://imagekit.io/dashboard/settings/security\n' +
          '2. Turn ON "Allow unsigned file uploads"\n' +
          '3. Click Save\n' +
          '4. Try uploading again'
        );
      }
      
      throw new Error(error.message || 'Failed to upload image to ImageKit');
    }

    const data: ImageKitUploadResponse = await uploadResponse.json();

    console.log('✅ ImageKit upload successful:', data.url);
    return data.url;
  } catch (error: any) {
    console.error('❌ ImageKit upload error:', error);
    throw error;
  }
};

/**
 * Upload to ImageKit with preview generation
 * This returns both the full URL and a thumbnail URL for preview
 */
export const uploadToImageKitWithPreview = async (file: File): Promise<{ url: string; thumbnailUrl: string }> => {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !urlEndpoint) {
    throw new Error(
      'ImageKit configuration missing. Please set VITE_IMAGEKIT_PUBLIC_KEY and VITE_IMAGEKIT_URL_ENDPOINT in .env.local'
    );
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('Image size must be less than 10MB');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('publicKey', publicKey);
    formData.append('fileName', `${Date.now()}_${file.name.replace(/\s+/g, '_')}`);
    formData.append('folder', '/yummyfi-products');
    formData.append('useUniqueFileName', 'true');
    
    // Generate transformation for thumbnail preview
    formData.append('transformation', JSON.stringify({
      pre: 'l-text,i-Uploading,fs-50,l-end',
      post: [
        {
          type: 'transformation',
          value: 'tr:w-400,h-400,fo-auto'
        }
      ]
    }));

    const uploadResponse = await fetch(
      'https://upload.imagekit.io/api/v1/files/upload',
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(publicKey + ':')}`
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      throw new Error(error.message || 'Failed to upload image to ImageKit');
    }

    const data: ImageKitUploadResponse = await uploadResponse.json();

    // Generate a thumbnail URL using ImageKit transformations
    const thumbnailUrl = `${urlEndpoint}/tr:w-300,h-300,fo-auto/${data.filePath}`;

    return {
      url: data.url,
      thumbnailUrl: thumbnailUrl
    };
  } catch (error: any) {
    console.error('ImageKit upload error:', error);
    throw new Error(error.message || 'Failed to upload image to ImageKit');
  }
};

/**
 * Get optimized image URL with transformations
 * ImageKit allows you to transform images on-the-fly
 * 
 * @param url - Original ImageKit URL
 * @param transformations - Transformation parameters like width, height, quality
 */
export const getOptimizedImageUrl = (
  url: string,
  transformations: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
    crop?: 'maintain_ratio' | 'force' | 'at_max' | 'at_least';
  } = {}
): string => {
  const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
  if (!urlEndpoint || !url.includes('imagekit.io')) {
    return url;
  }

  const { width, height, quality = 80, format = 'auto', crop = 'maintain_ratio' } = transformations;

  let transformStr = 'tr:';
  if (width) transformStr += `w-${width},`;
  if (height) transformStr += `h-${height},`;
  transformStr += `q-${quality},`;
  transformStr += `f-${format},`;
  transformStr += `c-${crop}`;

  // Extract the file path from the URL
  const filePath = url.split('imagekit.io/')[1];
  
  return `${urlEndpoint}/${transformStr}/${filePath}`;
};
