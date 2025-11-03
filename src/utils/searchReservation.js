import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { reservationTable } from "../db/schema.js";

export async function searchReservation(id) {
    try {
        const reservation = await db.select().from(reservationTable).where(eq(reservationTable.id, id));
        if(reservation[0]) return reservation[0];
        return;
    } catch (e) {
        console.log(e);
        return;
    }
}
