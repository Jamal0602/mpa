
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BucketConfig {
  public: boolean;
  allowedMimeTypes?: string[];
  fileSizeLimit?: number;
}

export const BUCKET_NAMES = {
  PROJECTS: 'projects',
  RESUMES: 'resumes',
  PROFILES: 'profiles',
  DOCUMENTS: 'documents'
};

export const ensureBucketExists = async (
  bucketId: string, 
  config: BucketConfig = { public: false }
): Promise<boolean> => {
  try {
    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error(`Error listing buckets:`, bucketsError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketId);
    
    if (!bucketExists) {
      // Create the bucket if it doesn't exist
      console.log(`Bucket ${bucketId} does not exist, creating...`);
      const { error } = await supabase.storage.createBucket(bucketId, {
        public: config.public,
        fileSizeLimit: config.fileSizeLimit || 10485760, // 10MB default
        allowedMimeTypes: config.allowedMimeTypes
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketId}:`, error);
        return false;
      }
      
      console.log(`Bucket ${bucketId} created successfully`);
    } else {
      console.log(`Bucket ${bucketId} already exists`);
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
): Promise<{ data: any; url: string; error?: null } | { error: any; data?: null; url?: string }> => {
  try {
    console.log(`Starting upload for ${file.name} to bucket ${bucketId} at path ${filePath}`);
    
    // Ensure bucket exists first
    const bucketConfig: BucketConfig = {
      public: bucketId === BUCKET_NAMES.PROJECTS, // Projects bucket is public, others are private by default
      allowedMimeTypes: ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      fileSizeLimit: 10485760 // 10MB
    };
    
    const bucketExists = await ensureBucketExists(bucketId, bucketConfig);
    
    if (!bucketExists) {
      const error = new Error(`Bucket ${bucketId} could not be created or accessed`);
      console.error(error);
      return { error, data: null };
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(filePath, file, options);
      
    if (error) {
      console.error(`Error uploading file to ${bucketId}:`, error);
      return { error, data: null };
    }
    
    console.log(`File uploaded successfully to ${bucketId} at path:`, data.path);
    
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
    return { error, data: null };
  }
};

export const getFileUrl = (bucketId: string, filePath: string): string => {
  const { data } = supabase.storage
    .from(bucketId)
    .getPublicUrl(filePath);
    
  return data.publicUrl;
};

export const deleteFileFromBucket = async (bucketId: string, filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucketId)
      .remove([filePath]);
      
    if (error) {
      console.error(`Error deleting file from ${bucketId}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting file from ${bucketId}:`, error);
    return false;
  }
};

// Helper function to retry file operations
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      console.log(`Retry ${retries}/${maxRetries} after ${delay}ms delay...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Max retries exceeded");
};
