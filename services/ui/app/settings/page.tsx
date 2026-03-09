"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ServiceGrid } from "@/components/status/service-grid";
import { ApiKeyForm } from "@/components/settings/api-key-form";
import { CollectorList } from "@/components/intel/collector-list";
import { WatchlistManager } from "@/components/intel/watchlist-manager";

import { useSettings } from "@/lib/queries/settings";
import { Button } from "@/components/ui/button";
import { RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const ALL_SETTING_KEYS = [
  "fred_api_key",
  "alpaca_api_key",
  "alpaca_secret_key",
  "alpaca_live_api_key",
  "alpaca_live_secret_key",
];

export default function SettingsPage() {
  const { data: settings, isLoading: settingsLoading } = useSettings(ALL_SETTING_KEYS);
  const [reconciling, setReconciling] = useState(false);

  const { data: services, isLoading: statusLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["k8s-status"],
    queryFn: async () => {
      const res = await fetch("/api/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      const json = await res.json();
      return Array.isArray(json) ? json : [];
    },
    refetchInterval: 15_000,
  });

  function getValue(key: string) {
    return settings?.find((s) => s.key === key)?.value ?? "";
  }

  async function handleForceReconcile() {
    setReconciling(true);
    try {
      const res = await fetch("/api/force-reconcile", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast.success("재조정 요청 완료");
    } catch {
      toast.error("재조정 요청 실패");
    } finally {
      setReconciling(false);
    }
  }

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("ko-KR")
    : "";

  return (
    <div className="space-y-5 animate-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">설정</h2>
          <p className="page-subtitle">시스템 설정 및 서비스 관리</p>
        </div>
      </div>

      <Tabs defaultValue="system">
        <TabsList>
          <TabsTrigger value="system">시스템</TabsTrigger>
          <TabsTrigger value="api-keys">API 키</TabsTrigger>
          <TabsTrigger value="collectors">Intel 수집기</TabsTrigger>
        </TabsList>

        {/* 시스템 탭 — K8s 서비스 상태 */}
        <TabsContent value="system" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="section-header">K8s 서비스 상태</p>
            <div className="flex items-center gap-2">
              {updatedAt && (
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {updatedAt}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleForceReconcile}
                disabled={reconciling}
              >
                <RotateCcw
                  className={`mr-1.5 h-4 w-4 ${reconciling ? "animate-spin" : ""}`}
                />
                강제 재조정
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={statusLoading}
              >
                <RefreshCw
                  className={`mr-1.5 h-4 w-4 ${statusLoading ? "animate-spin" : ""}`}
                />
                새로고침
              </Button>
            </div>
          </div>

          {statusLoading && !services ? (
            <div className="empty-state">로딩중...</div>
          ) : (
            <ServiceGrid services={services ?? []} onRefresh={() => refetch()} />
          )}
        </TabsContent>

        {/* API 키 탭 — 브로커 + 일반 API 키 */}
        <TabsContent value="api-keys" className="space-y-6">
          {settingsLoading ? (
            <div className="empty-state">로딩중...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <ApiKeyForm
                  title="Alpaca Paper"
                  testType="alpaca"
                  fields={[
                    { settingKey: "alpaca_api_key", label: "API Key", currentValue: getValue("alpaca_api_key") },
                    { settingKey: "alpaca_secret_key", label: "Secret Key", currentValue: getValue("alpaca_secret_key") },
                  ]}
                />
                <ApiKeyForm
                  title="Alpaca Live"
                  testType="alpaca-live"
                  fields={[
                    { settingKey: "alpaca_live_api_key", label: "API Key", currentValue: getValue("alpaca_live_api_key") },
                    { settingKey: "alpaca_live_secret_key", label: "Secret Key", currentValue: getValue("alpaca_live_secret_key") },
                  ]}
                />
                <ApiKeyForm
                  title="FRED"
                  testType="fred"
                  fields={[
                    { settingKey: "fred_api_key", label: "API Key", currentValue: getValue("fred_api_key") },
                  ]}
                />
              </div>
          )}
        </TabsContent>

        {/* Intel 수집기 탭 */}
        <TabsContent value="collectors" className="space-y-8 pt-2">
          <div className="space-y-4">
            <p className="section-header">워치리스트</p>
            <WatchlistManager />
          </div>
          <div className="space-y-4">
            <p className="section-header">수집기 목록</p>
            <CollectorList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
