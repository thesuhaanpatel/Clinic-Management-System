// app/api/patients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, appointments } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countOnly = searchParams.get("count");
    const phone = searchParams.get("phone");
    
    if (countOnly === "true") {
      const count = await db.select({ count: sql`count(*)` }).from(patients);
      return NextResponse.json({ count: count[0].count });
    }
    
    if (phone) {
      const foundPatients = await db
        .select()
        .from(patients)
        .where(sql`${patients.phone} LIKE ${'%' + phone + '%'}`)
        .orderBy(patients.name);
      
      return NextResponse.json(foundPatients);
    }
    
    const allPatients = await db.select().from(patients).orderBy(patients.name);
    return NextResponse.json(allPatients);
  } catch (error) {
    console.error("GET /patients error:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

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

    return NextResponse.json({ message: "Patient added successfully", patient: result[0] });
  } catch (error) {
    console.error("POST /patients error:", error);
    return NextResponse.json({ error: "Failed to add patient" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    const result = await db.update(patients)
      .set(updates)
      .where(eq(patients.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Patient updated successfully", 
      patient: result[0] 
    });
  } catch (error) {
    console.error("PUT /patients error:", error);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    // Convert to number
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: "Invalid Patient ID" }, { status: 400 });
    }

    // Check if patient exists
    const existingPatient = await db.select().from(patients).where(eq(patients.id, patientId));
    if (existingPatient.length === 0) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Delete related records in members and appointments
    await db.delete(appointments).where(eq(appointments.patientId, patientId));

    // Delete the patient
    await db.delete(patients).where(eq(patients.id, patientId));

    return NextResponse.json({ message: "Patient and related records deleted successfully" });
  } catch (error) {
    console.error("DELETE /patients error:", error);
    return NextResponse.json({ error: "Failed to delete patient. They may have associated records." }, { status: 500 });
  }
}