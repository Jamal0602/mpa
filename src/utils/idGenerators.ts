
/**
 * Generate a unique MPA ID for a user
 * @param username The username to base the MPA ID on
 * @returns A formatted MPA ID
 */
export const generateMpaId = (username: string): string => {
  // Remove any non-alphanumeric characters and convert to lowercase
  const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Add a random suffix to ensure uniqueness for very short usernames
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // If the username is too short, add more randomness
  const baseId = sanitizedUsername.length < 4 
    ? `${sanitizedUsername}${randomSuffix}` 
    : sanitizedUsername;
    
  return `${baseId}@mpa`;
};

/**
 * Generate a referral code for a user
 * @param username The username to base the referral code on
 * @returns A formatted referral code
 */
export const generateReferralCode = (username: string): string => {
  // Take the first 3 characters (or pad if shorter) and convert to uppercase
  let prefix = username.substring(0, Math.min(3, username.length)).toUpperCase();
  
  // If prefix is shorter than 3 chars, pad with random letters
  while (prefix.length < 3) {
    const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
    prefix += randomChar;
  }
  
  // Generate a random 4-digit number
  const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${prefix}-${randomPart}`;
};
