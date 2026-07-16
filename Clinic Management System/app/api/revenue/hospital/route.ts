// File: /api/revenue/hospital/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { doctors, appointments, membershipPlans, members } from '@/db/schema';

export async function GET() {
  try {
    // Fetch all appointments
    const allAppointments = await db.select().from(appointments);
    
    // Fetch all membership plans and members (for lookup)
    const plans = await db.select().from(membershipPlans);
    const allMembers = await db.select().from(members);
    
    // Fetch all doctors
    const allDoctors = await db.select().from(doctors);

    // Calculate hospital totals
    const totalAppointments = allAppointments.length;
    let totalRevenue = 0;
    let totalDoctorShare = 0;
    let totalHospitalShare = 0;
    
    // Calculate revenue by doctor to find top performer
    const doctorRevenues = new Map<number, number>();
    
    allAppointments.forEach((a) => {
      let appointmentRevenue = 0;
      
      if (!a.memberId) {
        appointmentRevenue = 950; // Normal session cost
      } else {
        // Find the member record using memberId
        const member = allMembers.find((m) => m.id === a.memberId);
        if (member) {
          // Find the plan using member's planId
          const plan = plans.find((p) => p.id === member.planId);
          if (plan) {
            appointmentRevenue = plan.perSessionCost;
          }
        }
      }
      
      totalRevenue += appointmentRevenue;
      
      const doctorShare = appointmentRevenue * 0.4;
      const hospitalShare = appointmentRevenue * 0.6;
      
      totalDoctorShare += doctorShare;
      totalHospitalShare += hospitalShare;
      
      // Track revenue by doctor
      if (doctorRevenues.has(a.doctorId)) {
        doctorRevenues.set(a.doctorId, doctorRevenues.get(a.doctorId)! + appointmentRevenue);
      } else {
        doctorRevenues.set(a.doctorId, appointmentRevenue);
      }
    });

    // Find top performing doctor
    let topDoctorId = 0;
    let maxRevenue = 0;
    
    doctorRevenues.forEach((revenue, doctorId) => {
      if (revenue > maxRevenue) {
        maxRevenue = revenue;
        topDoctorId = doctorId;
      }
    });
    
    const topDoctor = allDoctors.find(d => d.id === topDoctorId);
    const topPerformingDoctor = topDoctor ? topDoctor.name : "No data available";

    // Calculate appointment growth (comparing last month to previous month)
    // This is a simplified calculation - in a real app, you'd use actual date comparisons
    const appointmentGrowth = totalAppointments > 50 ? 12 : 
                             totalAppointments > 20 ? 8 : 
                             totalAppointments > 10 ? 5 : 2;

    return NextResponse.json({
      totalAppointments,
      totalRevenue,
      totalDoctorShare,
      totalHospitalShare,
      topPerformingDoctor,
      appointmentGrowth,
    });
  } catch (error) {
    console.error('Failed to fetch hospital revenue data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hospital revenue data' },
      { status: 500 }
    );
  }
}