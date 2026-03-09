"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";

interface BrokerInfo {
  name: string;
  label: string;
  connected: boolean;
  equity: string;
  buyingPower: string;
  cash: string;
  positions: number;
  hasKey: boolean;
  error?: string;
}

interface BrokerSummary {
  broker: string;
  total: number;
  enabled: number;
  disabled: number;
  phases: Record<string, number>;
}

function StatusDot({ connected }: { connected: boolean }) {
  return (
    <span className={`status-dot ${connected ? "status-dot-green" : "status-dot-red"}`} />
  );
}

function PaperCapitalEditor({ brokerName, onSaved }: { brokerName: string; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [capital, setCapital] = useState("");
  const [saving, setSaving] = useState(false);

  const accountId = brokerName;

  async function handleSave() {
    const value = Number(capital);
    if (!value || value <= 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/paper/${encodeURIComponent(accountId)}/capital`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capital: value }),
      });
      if (res.ok) {
        setEditing(false);
        setCapital("");
        onSaved();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <button
        className="text-xs hover:text-[var(--text-primary)] transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onClick={() => setEditing(true)}
      >
        <Edit2 className="mr-1 h-3 w-3 inline" />
        자본금 수정
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        value={capital}
        onChange={(e) => setCapital(e.target.value)}
        placeholder="100000"
        className="h-7 w-28 text-xs font-mono"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        style={{ color: 'var(--accent)' }}
        onClick={handleSave}
        disabled={saving}
      >
        <Check className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => {
          setEditing(false);
          setCapital("");
        }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function BrokerCards({
  brokers,
  strategies,
  onRefresh,
}: {
  brokers: BrokerInfo[];
  strategies: BrokerSummary[];
  onRefresh: () => void;
}) {
  if (brokers.length === 0) {
    return <div className="empty-state">브로커 데이터가 없습니다.</div>;
  }

  const stratMap = new Map(strategies.map((s) => [s.broker, s]));

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
      {brokers.map((b) => {
        const stats = stratMap.get(b.name);
        const isPaper = b.name === "paper-broker";

        return (
          <div key={b.name} className="obsidian-card p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <StatusDot connected={b.connected} />
                <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{b.label}</span>
              </span>
              <div className="flex items-center gap-1.5">
                {b.positions > 0 && (
                  <span className="obsidian-badge badge-running">{b.positions} 포지션</span>
                )}
                {!b.hasKey && (
                  <span className="obsidian-badge badge-error">키 없음</span>
                )}
              </div>
            </div>

            {/* Account Info */}
            {b.connected ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{b.equity}</div>
                  <div className="stat-label">Equity</div>
                </div>
                <div>
                  <div className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{b.buyingPower}</div>
                  <div className="stat-label">Buying Power</div>
                </div>
                <div>
                  <div className="text-sm font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{b.cash}</div>
                  <div className="stat-label">Cash</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                {b.error || "연결 안 됨"}
              </div>
            )}

            {/* Strategy summary */}
            {stats && (
              <div className="border-t pt-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>
                    전략 {stats.total}개 (활성 {stats.enabled})
                  </span>
                  {Object.keys(stats.phases).length > 0 && (
                    <div className="flex gap-1">
                      {Object.entries(stats.phases).map(([phase, count]) => (
                        <span key={phase} className="obsidian-badge badge-stopped text-[10px]">
                          {phase}: {count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Paper capital editor */}
            {isPaper && (
              <div className="border-t pt-2" style={{ borderColor: 'var(--border-subtle)' }}>
                <PaperCapitalEditor brokerName={b.name} onSaved={onRefresh} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
