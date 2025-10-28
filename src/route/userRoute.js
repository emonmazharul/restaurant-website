import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from 'drizzle-orm';
import { usersTable } from '../db/schema.js';
import { db } from "../db/db.js";



const router = new Router();

router.get('/', async (req,res) => {
    const user = req.session.user_id ? await db.select().from(usersTable).where(eq(usersTable.id, req.session.user_id)) : undefined;
    try {
        if(user == undefined || user.length == 0) { 
            return res.status(401).send({
                error:'Unauthorize request',
                "message": "Authentication required. Please log in."
            });
        }

        res.status(200).send({
            message:'Profile data has been fetched',
            data: user[0],
        })
    } catch (e) {
        console.log(e);

    }
});

router.post('/', async (req,res) => {
    req.session.user_id = undefined;
    try {
        const requireKeys = ['fullName','email','password', 'phone', 'fullAddress', 'postCode']
        const isValidBody = requireKeys.every((key) => req.body[key] != undefined )
        if (isValidBody == false) res.status(400).send({error:'bad request',message:'Please provide all the required information'})
        const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, req.body.email));
        if(existingUser.length) {
            return res.status(400).send({
                error:'bad request',
                message:'Please use another email as the email is already registered',
            });
        }
        const salt = bcrypt.genSaltSync(8);
        const passwordHash = bcrypt.hashSync(req.body.password, salt);
        const user = await db.insert(usersTable).values({
            ...req.body,
            password:passwordHash,
        }).returning();
        req.session.user_id = user[0].id;
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

router.post('/login', async (req,res) => {
    req.session.user_id = undefined;
    try {
        if(req.body == undefined || req.body.email == undefined || req.body.password == undefined) {
            return res.status(400).send({
                error:'bad request',
                message: 'Invalid email or password',
            })
        }
        const user = await db.select().from(usersTable).where(eq(usersTable.email, req.body.email));
        if (user.length == 0) return res.status(400).send({error:'bad request', message:' Invalid email or password'});
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user[0].password);
        if(isPasswordCorrect == false ) return res.status(400).send({error:'bad request', message:' Invalid email or password'});
        req.session.user_id = user[0].id;
        res.send({
            success:'Login is succesfull.',
            message: 'Successfully Loged in',
            data: user[0]
        }) 
    } catch (e) {
        console.log(e);
        res.status(500).send({error:'server errror', message:'server failed.'});
    }
})



router.patch('/', async (req,res) => {
    console.log(req.body);
    try {
        const user = req.session.user_id ? await db.select().from(usersTable).where(eq(usersTable.id, req.session.user_id)) : undefined;
        if(user == undefined || user.length == 0) { 
            return res.status(401).send({
                error:'Unauthorize request',
                message: "Authentication required. Please log in."
            });
        }

        if(req.body == undefined) {
            return res.status(400).send({
                error:'bad request',
                message:'Please provide new values to update your profile',
            });
        }

        const allowed_keys = ['fullName','email','phone','fullAddress','postCode','newPassword','confirmNewPassword','currentPassword']
        const body_keys = Object.keys(req.body);
        const isNonAllowedKeysAvailable = body_keys.every(key => !allowed_keys.includes(key));
        if (isNonAllowedKeysAvailable) {
            return res.status(400).send({
                error:'bad request',
                message:'Error! recieve some irrelative data',
            })
        }
        // delete the body property if it has any empty value
        for (let x in req.body){
            if (req.body[x] == '') {
                delete req.body[x];
            }
        }
        // edit the password and is thery any new one update the password with that
        let edible_password = req.body.newPassword;
        if(edible_password){
            const passwordSalt =  bcrypt.genSaltSync();
            const passwordHash = bcrypt.hashSync(edible_password,  passwordSalt);
            req.body.password = passwordHash;
        };

        const updated_user = await db.update(usersTable).set({
            ...req.body,
        }).where(usersTable.id, req.session.user_id).returning();
        res.status(201).send({
            success:'Updated profile successfully',
            message:'Successfully updated your profile.',
            data:updated_user[0],
        })
    } catch (e) {
        console.log(e);
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