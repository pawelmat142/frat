-- Migration: Add phone_number column to jh_offers table

-- Add phone_number column of type JSONB
ALTER TABLE jh_offers
ADD COLUMN phone_number JSONB;