import { drizzle } from 'drizzle-orm/node-postgres';


export const db = drizzle(process.env.TEST_DATABASE_URL);


