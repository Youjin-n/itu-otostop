"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Play, Square, Gauge, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/use-websocket";
import { TokenInput } from "@/components/token-input";
import { CRNManager } from "@/components/crn-manager";
import { CalibrationCard } from "@/components/calibration-card";
import { CountdownTimer } from "@/components/countdown-timer";
import { LiveLogs } from "@/components/live-logs";
import { SettingsPanel } from "@/components/settings-panel";
import { ConnectionStatus } from "@/components/connection-status";
import { ThemeToggle } from "@/components/theme-toggle";

export function Dashboard() {
  // Config state
  const [token, setToken] = useState("");
  const [tokenChanged, setTokenChanged] = useState(false);
  const [crnList, setCrnList] = useState<string[]>([]);
  const [scrnList, setScrnList] = useState<string[]>([]);
  const [kayitSaati, setKayitSaati] = useState("14:00:00");
  const [maxDeneme, setMaxDeneme] = useState(60);
  const [retryAralik, setRetryAralik] = useState(3.0);
  const [gecikmeBuffer, setGecikmeBuffer] = useState(0.005);

  // UI state
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const [starting, setStarting] = useState(false);

  // WebSocket real-time data
  const ws = useWebSocket();

  const isRunning =
    ws.phase === "token_check" ||
    ws.phase === "calibrating" ||
    ws.phase === "waiting" ||
    ws.phase === "registering";

  // Load config on mount
  useEffect(() => {
    (async () => {
      try {
        const config = await api.getConfig();
        if (config.ecrn_list?.length) setCrnList(config.ecrn_list);
        if (config.scrn_list?.length) setScrnList(config.scrn_list);
        if (config.kayit_saati) setKayitSaati(config.kayit_saati);
        if (config.max_deneme) setMaxDeneme(config.max_deneme);
        if (config.retry_aralik) setRetryAralik(config.retry_aralik);
        if (config.gecikme_buffer) setGecikmeBuffer(config.gecikme_buffer);
        if (config.token_set) setTokenValid(true);
      } catch {
        // Backend not running yet, that's OK
      }
    })();
  }, []);

  // Save config to backend
  const saveConfig = useCallback(async () => {
    try {
      await api.setConfig({
        // Token sadece kullanıcı değiştirdiyse gönder
        ...(tokenChanged && token ? { token } : {}),
        ecrn_list: crnList,
        scrn_list: scrnList,
        kayit_saati: kayitSaati,
        max_deneme: maxDeneme,
        retry_aralik: retryAralik,
        gecikme_buffer: gecikmeBuffer,
      });
    } catch {
      // silent fail for auto-save
    }
  }, [
    token,
    tokenChanged,
    crnList,
    scrnList,
    kayitSaati,
    maxDeneme,
    retryAralik,
    gecikmeBuffer,
  ]);

  // Auto-save config on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (token || crnList.length > 0 || scrnList.length > 0) saveConfig();
    }, 500);
    return () => clearTimeout(timer);
  }, [
    token,
    crnList,
    scrnList,
    kayitSaati,
    maxDeneme,
    retryAralik,
    gecikmeBuffer,
    saveConfig,
  ]);

  // Watch token changes for test button state
  useEffect(() => {
    setTokenValid(null);
    setTokenChanged(true);
  }, [token]);

  // Calibrate
  const handleCalibrate = async () => {
    if (!token) {
      toast.error("Önce token gir");
      return;
    }
    setCalibrating(true);
    try {
      await saveConfig();
      const result = await api.calibrate();
      toast.success(
        `Kalibrasyon tamam: offset ${result.server_offset_ms >= 0 ? "+" : ""}${result.server_offset_ms?.toFixed(0)}ms, RTT ${result.rtt_one_way_ms?.toFixed(1)}ms`,
      );
    } catch (err) {
      toast.error(
        `Kalibrasyon hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
      );
    } finally {
      setCalibrating(false);
    }
  };

  // Start registration
  const handleStart = async () => {
    if (!token) {
      toast.error("Önce token gir");
      return;
    }
    if (crnList.length === 0) {
      toast.error("En az bir CRN ekle");
      return;
    }
    setStarting(true);
    try {
      await saveConfig();
      await api.startRegistration();
      toast.success("Kayıt süreci başlatıldı!");
    } catch (err) {
      toast.error(
        `Başlatma hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
      );
    } finally {
      setStarting(false);
    }
  };

  // Cancel
  const handleCancel = async () => {
    try {
      await api.cancelRegistration();
      toast.info("Kayıt iptal edildi");
    } catch (err) {
      toast.error(
        `İptal hatası: ${err instanceof Error ? err.message : "Bilinmeyen hata"}`,
      );
    }
  };

  // Show toast on done
  useEffect(() => {
    if (ws.done) {
      const successCount = Object.values(ws.crnResults).filter(
        (r) => r.status === "success",
      ).length;
      if (successCount > 0) {
        toast.success(`${successCount} ders başarıyla kaydedildi! 🎉`);
      } else {
        toast.warning("Kayıt süreci bitti, başarılı ders yok");
      }
    }
  }, [ws.done, ws.crnResults]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Zap className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold tracking-tight">
                İTÜ OBS Kayıt
              </h1>
            </motion.div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus connected={ws.connected} />
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Countdown Timer — always visible */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CountdownTimer
            targetTime={kayitSaati}
            countdown={ws.countdown}
            phase={ws.phase}
          />
        </motion.div>

        {/* Action buttons */}
        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            variant="outline"
            onClick={handleCalibrate}
            disabled={calibrating || isRunning || !token}
            className="flex-1"
          >
            <Gauge className="h-4 w-4 mr-2" />
            {calibrating ? "Kalibre ediliyor..." : "Kalibre Et"}
          </Button>
          {!isRunning ? (
            <Button
              onClick={handleStart}
              disabled={starting || !token || crnList.length === 0}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              {starting ? "Başlatılıyor..." : "Kayıt Başlat"}
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleCancel}
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              İptal Et
            </Button>
          )}
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TokenInput
              token={token}
              onTokenChange={setToken}
              tokenValid={tokenValid}
            />
            <CRNManager
              crnList={crnList}
              onCrnListChange={setCrnList}
              crnResults={ws.crnResults}
              disabled={isRunning}
              mode="add"
            />
            <CRNManager
              crnList={scrnList}
              onCrnListChange={setScrnList}
              crnResults={ws.crnResults}
              disabled={isRunning}
              mode="drop"
            />
            <SettingsPanel
              kayitSaati={kayitSaati}
              onKayitSaatiChange={setKayitSaati}
              maxDeneme={maxDeneme}
              onMaxDenemeChange={setMaxDeneme}
              retryAralik={retryAralik}
              onRetryAralikChange={setRetryAralik}
              gecikmeBuffer={gecikmeBuffer}
              onGecikmeBufferChange={setGecikmeBuffer}
              disabled={isRunning}
            />
          </motion.div>

          {/* Right column */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CalibrationCard
              calibration={ws.calibration}
              loading={calibrating}
            />
            <LiveLogs logs={ws.logs} onClear={ws.clearLogs} />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-xs text-muted-foreground">
          İTÜ OBS Ders Kayıt Otomasyon Aracı — {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
