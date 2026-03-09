"use client";

import { useMarketData } from "@/lib/queries/intel";
import { MarketOverview } from "@/components/intel/intel-data";
import { SectorHeatmap } from "@/components/intel/sector-heatmap";
import { UnusualVolumeAlerts } from "@/components/intel/unusual-volume-alerts";
import { IndicatorChart } from "@/components/intel/indicator-chart";

export default function MarketPage() {
  const { data, isLoading } = useMarketData();

  if (isLoading) return <div className="empty-state">로딩중...</div>;
  if (!data?.latest) return <div className="empty-state">시장 데이터 없음</div>;

  const snap = data.latest;

  return (
    <div className="space-y-4">
      <MarketOverview />
      <SectorHeatmap sectorFlows={snap.sectorFlows as Record<string, number> | null} />
      <UnusualVolumeAlerts volumeAnomalies={snap.volumeAnomalies as Record<string, unknown> | null} />
      <IndicatorChart indicator="VIXCLS" label="VIX 추이" color="#EF4444" decimals={1} />
    </div>
  );
}
