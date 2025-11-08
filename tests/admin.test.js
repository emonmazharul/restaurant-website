import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../src/server.js";

describe('Admin Api' , async () => {

    const agent = request.agent(app);

    await agent.post('/admin/login')
    .send({
        email:'mazharuli1999@gmail.com',
        password:'bangla098@',
    }).expect(201);

    it('should fail to login as admin without correct email or passwrod', async () => {
        const res = await request(app).post('/admin/login')
        .send({
            email:'mazharuli19999@gmail.com',
            password: 'bangla098:',
        });
        expect(res.statusCode).toEqual(400);
    })

    it('should login as a admin with correct email or passwrod', async () => {
        const res = await request(app).post('/admin/login')
        .send({
            email:'mazharuli1999@gmail.com',
            password: 'bangla098@',
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({
            message: 'Successfully Loged in',
            isAdmin:true,
        });
    })

    it('should fail to get admin information' , async() => {
        const res = await request(app).get('/admin');
        expect(res.statusCode).toEqual(401);
    })

    it('should succes  to get admin information with admin loged in' , async() => {
        const res = await agent.get('/admin');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({isAdmin:true})
    })
})