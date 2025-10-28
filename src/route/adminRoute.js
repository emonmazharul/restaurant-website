import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { usersTable } from "../db/schema.js";
import adminMiddleWare from "../middleware/adminMiddleware.js";

const router = new Router();

router.post('/login', async (req,res) => {
    req.session.admin_id = undefined;
    try {
        if(req.body == undefined || req.body.email == undefined || req.body.password == undefined) {
            return res.status(400).send({
                error:'bad request',
                message: 'Invalid email or password',
            })
        }
        const user = await db.select().from(usersTable).where(eq(usersTable.email, req.body.email));
        if (user.length == 0) return res.status(400).send({error:'bad request', message:' Invalid email or password'});
        if(user[0].email !== process.env.ADMIN_EMAIL ) return res.status(400).send({error:'bad request', message:' Invalid email or password'});
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user[0].password);
        if(isPasswordCorrect == false ) return res.status(400).send({error:'bad request', message:' Invalid email or password'});
        req.session.admin_id = user[0].id;
        res.status(201).send({
            message: 'Successfully Loged in',
            isAdmin:true,
        }); 
    } catch (e) {
        req.session.admin_id = undefined;
        res.send({error:'servaer failed', message:'Server crushed. Try again'});
    }
})

router.get('/', adminMiddleWare, (req,res) => {
    try {
        res.send({isAdmin:true});
    } catch (e) {
        console.log(e);
    }
})

export default router;