import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from 'drizzle-orm';
import { usersTable } from '../db/schema.js';
import { db } from "../db/db.js";
import {signUpbodyChecker,loginBodyChecker,userSignUpMiddleware,userLoginMiddleware,userSessionMiddleware, updateBodyChecker, userUpdateMiddleware} from '../middleware/userMiddleware.js'
import { passwordHashMaker,passwordChecker } from "../utils/passwordHasMaker.js";
import { v4 as uuid } from 'uuid';
const router = new Router();

router.get('/', userSessionMiddleware, async (req,res) => {
    
    try {
        const user =  await db.select().from(usersTable).where(eq(usersTable.id, req.session.user_id));
        res.status(200).send({
            message:'Profile data has been fetched',
            data: user[0],
        })
    } catch (e) {
        res.status(500).send({
            error:'server crushed',
            message:'Server cruhsed. Please try again',
        });

    }
});

router.post('/', signUpbodyChecker(), userSignUpMiddleware, async (req,res) => {
    req.session.user_id = undefined;
    try {
        
        const user = await db.insert(usersTable).values({
            ...req.body,
            // id:uuid(),
            password:passwordHashMaker(req.body.password),
        }).returning();

        req.session.user_id = user[0].id;
        delete user[0].id;
        res.status(201).send({
            success:'Sign up successfull',
            message:'Welcome, your registration have been completed.Thanks for be with us.',
            data: user[0],
        })
        } catch (e) {
        console.log(e);
        res.status(500).send({error:'server crushed',message:'something went wront'});
    }
});

router.post('/login', loginBodyChecker(), userLoginMiddleware, async (req,res) => {
    req.session.user_id = undefined;
    try {    
        // all the check done middleware and if everything is right the fetch user here again and then send it to as part of response;
        const user = await db.select().from(usersTable).where(eq(usersTable.email, req.body.email));        
        req.session.user_id = user[0].id;
        res.send({
            success:'Login is succesfull.',
            message: 'Successfully Loged in',
            data: user[0]
        }); 
    } catch (e) {
        console.log(e);
        res.status(500).send({error:'server errror', message:'server failed.'});
    }
})



router.patch('/', updateBodyChecker(), userSessionMiddleware, userUpdateMiddleware , async (req,res) => {
    try {
        
        
        // edit the password and is thery any new one update the password with that
        if(req.body.newPassword){
            const passwordSalt =  bcrypt.genSaltSync(8);
            const passwordHash = bcrypt.hashSync(edible_password,  passwordSalt);
            req.body.password = passwordHash;
            delete req.body.newPassword;
            delete req.body.confirmNewPassword;
        };

        const updated_user = await db.update(usersTable).set({
            ...req.body,
        }).where(usersTable.id, req.session.user_id).returning();
        delete updated_user[0].id;
        res.status(201).send({
            success:'Updated profile successfully',
            message:'Successfully updated your profile.',
            data:updated_user[0],
        });
    } catch (e) {
        res.status(500).send({error:'server crushed', message:'Update failed.Try again'});
    }
})

router.post('/logout' , async (req,res) => {
    try {
        req.session.destroy(e => {
            res.send({message: 'Loged out from the website'})
        })
    } catch (e)  {
        res.status(400).send({
            error:e.message,
        })
        console.log(e);
    }
})

export default router;