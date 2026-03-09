import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { intelCollectors } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const data = await db
    .select()
    .from(intelCollectors)
    .orderBy(asc(intelCollectors.name));

  return NextResponse.json({ data });
}
