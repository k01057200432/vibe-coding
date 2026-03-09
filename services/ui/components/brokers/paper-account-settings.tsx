"use client";

import { useState } from "react";
import { usePaperAccounts, useUpdatePaperCapital } from "@/lib/queries/paper";
import { Button } from "@/components/ui/button";
import { Banknote, Save } from "lucide-react";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPct(n: number) {
  return `${(n * 100).toFixed(1)}%`;
}

function AccountCard({
  account,
}: {
  account: { id: string; name: string; initialCapital: string; currentBalance: string; memo: string };
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(account.initialCapital);
  const update = useUpdatePaperCapital();

  return (
    <div className="obsidian-card p-3 space-y-1">
      <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{account.name}</div>
      {account.memo && (
        <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>{account.memo}</div>
      )}
      <div className="text-sm font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
        {formatMoney(Number(account.currentBalance))}
      </div>
      {editing ? (
        <form
          className="flex items-center gap-2 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            const num = Number(value);
            if (num > 0) {
              update.mutate(
                { id: account.id, capital: num },
                { onSuccess: () => setEditing(false) }
              );
            }
          }}
        >
          <input
            type="number"
            min={0}
            step={100}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="form-input h-7 w-28 text-xs font-mono"
          />
          <Button type="submit" size="sm" variant="outline" className="h-7 text-xs" disabled={update.isPending}>
            <Save className="h-3 w-3 mr-1" />
            저장
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setEditing(false)}
          >
            취소
          </Button>
        </form>
      ) : (
        <button
          className="text-[11px] hover:text-[var(--text-primary)] transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onClick={() => {
            setValue(account.initialCapital);
            setEditing(true);
          }}
        >
          초기: {formatMoney(Number(account.initialCapital))} (클릭하여 수정)
        </button>
      )}
    </div>
  );
}

export function PaperAccountSettings() {
  const { data, isLoading } = usePaperAccounts();

  if (isLoading) {
    return <div className="empty-state">로딩중...</div>;
  }

  if (!data || data.accounts.length === 0) {
    return (
      <div className="obsidian-card p-4">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
          <Banknote className="h-4 w-4" />
          Paper Trading
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          설정된 가상계좌가 없습니다. Bot이 paper 모드 전략을 실행하면 자동으로 생성됩니다.
        </p>
      </div>
    );
  }

  const { accounts, total, allocations } = data;

  return (
    <div className="obsidian-card p-4 space-y-4">
      <div>
        <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Banknote className="h-4 w-4" />
          Paper Trading
        </h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          가상계좌 자본금 설정 &middot; 현재 잔고{" "}
          <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatMoney(total.currentBalance)}</span>
          {total.initialCapital !== total.currentBalance && (
            <span style={{ color: 'var(--text-dim)' }}>
              {" "}/ 초기 {formatMoney(total.initialCapital)}
            </span>
          )}
        </p>
      </div>

      {/* Broker sub-accounts */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((a) => (
          <AccountCard key={a.id} account={a} />
        ))}
      </div>

      {/* Strategy allocations */}
      {allocations.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="section-header">전략별 배분</p>
            <span className="obsidian-badge badge-stopped text-[10px]">
              {allocations.length}개
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="space-y-1">
              {allocations.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-xs hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <span
                    className={`status-dot ${a.enabled ? "status-dot-green" : "status-dot-gray"}`}
                  />
                  <span className="flex-1 truncate font-medium" style={{ color: 'var(--text-primary)' }}>{a.name}</span>
                  <span className="obsidian-badge badge-info text-[10px]">
                    {a.type}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{a.broker}</span>
                  <span className="font-mono w-16 text-right" style={{ color: 'var(--text-secondary)' }}>{formatMoney(a.allocated)}</span>
                  <span className="font-mono w-12 text-right" style={{ color: 'var(--text-muted)' }}>
                    {formatPct(a.capitalPct)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
