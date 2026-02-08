"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CountdownTimerProps {
  targetTime: string; // HH:MM:SS
  countdown: number | null;
  phase: string;
}

export function CountdownTimer({
  targetTime,
  countdown,
  phase,
}: CountdownTimerProps) {
  const [displayTime, setDisplayTime] = useState("--:--:--");
  const [localCountdown, setLocalCountdown] = useState<number | null>(null);

  // Server countdown'ı kullan, yoksa lokal hesapla
  useEffect(() => {
    if (countdown !== null) {
      setLocalCountdown(countdown);
    }
  }, [countdown]);

  // Lokal countdown timer
  useEffect(() => {
    if (localCountdown === null || phase === "done" || phase === "idle") return;

    const interval = setInterval(() => {
      setLocalCountdown((prev) => {
        if (prev === null || prev <= 0) return 0;
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [localCountdown, phase]);

  // Format countdown
  useEffect(() => {
    if (localCountdown === null || localCountdown <= 0) {
      if (phase === "registering") {
        setDisplayTime("KAYIT YAPILIYOR");
      } else if (phase === "done") {
        setDisplayTime("TAMAMLANDI");
      } else {
        setDisplayTime(targetTime);
      }
      return;
    }
    const total = Math.max(0, localCountdown);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = Math.floor(total % 60);
    const ms = Math.floor((total % 1) * 10);
    setDisplayTime(
      h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${ms}`,
    );
  }, [localCountdown, phase, targetTime]);

  const isActive = phase === "waiting" || phase === "calibrating";
  const isRegistering = phase === "registering";
  const isDone = phase === "done";

  return (
    <Card
      className={`border-border/50 overflow-hidden relative ${
        isRegistering
          ? "border-orange-500/50"
          : isDone
            ? "border-emerald-500/50"
            : "border-border/50"
      }`}
    >
      {/* Animated background gradient */}
      {isActive && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: "200% 100%" }}
        />
      )}
      {isRegistering && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {isDone && <div className="absolute inset-0 bg-emerald-500/5" />}

      <CardContent className="relative py-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Timer className="h-4 w-4" />
            <span className="text-sm">
              {isActive
                ? "Kayıt saatine kalan"
                : isRegistering
                  ? "Kayıt devam ediyor"
                  : isDone
                    ? "Kayıt tamamlandı"
                    : `Hedef: ${targetTime}`}
            </span>
          </div>
          <motion.div
            key={displayTime}
            initial={{ opacity: 0.8, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`font-mono font-bold tracking-wider ${
              isRegistering
                ? "text-4xl text-orange-400"
                : isDone
                  ? "text-4xl text-emerald-400"
                  : isActive
                    ? "text-5xl text-primary"
                    : "text-4xl text-muted-foreground"
            }`}
          >
            {displayTime}
          </motion.div>
          {isActive && localCountdown !== null && localCountdown > 0 && (
            <motion.div
              className="h-1 bg-primary/20 rounded-full mt-4 mx-auto max-w-xs overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: localCountdown, ease: "linear" }}
              />
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
