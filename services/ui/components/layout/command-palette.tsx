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
import {
  LayoutDashboard,
  Target,
  ArrowLeftRight,
  Lightbulb,
  Bell,
  Settings,
  Terminal,
  RefreshCw,
} from "lucide-react";
import { useUIStore } from "@/lib/stores/ui";
import { useStrategies } from "@/lib/queries/strategies";

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, toggleTerminal } = useUIStore();
  const { data: strategies } = useStrategies();

  // Cmd+K / Ctrl+K
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
      { label: "대시보드", icon: LayoutDashboard, href: "/" },
      { label: "전략", icon: Target, href: "/strategies" },
      { label: "거래", icon: ArrowLeftRight, href: "/trading" },
      { label: "인사이트", icon: Lightbulb, href: "/insights" },
      { label: "알림", icon: Bell, href: "/notifications/all" },
      { label: "설정", icon: Settings, href: "/settings" },
    ],
    []
  );

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="페이지, 전략, 액션 검색..." />
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

        {strategies && strategies.length > 0 && (
          <CommandGroup heading="전략">
            {strategies.map((s) => (
              <CommandItem
                key={s.id}
                value={`전략 ${s.name} ${s.type}`}
                onSelect={() => go(`/strategies/${s.id}`)}
              >
                <Target className="mr-2 h-4 w-4" />
                <span>{s.name}</span>
                <span className="ml-auto text-xs text-[var(--text-muted)]">{s.type}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

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
          <CommandItem
            onSelect={() => {
              setCommandPaletteOpen(false);
              fetch("/api/reconcile", { method: "POST" }).then(() => window.location.reload());
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            강제 재조정
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
