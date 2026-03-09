import * as k8s from "@kubernetes/client-node";

const NAMESPACE = process.env.POD_NAMESPACE || "trading";
const ALLOWED_DEPLOYMENTS = [
  "trading-bot",
  "trading-broker",
  "trading-controller",
  "trading-ui",
  "trading-claude",
  "trading-intel",
  "trading-report",
];

let appsApi: k8s.AppsV1Api | null = null;
let coreApi: k8s.CoreV1Api | null = null;

try {
  const kc = new k8s.KubeConfig();
  kc.loadFromCluster();
  appsApi = kc.makeApiClient(k8s.AppsV1Api);
  coreApi = kc.makeApiClient(k8s.CoreV1Api);
} catch {
  // local dev — K8s not available
}

export interface ServiceStatus {
  name: string;
  ready: boolean;
  replicas: number;
  availableReplicas: number;
  image: string;
  restartCount: number;
  age: string;
}

function formatAge(creationTimestamp: Date | undefined): string {
  if (!creationTimestamp) return "unknown";
  const diff = Date.now() - new Date(creationTimestamp).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d${hours}h`;
  const minutes = Math.floor((diff % 3600000) / 60000);
  return hours > 0 ? `${hours}h${minutes}m` : `${minutes}m`;
}

export async function getServiceStatuses(): Promise<ServiceStatus[]> {
  if (!appsApi || !coreApi) return [];

  const { items: deployments } = await appsApi.listNamespacedDeployment({
    namespace: NAMESPACE,
  });

  const { items: pods } = await coreApi.listNamespacedPod({
    namespace: NAMESPACE,
  });

  return deployments
    .filter((d) => ALLOWED_DEPLOYMENTS.includes(d.metadata?.name ?? ""))
    .map((d) => {
      const name = d.metadata?.name ?? "";
      const replicas = d.status?.replicas ?? 0;
      const available = d.status?.availableReplicas ?? 0;
      const image =
        d.spec?.template?.spec?.containers?.[0]?.image?.split("/").pop() ?? "";

      const depPods = pods.filter((p) =>
        p.metadata?.name?.startsWith(name)
      );
      const restartCount = depPods.reduce((sum, p) => {
        const containerRestarts =
          p.status?.containerStatuses?.[0]?.restartCount ?? 0;
        return sum + containerRestarts;
      }, 0);

      return {
        name,
        ready: available > 0 && available >= replicas,
        replicas,
        availableReplicas: available,
        image,
        restartCount,
        age: formatAge(d.metadata?.creationTimestamp),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function restartDeployment(
  name: string
): Promise<{ ok: boolean; error?: string }> {
  if (!appsApi) return { ok: false, error: "K8s not available" };
  if (!ALLOWED_DEPLOYMENTS.includes(name)) {
    return { ok: false, error: `Deployment "${name}" not allowed` };
  }

  await appsApi.patchNamespacedDeployment({
    name,
    namespace: NAMESPACE,
    body: {
      spec: {
        template: {
          metadata: {
            annotations: {
              "kubectl.kubernetes.io/restartedAt": new Date().toISOString(),
            },
          },
        },
      },
    },
  });

  return { ok: true };
}

export { ALLOWED_DEPLOYMENTS };
