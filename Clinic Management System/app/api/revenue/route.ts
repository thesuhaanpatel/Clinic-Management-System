import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { doctors, appointments, membershipPlans, members } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = parseInt(searchParams.get('doctorId') || '0');

    if (!doctorId) {
      return NextResponse.json(
        { error: 'Doctor ID is required' },
        { status: 400 }
      );
    }

    // Verify doctor exists
    const doctor = await db.select().from(doctors).where(eq(doctors.id, doctorId));
    if (doctor.length === 0) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Fetch appointments for the doctor
    const docAppointments = await db.select().from(appointments).where(eq(appointments.doctorId, doctorId));

    // Fetch all membership plans and members (for lookup)
    const plans = await db.select().from(membershipPlans);
    const allMembers = await db.select().from(members);

    const numAppointments = docAppointments.length;
    let normalSessions = 0;
    let membershipSessions = 0;
    let totalRevenue = 0;

    docAppointments.forEach((a) => {
      if (!a.memberId) {
        normalSessions++;
        totalRevenue += 950; // Normal session cost
      } else {
        // Find the member record using memberId
        const member = allMembers.find((m) => m.id === a.memberId);
        if (member) {
          // Find the plan using member's planId
          const plan = plans.find((p) => p.id === member.planId);
          if (plan) {
            membershipSessions++;
            totalRevenue += plan.perSessionCost;
          }
        }
      }
    });

    const docShare = totalRevenue * 0.4;
    const hospitalShare = totalRevenue * 0.6;

    return NextResponse.json({
      numAppointments,
      normalSessions,
      membershipSessions,
      totalRevenue,
      docShare,
      hospitalShare,
    });
  } catch (error) {
    console.error('Failed to fetch revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue data' },
      { status: 500 }
    );
  }
}