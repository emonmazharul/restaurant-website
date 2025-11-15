import "dotenv/config";
import request from "supertest";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import app from "../src/server.js";



describe('Menu api', () => {
    it('should view the public menu', async () => {
        const res = await request(app).get('/api/menu');
        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty('startar')
        expect(res.body.data).toHaveProperty('traditional')
        expect(res.body.data).toHaveProperty('tandoori')
        expect(res.body.data).toHaveProperty('biryani')
    })

    it('should not view the admin without admin loged in', async () => {
        const menuRes = await request(app).get('/api/menu/fullMenu');
        expect(menuRes.statusCode).toEqual(401);
        expect(menuRes.body).toHaveProperty('error');
    })

    it('should view the private menu', async () => {
        const agent = request.agent(app);
        await agent.post('/api/admin/login')
        .send({
            email:'mazharuli1999@gmail.com',
            password:'bangla098@',
        })
        const menuRes = await agent.get('/api/menu/fullMenu');
        expect(menuRes.statusCode).toEqual(200);
        expect(menuRes.body).toHaveProperty('data');
    })

    it('should not add new menu/item without admin loged in', async () => {
        const menuRes = await request(app).post('/api/menu')
        .send({
            category:'tandoori',
            name:'new dish',
            price:10.30
        });
        expect(menuRes.statusCode).toEqual(401);
        expect(menuRes.body).toHaveProperty('error');
    })

    it('should not add new menu/item without providing all information', async () => {
        const agent = request.agent(app);
        const res = await agent.post('/api/admin/login')
        .send({
            email:'mazharuli1999@gmail.com',
            password:'bangla098@',
        })

        const menuRes = await agent.post('/api/menu')
        .send({
            name:'new dish',
            price:10.30
        });
        expect(menuRes.statusCode).toEqual(400);
        expect(menuRes.body.message).toEqual('Please provide all required information');
    })

    it('should  add new menu/item without admin loged in', async () => {
        const agent = request.agent(app);
        const res = await agent.post('/api/admin/login')
        .send({
            email:'mazharuli1999@gmail.com',
            password:'bangla098@',
        })

        const menuRes = await agent.post('/api/menu')
        .send({
            category:'tandoori',
            name:'new dish',
            price:10.30
        });
        expect(menuRes.statusCode).toEqual(201);
        expect(menuRes.body.message).toEqual('Successfully added new product');
    })

})