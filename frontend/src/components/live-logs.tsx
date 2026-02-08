"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LogEntry } from "@/hooks/use-websocket";

interface LiveLogsProps {
  logs: LogEntry[];
  onClear: () => void;
}

const levelColors = {
  info: "text-foreground",
  warning: "text-yellow-400",
  error: "text-red-400",
};

const levelDots = {
  info: "bg-blue-400",
  warning: "bg-yellow-400",
  error: "bg-red-400",
};

export function LiveLogs({ logs, onClear }: LiveLogsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Terminal className="h-5 w-5 text-primary" />
            Canlı Log
            {logs.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-normal"
              >
                {logs.length}
              </motion.span>
            )}
          </CardTitle>
          {logs.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onClear}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={scrollRef}
          className="h-[300px] overflow-y-auto rounded-lg bg-background/80 border border-border/30 p-3 font-mono text-xs space-y-0.5"
        >
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Kayıt başlatılınca loglar burada görünecek</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -10, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-start gap-2 py-0.5 ${levelColors[log.level]}`}
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${levelDots[log.level]}`}
                  />
                  <span className="text-muted-foreground shrink-0">
                    {new Date(log.time * 1000).toLocaleTimeString("tr-TR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="break-all">{log.message}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
