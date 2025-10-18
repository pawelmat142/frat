SELECT user_id,
             uid,
             version,
             status,
             roles,
             display_name,
             email,
             verified,
             provider,
             photo_url,
             created_at,
             updated_at
FROM public.jh_users
LIMIT 1000;

-- Wynik jako JSON (każdy wiersz jako obiekt)
SELECT row_to_json(t)
FROM (
    SELECT user_id,
                 uid,
                 version,
                 status,
                 roles,
                 display_name,
                 email,
                 verified,
                 provider,
                 photo_url,
                 created_at,
                 updated_at
    FROM public.jh_users
    LIMIT 1000
) t;

-- Lub cała tablica JSON:
SELECT json_agg(t)
FROM (
    SELECT user_id,
                 uid,
                 version,
                 status,
                 roles,
                 display_name,
                 email,
                 verified,
                 provider,
                 photo_url,
                 created_at,
                 updated_at
    FROM public.jh_users
    LIMIT 1000
) t;