
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Set initial value
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
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
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", checkMobile)
      } else {
        window.removeEventListener("resize", checkMobile)
      }
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
  }, [forceDesktop])
  
  return {
    forceDesktop,
    toggleForceDesktop: () => setForceDesktop(prev => !prev)
  }
}
