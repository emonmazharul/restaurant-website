import {drizzle} from 'drizzle-orm/libsql'

export const db = drizzle(process.env.DB_FILE_NAME);
export const rateLimitDb = drizzle(process.env.RATE_LIMIT_DB_FILE_NAME);
