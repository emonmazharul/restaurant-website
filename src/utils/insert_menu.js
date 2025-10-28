import { db } from "../db/db.js";
import { menuTable } from "../db/schema.js";
import {startar,traditional,tandoori,rice,bread,biryani} from './menu_item.js'



export async function InsertItems(values){
    try {
        const menu = await db.insert(menuTable).values(values).returning();
        console.log(menu);
    } catch(e) {
        console.log(e);
    }
}


export async function deleteItems() {
    try {
        const deletedItems = await db.delete(menuTable).returning();
        console.log('deletedItems:')
        console.timeLog(deletedItems);

    } catch(e) {
        console.log(e);
    }
}
