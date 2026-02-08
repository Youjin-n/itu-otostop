"use client";

import { motion } from "motion/react";
import { Wifi, WifiOff } from "lucide-react";

interface ConnectionStatusProps {
  connected: boolean;
}

export function ConnectionStatus({ connected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        className={`h-2 w-2 rounded-full ${connected ? "bg-emerald-400" : "bg-red-400"}`}
        animate={
          connected
            ? { scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }
            : { opacity: [1, 0.3, 1] }
        }
        transition={{ repeat: Infinity, duration: connected ? 2 : 1 }}
      />
      {connected ? (
        <Wifi className="h-4 w-4 text-emerald-400" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-400" />
      )}
      <span className="text-xs text-muted-foreground">
        {connected ? "Bağlı" : "Bağlantı yok"}
      </span>
    </div>
  );
}
