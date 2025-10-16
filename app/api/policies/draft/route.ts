import { NextResponse } from 'next/server';
import { createDraftPolicy, PolicyItemInput } from '@/lib/compliance';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const org_id: string | undefined = body.org_id;
    const items: PolicyItemInput[] = Array.isArray(body.items) ? body.items : [];

    if (!org_id || !items.length) {
      return NextResponse.json({ error: 'org_id and items are required' }, { status: 400 });
    }

    const policyId = await createDraftPolicy(org_id, items);
    return NextResponse.json({ policy_id: policyId });
  } catch (e: any) {
    console.error('Create draft policy error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
