-- Drop existing function if it exists
DROP FUNCTION IF EXISTS find_matching_technicians(UUID) CASCADE;

-- Create Find Matching Technicians RPC function
CREATE OR REPLACE FUNCTION find_matching_technicians(p_job_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_job_trade TEXT;
  v_org_id UUID;
  v_technician_id UUID;
  v_distance_m NUMERIC;
  v_duration_sec NUMERIC;
BEGIN
  -- Get job details
  SELECT trade_needed, org_id INTO v_job_trade, v_org_id
  FROM jobs
  WHERE id = p_job_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Find technicians matching the trade and organization
  FOR v_technician_id IN
    SELECT id
    FROM technicians
    WHERE org_id = v_org_id
      AND trade_needed = v_job_trade
      AND is_available = true
    LIMIT 10
  LOOP
    -- Use placeholder distance/duration
    v_distance_m := (random() * 50000)::NUMERIC;
    v_duration_sec := (v_distance_m / 1000 * 3)::NUMERIC;

    -- Insert into job_candidates with org_id
    INSERT INTO job_candidates (org_id, job_id, technician_id, distance_m, duration_sec, match_score)
    VALUES (v_org_id, p_job_id, v_technician_id, v_distance_m, v_duration_sec, 0.8)
    ON CONFLICT DO NOTHING;
  END LOOP;
END
$$;
