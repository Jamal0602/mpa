
import React from "react";
import { motion } from "framer-motion";
import { LoadingPageCGT } from "@/components/ui/loading-cgt";

interface LoadingRouteProps {
  message?: string;
}

const LoadingRoute = ({ message = "Loading Your Experience" }: LoadingRouteProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center"
    >
      <LoadingPageCGT text={message} />
    </motion.div>
  );
};

export default LoadingRoute;
