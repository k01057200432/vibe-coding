"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useStrategies,
  useToggleStrategy,
  useUpdateStrategy,
  useDeleteStrategy,
  useRestartStrategy,
  type Strategy,
} from "@/lib/queries/strategies";
import { StrategyForm } from "./strategy-form";
import {
  MoreHorizontal,
  Power,
  Pencil,
  Trash2,
  RotateCcw,
  Plus,
} from "lucide-react";

function PhaseBadge({ phase }: { phase: string }) {
  const cls: Record<string, string> = {
    running: "badge-running",
    pending: "badge-pending",
    stopped: "badge-stopped",
    error: "badge-error",
  };
  const labels: Record<string, string> = {
    running: "실행중",
    pending: "대기",
    stopped: "중지",
    error: "오류",
  };
  return (
    <span className={`obsidian-badge ${cls[phase] ?? "badge-stopped"}`}>
      {labels[phase] ?? phase}
    </span>
  );
}

function EnabledBadge({ enabled }: { enabled: boolean }) {
  return (
    <span className={`obsidian-badge ${enabled ? "badge-running" : "badge-stopped"}`}>
      {enabled ? "ON" : "OFF"}
    </span>
  );
}

function formatTime(ts: string | null) {
  if (!ts) return "-";
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}초 전`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`;
  return d.toLocaleString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function InlineEditCell({
  value,
  onSave,
  onCancel,
  type = "text",
}: {
  value: string;
  onSave: (val: string) => void;
  onCancel: () => void;
  type?: "text" | "number";
}) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSave(editValue);
    if (e.key === "Escape") onCancel();
  };

  return (
    <input
      ref={inputRef}
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={() => onSave(editValue)}
      type={type}
      className="form-input h-7 text-sm w-full min-w-[60px]"
      style={{ fontSize: "16px" }}
    />
  );
}

interface EditingState {
  id: string;
  field: string;
}

export function StrategyTable() {
  const router = useRouter();
  const { data: strategies, isLoading } = useStrategies();
  const toggle = useToggleStrategy();
  const update = useUpdateStrategy();
  const remove = useDeleteStrategy();
  const restart = useRestartStrategy();
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editData, setEditData] = useState<Strategy | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);

  const handleEdit = (s: Strategy) => {
    setEditData(s);
    setEditOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" 전략을 삭제하시겠습니까?`)) {
      remove.mutate(id);
    }
  };

  const handleInlineSave = (s: Strategy, field: string, value: string) => {
    setEditing(null);
    const oldValue = field === "capitalPct" ? String(Number(s.capitalPct) * 100) : String(s[field as keyof Strategy] ?? "");
    if (value === oldValue) return;

    const payload: Record<string, unknown> = { id: s.id };
    if (field === "name") payload.name = value;
    if (field === "capitalPct") payload.capitalPct = String(Number(value) / 100);
    if (field === "schedule") payload.schedule = value;
    update.mutate(payload as { id: string } & Record<string, unknown>);
  };

  const startEditing = (id: string, field: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing({ id, field });
  };

  return (
    <div className="space-y-4">
      <div className="page-header">
        <div>
          <h2 className="page-title">전략 관리</h2>
          <p className="page-subtitle">전략 생성, 수정, 활성화 관리</p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-[var(--accent)] text-white hover:bg-[var(--accent-bright)]"
        >
          <Plus className="h-4 w-4 mr-1" /> 새 전략
        </Button>
      </div>

      {isLoading ? (
        <div className="empty-state">로딩중...</div>
      ) : !strategies?.length ? (
        <div className="empty-state">설정된 전략이 없습니다</div>
      ) : (
        <div className="obsidian-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상태</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>브로커</TableHead>
                  <TableHead>심볼</TableHead>
                  <TableHead>모드</TableHead>
                  <TableHead>자본</TableHead>
                  <TableHead>페이즈</TableHead>
                  <TableHead>하트비트</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody className="select-text">
                {strategies.map((s) => (
                  <TableRow
                    key={s.id}
                    className={`cursor-pointer ${editing?.id === s.id ? "bg-[var(--bg-elevated)]" : ""}`}
                    onClick={() => { if (!editing) router.push(`/strategies/${s.id}`); }}
                  >
                    <TableCell>
                      <EnabledBadge enabled={s.enabled} />
                    </TableCell>
                    <TableCell
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                      onDoubleClick={(e) => startEditing(s.id, "name", e)}
                    >
                      {editing?.id === s.id && editing.field === "name" ? (
                        <InlineEditCell
                          value={s.name}
                          onSave={(v) => handleInlineSave(s, "name", v)}
                          onCancel={() => setEditing(null)}
                        />
                      ) : (
                        s.name
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="obsidian-badge badge-info">{s.type}</span>
                    </TableCell>
                    <TableCell>
                      {s.broker}
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate">
                      {s.symbols.join(", ")}
                    </TableCell>
                    <TableCell>
                      <span className={`obsidian-badge ${s.mode === "live" ? "badge-live" : "badge-paper"}`}>
                        {s.mode === "paper" ? "가상" : s.mode === "live" ? "실전" : s.mode}
                      </span>
                    </TableCell>
                    <TableCell
                      className="font-mono"
                      onDoubleClick={(e) => startEditing(s.id, "capitalPct", e)}
                    >
                      {editing?.id === s.id && editing.field === "capitalPct" ? (
                        <InlineEditCell
                          value={(Number(s.capitalPct) * 100).toFixed(1)}
                          onSave={(v) => handleInlineSave(s, "capitalPct", v)}
                          onCancel={() => setEditing(null)}
                          type="number"
                        />
                      ) : (
                        `${(Number(s.capitalPct) * 100).toFixed(1)}%`
                      )}
                    </TableCell>
                    <TableCell>
                      <PhaseBadge phase={s.phase} />
                    </TableCell>
                    <TableCell className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      {formatTime(s.heartbeatAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggle.mutate(s.id)}>
                            <Power className="h-4 w-4 mr-2" />
                            {s.enabled ? "비활성화" : "활성화"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(s)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            편집
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => restart.mutate(s.id)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            재시작
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            style={{ color: 'var(--accent-red)' }}
                            onClick={() => handleDelete(s.id, s.name)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <StrategyForm open={createOpen} onOpenChange={setCreateOpen} />
      <StrategyForm
        key={editData?.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        editData={editData}
      />
    </div>
  );
}
