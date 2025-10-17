import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 });

    const key = process.env.GOOGLE_MAPS_SERVER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&key=${key}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== 'OK') {
      return NextResponse.json({ error: data.error_message || data.status }, { status: 400 });
    }

    const result = data.results?.[0];
    const loc = result?.geometry?.location;
    const comps = result?.address_components || [];
    const city = comps.find((c: any) => c.types?.includes('locality'))?.long_name ?? null;
    const state = comps.find((c: any) => c.types?.includes('administrative_area_level_1'))?.short_name ?? null;

    return NextResponse.json({ lat: loc?.lat, lng: loc?.lng, city, state });
  } catch (e: any) {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 });
  }
}
