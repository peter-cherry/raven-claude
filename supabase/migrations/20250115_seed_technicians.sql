-- Seed sample technicians
INSERT INTO technicians (
  id, org_id, full_name, trade_specialization, 
  location_lat, location_lng, average_rating, 
  is_available, created_at
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'John Smith',
  'HVAC',
  40.7128,
  -74.0060,
  4.8,
  true,
  now()
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Maria Garcia',
  'Plumbing',
  40.7150,
  -74.0080,
  4.9,
  true,
  now()
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Tom Wilson',
  'Electrical',
  40.7100,
  -74.0050,
  4.7,
  true,
  now()
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Sarah Johnson',
  'HVAC',
  40.7160,
  -74.0070,
  4.9,
  true,
  now()
)
ON CONFLICT DO NOTHING;
