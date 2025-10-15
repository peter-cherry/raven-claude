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

    // Get the auth token from the request
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    // Get user's organization
    const { data: membership, error: memberError } = await supabase
      .from('org_memberships')
      .select('org_id')
      .eq('user_id', user.id)
      .single();

    if (memberError || !membership) {
      console.error('Membership error:', memberError);
      return NextResponse.json(
        { success: false, error: 'User is not part of any organization' },
        { status: 403 }
      );
    }

    // Insert raw work order
    const { data, error } = await supabase
      .from('raw_work_orders')
      .insert({
        org_id: membership.org_id,
        raw_text: raw_text.trim(),
        source,
        status: 'pending',
        created_by: user.id,
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
