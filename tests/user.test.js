import "dotenv/config";
import request from "supertest";
import { db } from "../src/db/db.js";
import app from "../src/server.js";
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';
// import { passwordHashMaker } from "../src/utils/passwordHasMaker.js";



const password = 'UxvcCK5ihNA5MUL';
// const password = 'newPassword';
const email = 'Ebba.Cormier@hotmail.com';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkViYmEuQ29ybWllckBob3RtYWlsLmNvbSIsImlhdCI6MTc2MjU2MDIwNCwiZXhwIjoxNzYyNTYwODA0fQ.ozShmf3-WjIBAF5hYymW64uRRf0qqUfjYhz-Dp0yGFg'
const falseToken = 'syJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IkViYmEuQ29ybWllckBob3RtYWlsLmNvbSIsImlhdCI6MTc2MjU1OTY3MiwiZXhwIjoxNzYyNTYwMjcyfQ.nkOkYKwzB2rjnMwQ-ULESoE8ZhRmwdUZQISWPwdgDYs' 


describe("Users API", () => {
  beforeAll(async () => {
    const newUserValue = {
        fullName:faker.person.fullName(),
        password:faker.internet.password(),
        phone:faker.phone.number(),
        id:uuid(),
        email:faker.internet.email(),
        fullAddress:faker.location.streetAddress(),
        postCode:faker.location.zipCode(),
    };
  });

  afterAll(async () => {
    // Close DB connection
    await db.$client?.end?.();
  });

  it("GET /api/users should return a 400 error", async () => {
    const res = await request(app).get("/api/user");
    expect(res.status).toBe(401);
    // expect(Array.isArray(res.body)).toBe(true);
  });

  it("should fail to create user without all user requied information", async () => {
   const newUserValue = {
        fullName:faker.person.fullName(),
        password:faker.internet.password(),
        email:faker.internet.email(),
        fullAddress:faker.location.streetAddress(),
        postCode:faker.location.zipCode(),
    };
    const res = await request(app)
        .post("/api/user")
        .send(newUserValue)
        
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('Please provide valid email and phone number and other required information');
  });

  it("should fail to create user while the email is already in use", async () => {
   const newUserValue = {
        fullName:faker.person.fullName(),
        password:faker.internet.password(),
        phone:'07444807891',
        email:'Ebba.Cormier@hotmail.com',
        fullAddress:faker.location.streetAddress(),
        postCode:faker.location.zipCode(),
    };
    const res = await request(app)
        .post("/api/user")
        .send(newUserValue)
        
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('Please use another email as the email is already registered');
  });

  it("login/api/user with invalid information should return a 400", async () => {
    const userCredential = {email:faker.internet.email(), password:'wrongpassword'};
    const res = await request(app)
        .post("/api/user/login")
        .send(userCredential)
        
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it("login/api/user with valid information should return a 200", async () => {

    const userCredential = {email, password};
    const userFromDb = {
      "fullName": "My new Name",
      "email": "Ebba.Cormier@hotmail.com",
      "fullAddress": "555 Edward Street",
      "postCode": "17391-6899",
      "phone": "413-671-8722 x132",
      "updated_at": null,
      "created_at": "2025-11-07T22:44:44.437Z",
      "deleted_at": null
    }
    const res = await request(app)
        .post("/api/user/login")
        .send(userCredential)
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty('data');
          expect(res.body).toEqual({
            success:'Login is succesfull.',
            message: 'Successfully Loged in',
            data: userFromDb
          })
  });

  it('should logout user succesfully', async () => {
    const res = await request(app).post('/api/user/logout');
    expect(res.statusCode).toEqual(200);
  })

  it('should not let someone update information without logged in ', async () => {
    const res = await request(app)
      .patch('/api/user')
      .send({fullName:'Donald Trump'})
      .set('Accept', 'application/json');
      expect(res.body).toHaveProperty('error');
      expect(res.statusCode).toEqual(401)
  })

  it('should not let someone update profile when the do not provide current password even if they are logged in ', async () => {
    const agent = request.agent(app);

    const loginRes = await agent
      .post("/api/user/login")
      .send({email, password})
      .expect(200);
    expect(loginRes.body).toHaveProperty("data");
    const profileRes = await agent.patch('/api/user')
    .send({
      fullName:'My new Name'
    })
    .expect(400);
    
    expect(profileRes.body.error).toEqual('bad request');
  })

   it('should let user update profile after login with a valid session and provided current password ', async () => {
    const agent = request.agent(app);
    const loginRes = await agent
      .post("/api/user/login")
      .send({email, password})
      .expect(200);
    expect(loginRes.body).toHaveProperty("data");
    const profileRes = await agent.patch('/api/user')
    .send({
      fullName:'My new Name',
      password
    })
    .expect(201);
    
    expect(profileRes.body.data.fullName).toEqual('My new Name');

  })

  it('should fail to update password as both password is not same ', async () => {
    const agent = request.agent(app);

    const loginRes = await agent
      .post("/api/user/login")
      .send({email, password})
      .expect(200);
    expect(loginRes.body).toHaveProperty("data");
    const profileRes = await agent.patch('/api/user')
    .send({
      newPassword:'newPassword',
      password
    })
    .expect(400);
  })


  // it('should fail to update password as both password is not same ', async () => {
  //   const agent = request.agent(app);
    
  //   const loginRes = await agent
  //     .post("/api/user/login")
  //     .send({email, password})
  //     .expect(200);
  //   expect(loginRes.body).toHaveProperty("data");
  //   const profileRes = await agent.patch('/api/user')
  //   .send({
  //     newPassword:'newPassword',
  //     newConfirmPassword:'newPassword',
  //     password
  //   })
  //   .expect(201);
  // })


  it('should fail without giving an email for requesting a forget password', async () => {
    const res = await request(app).post('/api/user/forget-password');
    expect(res.statusCode).toEqual(400);
  })

  it('should fail to request a password reset if the email is not registered', async () => {
    const res = await request(app).post('/api/user/forget-password')
    .send({email:'empty@gmail.com'});
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('invalid email')
    
  })


  //  it('should successfullu request a forget password with an valid registered email', async () => {
  //   const res = await request(app).post('/api/user/forget-password')
  //   .send({email});
  //   expect(res.statusCode).toEqual(201);
  //   expect(res.body.success).toEqual('send the link');

  // })


  // reset password
  it('should fail to reset a password without a valid token and two confirmed new passwords ', async () => {
    const res = await request(app).post('/api/user/reset-password')
    .send({
      newPassword:'my password',
      confirmedNewPassword:'my password'
    });
    expect(res.statusCode).toEqual(400);
  })

  // reset password

  it('should fail to check the data if resetToken param is not a type of token string ', async () => {
      const res = await request(app).get('/api/user/reset-password/' + 'some token')
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('invalid token');
    })

  it('should fail to check the reset password info without a valid token ', async () => {
      const res = await request(app).get('/api/user/reset-password/' + token)
      expect(res.statusCode).toEqual(400);
      expect(res.body.error).toEqual('request expired');
    })

  // fail to get reset password

  it('should fail to reset a password with a invalid or expiry token ', async () => {
    const res = await request(app).post('/api/user/reset-password')
    .send({
      resetToken:falseToken,
      newPassword:'my password',
      confirmedNewPassword:'my password'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('request expired');
  })

  it('should fail to reset a password without both password being same ', async () => {
    const res = await request(app).post('/api/user/reset-password')
    .send({
      resetToken:token,
      newPassword:'UxvcCK5ihNA5MUL',
      confirmedNewPassword:'somethingelse'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('both password is not same');
  })

  // it('should not able to change password when re enter his old password again ', async () => {
  //   const res = await request(app).post('/api/user/reset-password')
  //   .send({
  //     resetToken:token,
  //     newPassword:password,
  //     confirmedNewPassword:password,
  //   });
  //   expect(res.statusCode).toEqual(400);
  //   expect(res.body.error).toEqual('new password is same as the old one');
  // })

  // it('should able to change to passwordd with valid token + when both password does match ', async () => {
  //   const res = await request(app).post('/api/user/reset-password')
  //   .send({
  //     resetToken:token,
  //     newPassword:'UxvcCK5ihNA5MUL',
  //     confirmedNewPassword:'UxvcCK5ihNA5MUL'
  //   });
  //   expect(res.statusCode).toEqual(201);
  //   expect(res.body.message).toEqual('Passwrod has been updated.Now login with the new password');
  // })


});