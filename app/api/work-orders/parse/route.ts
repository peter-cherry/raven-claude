import { NextRequest, NextResponse } from 'next/server';

const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;

interface ParsedWorkOrderData {
  job_title: string;
  description: string;
  trade_needed: string;
  address_text: string;
  scheduled_start_ts: string;
  urgency: 'emergency' | 'same_day' | 'next_day' | 'within_week' | 'flexible';
  duration: string;
  budget_min: number;
  budget_max: number;
  pay_rate: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { raw_text } = await request.json();

    if (!raw_text || !raw_text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Raw text is required' },
        { status: 400 }
      );
    }

    if (!CLAUDE_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Claude API not configured' },
        { status: 500 }
      );
    }

    // Call Claude API to parse the work order
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a work order parsing assistant. Extract the following fields from the raw work order text and return ONLY a valid JSON object (no markdown, no explanation). If a field is not found, use a sensible default.

Raw work order text:
${raw_text}

Return JSON with these exact fields:
{
  "job_title": "string (concise title, max 100 chars)",
  "description": "string (detailed problem and scope)",
  "trade_needed": "string (one of: HVAC, Plumbing, Electrical, Handyman, Facilities Tech, Other)",
  "address_text": "string (full address)",
  "scheduled_start_ts": "string (ISO 8601 datetime, e.g. 2025-10-15T14:00:00)",
  "urgency": "string (one of: emergency, same_day, next_day, within_week, flexible)",
  "duration": "string (estimated time, e.g. '2-3 hours')",
  "budget_min": number (in dollars, minimum),
  "budget_max": number (in dollars, maximum),
  "pay_rate": "string (e.g. '$75/hr' or '$500 flat')",
  "contact_name": "string (requester name)",
  "contact_phone": "string (phone number)",
  "contact_email": "string (email address)"
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Claude API error:', error);
      return NextResponse.json(
        { success: false, error: 'Claude API call failed' },
        { status: 500 }
      );
    }

    const result = await response.json();
    const content = result.content[0]?.text;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No response from Claude' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsed: ParsedWorkOrderData;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse Claude response:', content);
      return NextResponse.json(
        { success: false, error: 'Failed to parse Claude response' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: parsed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Parse API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
