import { db } from '../db/db.js';
import { usersTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';


export default async  function adminMiddleWare(req,res,next) {
    if (!req.session.admin_id) {
        return res.status(401).send({
            error:'Unauthorized',
            message:`You don't have access to do the operation!`,
        })
    }
    try {
        const user = await db.select().from(usersTable).where(eq(usersTable.id, req.session.admin_id));
        if(user[0].email !== process.env.ADMIN_EMAIL) {
            return res.status(401).send({
                error:'Unauthorized',
                message:"you don't have permission for the action!"
            })
        }
        next();
    } catch (e ) {
        res.send({
            error:'server problem',
            message:'Server crushed. Please try again',
        })

    }   
}