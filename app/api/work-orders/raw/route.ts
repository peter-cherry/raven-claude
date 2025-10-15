import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { raw_text, source = 'search_input', org_id } = body;

    if (!raw_text || !raw_text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Work order text cannot be empty' },
        { status: 400 }
      );
    }

    if (!org_id) {
      return NextResponse.json(
        { success: false, error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('raw_work_orders')
      .insert({
        org_id,
        raw_text: raw_text.trim(),
        source,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating raw work order:', error);
      return NextResponse.json(
        { success: false, error: error.message },
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
