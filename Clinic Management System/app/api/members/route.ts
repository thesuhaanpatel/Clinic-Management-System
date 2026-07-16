// app/api/members/route.ts
import { NextResponse, NextRequest } from "next/server";
import { db } from "@/db";
import { members, membershipPlans, patients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get("patientId");

    const query = db
      .select({
        id: members.id,
        patientId: members.patientId,
        patientName: patients.name,
        planId: members.planId,
        planName: membershipPlans.name,
        planTotalSessions: membershipPlans.totalSessions,
        remainingSessions: members.remainingSessions,
      })
      .from(members)
      .leftJoin(patients, eq(members.patientId, patients.id))
      .leftJoin(membershipPlans, eq(members.planId, membershipPlans.id));

    if (patientId) {
      query.where(eq(members.patientId, parseInt(patientId)));
    }

    const membersData = await query.orderBy(members.id);

    return NextResponse.json(membersData, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { patientId, planId, remainingSessions } = body;

    // Validate required fields
    if (!patientId || !planId) {
      return NextResponse.json(
        { error: "Patient ID and Plan ID are required" },
        { status: 400 }
      );
    }

    // Get the plan to determine total sessions
    const plan = await db
      .select({ id: membershipPlans.id, totalSessions: membershipPlans.totalSessions })
      .from(membershipPlans)
      .where(eq(membershipPlans.id, parseInt(planId)))
      .limit(1);

    if (!plan || plan.length === 0) {
      return NextResponse.json(
        { error: "Membership plan not found" },
        { status: 404 }
      );
    }

    // Ensure remainingSessions is set correctly
    const sessions = remainingSessions ? parseInt(remainingSessions) : plan[0].totalSessions;
    if (isNaN(sessions) || sessions < 0) {
      return NextResponse.json(
        { error: "Invalid remaining sessions value" },
        { status: 400 }
      );
    }

    // Create the membership
    const result = await db.insert(members).values({
      patientId: parseInt(patientId),
      planId: parseInt(planId),
      remainingSessions: sessions,
    }).returning();

    console.log("Created membership:", result[0]); // Debugging log

    return NextResponse.json({ 
      success: true, 
      member: result[0] 
    });
  } catch (error) {
    console.error("Error creating membership:", error);
    return NextResponse.json(
      { error: "Failed to create membership" },
      { status: 500 }
    );
  }
}