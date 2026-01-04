SELECT worker_id,
             uid,
             status,
             display_name,
             email,
             first_name,
             last_name,
             residence_country,
             skills,
             certificates,
             communication_languages,
             location_option,
             location_countries,
             point,
             point_radius,
             created_at,
             updated_at
FROM public.jh_employee_profiles
LIMIT 1000;

-- Wynik jako JSON (każdy wiersz jako obiekt)
SELECT row_to_json(t)
FROM (
    SELECT worker_id,
                 uid,
                 status,
                 display_name,
                 email,
                 first_name,
                 last_name,
                 residence_country,
                 skills,
                 certificates,
                 communication_languages,
                 location_option,
                 location_countries,
                 point,
                 point_radius,
                 created_at,
                 updated_at
    FROM public.jh_employee_profiles
    LIMIT 1000
) t;

-- Lub cała tablica JSON:
SELECT json_agg(t)
FROM (
    SELECT worker_id,
                 uid,
                 status,
                 display_name,
                 email,
                 first_name,
                 last_name,
                 residence_country,
                 skills,
                 certificates,
                 communication_languages,
                 location_option,
                 location_countries,
                 point,
                 point_radius,
                 created_at,
                 updated_at
    FROM public.jh_employee_profiles
    LIMIT 1000
) t;