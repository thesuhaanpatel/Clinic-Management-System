// app/api/appointments/route.ts
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, members, patients, doctors, revenueTransactions } from "@/db/schema";
import { NextResponse, NextRequest } from "next/server";

// GET all appointments with patient and doctor details
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countOnly = searchParams.get("count");
    
    if (countOnly === "true") {
      const count = await db.select({ count: sql`count(*)` }).from(appointments);
      return NextResponse.json({ count: count[0].count }, { headers: { "Cache-Control": "no-store" } });
    }

    const appointmentsData = await db
      .select({
        id: appointments.id,
        patientId: appointments.patientId,
        patientName: patients.name,
        date: appointments.date,
        billNo: appointments.billNo,
        seenBy: doctors.name,
        paymentCash: appointments.paymentCash,
        paymentOnline: appointments.paymentOnline,
        paymentPackage: appointments.paymentPackage,
        balance: appointments.balance,
        remark: appointments.remark,
        phone: patients.phone,
        contactNo: appointments.contactNo,
      })
      .from(appointments)
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .orderBy(appointments.date);

    return NextResponse.json(appointmentsData, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      patientId, 
      doctorId, 
      date, 
      billNo, 
      seenBy, 
      paymentCash = 0, 
      paymentOnline = 0, 
      paymentPackage = 0, 
      balance = 0, 
      remark, 
      contactNo,
      useMemberSession = false,
      memberId
    } = body;

    // Validate required fields
    if (!patientId || !doctorId || !date) {
      return NextResponse.json(
        { error: "Patient ID, Doctor ID, and Date are required" },
        { status: 400 }
      );
    }

    // Handle member session if requested
    if (useMemberSession && memberId) {
      const memberRecord = await db
        .select()
        .from(members)
        .where(eq(members.id, parseInt(memberId)))
        .limit(1);

      if (!memberRecord || memberRecord.length === 0 || memberRecord[0].remainingSessions <= 0) {
        return NextResponse.json(
          { error: "Invalid or expired membership" },
          { status: 400 }
        );
      }

      // Decrement remaining sessions
      await db
        .update(members)
        .set({ remainingSessions: memberRecord[0].remainingSessions - 1 })
        .where(eq(members.id, parseInt(memberId)));
    }

    // Calculate total payment and balance
    const totalPayment = paymentCash + paymentOnline + paymentPackage;
    const calculatedBalance = balance === 0 ? 0 : balance;

    // Create appointment
    const result = await db.insert(appointments).values({
      patientId: parseInt(patientId),
      doctorId: parseInt(doctorId),
      date: new Date(date).toISOString(),
      memberId: useMemberSession && memberId ? parseInt(memberId) : null,
      billNo: billNo || null,
      seenBy: seenBy || null,
      paymentCash: parseInt(paymentCash) || 0,
      paymentOnline: parseInt(paymentOnline) || 0,
      paymentPackage: parseInt(paymentPackage) || 0,
      balance: calculatedBalance,
      remark: remark || null,
      contactNo: contactNo || null,
    }).returning();

    // Create revenue transaction if payment was made
    if (totalPayment > 0) {
      await db.insert(revenueTransactions).values({
        type: 'appointment',
        amount: totalPayment,
        paymentMethod: paymentCash > 0 ? 'cash' : paymentOnline > 0 ? 'online' : 'package',
        paymentDate: new Date().toISOString(),
        description: `Appointment for patient ID: ${patientId}`,
        patientId: parseInt(patientId),
        appointmentId: result[0].id,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      appointment: result[0] 
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    const appointmentId = parseInt(id);

    // First check if this appointment used a member session
    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    // If it used a member session, increment the remaining sessions back
    if (appointment && appointment.length > 0 && appointment[0].memberId) {
      const memberRecord = await db
        .select()
        .from(members)
        .where(eq(members.id, appointment[0].memberId))
        .limit(1);

      if (memberRecord && memberRecord.length > 0) {
        await db
          .update(members)
          .set({ remainingSessions: memberRecord[0].remainingSessions + 1 })
          .where(eq(members.id, appointment[0].memberId));
      }
    }

    // Delete the appointment
    await db.delete(appointments).where(eq(appointments.id, appointmentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return NextResponse.json(
      { error: "Failed to delete appointment" },
      { status: 500 }
    );
  }
}