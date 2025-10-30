import Router from 'express'
import  {query,body,matchedData,checkSchema,validationResult} from 'express-validator'
import { orderMiddleWare } from '../middleware/orderBodyMiddleware.js';
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

router.post('/test2', async (req,res) => {
        const result = await checkSchema({
            email: { isEmail: true },
            password: { isLength: { options: { min: 8 } } },
        }).run(req);
        console.log(result.isEmpty());
        res.send({message:'working'});
})

router.post('/', body('email', {min:8}).isEmail() ,(req,res) => {
    const result = validationResult(req);
    const result2 = matchedData(req);
    console.log(result);
    res.send({message: result.array()});
})

export default router;