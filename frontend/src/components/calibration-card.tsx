"use client";

import { motion } from "motion/react";
import { Activity, Server, Wifi, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalibrationCardProps {
  calibration: Record<string, number> | null;
  loading?: boolean;
}

function MetricRow({
  icon: Icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-2"
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-mono font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </motion.div>
  );
}

export function CalibrationCard({
  calibration,
  loading,
}: CalibrationCardProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Kalibrasyon
          {loading && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="ml-auto"
            >
              <Activity className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {calibration ? (
          <div className="divide-y divide-border/50">
            <MetricRow
              icon={Server}
              label="Sunucu Offset"
              value={`${calibration.server_offset_ms >= 0 ? "+" : ""}${calibration.server_offset_ms?.toFixed(0)}`}
              unit="ms"
              color="text-blue-400"
            />
            <MetricRow
              icon={Wifi}
              label="RTT (tam)"
              value={calibration.rtt_full_ms?.toFixed(0) || "—"}
              unit="ms"
              color="text-green-400"
            />
            <MetricRow
              icon={Wifi}
              label="RTT (tek yön)"
              value={calibration.rtt_one_way_ms?.toFixed(1) || "—"}
              unit="ms"
              color="text-emerald-400"
            />
            <MetricRow
              icon={Clock}
              label="NTP Offset"
              value={calibration.ntp_offset_ms?.toFixed(0) || "—"}
              unit="ms"
              color="text-yellow-400"
            />
            <MetricRow
              icon={Server}
              label="Sunucu ↔ NTP Fark"
              value={calibration.server_ntp_diff_ms?.toFixed(0) || "—"}
              unit="ms"
              color="text-orange-400"
            />
            <MetricRow
              icon={Activity}
              label="Hassasiyet"
              value={`±${calibration.accuracy_ms?.toFixed(1)}`}
              unit="ms"
              color="text-purple-400"
            />
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            {loading ? "Ölçülüyor..." : "Kalibrasyon henüz yapılmadı"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
