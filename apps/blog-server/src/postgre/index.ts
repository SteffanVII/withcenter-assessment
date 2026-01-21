import { Pool, types } from "pg";
import dotenv from "dotenv"
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "@repo/blog-types"
import { createClient, SupabaseClient } from "@supabase/supabase-js";

dotenv.config()

// OID 1114 is 'TIMESTAMP' (without time zone)
types.setTypeParser(1114, (stringValue) => {
  // Appending 'Z' tells JS this string is already in UTC
  return new Date(stringValue + 'Z');
});

let pool : Pool | undefined;
export let supabaseCliet : SupabaseClient;

export function createPostgrePool() {

    pool = new Pool({
        connectionString : process.env.SUPABASE_DATABASE_CONNECTION_URI,
        ssl : {
            rejectUnauthorized : false
        }
    })

}

export async function testPostgreConnection() {
    if ( !pool ) {
        throw new Error("Postgre pool not initialized");
    }

    const client = await pool.connect();

    try {
        const result = await client.query("SELECT CURRENT_TIMESTAMP")
        console.log(`Database time - ${result.rows[0].current_timestamp} 🗄️  ✅`)
        console.log(`Database connection successful! 🗄️  ✅`)
    } catch (error) {
        throw error        
    } finally {
        client.release();
    }
}

let dialect : PostgresDialect
export let blogKysely : Kysely<DB>

export const createTaskprioKyselyConnection = async () => {

    if ( !pool ) return

    dialect = new PostgresDialect({
        pool : pool
    })

    blogKysely = new Kysely<DB>({
        dialect
    })

}

export const createSupabaseClient = async () => {
    supabaseCliet = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY
    )
}