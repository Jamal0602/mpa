
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme/theme-provider";

const createCloud = (index: number) => {
  const size = Math.random() * 100 + 50;
  const speed = Math.random() * 20 + 20;
  const delay = Math.random() * 10;
  const opacity = Math.random() * 0.4 + 0.1;
  const top = Math.random() * 40; // Keep clouds in the top 40% of the container
  
  return {
    id: `cloud-${index}`,
    size,
    speed,
    delay,
    opacity,
    top,
  };
};

interface CloudProps {
  className?: string;
}

export const CloudAnimation: React.FC<CloudProps> = ({ className = "" }) => {
  const [clouds, setClouds] = useState<any[]>([]);
  const { theme } = useTheme();
  
  useEffect(() => {
    const newClouds = Array.from({ length: 6 }, (_, i) => createCloud(i));
    setClouds(newClouds);
    
    const interval = setInterval(() => {
      setClouds(prev => {
        const newClouds = [...prev];
        const randomIndex = Math.floor(Math.random() * newClouds.length);
        newClouds[randomIndex] = createCloud(randomIndex);
        return newClouds;
      });
    }, 20000); // Regenerate a random cloud every 20 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const cloudColor = theme === 'dark' ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.8)";
  const shadowColor = theme === 'dark' ? "rgba(0, 0, 0, 0.1)" : "rgba(0, 0, 0, 0.1)";
  
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}>
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          initial={{ x: -cloud.size, opacity: 0 }}
          animate={{
            x: `calc(100vw + ${cloud.size}px)`,
            opacity: cloud.opacity,
            transition: {
              x: {
                duration: cloud.speed,
                repeat: Infinity,
                delay: cloud.delay,
                ease: "linear",
              },
              opacity: {
                duration: 2,
                delay: cloud.delay,
              },
            },
          }}
          style={{
            position: "absolute",
            top: `${cloud.top}%`,
            width: cloud.size,
            height: cloud.size / 2,
            borderRadius: "50%",
            background: cloudColor,
            boxShadow: `0 0 30px ${shadowColor}`,
            filter: "blur(12px)",
          }}
        />
      ))}
    </div>
  );
};
