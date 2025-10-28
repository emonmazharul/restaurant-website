import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { orderTable } from "../db/schema.js";

export async function searchOrder(orderId) {
    try {
        const order = await db.select().from(orderTable).where(eq(orderTable.orderId, orderId));
        console.log(order);
        if(order[0]) return order[0];
        return;
    } catch (e) {
        console.log(e);
        return;
    }
}
