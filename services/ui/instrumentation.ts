import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";

export function register() {
  initOtel();
  initPush();
}

function initOtel() {
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) {
    console.log("[otel] OTEL_EXPORTER_OTLP_ENDPOINT not set, tracing disabled");
    return;
  }

  const exporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
  });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "trading-ui",
    }),
    spanProcessor: new SimpleSpanProcessor(exporter),
  });

  sdk.start();
  console.log("[otel] tracing initialized", { service: "trading-ui", endpoint });

  if (typeof process !== "undefined" && process.on) {
    process.on("SIGTERM", () => {
      sdk.shutdown().catch(console.error);
    });
  }
}

function initPush() {
  import("./lib/push").then(({ startPushListener }) => {
    startPushListener();
  }).catch((err) => {
    console.error("[push] failed to load push module:", err.message);
  });
}
