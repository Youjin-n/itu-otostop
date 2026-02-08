"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Settings, Clock, RefreshCcw, Hash, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  kayitSaati: string;
  onKayitSaatiChange: (v: string) => void;
  maxDeneme: number;
  onMaxDenemeChange: (v: number) => void;
  retryAralik: number;
  onRetryAralikChange: (v: number) => void;
  gecikmeBuffer: number;
  onGecikmeBufferChange: (v: number) => void;
  disabled?: boolean;
}

export function SettingsPanel({
  kayitSaati,
  onKayitSaatiChange,
  maxDeneme,
  onMaxDenemeChange,
  retryAralik,
  onRetryAralikChange,
  gecikmeBuffer,
  onGecikmeBufferChange,
  disabled,
}: SettingsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle
          className="flex items-center gap-2 text-lg cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <Settings className="h-5 w-5 text-primary" />
          Ayarlar
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            className="ml-auto text-muted-foreground text-sm"
          >
            ▾
          </motion.span>
        </CardTitle>
      </CardHeader>
      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        className="overflow-hidden"
      >
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3 w-3" /> Kayıt Saati
              </Label>
              <Input
                type="time"
                step="1"
                value={kayitSaati}
                onChange={(e) => onKayitSaatiChange(e.target.value)}
                disabled={disabled}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Hash className="h-3 w-3" /> Maks Deneme
              </Label>
              <Input
                type="number"
                min={1}
                max={300}
                value={maxDeneme}
                onChange={(e) => onMaxDenemeChange(Number(e.target.value))}
                disabled={disabled}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <RefreshCcw className="h-3 w-3" /> Retry Aralığı (sn)
              </Label>
              <Input
                type="number"
                min={1}
                max={10}
                step={0.5}
                value={retryAralik}
                onChange={(e) => onRetryAralikChange(Number(e.target.value))}
                disabled={disabled}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs">
                <Shield className="h-3 w-3" /> Buffer (ms)
              </Label>
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={gecikmeBuffer * 1000}
                onChange={(e) =>
                  onGecikmeBufferChange(Number(e.target.value) / 1000)
                }
                disabled={disabled}
                className="font-mono"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Retry Aralığı: Sunucu 3sn&apos;den sık istekleri yok sayar (VAL16).
            Buffer: Erken varış cezasını önler (+5ms önerilen).
          </p>
        </CardContent>
      </motion.div>
    </Card>
  );
}
