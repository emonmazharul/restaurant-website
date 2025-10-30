import { body,checkExact,validationResult } from "express-validator";

export const bodyChecker = () => {
    return checkExact([
        body('fullName').isString().notEmpty(),
        body('email').isEmail().notEmpty(),
        body('phone').isMobilePhone(),
        body('guests').isNumeric(),
        body('booking_date').isString().notEmpty(),
        body('booking_time').isString().notEmpty(),
        body('special_request').optional().trim(),
    ]);
}

export function reservationBodyMiddleware(req,res,next) {
    const bodyValidationResult = validationResult(req).array();
    if(bodyValidationResult.length) {
        return res.status(400).send({
            error:'bad request',
            reasons:bodyValidationResult,
            message:'Please provide valid information and read the reasons',
        });
    }
    
    next();
    
}