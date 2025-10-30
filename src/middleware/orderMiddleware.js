import { body,checkExact,validationResult } from "express-validator";

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
        body('cart').isJSON({allow_primitives:true}),
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
    const cart = JSON.stringify(req.body.cart);
    const isValidCart = Array.isArray(cart) && cart.length > 0
    if(!isValidCart) {
        return res.status(400).send({
            error:'bad request',
            message:'There is no valid cart',
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
    req.body.totalPrice = req.body.totalPrice.toFixed(2);
    next();
}

