import Router from 'express'
import dayjs from "dayjs";
import Stripe from 'stripe';
import { v4 as uuid } from 'uuid';
import { db } from '../db/db.js';
import { orderTable,salesTable } from '../db/schema.js';
import { sql,eq,desc } from 'drizzle-orm';
import { orderBodyMiddleware } from '../middleware/orderBodyMiddleware.js';
import { checkoutProductData } from '../utils/checkProductData.js';
import adminMiddleWare from '../middleware/adminMiddleware.js';
import { io } from '../server.js';


// const now = Math.floor(Date.now() / 1000); // current unix time (seconds)
// const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

// const orders = await db
//   .select()
//   .from(orderTable)
//   .where(sql`${orderTable.createdAt} BETWEEN ${thirtyDaysAgo} AND ${now}`)
//   .where(sql`${orderTable.orderCanceled} = 0`)
//   .where(sql`${orderTable.checkoutCompleted} = 1`);


// const salesByDay = Array.from({ length: 30 }, (_, i) => {
// const day = dayjs().subtract(29 - i, "day").format("YYYY-MM-DD");
// return { day, sales: 0 };
// });

// for (const order of orders) {
//   const orderDay = dayjs.unix(order.createdAt).format("YYYY-MM-DD");
//   const dayObj = salesByDay.find((d) => d.day === orderDay);
//   if (dayObj) {
//     dayObj.sales += order.totalPrice / 100; // convert to £ if stored in pence
//   }
// }



const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY);



const router = new Router();

router.get('/check', adminMiddleWare, (req,res) => {
    res.send({message:'helllo'});
})

router.post('/', orderBodyMiddleware,  async (req,res) => {
    try {
        
        if(req.body.paymentMethod == 'cash') {
            const order = await db.insert(orderTable).values({
                ...req.body,
                cart:JSON.stringify(req.body.cart),
                orderId:uuid(),
            }).returning();
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
            return res.status(201).send({orderId:order[0].orderId, url:`http://localhost:5000/order/success?orderType=cash&orderId=${order[0].orderId}`});
        }
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
        res.status(201).send({orderId:order[0].orderId ,url:session.url});
    } catch (e) {
        console.log(e);
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
        console.log(e);
        throw new Error(e);
        res.status(400).send({error:'bad request', message:e.message});
    }
})

// router.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
//   let event = request.body;
//   // Only verify the event if you have an endpoint secret defined.
//   // Otherwise use the basic event deserialized with JSON.parse
//   if (process.env.STRIPE_WEBHOOK_KEY) {
//     // Get the signature sent by Stripe
//     const signature = request.headers['stripe-signature'];
//     try {
//       event = stripe.webhooks.constructEvent(
//         request.body,
//         signature,
//         process.env.STRIPE_WEBHOOK_KEY
//       );
//     } catch (err) {
//       console.log(`⚠️  Webhook signature verification failed.`, err.message);
//       return response.sendStatus(400);
//     }
//   }

//   // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntent = event.data.object;
//       console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
//       // Then define and call a method to handle the successful payment intent.
//       // handlePaymentIntentSucceeded(paymentIntent);
//       break;
//     case 'payment_method.attached':
//       const paymentMethod = event.data.object;
//       // Then define and call a method to handle the successful attachment of a PaymentMethod.
//       // handlePaymentMethodAttached(paymentMethod);
//       break;
//     default:
//       // Unexpected event type
//       console.log(`Unhandled event type ${event.type}.`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// });



router.get('/success' , async (req,res) => {
    try {
        const { session_id,orderType,orderId} = req.query;
        
        // if the payment is cash 
        if(orderType && orderType === 'cash') {
            const order = await db.select().from(orderTable).where(eq(orderTable.orderId, orderId));
            if(order.length === 0) return res.redirect('/order/cancel');
            io.emit('newOrder', order[0]);
            return res.send({message: 'Thanks for your order and it will be ready soon'});
        }

        // if the payment  is online 
        const order = await db.select().from(orderTable).where(eq(orderTable.checkoutId, session_id));
        if(order.length === 0) return res.redirect('/order/cancel');
        if(order[0].checkoutCompleted == true) return res.redirect('http://localhost:5173/');
        const updated_order =  await db.update(orderTable).set({
            checkoutCompleted:true,  
        }).where(eq(orderTable.checkoutId, session_id)).returning();
        io.emit('newOrder', updated_order[0]);
        res.send({message:'Thanks for your order and it will be ready soon'});
         
    } catch (e) {
        res.status(400).send({error:'bad request', message:'something wrong happend'});
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