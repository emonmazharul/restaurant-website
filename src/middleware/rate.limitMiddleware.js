import { RateLimiterMemory } from 'rate-limiter-flexible';

const opts = {
    point: 20,
    duration:60,
    blockDuration: 60 * 20,
}

const rateLimitMermory = new RateLimiterMemory(opts);
export const rateLimitMiddleware = (req,res,next) => {
    
    rateLimitMermory.consume(req.ip, 2) // consume 2 points
    .then((rateLimiterRes) => {
      next();
    })
    .catch((rateLimiterRes) => {
        res.status(409).send({error:'too many request', message:'You tried too many times. Now wait for some times'});
      // Not enough points to consume
    });
}