-- Drop existing function
DROP FUNCTION IF EXISTS find_matching_technicians(UUID);

-- Updated Find Matching Technicians RPC
-- This function finds technicians matching a job's trade and creates job_candidates records
CREATE OR REPLACE FUNCTION find_matching_technicians(p_job_id UUID)
RETURNS void AS $$
DECLARE
  v_job_trade TEXT;
  v_org_id UUID;
  v_technician RECORD;
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
  FOR v_technician IN
    SELECT id, lat, lng
    FROM technicians
    WHERE org_id = v_org_id
      AND trade_needed = v_job_trade
      AND is_available = true
    LIMIT 10
  LOOP
    -- For now, use placeholder distance/duration
    v_distance_m := (random() * 50000)::NUMERIC;  -- Random 0-50km
    v_duration_sec := (v_distance_m / 1000 * 3)::NUMERIC;  -- Rough estimate: 3 min per km

    -- Insert into job_candidates
    INSERT INTO job_candidates (
      job_id,
      technician_id,
      distance_m,
      duration_sec,
      match_score
    ) VALUES (
      p_job_id,
      v_technician.id,
      v_distance_m,
      v_duration_sec,
      0.8
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
