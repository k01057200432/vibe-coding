import { NextResponse } from "next/server";
import { getServiceStatuses } from "@/lib/k8s";

export async function GET() {
  try {
    const statuses = await getServiceStatuses();
    if (statuses.length > 0) {
      return NextResponse.json(statuses);
    }
    // K8s not available — return empty with flag
    return NextResponse.json({ services: [], k8s: false });
  } catch (err) {
    return NextResponse.json(
      { services: [], k8s: false, error: String(err) },
      { status: 200 }
    );
  }
}
