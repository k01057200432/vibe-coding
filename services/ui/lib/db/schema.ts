import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  doublePrecision,
  timestamp,
  bigserial,
  bigint,
  integer,
  jsonb,
  date,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

// ─── strategies (Operator CR) ────────────────────────────────────

export const strategies = pgTable(
  "strategies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    type: text("type").notNull(),
    broker: text("broker").notNull(),
    symbols: text("symbols").array().notNull(),
    params: jsonb("params").notNull().default({}),
    mode: text("mode").notNull().default("paper"),
    enabled: boolean("enabled").notNull().default(false),
    schedule: text("schedule").notNull().default("1s"),
    capitalPct: numeric("capital_pct", { precision: 5, scale: 4 })
      .notNull()
      .default("0.1000"),
    phase: text("phase").notNull().default("pending"),
    message: text("message"),
    lastSignalAt: timestamp("last_signal_at", { withTimezone: true }),
    podName: text("pod_name"),
    positions: jsonb("positions"),
    heartbeatAt: timestamp("heartbeat_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_strategies_enabled_phase").on(t.enabled, t.phase)]
);

// ─── strategy_types ──────────────────────────────────────────────

export const strategyTypes = pgTable("strategy_types", {
  type: text("type").primaryKey(),
  label: text("label").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── trades ──────────────────────────────────────────────────────

export const trades = pgTable(
  "trades",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    broker: text("broker").notNull(),
    symbol: text("symbol").notNull(),
    side: text("side").notNull(),
    qty: numeric("qty").notNull(),
    price: numeric("price").notNull(),
    orderType: text("order_type").notNull(),
    status: text("status").notNull(),
    orderId: text("order_id"),
    strategy: text("strategy"),
    pnl: numeric("pnl"),
    simulationId: uuid("simulation_id"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_trades_created_at").on(t.createdAt),
    index("idx_trades_strategy").on(t.strategy),
    index("idx_trades_simulation_id").on(t.simulationId),
  ]
);

// ─── daily_pnl ───────────────────────────────────────────────────

export const dailyPnl = pgTable("daily_pnl", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  date: date("date").notNull().unique(),
  startingEquity: numeric("starting_equity").notNull(),
  endingEquity: numeric("ending_equity").notNull(),
  realizedPnl: numeric("realized_pnl").notNull().default("0"),
  tradeCount: integer("trade_count").notNull().default(0),
  winCount: integer("win_count").notNull().default(0),
  lossCount: integer("loss_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── signals ─────────────────────────────────────────────────────

export const signals = pgTable(
  "signals",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    strategy: text("strategy").notNull(),
    symbol: text("symbol").notNull(),
    action: text("action").notNull(),
    positionPct: numeric("position_pct"),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_signals_strategy").on(t.strategy)]
);

// ─── notifications ───────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    level: text("level").notNull().default("info"),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: jsonb("data"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_notifications_unread").on(t.read, t.createdAt)]
);

// ─── reports ────────────────────────────────────────────────────

export const reports = pgTable(
  "reports",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    type: text("type").notNull().default("daily"),
    title: text("title").notNull(),
    content: text("content").notNull(),
    summary: text("summary"),
    metadata: jsonb("metadata").notNull().default({}),
    generatedBy: text("generated_by").notNull().default("system"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("idx_reports_type_created").on(t.type, t.createdAt)]
);

// ─── ohlcv ──────────────────────────────────────────────────────

export const ohlcvCache = pgTable(
  "ohlcv",
  {
    symbol: text("symbol").notNull(),
    timeframe: text("timeframe").notNull().default("1d"),
    open: doublePrecision("open").notNull(),
    high: doublePrecision("high").notNull(),
    low: doublePrecision("low").notNull(),
    close: doublePrecision("close").notNull(),
    volume: doublePrecision("volume").notNull(),
    ts: timestamp("ts", { withTimezone: true }).notNull(),
  },
  (t) => [
    uniqueIndex("ohlcv_symbol_timeframe_ts_key").on(
      t.symbol,
      t.timeframe,
      t.ts
    ),
    index("idx_ohlcv_symbol_tf_ts").on(t.symbol, t.timeframe, t.ts),
  ]
);

// ─── intel_events ────────────────────────────────────────────────

export const intelEvents = pgTable(
  "intel_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    type: text("type").notNull(),
    source: text("source").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    impactLevel: text("impact_level").notNull().default("low"),
    symbols: text("symbols").array(),
    expectedValue: numeric("expected_value"),
    actualValue: numeric("actual_value"),
    previousValue: numeric("previous_value"),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_intel_type_time").on(t.type, t.detectedAt),
    uniqueIndex("idx_intel_events_type_title").on(t.type, t.title),
  ]
);

// ─── market_snapshots ────────────────────────────────────────────

export const marketSnapshots = pgTable(
  "market_snapshots",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity(),
    vix: numeric("vix", { precision: 6, scale: 2 }),
    sectorFlows: jsonb("sector_flows"),
    volumeAnomalies: jsonb("volume_anomalies"),
    fearGreedIdx: integer("fear_greed_idx"),
    ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_market_snapshots_ts").on(t.ts)]
);

// ─── market_trades ──────────────────────────────────────────────
export const marketTrades = pgTable(
  "market_trades",
  {
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    symbol: text("symbol").notNull(),
    price: doublePrecision("price").notNull(),
    size: integer("size").notNull(),
    exchange: text("exchange").notNull().default(""),
    tape: text("tape").notNull().default(""),
    tradeId: bigint("trade_id", { mode: "number" }).notNull(),
  },
  (t) => [index("idx_market_trades_symbol_ts").on(t.symbol, t.ts)]
);

// ─── market_quotes ──────────────────────────────────────────────
export const marketQuotes = pgTable(
  "market_quotes",
  {
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    symbol: text("symbol").notNull(),
    bidPrice: doublePrecision("bid_price").notNull(),
    bidSize: integer("bid_size").notNull(),
    askPrice: doublePrecision("ask_price").notNull(),
    askSize: integer("ask_size").notNull(),
    bidExchange: text("bid_exchange").notNull().default(""),
    askExchange: text("ask_exchange").notNull().default(""),
    tape: text("tape").notNull().default(""),
  },
  (t) => [index("idx_market_quotes_symbol_ts").on(t.symbol, t.ts)]
);

// ─── market_data ─────────────────────────────────────────────────

export const marketData = pgTable(
  "market_data",
  {
    indicator: text("indicator").notNull(),
    value: numeric("value").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    ts: timestamp("ts", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.indicator, t.ts] }),
  ]
);

