
import React from 'react';

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
export const getLinkTarget = (): '_blank' | '_system' | '_self' => {
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

/**
 * Utility to handle opening OAuth provider links in external browser when in mobile app
 */
export const handleOAuthLink = (provider: string) => {
  // This function will be used by OAuth buttons to open in external browser when in mobile app
  const baseUrl = window.location.origin;
  const authUrl = `${baseUrl}/auth?provider=${provider}`;
  
  if (isMobileApp()) {
    return openExternalLink(authUrl);
  }
  
  // Let the normal auth flow handle it in regular browsers
  window.location.href = authUrl;
  return true;
};

/**
 * Safe link element that handles external links in mobile apps
 */
export const SafeLink: React.FC<React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }> = ({ 
  href, 
  children, 
  className = '',
  onClick,
  ...rest 
}) => {
  const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
  const target = isExternal ? getLinkTarget() : undefined;
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    
    if (isExternal && isMobileApp()) {
      e.preventDefault();
      openExternalLink(href);
    }
  };
  
  return (
    <a 
      href={href} 
      target={target} 
      rel={isExternal ? "noopener noreferrer" : undefined} 
      onClick={handleClick} 
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
};
