
DROP SCHEMA IF EXISTS blog_user;
CREATE SCHEMA IF EXISTS blog_user;

DROP TABLE IF EXISTS blog_user.user;
CREATE TABLE IF NOT EXISTS blog_user.user (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
	firstname VARCHAR(255) NOT NULL,
	lastname VARCHAR(255) NOT NULL,
	password_hashed VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_modified TIMESTAMP,

    CONSTRAINT user_email_unique UNIQUE (email)
);

DROP TRIGGER IF EXISTS update_user_last_modified_timestamp_trigger ON blog_user.user;
CREATE TRIGGER update_user_last_modified_timestamp_trigger
BEFORE INSERT OR UPDATE ON blog_user.user
FOR EACH ROW
EXECUTE FUNCTION public.update_last_modified_timestamp();