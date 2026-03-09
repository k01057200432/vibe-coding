"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { navItems } from "@/components/layout/nav-rail";
import { useUIStore } from "@/lib/stores/ui";

export interface HotkeyDef {
  key: string;
  label: string;
  action: () => void;
}

function getPageHotkeys(
  pathname: string,
  router: ReturnType<typeof useRouter>
): HotkeyDef[] {
  // Dashboard
  if (pathname === "/") {
    return [
      {
        key: "q",
        label: "전체 청산",
        action: () => {
          if (confirm("Kill Switch: 모든 전략을 비활성화합니까?")) {
            fetch("/api/kill", { method: "POST" }).then(() =>
              window.location.reload()
            );
          }
        },
      },
      {
        key: "w",
        label: "전략 재개",
        action: () => {
          if (confirm("모든 전략을 재개합니까?")) {
            fetch("/api/resume", { method: "POST" }).then(() =>
              window.location.reload()
            );
          }
        },
      },
      {
        key: "e",
        label: "강제 재조정",
        action: () => {
          fetch("/api/force-reconcile", { method: "POST" }).then(() =>
            window.location.reload()
          );
        },
      },
    ];
  }

  // Strategies
  if (pathname === "/strategies") {
    return [
      {
        key: "q",
        label: "새 전략",
        action: () =>
          window.dispatchEvent(new CustomEvent("shortcut:new-strategy")),
      },
      {
        key: "e",
        label: "편집",
        action: () =>
          window.dispatchEvent(new CustomEvent("shortcut:edit-strategy")),
      },
    ];
  }

  // Trading
  if (pathname === "/trading") {
    return [
      {
        key: "q",
        label: "Kill All",
        action: () => {
          if (confirm("Kill Switch: 모든 전략을 비활성화합니까?")) {
            fetch("/api/kill", { method: "POST" }).then(() =>
              window.location.reload()
            );
          }
        },
      },
    ];
  }

  return [];
}

const globalHotkeys: Omit<HotkeyDef, "action">[] = [];

export function useHotkeys() {
  const router = useRouter();
  const pathname = usePathname();
  const { setHudVisible, setCommandPaletteOpen, toggleTerminal } = useUIStore();

  useEffect(() => {
    const pageHotkeys = getPageHotkeys(pathname, router);
    const pageKeyMap = new Map(pageHotkeys.map((h) => [h.key, h]));

    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+K / Ctrl+K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        // Handled in command-palette.tsx
        return;
      }

      // HUD: Alt 단독 press
      if (e.key === "Alt") {
        setHudVisible(true);
        return;
      }

      // Ctrl+`: 터미널 토글 (Wayland에서 e.key가 다를 수 있어 e.code도 체크)
      if (e.ctrlKey && (e.key === "`" || e.code === "Backquote")) {
        e.preventDefault();
        toggleTerminal();
        return;
      }

      if (!e.altKey) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      // Alt+2~7: 페이지 이동
      const navKey = navItems.find((item) => item.key === e.key);
      if (navKey) {
        e.preventDefault();
        router.push(navKey.href);
        return;
      }

      // Page-specific hotkeys
      const pageHotkey = pageKeyMap.get(e.key.toLowerCase());
      if (pageHotkey) {
        e.preventDefault();
        pageHotkey.action();
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
  }, [router, pathname, setHudVisible, setCommandPaletteOpen, toggleTerminal]);
}

export { getPageHotkeys, globalHotkeys };
