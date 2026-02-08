"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, X, BookOpen, BookMinus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CRNManagerProps {
  crnList: string[];
  onCrnListChange: (list: string[]) => void;
  crnResults: Record<string, { status: string; message: string }>;
  disabled?: boolean;
  mode?: "add" | "drop";
}

const statusColors: Record<string, string> = {
  pending: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  already: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  full: "bg-red-500/20 text-red-400 border-red-500/30",
  conflict: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  upgrade: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  debounce: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
  dropped: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const statusLabels: Record<string, string> = {
  pending: "Bekliyor",
  success: "Başarılı ✓",
  already: "Zaten Kayıtlı",
  full: "Kontenjan Dolu",
  conflict: "Çakışma",
  upgrade: "Yükseltme",
  debounce: "Debounce",
  error: "Hata",
  dropped: "Bırakıldı ✓",
};

export function CRNManager({
  crnList,
  onCrnListChange,
  crnResults,
  disabled,
  mode = "add",
}: CRNManagerProps) {
  const [input, setInput] = useState("");

  const addCRN = () => {
    const trimmed = input.trim();
    if (trimmed && !crnList.includes(trimmed)) {
      onCrnListChange([...crnList, trimmed]);
      setInput("");
    }
  };

  const removeCRN = (crn: string) => {
    onCrnListChange(crnList.filter((c) => c !== crn));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCRN();
    }
  };

  const isDrop = mode === "drop";
  const Icon = isDrop ? BookMinus : BookOpen;
  const title = isDrop
    ? "Bırakılacak Dersler (SCRN)"
    : "Eklenecek Dersler (ECRN)";
  const placeholder = isDrop
    ? "Bırakılacak CRN (ör: 20150)"
    : "Eklenecek CRN (ör: 24066)";
  const emptyText = isDrop ? "Bırakılacak ders yok" : "Henüz CRN eklenmedi";
  const accentColor = isDrop ? "text-orange-500" : "text-primary";
  const borderAccent = isDrop ? "border-orange-500/30" : "border-border/50";

  return (
    <Card className={`${borderAccent} bg-card/50 backdrop-blur-sm`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${accentColor}`} />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {crnList.length} ders
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!disabled && (
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="font-mono"
            />
            <Button
              onClick={addCRN}
              size="icon"
              variant="outline"
              disabled={!input.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {crnList.map((crn) => {
              const result = crnResults[crn];
              const status = result?.status || "pending";
              return (
                <motion.div
                  key={crn}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    status === "success"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : status === "full" || status === "error"
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-border/50 bg-background/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-lg">{crn}</span>
                    {result && (
                      <Badge
                        className={statusColors[status] || statusColors.pending}
                      >
                        {statusLabels[status] || status}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {result?.message && (
                      <span className="text-xs text-muted-foreground">
                        {result.message}
                      </span>
                    )}
                    {!disabled && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCRN(crn)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {crnList.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {emptyText}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
