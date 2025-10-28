import Router from 'express'
import { menuTable, usersTable } from '../db/schema.js';
import {drizzle} from 'drizzle-orm/libsql'
import { eq } from 'drizzle-orm';
import { db } from "../db/db.js";
import adminMiddleWare from '../middleware/adminMiddleware.js';
import { traditional, startar,biryani,rice,bread,tandoori } from '../utils/menu_item.js';
const router = new Router();

// this is a function for creating menu
async function createMenu() {
    const new_traditonal_menu = await db.insert(menuTable).values(traditional).returning();
    console.log(new_traditonal_menu);
}
async function createTable(newTable) {
    const newMenu = await db.insert(menuTable).values(tandoori).returning();
    console.log(newMenu);
}


router.get('/fullMenu', adminMiddleWare, async (req,res) => {
    try {
        const menu = await db.select().from(menuTable);
        res.send({
            message:'Fetched menu successfully',
            data:menu,
        })
    } catch (e) {
        console.log(e);
        res.send({
            error:'bad request',
            message:'something wrong happended',
        })
    }
})

router.get('/', async (req,res) => {
    try {
        const startar = await db.select().from(menuTable).where(eq(menuTable.category, 'Startar'));
        const traditional = await db.select().from(menuTable).where(eq(menuTable.category, 'Traditional')) 
        const tandoori = await db.select().from(menuTable).where(eq(menuTable.category, 'Tandoori Grilled')) 
        const biryani = await db.select().from(menuTable).where(eq(menuTable.category, 'Biryani')) 
        const rice = await db.select().from(menuTable).where(eq(menuTable.category, 'Rice')) 
        const bread = await db.select().from(menuTable).where(eq(menuTable.category, 'Nan'));
        return res.send({
            message:'Successfully Fetch the data',
            data: {
                startar,
                traditional,
                tandoori,
                biryani,
                rice,
                bread
            }
        }) 

    } catch(e ){
        console.log (e);
        return res.status(400).send({
            error:'bad request',
            message:e.message,
        })
    }
})

router.post('/', adminMiddleWare, async (req,res) => {
    try {
        const keys = ['category', 'name', 'price'];
        const isReqBodyValid = req.body ? keys.every(key => req.body[key] !== undefined) : false;
        if(!isReqBodyValid) return res.status(400).send({error:'bad request', message:'Please provide all required information'});
        const menu = await db.insert(menuTable).values({
            name:req.body.name,
            price:req.body.price,
            category:req.body.category,
            lastUpdate:Date.now(),
        }).returning();
        res.status(201).send({
            message:' Successfully added new product',
            data: menu[0]
        })
    } catch (e) {
        console.log(e);
    }
})



export default router;