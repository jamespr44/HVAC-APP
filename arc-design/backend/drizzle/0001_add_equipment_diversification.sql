-- Add diversification fields to equipment table
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS diversity_factor numeric DEFAULT 1.0;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS part_load_percentage numeric DEFAULT 100;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS usage_profile text DEFAULT 'peak';

-- Add comments for documentation
COMMENT ON COLUMN equipment.diversity_factor IS 'Diversity factor (0-1): percentage of equipment operating simultaneously';
COMMENT ON COLUMN equipment.part_load_percentage IS 'Part load percentage (0-100): equipment running at % of full capacity';
COMMENT ON COLUMN equipment.usage_profile IS 'Usage profile: peak (100%) | average (80%) | low (50%) | custom (user-defined)';
