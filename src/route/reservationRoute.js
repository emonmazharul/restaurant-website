import { Router } from "express";
import { db } from "../db/db.js";
import { desc, eq } from "drizzle-orm";
import { reservationTable } from '../db/schema.js';
import { emailSender } from "../utils/sendEmail.js";

import adminMiddleWare from "../middleware/adminMiddleware.js";


const router = new Router();

router.get('/', adminMiddleWare, async(req,res) =>  {
    try {
        const reservations = await db.select().from(reservationTable).orderBy(desc(reservationTable.id));
        return res.send({
            message:'fetched reservations from db',
            data: reservations,
        });
    } catch (e) {
        console.log(e);
        res.status({
            error:'bad request',
            message:'something wront went. Sorry for disruptions',
        })
        console.log(e);
    }
})

router.post('/', async (req,res) => {
    try {
        if(req.body === undefined) {
            return res.status(400).send({
                error:'bad request',
                message:'Not enough information!'
            });

        }
        const keys = ['fullName','phone','email', 'guests', 'booking_date','booking_time','special_request'];
        const isValidBody = keys.every((key) => {
            if(key == 'special_request') return true;
            return req.body[key] !== undefined
        });

        if(!isValidBody) return res.status(400).send({
            error:'bad request',
            message: 'Please provide required information',
        });

        const reservation = await db.insert(reservationTable).values({
            ...req.body,
            booking_date: new Date(req.body.booking_date),
            guests:Number(req.body.guests),
        }).returning();
        setTimeout(() => {
            res.status(201).send({
            data:reservation[0],
            id:reservation[0].id,
            message:'Thank for booking a table with us and we will confirm you as soon as possible.', 
            });
        }, 1000);
    } catch(e){
        res.status(400).send({
            error:'bad request',
            message:'something wrong happend',
        })
    }
})

const middleWare = (req,res,next) => {
    if(!req.body) return res.status(400).send({error:'bad request', message:'please provide necessary information.'});
    next();
}

router.post('/confirm-reservation', middleWare, adminMiddleWare, async (req,res) => {
    try {
        const response = await emailSender(req.body);
        if(response.error) {
            return res.status(404).send({error:'bad request', message:'Could not confirm user.Try again'});
        };
        await db.update(reservationTable).set({
            confirmed:true,
        }).where(eq(reservationTable.id, req.body.id )).returning();
        res.status(201).send({
            success:'send message successfully',
            message:'Reservation has been confirmed',
        })
    } catch (e) {
        return res.status(404).send({error:'bad request', message:'operation failed'});
    }
})

export default router