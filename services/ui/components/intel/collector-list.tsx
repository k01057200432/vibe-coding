"use client";

import { useState } from "react";
import {
  useCollectors,
  useToggleCollector,
  useUpdateInterval,
  useUpdateConfig,
  type IntelCollector,
} from "@/lib/queries/intel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Clock, RefreshCw, Settings2 } from "lucide-react";

const NO_CONFIG_COLLECTORS = new Set([
  "feargreed", "vix", "quotes", "snapshot", "fed_funds_rate",
  "put_call_ratio", "market_breadth", "semiconductor_index",
  "hy_spread", "real_rates", "consumer_sentiment",
  "economic_calendar", "yield_curve", "fed_speeches", "aaii",
]);

function formatInterval(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

function CollectorCard({ collector }: { collector: IntelCollector }) {
  const [editingInterval, setEditingInterval] = useState(false);
  const [intervalValue, setIntervalValue] = useState(
    String(collector.intervalSeconds)
  );
  const [configOpen, setConfigOpen] = useState(false);
  const [configText, setConfigText] = useState("");
  const [configError, setConfigError] = useState("");

  const toggle = useToggleCollector();
  const updateInterval = useUpdateInterval();
  const updateConfig = useUpdateConfig();

  const statusBadgeClass =
    collector.status === "running"
      ? "badge-running"
      : collector.status === "error"
        ? "badge-error"
        : "badge-stopped";

  return (
    <div className="obsidian-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex-1 truncate font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
          {collector.name}
        </span>
        <span className={`obsidian-badge ${statusBadgeClass}`}>
          {collector.status}
        </span>
        <Switch
          checked={collector.enabled}
          onCheckedChange={() => toggle.mutate(collector.id)}
          disabled={toggle.isPending}
        />
      </div>
      {collector.description && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{collector.description}</p>
      )}

      {/* Interval */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-3.5 w-3.5" style={{ color: 'var(--text-muted)' }} />
        {editingInterval ? (
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const secs = Number(intervalValue);
              if (secs >= 1) {
                updateInterval.mutate(
                  { id: collector.id, intervalSeconds: secs },
                  { onSuccess: () => setEditingInterval(false) }
                );
              }
            }}
          >
            <input
              type="number"
              min={1}
              value={intervalValue}
              onChange={(e) => setIntervalValue(e.target.value)}
              className="form-input h-7 w-20 text-xs"
            />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>sec</span>
            <Button type="submit" size="sm" variant="outline" className="h-7 text-xs">
              저장
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs"
              onClick={() => setEditingInterval(false)}
            >
              취소
            </Button>
          </form>
        ) : (
          <button
            className="hover:text-[var(--text-primary)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => {
              setIntervalValue(String(collector.intervalSeconds));
              setEditingInterval(true);
            }}
          >
            매 {formatInterval(collector.intervalSeconds)}
          </button>
        )}
      </div>

      {/* Last run */}
      {collector.lastRunAt && (
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <RefreshCw className="h-3 w-3" />
          마지막: {new Date(collector.lastRunAt).toLocaleString("ko-KR")}
        </div>
      )}

      {/* Error */}
      {collector.errorMessage && (
        <p className="text-xs rounded px-2 py-1" style={{ color: 'var(--accent-red)', background: 'var(--accent-red-glow)' }}>
          {collector.errorMessage}
        </p>
      )}

      {/* JSON config edit — only for collectors that use config */}
      {!NO_CONFIG_COLLECTORS.has(collector.id) && (
        <>
          <button
            className="flex items-center justify-center gap-1 w-full h-7 text-xs rounded transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => {
              setConfigText(JSON.stringify(collector.config, null, 2));
              setConfigError("");
              setConfigOpen(true);
            }}
          >
            <Settings2 className="h-3 w-3" />
            JSON 설정
          </button>

          <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm" style={{ color: 'var(--text-primary)' }}>{collector.name} 설정</DialogTitle>
          </DialogHeader>
          <Textarea
            value={configText}
            onChange={(e) => {
              setConfigText(e.target.value);
              setConfigError("");
            }}
            rows={14}
            className="font-mono text-xs"
          />
          {configError && (
            <p className="text-xs" style={{ color: 'var(--accent-red)' }}>{configError}</p>
          )}
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setConfigOpen(false)}>
              취소
            </Button>
            <Button
              size="sm"
              disabled={updateConfig.isPending}
              className="btn-accent"
              onClick={() => {
                try {
                  const parsed = JSON.parse(configText);
                  updateConfig.mutate(
                    { id: collector.id, config: parsed },
                    { onSuccess: () => setConfigOpen(false) }
                  );
                } catch {
                  setConfigError("유효한 JSON이 아닙니다");
                }
              }}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}

export function CollectorList() {
  const { data, isLoading } = useCollectors();

  if (isLoading) return <div className="empty-state">로딩중...</div>;

  const collectors = data?.data ?? [];

  if (collectors.length === 0) return <div className="empty-state">설정된 수집기가 없습니다</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {collectors.map((c) => (
        <CollectorCard key={c.id} collector={c} />
      ))}
    </div>
  );
}
