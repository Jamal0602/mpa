
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Check if force desktop mode is enabled
    const forceDesktop = localStorage.getItem('force-desktop-mode') === 'true';
    
    // Set initial value
    const checkMobile = () => {
      // Only set as mobile if force desktop mode is not enabled
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT && !forceDesktop)
    }
    
    // Check immediately
    checkMobile()
    
    // Set up event listener for resize
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Use the appropriate event listener method based on browser support
    if (mql.addEventListener) {
      mql.addEventListener("change", checkMobile)
    } else {
      // Fallback for older browsers
      window.addEventListener("resize", checkMobile)
    }
    
    // Watch for changes to force-desktop-mode in localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'force-desktop-mode') {
        checkMobile()
      }
    }
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", checkMobile)
      } else {
        window.removeEventListener("resize", checkMobile)
      }
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return !!isMobile
}

// Add desktop mode for mobile devices
export function useForceDesktopMode() {
  const [forceDesktop, setForceDesktop] = React.useState(() => {
    return localStorage.getItem('force-desktop-mode') === 'true'
  })
  
  React.useEffect(() => {
    if (forceDesktop) {
      document.documentElement.classList.add('force-desktop-mode')
      localStorage.setItem('force-desktop-mode', 'true')
    } else {
      document.documentElement.classList.remove('force-desktop-mode')
      localStorage.setItem('force-desktop-mode', 'false')
    }
    
    // Dispatch a storage event so other components can react to the change
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'force-desktop-mode',
      newValue: forceDesktop ? 'true' : 'false',
      storageArea: localStorage
    }))
  }, [forceDesktop])
  
  return {
    forceDesktop,
    toggleForceDesktop: () => setForceDesktop(prev => !prev)
  }
}
