SELECT version,
       elements,
       columns,
       groups,
       created_at,
       updated_at,
       dictionary_id,
       code,
       description,
       status
FROM public.jh_dictionaries
LIMIT 1000;