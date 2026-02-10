import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { progress } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET: Fetch all progress for the authenticated user
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(progress)
    .where(eq(progress.clerkId, userId));

  return NextResponse.json(rows);
}

// POST: Upsert progress for a specific number
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { numberId, digitsLearned, bestAccuracy, currentStreak, bestStreak, lastPracticeDate, totalPracticeTime } = body;

  if (!numberId) {
    return NextResponse.json({ error: 'numberId is required' }, { status: 400 });
  }

  // Check if progress already exists
  const existing = await db
    .select()
    .from(progress)
    .where(and(eq(progress.clerkId, userId), eq(progress.numberId, numberId)))
    .limit(1);

  if (existing.length > 0) {
    // Update — only update fields that are provided and are better
    const current = existing[0];
    await db
      .update(progress)
      .set({
        digitsLearned: Math.max(current.digitsLearned, digitsLearned ?? 0),
        bestAccuracy: Math.max(current.bestAccuracy, bestAccuracy ?? 0),
        currentStreak: currentStreak ?? current.currentStreak,
        bestStreak: Math.max(current.bestStreak, bestStreak ?? 0),
        lastPracticeDate: lastPracticeDate ?? current.lastPracticeDate,
        totalPracticeTime: (current.totalPracticeTime) + (totalPracticeTime ?? 0),
        updatedAt: new Date(),
      })
      .where(and(eq(progress.clerkId, userId), eq(progress.numberId, numberId)));
  } else {
    // Insert new
    await db.insert(progress).values({
      clerkId: userId,
      numberId,
      digitsLearned: digitsLearned ?? 0,
      bestAccuracy: bestAccuracy ?? 0,
      currentStreak: currentStreak ?? 0,
      bestStreak: bestStreak ?? 0,
      lastPracticeDate: lastPracticeDate ?? null,
      totalPracticeTime: totalPracticeTime ?? 0,
    });
  }

  return NextResponse.json({ success: true });
}
