import { RateLimiterMemory } from 'rate-limiter-flexible';

const opts = {
    point:100,
    duration:10,
    // blockDuration: 60 * 20,
}

const rateLimitMermory = new RateLimiterMemory(opts);


export const rateLimitMiddleware = (req,res,next) => {
    const key = req.headers['x-forwarded-for']
    next();
//     console.log(req.ip);
//     rateLimitMermory.consume(req.ip) // consume 2 points
//     .then((rateLimiterRes) => {
//       next();
//     })
//     .catch((rateLimiterRes) => {
//         console.log(rateLimiterRes);
//         res.status(409).send({error:'too many request', message:'You tried too many times. Now wait for some times'});
//       // Not enough points to consume
//     });
}