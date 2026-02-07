/**
 * Compress image to reduce size for base64 storage
 * Targets < 500KB to stay well under Firestore's 1MB limit
 */
export async function compressImage(file: File, maxSizeKB: number = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculate new dimensions (max 800px width)
        let width = img.width;
        let height = img.height;
        const maxWidth = 800;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try different quality levels to meet size target
        let quality = 0.8;
        let result = canvas.toDataURL('image/jpeg', quality);
        
        // Reduce quality until size is acceptable
        while (result.length > maxSizeKB * 1024 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }
        
        console.log(`📸 Image compressed: ${(result.length / 1024).toFixed(2)}KB (quality: ${quality})`);
        resolve(result);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
