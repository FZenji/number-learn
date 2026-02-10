import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface WebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    [key: string]: unknown;
  };
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get Svix headers
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing Svix headers' },
      { status: 400 }
    );
  }

  const body = await req.text();

  // Verify the webhook signature
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle events
  switch (event.type) {
    case 'user.created': {
      const { id, email_addresses } = event.data;
      const email = email_addresses?.[0]?.email_address || null;

      await db.insert(users).values({
        clerkId: id,
        email,
      }).onConflictDoNothing();

      console.log(`User created: ${id}`);
      break;
    }

    case 'user.deleted': {
      const { id } = event.data;

      // Cascade delete is handled by FK constraints
      await db.delete(users).where(eq(users.clerkId, id));

      console.log(`User deleted: ${id}`);
      break;
    }

    default:
      console.log(`Unhandled webhook event: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
