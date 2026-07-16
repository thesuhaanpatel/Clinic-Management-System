// app/api/patients/add/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, age, gender, dob, school, area, referredBy, phone } = body;

    // Validate required fields
    if (!name || !age || !gender || !phone) {
      return NextResponse.json(
        { error: "Name, age, gender, and phone are required" },
        { status: 400 }
      );
    }

    const result = await db.insert(patients).values({
      name,
      age: parseInt(age),
      gender,
      dob,
      school,
      area,
      referredBy,
      phone,
    }).returning();

    return NextResponse.json({ 
      message: "Patient added successfully", 
      patient: result[0] 
    });
  } catch (error) {
    console.error("POST /patients/add error:", error);
    return NextResponse.json({ error: "Failed to add patient" }, { status: 500 });
  }
}