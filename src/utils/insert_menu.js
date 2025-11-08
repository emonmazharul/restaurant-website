import { db } from "../db/db.js";
import { menuTable } from "../db/schema.js";
import {startar,traditional,tandoori,rice,bread,biryani} from './menu_item.js'



export async function InsertItems(values){
    try {
        const menu = await db.insert(menuTable).values(values).returning();
    } catch(e) {
        console.log(e);
    }
}
// await InsertItems(startar)
// await InsertItems(traditional)
// await InsertItems(tandoori)
// await InsertItems(rice)
// await InsertItems(bread)
// await InsertItems(biryani)


export async function deleteItems() {
    try {
        const deletedItems = await db.delete(menuTable).returning();
        console.log('deletedItems:')
        console.timeLog(deletedItems);

    } catch(e) {
        console.log(e);
    }
}

export default InsertItems;