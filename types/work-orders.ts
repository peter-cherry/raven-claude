export type RawWorkOrderStatus = 'pending' | 'parsed' | 'job_created' | 'failed';
export type RawWorkOrderSource = 'email' | 'api' | 'manual' | 'search_input';

export interface ParsedWorkOrderData {
  job_title?: string;
  description?: string;
  trade_needed?: string;
  address_text?: string;
  scheduled_start_ts?: string;
  urgency?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  [key: string]: any;
}

export interface RawWorkOrder {
  id: string;
  org_id: string;
  raw_text: string;
  source: RawWorkOrderSource;
  status: RawWorkOrderStatus;
  parsed_data: ParsedWorkOrderData | null;
  job_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface SubmitRawWorkOrderRequest {
  raw_text: string;
  source?: RawWorkOrderSource;
  org_id: string;
}

export interface SubmitRawWorkOrderResponse {
  success: boolean;
  raw_work_order_id?: string;
  error?: string;
  message?: string;
}
