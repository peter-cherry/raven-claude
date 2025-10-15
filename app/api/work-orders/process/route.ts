import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { raw_work_order_id } = await request.json();

    if (!raw_work_order_id) {
      return NextResponse.json(
        { success: false, error: 'raw_work_order_id is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get the raw work order
    const { data: rawWO, error: fetchError } = await supabase
      .from('raw_work_orders')
      .select('*')
      .eq('id', raw_work_order_id)
      .single();

    if (fetchError || !rawWO) {
      return NextResponse.json(
        { success: false, error: 'Raw work order not found' },
        { status: 404 }
      );
    }

    // Call Claude parsing API
    const parseResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/work-orders/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_text: rawWO.raw_text }),
    });

    if (!parseResponse.ok) {
      const parseError = await parseResponse.json();
      await supabase
        .from('raw_work_orders')
        .update({
          status: 'failed',
          error_message: `Parsing failed: ${parseError.error}`,
        })
        .eq('id', raw_work_order_id);

      return NextResponse.json(
        { success: false, error: parseError.error || 'Parsing failed' },
        { status: 500 }
      );
    }

    const parseResult = await parseResponse.json();
    const parsedData = parseResult.data;

    // Update raw work order with parsed data
    await supabase
      .from('raw_work_orders')
      .update({
        status: 'parsed',
        parsed_data: parsedData,
      })
      .eq('id', raw_work_order_id);

    // Geocode address using Mapbox
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    let geoData = { city: null, state: null, lat: 0, lng: 0 };

    if (mapboxToken && parsedData.address_text) {
      try {
        const geoResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(parsedData.address_text)}.json?access_token=${mapboxToken}`
        );
        const geoJson = await geoResponse.json();

        if (geoJson.features && geoJson.features.length > 0) {
          const feature = geoJson.features[0];
          geoData = {
            lat: feature.center[1],
            lng: feature.center[0],
            city: feature.context?.find((c: any) => c.id.startsWith('place'))?.text ?? null,
            state: feature.context?.find((c: any) => c.id.startsWith('region'))?.short_code?.split('-')[1] ?? null,
          };
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    }

    // Create job record with parsed data
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        org_id: rawWO.org_id,
        job_title: parsedData.job_title,
        description: parsedData.description,
        trade_needed: parsedData.trade_needed,
        address_text: parsedData.address_text,
        city: geoData.city,
        state: geoData.state,
        lat: geoData.lat,
        lng: geoData.lng,
        scheduled_at: parsedData.scheduled_start_ts,
        duration: parsedData.duration,
        urgency: parsedData.urgency,
        budget_min: parsedData.budget_min,
        budget_max: parsedData.budget_max,
        pay_rate: parsedData.pay_rate,
        contact_name: parsedData.contact_name,
        contact_phone: parsedData.contact_phone,
        contact_email: parsedData.contact_email,
        job_status: 'matching',
        status: 'pending',
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Job creation error:', jobError);
      await supabase
        .from('raw_work_orders')
        .update({
          status: 'failed',
          error_message: `Job creation failed: ${jobError?.message}`,
        })
        .eq('id', raw_work_order_id);

      return NextResponse.json(
        { success: false, error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // Link raw work order to job
    await supabase
      .from('raw_work_orders')
      .update({
        status: 'job_created',
        job_id: job.id,
      })
      .eq('id', raw_work_order_id);

    // Call find_matching_technicians RPC
    try {
      await supabase.rpc('find_matching_technicians', {
        p_job_id: job.id,
        p_lat: geoData.lat,
        p_lng: geoData.lng,
        p_trade: parsedData.trade_needed,
        p_state: geoData.state,
        p_max_distance_m: 40000,
      });
    } catch (err) {
      console.error('Technician matching error:', err);
      // Don't fail - the matching might work differently
    }

    return NextResponse.json(
      {
        success: true,
        job_id: job.id,
        parsed_data: parsedData,
        message: 'Work order processed successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Process API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
