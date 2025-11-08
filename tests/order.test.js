import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../src/server.js";


describe('Order api', async () => {
    const agent = request.agent(app);
    await agent.post('/admin/login').send({
        email:'mazharuli1999@gmail.com',
        password:'bangla098@'
    })

    // should faild to make an order without all required information
    it('should fail to make an order without all the required information', async () => {
        const res  = await request(app).post('/order')
        .send({
            fullName:'Dear Customer',
            email:'hello sir how are you',
            phone:'07444807891',
            totalPrice:40.35,
            paymentMethod:'cash',
            orderType:'online',
        })
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('reasons');
    })

    //cash order
    // can't make the order if the cart is not correct type of data
    it('should fail to make an order without all the required information', async () => {
        const res  = await request(app).post('/order')
        .send({
            fullName:'Dear Customer',
            email:'dev.mazharul@gmail.com',
            phone:'07444807891',
            totalPrice:40.35,
            paymentMethod:'cash',
            orderType:'collection',
            fullAddress : '65 mountfield road',
            postCode:'e6 6bh',
            specialRequest:'something new',
            deliveryTime:'ASAP',
            cart: [ 
                { id: 1, category: "Rice", name: "Garlic Rice", price: 3.95, quantity: 1 },
                { id: 3, category: "Dessert", name: "Ice Cream", price: 1.5, quantity: 3, updated_at: null }
            ],
        })
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('orderId');
    })

    //delivery order
    // order will fail if the cart is not correct data type
    it('should fail to make an order without all the required information', async () => {
        const res  = await request(app).post('/order')
        .send({
            fullName:'Dear Customer',
            email:'dev.mazharul@gmail.com',
            phone:'07444807891',
            totalPrice:40.35,
            paymentMethod:'online',
            orderType:'collection',
            fullAddress : '65 mountfield road',
            postCode:'e6 6bh',
            specialRequest:'something new',
            deliveryTime:'ASAP',
            cart: [{}],
        })
        // order failed and redirect order-cancel
        // the reason the cart is empty and this is why stripe could not process the checkout
        expect(res.statusCode).toEqual(400);
    })


    it('should fail to see order without admin loged in' , async () => {
        const res = await request(app).get('/order');
        expect(res.statusCode).toEqual(401);
    })

    it('should view all order with admin loged in' , async () => {
        const res = await agent.get('/order');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
    })

    it('it should fail to check the order without amdin loged in', async ()  => {
        const res = await request(app) .post('/order/admin-check')
        .send({orderId:'false ordr id'});
        expect(res.statusCode).toEqual(401);
    })

    it('it should fail to check the order without an valid orderId', async ()  => {
        const res = await agent.post('/order/admin-check')
        .send({orderId:'false ordr id'});
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual('We do not have any order with the give id');
    })

    it('it should success to check the order with admin loged id + with a valid order id', async ()  => {
        const res = await agent.post('/order/admin-check')
        .send({orderId:'de7b29c6-d91a-4801-aeda-6a8e35727d23'});
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual('the order is successfully checked by admin.');
    })

    it('should redirect the user to the order success page when the paymentType is cash', async ()  => {
        const res = await agent.get('/order/success?orderType=cash&session_id=none');
        expect(res.statusCode).toEqual(302);
    })

    it('should redirec the use to order-sucess when the order is paid online and ther is correct checkout id', async ()  => {
        const res = await agent.get('/order/success?orderType=online&session_id=cs_test_b1nOJe69KkgUR5e8fWAtylVtdn7SuJZcKltaAUOKfG4722rCtLIBIyOwsM');
        expect(res.statusCode).toEqual(302);
    })


})