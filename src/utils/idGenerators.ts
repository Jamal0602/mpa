
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a unique MPA ID for a user
 */
export const generateMpaId = (username: string): string => {
  return username.toLowerCase().replace(/[^a-z0-9]/g, '') + '@mpa';
};

/**
 * Generate a referral code
 */
export const generateReferralCode = (username: string): string => {
  const prefix = username.substring(0, 3).toUpperCase();
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${randomPart}`;
};

/**
 * Generate a unique file name with a timestamp and random string
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = uuidv4().substring(0, 8);
  const extension = originalName.split('.').pop();
  const sanitizedName = originalName
    .split('.')[0]
    .replace(/[^a-zA-Z0-9]/g, '-')
    .toLowerCase();
    
  return `${sanitizedName}-${timestamp}-${randomString}.${extension}`;
};

/**
 * Generate a unique project ID
 */
export const generateProjectId = (): string => {
  return `PRJ-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Date.now().toString().substring(7)}`;
};
