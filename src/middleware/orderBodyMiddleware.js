export function orderBodyMiddleware (req,res,next) {
    if (req.body == undefined) {
        return res.status(400).send({error:'bad request', message:'there was no information to proceed'});
    }
    const keys = ['cart', 'fullName', 'email', 'phone', 'paymentMethod', 'orderType', 'fullAddress', 'postCode', 'specialRequest', 'totalPrice', 'deliveryTime'];
    const isValidBody = keys.every(item => {
        if(item == 'specialRequest') return true;
        if(req.body[item] === undefined) return false;
        return true;
    })
    const isValidCart = req.body['cart'] && typeof Array.isArray(req.body['cart']) && req.body['cart'].length > 0
    if(isValidBody === false || isValidCart === false) {
        return res.status(400).send({
            error:'bad request',
            message:'Some information is missing',
        });
    }
    if(req.body.orderType == 'collection') {
        delete req.body.postCode;
        delete req.body.fullAddress;
    }
    req.body.totalPrice = req.body.totalPrice.toFixed(2);
    next();
}