import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { customNumbers } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: Fetch all custom numbers for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(customNumbers)
    .where(eq(customNumbers.clerkId, userId));

  return NextResponse.json(rows);
}

// POST: Create a new custom number
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { externalId, name, digits } = body;

  if (!externalId || !name || !digits) {
    return NextResponse.json(
      { error: 'externalId, name, and digits are required' },
      { status: 400 }
    );
  }

  // Enforce 1001 digit limit
  const clampedDigits = digits.slice(0, 1001);

  await db.insert(customNumbers).values({
    clerkId: userId,
    externalId,
    name,
    digits: clampedDigits,
  }).onConflictDoNothing();

  return NextResponse.json({ success: true });
}

// DELETE: Remove a custom number
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const externalId = searchParams.get('id');

  if (!externalId) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  await db
    .delete(customNumbers)
    .where(
      and(
        eq(customNumbers.clerkId, userId),
        eq(customNumbers.externalId, externalId)
      )
    );

  return NextResponse.json({ success: true });
}
