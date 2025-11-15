import { Router } from "express";
import { body,param,validationResult } from "express-validator";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import { eq } from 'drizzle-orm';
import { usersTable } from '../db/schema.js';
import { db } from "../db/db.js";
import {signUpbodyChecker,loginBodyChecker,userSignUpMiddleware,userLoginMiddleware,userSessionMiddleware, updateBodyChecker, userUpdateMiddleware} from '../middleware/userMiddleware.js'
import { passwordHashMaker,passwordChecker } from "../utils/passwordHasMaker.js";
import { rateLimitMiddleware } from "../middleware/rate.limitMiddleware.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";
import { v4 as uuid } from 'uuid';


const router = new Router();


router.get('/', userSessionMiddleware, async (req,res) => {
    
    try {
        const user =  await db.select().from(usersTable).where(eq(usersTable.id, req.session.user_id));
        delete user[0].id;
        delete user[0].password;
        
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

router.post('/', rateLimitMiddleware, signUpbodyChecker(), userSignUpMiddleware, async (req,res) => {
    req.session.user_id = undefined;
    try {
        
        const user = await db.insert(usersTable).values({
            ...req.body,
            id:uuid(),
            password:passwordHashMaker(req.body.password),
        }).returning();

        req.session.user_id = user[0].id;
        delete user[0].id;
        delete user[0].password;
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

router.post('/login', rateLimitMiddleware ,loginBodyChecker(), userLoginMiddleware, async (req,res) => {
    req.session.user_id = undefined;
    try {    
        // all the check done middleware and if everything is right the fetch user here again and then send it to as part of response;
        const user = await db.select().from(usersTable).where(eq(usersTable.email, req.body.email));        
        req.session.user_id = user[0].id;
        delete user[0].id; 
        delete user[0].password;
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


router.patch('/', rateLimitMiddleware, updateBodyChecker(), userSessionMiddleware, userUpdateMiddleware , async (req,res) => {
    try {
        // edit the password and is thery any new one update the password with that
        if(req.body.newPassword){
            const passwordSalt =  bcrypt.genSaltSync(8);
            const passwordHash = bcrypt.hashSync(req.body.newPassword,  passwordSalt);
            req.body.password = passwordHash;
            delete req.body.newPassword;
            delete req.body.newConfirmPassword;
        } else {
            delete req.body.password;
        }
        const updated_user = await db.update(usersTable).set({
            ...req.body,
        }).where(eq(usersTable.id, req.session.user_id)).returning();
        
        delete updated_user[0].id;
        delete updated_user[0].password;

        res.status(201).send({
            success:'Updated profile successfully',
            message:'Successfully updated your profile.',
            data:updated_user[0],
        });
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

router.post('/forget-password', body('email').isEmail(), async (req,res) => {
    try {
        const bodyValidationResult = validationResult(req).array();
        if(bodyValidationResult.length) return res.status(400).send({error:'invalid email', message:'Please provide a valid email'});
        const user = await db.select().from(usersTable).where(eq(usersTable.email, req.body.email));
        if(user[0] === undefined) return res.status(400).send({error:'invalid email', message:`Could not find a user with the given email`});
        const token = jwt.sign({email:req.body.email}, process.env.TOKEN_SECRET, {expiresIn:'10m'});
        const resetLink = `http://localhost:5173/reset-password/${token}`;
        const emailResponse = await sendResetPasswordEmail(user[0].fullName, resetLink, ); // replace the admin email with req.body.email
        if(emailResponse.error) return res.status(400).send({error:'email error', message:'could not send email.please try again'});
        return res.status(201).send({success:'send the link', message:'Please check your email for the reset password link'});
    } catch (e) {
        res.status(500).send({
            error:'server crushed',
            message:'Server crushed. Please try again',
        })
    }
})

router.get('/reset-password/:resetToken', param('resetToken').isJWT(), (req,res) => {
    try {
        const paramValidtionResult = validationResult(req).array();
        if(paramValidtionResult.length) {
            return res.status(400).send({
                error:'invalid token',
                message:'Try again with an valid email address',
            })
        };
        const tokenVerified = jwt.verify(req.params.resetToken, process.env.TOKEN_SECRET);
        res.send({data:tokenVerified});
    } catch(e) {
        res.status(400).send({error:'request expired',message:'Please try again as this session has already been expired'});
    }
})


router.post('/reset-password', body('resetToken').isJWT(),body('newPassword').isString(),body('confirmedNewPassword').isString(), async (req,res) => {

    try {
        const bodyValidationResult = validationResult(req).array();
        if(bodyValidationResult.length) {
            return res.status(400).send({
                error:`Invalid token or password`,
                message:`Can't change your password. Please check both passwords are same and try again`,
            });
        }
        const {resetToken, newPassword,confirmedNewPassword} =req.body;
        // check if both password is same
        if(newPassword !== confirmedNewPassword ) {
            return res.status(400).send({
                error:`both password is not same`,
                message:`Both password should be same`,
            });
        }
        const token_data = jwt.verify(resetToken, process.env.TOKEN_SECRET);
        const hashPassword =  passwordHashMaker(newPassword);
        const user = await db.select().from(usersTable).where(eq(usersTable.email, token_data.email));
        
        const isPasswordSame = passwordChecker(newPassword, user[0].password);
        
        // check if ther user is given the same password again
        if(isPasswordSame) {
            return res.status(400).send({
                error:`new password is same as the old one`,
                message:`New password should not match with the old one`,
            });
        }

        const updatedUser = await db.update(usersTable).set({
            password:hashPassword,
        }).where(eq(usersTable.email, token_data.email)).returning();
        // last check if ther password is updated
        if(!updatedUser.length === 0) throw new Error('Session has been expired');

        return res.status(201).send({message:'Passwrod has been updated.Now login with the new password'});    
    } catch(e) {
        res.status(400).send({error:'request expired',message:'Session expired.Please try again'});
    }
})

export default router;