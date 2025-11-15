import { Router } from "express";
import { db } from "../db/db.js";
import { body,checkExact,validationResult } from "express-validator";
import { desc, eq } from "drizzle-orm";
import { reservationTable } from '../db/schema.js';
import { emailSender } from "../utils/sendEmail.js";
import {bodyChecker,reservationBodyMiddleware} from '../middleware/reservationMiddleware.js'
import adminMiddleWare from "../middleware/adminMiddleware.js";
import { io } from "../server.js";


const router = new Router();

router.get('/', adminMiddleWare, async(req,res) =>  {
    try {
        const reservations = await db.select({
            id:reservationTable.id,
            fullName: reservationTable.fullName,
            email: reservationTable.email,
            phone: reservationTable.phone,
            guests: reservationTable.guests,
            confirmed: reservationTable.confirmed,
            booking_date:reservationTable.booking_date,
            booking_time:reservationTable.booking_time,
            special_request: reservationTable.special_request,
        }).from(reservationTable).orderBy(desc(reservationTable.id));
        return res.send({
            message:'fetched reservations from db',
            data: reservations,
        });
    } catch (e) {
        console.error(e);
        res.status({
            error:'bad request',
            message:'something wront went. Sorry for disruptions',
        })
    }
})

router.post('/', bodyChecker(), reservationBodyMiddleware, async (req,res) => {
    try {
        const reservation = await db.insert(reservationTable).values({
            ...req.body,
            booking_date: new Date(req.body.booking_date),
            guests:Number(req.body.guests),
        }).returning();
        io.emit("newReservation", reservation[0])
        res.status(201).send({
            data:reservation[0],
            id:reservation[0].id,
            message:'Thank for booking a table with us and we will confirm you as soon as possible.', 
        });
    } catch(e){
        console.log('shwoing error at resevation table')
        console.error(e);
        res.status(400).send({
            error:'bad request',
            message:'server crushed. Please try again',
        })
    }
})

const bodyCheckerForConfirmReservation = () => {
    return checkExact([
        body('id').notEmpty(),
        body('fullName').isString().notEmpty(),
        body('email').isEmail().notEmpty(),
        body('phone').isMobilePhone(),
        body('guests').isNumeric(),
        body('booking_date').isString().notEmpty(),
        body('booking_time').isString().notEmpty(),
        body('confirmed').isBoolean(),
        body('special_request').optional(),
    ]);
}

const middleWare = (req,res,next) => {

    const bodyValidationResult = validationResult(req).array();

    if(bodyValidationResult.length) {
        return res.status(400).send({
            error:'bad request',
            message:'Please only provide all required information.Thanks'
        })
    }
    next();
}

router.post('/confirm-reservation', bodyCheckerForConfirmReservation() , middleWare, adminMiddleWare, async (req,res) => {
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
        console.error(e);
        return res.status(404).send({error:'bad request', message:'operation failed'});
    }
})

export default router