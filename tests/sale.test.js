import "dotenv/config";
import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../src/server.js";

describe('Sale Api' , async () => {

    const agent = request.agent(app);

    await agent.post('/admin/login')
    .send({
        email:'mazharuli1999@gmail.com',
        password:'bangla098@',
    }).expect(201);

    it('should fail to view sale data without admin loged in', async () => {
        const res = await request(app).get('/sale/last-30-days');
        expect(res.statusCode).toEqual(401);
        
    })

    it('should view sale data as as an admin ', async () => {
        const res = await agent.get('/sale/last-30-days');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('message');
    })

})