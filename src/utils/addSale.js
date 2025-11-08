import { db } from "../db/db.js";
import { salesTable } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function addSale(order) {
    let sale = await db.select().from(salesTable).where(eq(salesTable.saleDate,new Date().toDateString()));
    if(sale[0]) {
        await db.update(salesTable).set({
            totalSale: sale[0].totalSale + order.totalPrice,
        });
    } else {
        await db.insert(salesTable).values({
            totalSale:order.totalPrice,
            saleDate: new Date().toDateString(),
        });
    }
}