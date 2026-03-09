"use client";

import { useEffect } from "react";
import { useUIStore } from "@/lib/stores/ui";

export function useHotkeys() {
  const { setHudVisible, toggleTerminal } = useUIStore();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Alt") {
        setHudVisible(true);
        return;
      }

      // Ctrl+`: terminal toggle
      if (e.ctrlKey && (e.key === "`" || e.code === "Backquote")) {
        e.preventDefault();
        toggleTerminal();
        return;
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === "Alt") {
        setHudVisible(false);
      }
    }

    function handleBlur() {
      setHudVisible(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [setHudVisible, toggleTerminal]);
}
