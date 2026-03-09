"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Save, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useUpsertSetting } from "@/lib/queries/settings";

interface KeyField {
  settingKey: string;
  label: string;
  currentValue?: string;
}

export function ApiKeyForm({
  title,
  fields,
  testType,
}: {
  title: string;
  fields: KeyField[];
  testType?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((f) => {
      init[f.settingKey] = f.currentValue ?? "";
    });
    return init;
  });

  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const upsert = useUpsertSetting();

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all(
        fields.map((f) =>
          upsert.mutateAsync({ key: f.settingKey, value: values[f.settingKey] ?? "" })
        )
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function maskValue(val: string) {
    if (val.length <= 4) return "****";
    return "****" + val.slice(-4);
  }

  return (
    <div className="obsidian-card p-4 space-y-4">
      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>

      {fields.map((f) => {
        const show = visible[f.settingKey] ?? false;
        const val = values[f.settingKey] ?? "";
        return (
          <div key={f.settingKey} className="space-y-1.5">
            <label htmlFor={f.settingKey} className="form-label">
              {f.label}
            </label>
            <div className="flex gap-2">
              <input
                id={f.settingKey}
                type={show ? "text" : "password"}
                value={show ? val : val ? maskValue(val) : ""}
                onChange={(e) => {
                  setValues((prev) => ({
                    ...prev,
                    [f.settingKey]: e.target.value,
                  }));
                  if (!show) setVisible((v) => ({ ...v, [f.settingKey]: true }));
                }}
                onFocus={() => setVisible((v) => ({ ...v, [f.settingKey]: true }))}
                placeholder="키 입력..."
                className="form-input font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setVisible((v) => ({
                    ...v,
                    [f.settingKey]: !v[f.settingKey],
                  }))
                }
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );
      })}
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="flex-1 btn-accent"
        >
          <Save className="mr-2 h-4 w-4" />
          {saving ? "저장중..." : saved ? "저장됨!" : "저장"}
        </Button>
        {testType && (
          <Button
            variant="outline"
            size="sm"
            disabled={testing}
            className="flex-1"
            onClick={async () => {
              setTesting(true);
              setTestResult(null);
              try {
                const res = await fetch("/api/settings/test", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type: testType }),
                });
                const data = await res.json();
                setTestResult(data);
              } catch {
                setTestResult({ ok: false, message: "요청 실패" });
              } finally {
                setTesting(false);
              }
            }}
          >
            {testing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {testing ? "테스트중..." : "테스트"}
          </Button>
        )}
      </div>
      {testResult && (
        <div
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm"
          style={{
            background: testResult.ok ? 'var(--accent-glow)' : 'var(--accent-red-glow)',
            color: testResult.ok ? 'var(--accent)' : 'var(--accent-red)',
          }}
        >
          {testResult.ok ? (
            <CheckCircle className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}
    </div>
  );
}
