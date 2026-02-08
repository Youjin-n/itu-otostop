"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR'da placeholder render et — hydration mismatch'i önler
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <span className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <motion.div
        key={theme}
        initial={{ scale: 0, rotate: -90, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </motion.div>
    </Button>
  );
}
