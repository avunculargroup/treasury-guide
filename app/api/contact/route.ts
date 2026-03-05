import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  entityType?: string;
  service?: string;
  message: string;
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const data = body as Partial<ContactFormData>;

  // Validate required fields
  if (!data.name?.trim()) {
    return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
  }
  if (!data.email?.trim() || !data.email.includes('@')) {
    return NextResponse.json({ success: false, error: 'A valid email address is required' }, { status: 400 });
  }
  if (!data.company?.trim()) {
    return NextResponse.json({ success: false, error: 'Company name is required' }, { status: 400 });
  }
  if (!data.message?.trim() || data.message.trim().length < 20) {
    return NextResponse.json(
      { success: false, error: 'Message must be at least 20 characters' },
      { status: 400 }
    );
  }

  // TODO: integrate email provider (e.g. Resend, Postmark)
  console.log('[BTS Contact Enquiry]', {
    name: data.name,
    email: data.email,
    company: data.company,
    entityType: data.entityType ?? null,
    service: data.service ?? null,
    message: data.message,
    submittedAt: new Date().toISOString(),
  });

  return NextResponse.json({
    success: true,
    data: { message: 'Enquiry received. A BTS advisor will be in touch shortly.' },
  });
}
