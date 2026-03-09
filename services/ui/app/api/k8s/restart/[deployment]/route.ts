import { NextRequest, NextResponse } from "next/server";
import { restartDeployment, ALLOWED_DEPLOYMENTS } from "@/lib/k8s";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ deployment: string }> }
) {
  const { deployment } = await params;

  if (!ALLOWED_DEPLOYMENTS.includes(deployment)) {
    return NextResponse.json(
      { error: `Deployment "${deployment}" not allowed` },
      { status: 400 }
    );
  }

  const result = await restartDeployment(deployment);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, deployment });
}
