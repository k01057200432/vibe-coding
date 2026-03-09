import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { intelEvents, marketSnapshots, ohlcvCache, marketData, watchlist } from "@/lib/db/schema";
import { desc, gte, eq, sql, inArray, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const tab = sp.get("tab") ?? "events";

  if (tab === "events") {
    const limit = Math.min(Number(sp.get("limit") ?? 30), 100);
    const offset = Number(sp.get("offset") ?? 0);
    const type = sp.get("type");

    const where = type ? eq(intelEvents.type, type) : undefined;

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(intelEvents)
        .where(where)
        .orderBy(desc(intelEvents.detectedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(intelEvents)
        .where(where),
    ]);

    return NextResponse.json({ data, total: countResult[0]?.count ?? 0 });
  }

  if (tab === "market") {
    const data = await db
      .select()
      .from(marketSnapshots)
      .orderBy(desc(marketSnapshots.ts))
      .limit(1);

    const recent = await db
      .select()
      .from(marketSnapshots)
      .where(gte(marketSnapshots.ts, sql`now() - interval '24 hours'`))
      .orderBy(desc(marketSnapshots.ts))
      .limit(48);

    return NextResponse.json({ latest: data[0] ?? null, recent });
  }

  if (tab === "ohlcv") {
    const symbol = sp.get("symbol");
    const symbols = sp.get("symbols"); // comma-separated
    const limit = Math.min(Number(sp.get("limit") ?? 60), 200);

    // Multi-symbol: latest N bars per symbol
    if (symbols) {
      const symList = symbols.split(",").map((s) => s.trim()).filter(Boolean);
      if (symList.length === 0) return NextResponse.json({ data: {} });

      const rows = await db
        .select()
        .from(ohlcvCache)
        .where(inArray(ohlcvCache.symbol, symList))
        .orderBy(ohlcvCache.symbol, desc(ohlcvCache.ts));

      // Group by symbol, take latest N per symbol
      const grouped: Record<string, typeof rows> = {};
      for (const row of rows) {
        if (!grouped[row.symbol]) grouped[row.symbol] = [];
        if (grouped[row.symbol].length < limit) {
          grouped[row.symbol].push(row);
        }
      }
      // Reverse each group to chronological order
      for (const sym of Object.keys(grouped)) {
        grouped[sym].reverse();
      }
      return NextResponse.json({ data: grouped });
    }

    // Single symbol (backward-compat)
    const sym = symbol ?? "QQQ";
    const data = await db
      .select()
      .from(ohlcvCache)
      .where(eq(ohlcvCache.symbol, sym))
      .orderBy(desc(ohlcvCache.ts))
      .limit(limit);

    return NextResponse.json({ data: data.reverse() });
  }

  // New: latest value per indicator group
  if (tab === "indicators") {
    const group = sp.get("group") ?? "all";

    // Build dynamic indicator lists from watchlist
    const [indexRows, commodityRows, etfRows] = await Promise.all([
      db.select({ symbol: watchlist.symbol }).from(watchlist).where(eq(watchlist.category, "index")),
      db.select({ symbol: watchlist.symbol }).from(watchlist).where(eq(watchlist.category, "commodity")),
      db.select({ symbol: watchlist.symbol }).from(watchlist).where(eq(watchlist.category, "etf")),
    ]);

    const globalIndicators = indexRows.map(r => `global_${r.symbol}`);
    const commodityIndicators = commodityRows.map(r => `commodity_${r.symbol}`);
    const flowIndicators = etfRows.map(r => `etf_flow_${r.symbol}`);

    const prefixMap: Record<string, string[]> = {
      global:    globalIndicators,
      commodity: commodityIndicators,
      macro:     ["BAMLH0A0HYM2", "DFII10", "UMCSENT", "sox_index", "pct_above_50ma",
                  "DGS2", "DGS10", "DGS30", "spread_2y10y", "dff",
                  "CPIAUCSL", "PCEPI", "T5YIE", "ICSA", "CCSA"],
      sentiment: ["put_call_ratio", "aaii_bullish", "aaii_neutral", "aaii_bearish"],
      flows:     flowIndicators,
      positioning: ["cot_es_noncomm_long", "cot_es_noncomm_short",
                    "cot_nq_noncomm_long", "cot_nq_noncomm_short"],
      dollar:    ["dollar_index"],
      forex:     ["forex_KRW=X", "forex_JPY=X", "forex_EURUSD=X", "forex_GBPUSD=X", "forex_CNY=X"],
      yield_curve: ["DGS2", "spread_2y5y", "spread_2y10y", "spread_10y30y",
                    "DGS5", "DGS10", "DGS30"],
    };

    const indicators = group === "all"
      ? Object.values(prefixMap).flat()
      : (prefixMap[group] ?? []);

    if (indicators.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Get latest row per indicator using a lateral join approach
    const rows = await db
      .selectDistinctOn([marketData.indicator], {
        indicator: marketData.indicator,
        value: marketData.value,
        metadata: marketData.metadata,
        ts: marketData.ts,
      })
      .from(marketData)
      .where(inArray(marketData.indicator, indicators))
      .orderBy(marketData.indicator, desc(marketData.ts));

    return NextResponse.json({ data: rows });
  }

  if (tab === "history") {
    const indicator = sp.get("indicator");
    const range = sp.get("range") ?? "1w";
    if (!indicator) {
      return NextResponse.json({ error: "indicator required" }, { status: 400 });
    }

    const intervalMap: Record<string, string> = {
      "1d": "1 day",
      "1w": "7 days",
      "1m": "30 days",
      "3m": "90 days",
    };
    const interval = intervalMap[range] ?? "7 days";

    const rows = await db
      .select({
        value: marketData.value,
        ts: marketData.ts,
      })
      .from(marketData)
      .where(
        and(
          eq(marketData.indicator, indicator),
          gte(marketData.ts, sql`now() - interval '${sql.raw(interval)}'`)
        )
      )
      .orderBy(marketData.ts);

    return NextResponse.json({ data: rows });
  }

  return NextResponse.json({ error: "invalid tab" }, { status: 400 });
}
