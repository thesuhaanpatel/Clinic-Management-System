import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { membershipPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const plans = await db.select().from(membershipPlans);
    console.log('Fetched membership plans:', plans);
    return NextResponse.json(plans);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch membership plans' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPlan = await db.insert(membershipPlans).values({
      name: body.name,
      price: body.price,
      totalSessions: body.totalSessions,
      perSessionCost: body.perSessionCost,
      isActive: body.isActive
    }).returning();
    return NextResponse.json(newPlan[0], { status: 201 });
  } catch {
    console.error('Failed to create membership plan:');
    return NextResponse.json(
      { error: 'Failed to create membership plan'},
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');
    const body = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }
    const updatedPlan = await db.update(membershipPlans)
      .set({
        name: body.name,
        price: body.price,
        totalSessions: body.totalSessions,
        perSessionCost: body.perSessionCost,
        isActive: body.isActive
      })
      .where(eq(membershipPlans.id, id))
      .returning();
    if (updatedPlan.length === 0) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(updatedPlan[0]);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update membership plan'},
      { status: 500 }
    );
  }
}