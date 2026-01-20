
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA IF NOT EXISTS public;

-- Update last_modified before INSERT and UPDATE
CREATE OR REPLACE FUNCTION public.update_last_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the operation is INSERT or UPDATE
    IF (TG_OP = 'UPDATE') THEN
        -- Set the 'last_modified' column of the new row to the current timestamp
        NEW.last_modified = NOW();
        RETURN NEW; -- Return the modified new row
    ELSIF (TG_OP = 'INSERT') THEN
        -- If it's an insert, ensure last_modified is set (optional, could use DEFAULT)
        NEW.last_modified = NOW();
        RETURN NEW; -- Return the new row
    END IF;

    -- For DELETE operations or if TG_OP is something else, just return OLD or NEW appropriately
    -- In a BEFORE DELETE trigger, you'd typically return OLD.
    -- For this example, we only really care about UPDATE/INSERT
    RETURN NEW; -- Or OLD, depending on context and timing

END;
$$ LANGUAGE plpgsql;

-- Convert UUID to base64
CREATE OR REPLACE FUNCTION public.uuid_to_base64(uuid_value UUID)
RETURNS TEXT AS $$
DECLARE
    base64_value TEXT;
BEGIN
    base64_value := ENCODE(DECODE(REPLACE(CAST(uuid_value AS TEXT),'-',''), 'hex'), 'base64');
    base64_value := replace(base64_value, '+', '-');
    base64_value := replace(base64_value, '/', '_');
    base64_value := replace(base64_value, '=', '');
    RETURN base64_value;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Convert base64 back to UUID
CREATE OR REPLACE FUNCTION public.base64_to_uuid(base64_value TEXT)
RETURNS UUID AS $$
DECLARE
    base64_value_corrected TEXT;
BEGIN
    -- Convert URL-safe base64 back to standard base64
    base64_value_corrected := replace(base64_value, '-', '+');
    base64_value_corrected := replace(base64_value_corrected, '_', '/');
    -- Add padding if needed
    base64_value_corrected := base64_value_corrected || repeat('=', (4 - (length(base64_value_corrected) % 4)) % 4);

    -- Decode base64 to hex, then convert to UUID
    RETURN CAST(ENCODE(DECODE(base64_value_corrected, 'base64'), 'hex') AS UUID);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if string is a valid UUID
CREATE OR REPLACE FUNCTION public.is_uuid(uuid_string TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if it matches UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    RETURN uuid_string ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Check if string is base64 (URL-safe)
CREATE OR REPLACE FUNCTION public.is_base64(base64_string TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if it matches base64 pattern: [A-Za-z0-9_-]+
    -- For UUID conversion, it should be 22 characters
    RETURN base64_string ~ '^[A-Za-z0-9_-]+$' AND length(base64_string) = 22;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Smart function that tries to convert and determines format
CREATE OR REPLACE FUNCTION public.detect_and_convert_to_uuid(id_string TEXT)
RETURNS UUID AS $$
DECLARE
    result_uuid UUID;
BEGIN
    -- Try to convert as base64 first
    BEGIN
        result_uuid := public.base64_to_uuid(id_string);
        RETURN result_uuid;
    EXCEPTION
        WHEN OTHERS THEN
            -- If base64 conversion fails, try as UUID
            BEGIN
                result_uuid := id_string::UUID;
                RETURN result_uuid;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE EXCEPTION 'String is neither valid base64 nor UUID: %', id_string;
            END;
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;