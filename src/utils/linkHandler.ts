
/**
 * Utility function to handle opening links in mobile apps via external browser
 */
export const openExternalLink = (url: string, event?: React.MouseEvent) => {
  if (event) {
    event.preventDefault();
  }
  
  // Check if in mobile app environment
  if (window.navigator && (window.navigator as any).app) {
    // Use Capacitor or Cordova API if available
    if ((window as any).cordova && (window as any).cordova.InAppBrowser) {
      (window as any).cordova.InAppBrowser.open(url, '_system');
      return true;
    } else if ((window as any).open) {
      // Fallback to window.open with _system
      (window as any).open(url, '_system');
      return true;
    } else {
      // Last resort - normal location change
      window.location.href = url;
      return true;
    }
  } else {
    // Normal browser behavior - open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  }
};

/**
 * Get MPA link opening strategy based on environment
 */
export const getLinkTarget = (): string => {
  // Check if in mobile app environment 
  if (window.navigator && (window.navigator as any).app) {
    return '_system'; // External browser for mobile apps
  }
  return '_blank'; // New tab for regular browsers
};

/**
 * Check if current environment is a mobile app
 */
export const isMobileApp = (): boolean => {
  return !!(window.navigator && (window.navigator as any).app);
};
