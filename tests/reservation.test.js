import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll, test } from "vitest";
import app from "../src/server.js";
import { password } from "pg/lib/defaults";


describe('Reservation API' , async () => {
    const agent = request.agent(app);
    const adminRes = await agent.post('/api/admin/login').send({
        email:'mazharuli1999@gmail.com',
        password:'bangla098@'
    })
    
    test('should not view the reservation without admin logged in' , async () => {
        const res = await request(app).get('/api/reservation');
        expect(res.statusCode).toEqual(401);
    })

    test('shuold not add any reservation without all info provided', async () => {
        const res = await request(app).post('/api/reservation').send({
            fullName:'maz islam',
            email:'someting@gmail.com',
            phone:'07444807891',
        });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('reasons');
    })

    test('shuold add a reservation with all info provided', async () => {
        const res = await request(app).post('/api/reservation').send({
            fullName:'maz islam',
            email:'someting@gmail.com',
            phone:'07444807891',
            booking_date:'2025/10/12',
            booking_time:'20:00',
            guests:5,
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('message');
    })

    test('shuold not confirm reservation without admin logged in', async () => {
        const res = await request(app).post('/api/reservation/confirm-reservation').send(
            {   id:1,
                fullName:'maz islam',
                email:'someting@gmail.com',
                phone:'07444807891',
                booking_date:'2025/10/12',
                booking_time:'20:00',
                guests:5,
                confirmed:false,
            });
            
        expect(res.statusCode).toEqual(401);
        expect(res.body).toHaveProperty('error');
    })

    test('shuold not confirm reservation without all required information', async () => {
        const res = await request(app).post('/api/reservation/confirm-reservation').send(
            {   
                id:1,
                fullName:'maz islam',
                email:'someting@gmail.com',
                phone:'07444807891',
            });
            // console.log(res.body);
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
    })

    test('shuold  confirm reservation with admin logged in', async () => {
        const res = await agent.post('/api/reservation/confirm-reservation').send(
            {   
                id:1,
                fullName:'maz islam',
                email:'someting@gmail.com',
                phone:'07444807891',
                booking_date:'2025/10/12',
                booking_time:'20:00',
                guests:5,
                confirmed:false,
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('success');
    })
})

// some more test need to edge everything in this route and tigher body checking