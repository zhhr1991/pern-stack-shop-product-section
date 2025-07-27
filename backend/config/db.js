import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config();

const { PGHOST, PGUSER, PGDATABASE, PGPASSWORD } = process.env;

export const sql = neon(
    //"postgresql://neondb_owner:npg_rbH48KmaSjgR@ep-round-resonance-adsy3brz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    'postgresql://neondb_owner:npg_rbH48KmaSjgR@ep-round-resonance-adsy3brz-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    //`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=required`
)