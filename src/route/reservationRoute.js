import { Router } from "express";
import { db } from "../db/db.js";
import { desc, eq } from "drizzle-orm";
import { reservationTable } from '../db/schema.js';
import { emailSender } from "../utils/sendEmail.js";
import {bodyChecker,reservationBodyMiddleware} from '../middleware/reservationMiddleware.js'
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

router.post('/', bodyChecker(), reservationBodyMiddleware, async (req,res) => {
    try {
        const reservation = await db.insert(reservationTable).values({
            ...req.body,
            booking_date: new Date(req.body.booking_date),
            guests:Number(req.body.guests),
        }).returning();
        res.status(201).send({
            data:reservation[0],
            id:reservation[0].id,
            message:'Thank for booking a table with us and we will confirm you as soon as possible.', 
        });
    } catch(e){
        res.status(400).send({
            error:'bad request',
            message:'server crushed. Please try again',
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