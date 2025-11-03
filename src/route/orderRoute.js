import Router from 'express'
import Stripe from 'stripe';
import { v4 as uuid } from 'uuid';
import { db } from '../db/db.js';
import { orderTable,salesTable } from '../db/schema.js';
import { eq,desc } from 'drizzle-orm';
import { bodyChecker, orderMiddleWare } from '../middleware/orderMiddleware.js';
import { checkoutProductData } from '../utils/checkProductData.js';
import adminMiddleWare from '../middleware/adminMiddleware.js';
import { io } from '../server.js';


const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);



const router = new Router();

router.get('/check', adminMiddleWare, (req,res) => {
    res.send({message:'helllo'});
})

// add sale to the table
async function addSale(order) {
    let sale = await db.select().from(salesTable).where(eq(salesTable.saleDate,new Date().toDateString()));
        if(sale[0]) {
            await db.update(salesTable).set({
                totalSale: sale[0].totalSale + order[0].totalPrice,
            });
        } else {
            await db.insert(salesTable).values({
                totalSale:order[0].totalPrice,
                saleDate: new Date().toDateString(),
            });
        }
}

router.post('/', bodyChecker() ,orderMiddleWare,  async (req,res) => {
    try {
        // if payment is cash then we excute this as we don't need make an checkout
        if(req.body.paymentMethod == 'cash') {
            const order = await db.insert(orderTable).values({
                ...req.body,
                cart:JSON.stringify(req.body.cart),
                orderId:uuid(),
            }).returning();
            addSale(order);
            io.emit('newOrder', order[0]);
            return res.status(201).send({orderId:order[0].orderId, url:`http://localhost:5000/order/success?orderType=cash&orderId=${order[0].orderId}`});
        }
        // create an payment session
        const session = await stripe.checkout.sessions.create({
            customer_email:req.body.email,
            line_items: checkoutProductData(req.body.cart, req.body.orderType),
            mode: 'payment',
            success_url: 'http://localhost:5000/order/success?session_id={CHECKOUT_SESSION_ID}&orderType=delivery',
            cancel_url: 'http://localhost:5000/order/cancel',
        });
        
        const order = await db.insert(orderTable).values({
            ...req.body,
            cart:JSON.stringify(req.body.cart),
            orderId: uuid(),
            checkoutId:session.id,
        }).returning();
        addSale(order);
        res.status(201).send({orderId:order[0].orderId ,url:session.url});
    } catch (e) {
        res.status(500).send({error:'server crushed', message:'order failed'});
    }
});

router.get('/', adminMiddleWare,  async (req,res) => {
    try {
        const orders = await db.select().from(orderTable).orderBy(desc(orderTable.id));
        res.send({
            message:'succesfully fetched the order',
            data:orders,
        })
    } catch(e) {
        res.status(400).send({error:'bad request', message:e.message});
    }
})


router.get('/success' , async (req,res) => {
    try {
        const { session_id,orderType,orderId} = req.query;
        
        // if the payment is cash 
        if(orderType && orderType === 'cash') {
            // const order = await db.select().from(orderTable).where(eq(orderTable.orderId, orderId));
            // if(order.length === 0) return res.redirect('/order/cancel');
            return res.redirect('http://localhost:5173/order-success');
        }

        // if the payment  is online 
        const order = await db.select().from(orderTable).where(eq(orderTable.checkoutId, session_id));
        if(order.length === 0) return res.redirect('http://localhost:5173/order-failed');
        if(order[0].checkoutCompleted == true) return res.redirect('http://localhost:5173/');
        const updated_order =  await db.update(orderTable).set({
            checkoutCompleted:true,  
        }).where(eq(orderTable.checkoutId, session_id)).returning();
        io.emit('newOrder', updated_order[0]);
        res.redirect('http://localhost:5173/order-success');
         
    } catch (e) {
        res.status(400).send({error:'bad request', message:'something wrong happend.Try again'});
    }
})

router.get('/cancel' , (req,res) => {
    res.send({success:'order failed'});
})



const middleWare = (req,res,next) => {
    if(!req.body && !req.body.orderId) return res.status(400).send({error:'bad request', message:'invalid request'});
    next();
}

router.post('/admin-check', middleWare,adminMiddleWare, async (req,res) => {
    try {
        await db.update(orderTable).set({
            checkedByAdmin:true,
        }).where(eq(orderTable.orderId, req.body.orderId));
        res.status(201).send({
            success:'order updated',
            message:'the order is successfully checked by admin.',
        });
    } catch (e) {
        res.status(400).send({error:'bad request', message:'invalid request'});
        console.log(e);
    }
})

export default router