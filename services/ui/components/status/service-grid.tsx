"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

interface ServiceStatus {
  name: string;
  ready: boolean;
  replicas: number;
  availableReplicas: number;
  image: string;
  restartCount: number;
  age: string;
}

export function ServiceGrid({
  services,
  onRefresh,
}: {
  services: ServiceStatus[];
  onRefresh: () => void;
}) {
  const [restarting, setRestarting] = useState<Record<string, boolean>>({});

  async function handleRestart(name: string) {
    if (!confirm(`${name}을(를) 재시작합니까?`)) return;
    setRestarting((r) => ({ ...r, [name]: true }));
    try {
      await fetch(`/api/k8s/restart/${name}`, { method: "POST" });
      setTimeout(onRefresh, 2000);
    } finally {
      setRestarting((r) => ({ ...r, [name]: false }));
    }
  }

  if (services.length === 0) {
    return (
      <div className="obsidian-card empty-state">
        K8s 클러스터에 연결할 수 없습니다. 로컬 개발 환경에서는 정상입니다.
      </div>
    );
  }

  return (
    <div className="grid gap-3 overflow-hidden sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((svc) => (
        <div key={svc.name} className="obsidian-card overflow-hidden p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`status-dot ${svc.ready ? "live-dot" : "status-dot-red"}`} />
                <span className="truncate text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                  {svc.name.replace("trading-", "")}
                </span>
              </div>
              <div className="mt-2 min-w-0 space-y-1 text-xs select-text" style={{ color: 'var(--text-muted)' }}>
                <div className="font-mono">
                  Pod: {svc.availableReplicas}/{svc.replicas}
                </div>
                <div className="truncate font-mono select-text" title={svc.image}>
                  {svc.image}
                </div>
                <div className="flex items-center gap-3">
                  <span>경과: {svc.age}</span>
                  {svc.restartCount > 0 && (
                    <span className="obsidian-badge badge-warning text-[10px]">
                      {svc.restartCount}회 재시작
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              disabled={restarting[svc.name]}
              onClick={() => handleRestart(svc.name)}
              title="재시작"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${restarting[svc.name] ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
