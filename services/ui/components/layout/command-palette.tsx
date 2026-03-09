"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Home, Terminal } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, toggleTerminal } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const go = (href: string) => {
    setCommandPaletteOpen(false);
    router.push(href);
  };

  const pages = useMemo(
    () => [
      { label: "홈", icon: Home, href: "/" },
    ],
    []
  );

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="페이지, 액션 검색..." />
      <CommandList>
        <CommandEmpty>결과 없음</CommandEmpty>

        <CommandGroup heading="페이지">
          {pages.map((p) => (
            <CommandItem key={p.href} onSelect={() => go(p.href)}>
              <p.icon className="mr-2 h-4 w-4" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="액션">
          <CommandItem
            onSelect={() => {
              setCommandPaletteOpen(false);
              toggleTerminal();
            }}
          >
            <Terminal className="mr-2 h-4 w-4" />
            터미널 열기/닫기
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
