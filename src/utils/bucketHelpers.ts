
import { supabase } from '@/lib/supabase';

export interface BucketConfig {
  public: boolean;
  allowedMimeTypes?: string[];
  fileSizeLimit?: number;
}

export const ensureBucketExists = async (
  bucketId: string, 
  config: BucketConfig = { public: false }
): Promise<boolean> => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketId);
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      const { error } = await supabase.storage.createBucket(bucketId, config);
      
      if (error) {
        console.error(`Error creating bucket ${bucketId}:`, error);
        return false;
      }
      
      console.log(`Bucket ${bucketId} created successfully`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking/creating bucket ${bucketId}:`, error);
    return false;
  }
};

export const uploadFileToBucket = async (
  bucketId: string,
  filePath: string,
  file: File,
  options = { cacheControl: '3600', upsert: false }
) => {
  try {
    // Ensure bucket exists first
    const bucketConfig: BucketConfig = {
      public: bucketId === 'projects', // Projects bucket is public, others are private by default
      allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 10485760 // 10MB
    };
    
    const bucketExists = await ensureBucketExists(bucketId, bucketConfig);
    
    if (!bucketExists) {
      throw new Error(`Bucket ${bucketId} could not be created or accessed`);
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(filePath, file, options);
      
    if (error) {
      throw error;
    }
    
    // Get the URL of the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucketId)
      .getPublicUrl(data.path);
      
    return {
      data,
      url: urlData.publicUrl
    };
  } catch (error) {
    console.error(`Error uploading file to ${bucketId}:`, error);
    throw error;
  }
};
