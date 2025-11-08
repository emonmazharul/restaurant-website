import { body,checkExact,validationResult } from "express-validator";
import { cartChecker } from '../utils/validCart.js';

const keys = ['cart', 'fullName', 'email', 'phone', 'paymentMethod', 
    'orderType', 'fullAddress', 'postCode', 'specialRequest', 'totalPrice', 'deliveryTime'];


export const bodyChecker = () => {
    return checkExact([
        body('fullName').isString().notEmpty(),
        body('email').isEmail().notEmpty(),
        body('phone').isMobilePhone(),
        body('totalPrice').isNumeric(),
        body('paymentMethod').isString().isIn(['cash', 'online']),
        body('orderType').isString().isIn(['collection', 'delivery']),
        body('cart').isArray({min:1}),
        body('deliveryTime').isString(),
        body('fullAddress').optional().isString().trim(),
        body('postCode').optional().isString().trim(),
        body('specialRequest').optional().trim(),
    ]);
}

export async function orderMiddleWare(req,res,next) {
    
    const bodyValidationResult = validationResult(req).array();
    if(bodyValidationResult.length) {
        return res.status(400).send({
            error:'bad request',
            reasons: bodyValidationResult,
            message:'Invalid values for making an order.Please read ther error reasons'
        })
    }

    const isValidCart = cartChecker(req.body.cart);
    if(isValidCart === false) {
         return res.status(400).send({
            error:'bad request',
            message:'Please provide correct cart information.',
        });
    }
    
    if(req.body.orderType === 'delivery' && !req.body.fullAddress && !req.body.postCode) {
        return res.status(400).send({
            error:'bad request',
            message:'Please provide valid address & postcode.',
        });
    }
    if(req.body.orderType === 'collection') {
        delete req.body.postCode;
        delete req.body.fullAddress;
    } 
    req.body.totalPrice = Number(req.body.totalPrice.toFixed(2));
    next();
}

