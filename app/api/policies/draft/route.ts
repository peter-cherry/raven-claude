import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const org_id: string | undefined = body.org_id;
    const items: Array<{ requirement_type: string; required: boolean; weight?: number; min_valid_days?: number }> = Array.isArray(body.items) ? body.items : [];

    if (!org_id || !items.length) {
      return NextResponse.json({ error: 'org_id and items are required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { data: membership } = await supabase
      .from('org_memberships')
      .select('org_id')
      .eq('org_id', org_id)
      .eq('user_id', session.user.id)
      .single();
    if (!membership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: policy, error: pErr } = await supabase
      .from('compliance_policies')
      .insert({ org_id, status: 'draft' })
      .select('id')
      .single();
    if (pErr) throw pErr;

    for (const it of items) {
      const { data: reqRow, error: rErr } = await supabase
        .from('compliance_requirements')
        .upsert({ org_id, requirement_type: it.requirement_type, weight: it.weight ?? 0, min_valid_days: it.min_valid_days ?? 0, enforcement: 'ENABLED' }, { onConflict: 'org_id,requirement_type' })
        .select('id')
        .single();
      if (rErr) throw rErr;

      const { error: iErr } = await supabase
        .from('compliance_policy_items')
        .insert({ policy_id: policy.id, requirement_id: reqRow.id, required: !!it.required, min_valid_days: it.min_valid_days ?? 0, weight: it.weight ?? 0 });
      if (iErr) throw iErr;
    }

    return NextResponse.json({ policy_id: policy.id });
  } catch (e: any) {
    console.error('Create draft policy error:', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}
