import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { strategyTypes } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const types = await db
    .select()
    .from(strategyTypes)
    .orderBy(asc(strategyTypes.type));
  return NextResponse.json(types);
}