// ─── intel_collectors ────────────────────────────────────────────

export const intelCollectors = pgTable("intel_collectors", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  intervalSeconds: integer("interval_seconds").notNull(),
  config: jsonb("config").notNull().default({}),
  lastRunAt: timestamp("last_run_at", { withTimezone: true }),
  status: text("status").notNull().default("idle"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── strategy_audit_log ──────────────────────────────────────────

export const strategyAuditLog = pgTable("strategy_audit_log", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  strategyId: uuid("strategy_id").notNull(),
  changedBy: text("changed_by").notNull(),
  fieldChanged: text("field_changed").notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  changedAt: timestamp("changed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── simulations ─────────────────────────────────────────────────

export const simulations = pgTable("simulations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  strategyType: text("strategy_type").notNull(),
  strategyParams: jsonb("strategy_params").default({}),
  brokerType: text("broker_type").default("alpaca"),
  symbols: text("symbols").array().notNull(),
  tradeSymbol: text("trade_symbol").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  speedMultiplier: numeric("speed_multiplier", { precision: 6, scale: 1 }).default("1.0"),
  initialCash: numeric("initial_cash").default("100000"),
  status: text("status").default("pending"),
  progressPct: numeric("progress_pct", { precision: 5, scale: 2 }).default("0"),
  currentBar: integer("current_bar").default(0),
  totalBars: integer("total_bars").default(0),
  simTime: timestamp("sim_time", { withTimezone: true }),
  finalEquity: numeric("final_equity"),
  totalReturnPct: numeric("total_return_pct"),
  maxDrawdownPct: numeric("max_drawdown_pct"),
  sharpeRatio: numeric("sharpe_ratio"),
  totalTrades: integer("total_trades").default(0),
  wonTrades: integer("won_trades").default(0),
  lostTrades: integer("lost_trades").default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

// ─── simulation_snapshots ────────────────────────────────────────

export const simulationSnapshots = pgTable(
  "simulation_snapshots",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    simulationId: uuid("simulation_id").references(() => simulations.id, {
      onDelete: "cascade",
    }),
    barIndex: integer("bar_index").notNull(),
    simTime: timestamp("sim_time", { withTimezone: true }).notNull(),
    equity: numeric("equity").notNull(),
    cash: numeric("cash").notNull(),
    positionValue: numeric("position_value").default("0"),
    price: numeric("price").notNull(),
    signalAction: text("signal_action"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    index("idx_simulation_snapshots_sim_id").on(t.simulationId, t.barIndex),
  ]
);

// ─── paper_accounts ──────────────────────────────────────────────

export const paperAccounts = pgTable("paper_accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  initialCapital: numeric("initial_capital", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  currentBalance: numeric("current_balance", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  currency: text("currency").notNull().default("USD"),
  memo: text("memo").notNull().default(""),
  commissionType: text("commission_type").notNull().default("zero"),
  commissionValue: numeric("commission_value", { precision: 10, scale: 6 })
    .notNull()
    .default("0"),
  slippageBps: numeric("slippage_bps", { precision: 6, scale: 2 })
    .notNull()
    .default("5.0"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── paper_snapshots ─────────────────────────────────────────────

export const paperSnapshots = pgTable("paper_snapshots", {
  brokerName: text("broker_name").primaryKey(),
  cash: numeric("cash", { precision: 14, scale: 2 }).notNull(),
  positions: jsonb("positions").notNull().default([]),
  equity: numeric("equity", { precision: 14, scale: 2 }).notNull(),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── settings ────────────────────────────────────────────────────

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── push_subscriptions ──────────────────────────────────────────

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("user_agent").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ─── watchlist ───────────────────────────────────────────────────

export const watchlist = pgTable("watchlist", {
  symbol: text("symbol").primaryKey(),
  category: text("category").notNull().default("stock"),
  bars: boolean("bars").notNull().default(true),
  trades: boolean("trades").notNull().default(false),
  quotes: boolean("quotes").notNull().default(false),
  description: text("description").notNull().default(""),
  source: text("source").notNull().default("manual"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── claude_sessions ─────────────────────────────────────────────

export const claudeSessions = pgTable("claude_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  mode: text("mode").notNull(),
  teammateMode: text("teammate_mode").notNull().default("tmux"),
  tmuxName: text("tmux_name").notNull().unique(),
  status: text("status").notNull().default("running"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  stoppedAt: timestamp("stopped_at", { withTimezone: true }),
});
