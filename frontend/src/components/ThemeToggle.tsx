"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-muted/10 rounded-xl transition-colors w-full text-left"
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun className="h-4 w-4 absolute transition-all duration-300 scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
        <Moon className="h-4 w-4 absolute transition-all duration-300 scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
      </div>
      Cambiar Tema
    </button>
  );
}
