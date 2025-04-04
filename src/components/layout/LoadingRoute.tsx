
import React from "react";
import { motion } from "framer-motion";
import { LoadingAnimation } from "@/components/ui/loading-animation";

interface LoadingRouteProps {
  message?: string;
  showPoweredBy?: boolean;
}

const LoadingRoute = ({ message = "Loading Your Experience", showPoweredBy = true }: LoadingRouteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center flex-col"
    >
      <LoadingAnimation text={message} showPoweredBy={showPoweredBy} size="lg" />
    </motion.div>
  );
};

export default LoadingRoute;
