// app/api/doctors/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doctors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countOnly = searchParams.get("count");
    
    if (countOnly === "true") {
      const count = await db.select({ count: doctors.id }).from(doctors);
      return NextResponse.json({ count: count[0].count });
    }
    
    const allDoctors = await db.select().from(doctors);
    return NextResponse.json(allDoctors);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newDoctor = await db.insert(doctors).values(body).returning();
    return NextResponse.json(newDoctor[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to create doctor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }
    
    await db.delete(doctors).where(eq(doctors.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete doctor" },
      { status: 500 }
    );
  }
}