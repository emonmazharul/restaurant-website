import Router from 'express'
import adminMiddleWare from '../middleware/adminMiddleware.js';
import { db } from '../db/db.js';
import { salesTable } from '../db/schema.js';
import { desc } from 'drizzle-orm';
const router = new Router();

router.get('/last-30-days', adminMiddleWare, async (req,res) => {
    try {
        const sales = await db.select().from(salesTable).orderBy(desc(salesTable.id)).limit(30);
        res.status(200).send({
            message:'Get the sale of last 30 days',
            data:sales,
        });
    } catch(e) {
        console.log(e);
        res.status(500).send({error:'server crushed', message:'failed to fetche sale report. Server crushed'});
    }
})

export default router;