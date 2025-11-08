import bcrypt from "bcryptjs";
import { body,checkExact,validationResult } from "express-validator";
import { eq } from 'drizzle-orm';
import { db } from "../db/db.js";
import { usersTable } from "../db/schema.js";
import { passwordChecker } from "../utils/passwordHasMaker.js";

export const signUpbodyChecker = () => {
    return checkExact([
        body('fullName').isString().notEmpty(),
        body('email').isEmail().notEmpty(),
        body('phone').isMobilePhone(),
        body('password').isString().isLength({min:8}),
        body('fullAddress').isString().notEmpty(),
        body('postCode').isString().notEmpty(),
    ]);
}

export async function userSignUpMiddleware(req,res,next) {

    const bodyValidationResult = validationResult(req).array();
    if (bodyValidationResult.length) {
        return res.status(400).send({error:'bad request',message:'Please provide valid email and phone number and other required information'})
    }
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, req.body.email));
    
    if(existingUser.length) {
        return res.status(400).send({
            error:'bad request',
            message:'Please use another email as the email is already registered',
        });
    }
    next();
}


export const loginBodyChecker = () => {
    return checkExact([
        body('email').notEmpty().isEmail(),
        body('password').notEmpty().isString(),
    ]);
}

export async function userLoginMiddleware(req,res,next) {
    const bodyValidationResult = validationResult(req).array();
    if(bodyValidationResult.length) {
        return res.status(400).send({
            error:'bad request',
            reasons:bodyValidationResult,
            message: 'Invalid email or password!',
        })
    }

    const user = await db.select().from(usersTable).where(eq(usersTable.email, req.body.email));
    // check if if there is an user with this email
    if (user.length == 0) {
        return res.status(400).send({error:'bad request', message:' Invalid email or password'});
    }
    const isPasswordCorrect = bcrypt.compareSync(req.body.password, user[0].password);
    if(isPasswordCorrect == false ) {
        return res.status(400).send({error:'bad request', message:' Invalid email or password'});
    }
    next();
}


export async  function userSessionMiddleware(req,res,next) {
    try {
        const user = req.session.user_id ? await db.select().from(usersTable).where(eq(usersTable.id, req.session.user_id)) : undefined;
        if(user === undefined || user.length == 0) { 
            return res.status(401).send({
                error:'Unauthorize request',
                message: "Authentication required. Please log in."
            });
        }
        next();
    } catch (e) {
        return res.status(500).send({
            error:'server crushed',
            message:'server crushed. Please try again',
        })
    }
}

export const updateBodyChecker = () => {
    return checkExact([
        body('fullName').optional().isString(),
        body('email').optional().isString(),
        body('phone').optional().isMobilePhone(),
        body('fullAddress').optional().isString(),
        body('postCode').optional().isString(),
        body('newPassword').optional().isString(),
        body('newConfirmPassword').optional().isString(),
        body('password').notEmpty().isString(),
    ]);
}

export async function userUpdateMiddleware(req,res,next){
    try {
        const bodyValidationResult = validationResult(req).array();
        if(bodyValidationResult.length) {
            return res.status(400).send({
                error:'bad request',
                message:'Please provide new values to update your profile.',
            });
        }
        
        // check if the given user password is correct;
        const user = await db.select().from(usersTable).where(eq(usersTable.id, req.session.user_id));
        const isPasswordCorrect = passwordChecker(req.body.password, user[0].password);
        if(!isPasswordCorrect) {
            return res.status(401).send({
                error:'Unauthorized',
                message:'Please provide the correct password',
            });
        }

        if(req.body.newPassword && (req.body.newPassword !==  req.body.newConfirmPassword)) {
             return res.status(400).send({
                error:'bad request',
                message:'Please check the new passwords again. It is no same',
            });
        }

        const allowed_keys = ['fullName','email','phone','fullAddress','postCode','newPassword','confirmNewPassword','currentPassword']
        // delete the body property if it has any empty value
        for (let x in req.body){
            if (req.body[x] == '') {
                delete req.body[x];
            }
        }
        next()
    } catch (e) {
        console.log(e);
        res.status(500).send({
            error:'server crushed',
            message:'Server failed.Please try again',
        })
    }

    // const body_keys = Object.keys(req.body);
        // const isNonAllowedKeysAvailable = body_keys.every(key => !allowed_keys.includes(key));
        // if (isNonAllowedKeysAvailable) {
        //     return res.status(400).send({
        //         error:'bad request',
        //         message:'Error! recieve some irrelative data',
        //     })
        // }
}