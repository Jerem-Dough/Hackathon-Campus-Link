-- FUNCTIONS FOR SQL DB HERE;
\connect "EXPOS_THANI_WEB";

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- ENABLE pgvector:
CREATE EXTENSION vector;



-- A) Aggregate to sum vectors
CREATE AGGREGATE IF NOT EXISTS vector_sum(VECTOR) (
  SFUNC    = vector_add,
  STYPE    = VECTOR,
  INITCOND = '[' || array_to_string(array_fill('0'::float8, ARRAY[1536]), ',') || ']'
);

-- B) Compute average embedding over a set of tags
CREATE OR REPLACE FUNCTION avg_tag_embedding(in_tags TEXT[])
RETURNS VECTOR(1536) LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  cnt   INT;
  summed VECTOR(1536);
BEGIN
  SELECT
    COUNT(*),
    vector_sum(embedding)
  INTO cnt, summed
  FROM tag_embeddings
  WHERE tag = ANY(in_tags);

  IF cnt = 0 THEN
    RETURN '[' || array_to_string(array_fill('0'::float8, ARRAY[1536]), ',') || ']';
  END IF;

  RETURN summed * (1.0 / cnt);
END;
$$;



-- C) Recommend events by tag similarity
CREATE OR REPLACE FUNCTION recommend_events_by_tags(
  in_tags TEXT[],
  in_limit INT DEFAULT 10
) RETURNS SETOF events LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT e.*
  FROM events e
  WHERE e.embedding IS NOT NULL
  ORDER BY e.embedding <=> avg_tag_embedding(in_tags)
  LIMIT in_limit;
END;
$$;

-- D) Recommend events for a specific user by their embedding
CREATE OR REPLACE FUNCTION recommend_events_for_user(
  in_user_uuid UUID,
  in_limit INT DEFAULT 10
) RETURNS SETOF events LANGUAGE plpgsql STABLE AS $$
DECLARE
  user_emb VECTOR(1536);
BEGIN
  SELECT embedding
    INTO user_emb
    FROM users
    WHERE uuid = in_user_uuid;

  IF user_emb IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT e.*
  FROM events e
  WHERE e.embedding IS NOT NULL
  ORDER BY e.embedding <=> user_emb
  LIMIT in_limit;
END;
$$;

CREATE OR REPLACE FUNCTION recommend_organizations(
    in_user_uuid UUID,
    in_limit INT DEFAULT 5
)
RETURNS SETOF organization LANGUAGE plpgsql STABLE AS $$
DECLARE
    user_emb VECTOR(1536);
BEGIN
    SELECT embedding
    INTO user_emb
    FROM users
    WHERE uuid = in_user_uuid;

    IF user_emb IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT o.*
    FROM organization o
    WHERE o.embedding IS NOT NULL
    ORDER BY o.embedding <=> user_emb
    LIMIT in_limit;
END;
$$;
    