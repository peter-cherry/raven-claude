import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raw_text, source = 'search_input' } = body;

    if (!raw_text || !raw_text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Work order text cannot be empty' },
        { status: 400 }
      );
    }

    // Create Supabase client (unauthenticated for now - testing)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Use default org for testing
    const orgId = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID;

    if (!orgId) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_DEFAULT_ORG_ID not configured' },
        { status: 500 }
      );
    }

    // Insert raw work order
    const { data, error } = await supabase
      .from('raw_work_orders')
      .insert({
        org_id: orgId,
        raw_text: raw_text.trim(),
        source,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating raw work order:', error);
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to create work order' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        raw_work_order_id: data.id,
        message: 'Work order submitted for parsing',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
