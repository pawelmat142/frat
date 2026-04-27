ALTER TABLE jh_chat_messages
    ADD COLUMN IF NOT EXISTS image_refs JSONB;
