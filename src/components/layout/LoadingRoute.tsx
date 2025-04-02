
import React from "react";
import { motion } from "framer-motion";
import { LoadingPageCGT } from "@/components/ui/loading-cgt";

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
      <LoadingPageCGT text={message} showPoweredBy={showPoweredBy} />
      {showPoweredBy && (
        <div className="mt-8 text-sm text-muted-foreground">
          Powered by <span className="font-bold text-primary">CGT</span>
        </div>
      )}
    </motion.div>
  );
};

export default LoadingRoute;
