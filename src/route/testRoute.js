import Router from 'express'
import  {query,body,checkExact,matchedData,checkSchema,validationResult} from 'express-validator'
import { orderMiddleWare } from '../middleware/orderMiddleware.js';
const router = new Router();

router.get('/', query(['person','age']).notEmpty().escape(), (req,res) => {
    const result = validationResult(req);
     
    if (result.isEmpty) {
        const data = matchedData(req);
        console.log(data);
        return res.send({message: data.person})
    }
    console.log(result.errors)
    res.send({errors : result.array()})
});


router.post('/login', body(['password'],['Please provide valid email and password']).notEmpty().isEmail(), (req,res) => {
    const result = validationResult(req);
    res.send(result.array());
})

router.post('/test2', async (req,res) => {
        const result = await checkSchema({
            email: { isEmail: true },
            password: { isLength: { options: { min: 8 } } },
        }).run(req);
        console.log(result);
        res.send({message:'working'});
})

const boydChecker = () => {
    return checkExact([body('email', 'invlaid email').isEmail(), body('password').isLength({min:8})])
}

router.post('/admin/login', boydChecker() , (req,res) => {
    try {
        const result = validationResult(req);
        res.send(result);
    } catch(e) {
        res.send(e);
    }
})
export default router;