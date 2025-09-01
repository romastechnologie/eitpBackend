import { ValidationError } from "class-validator";

export const generateServerErrorCode = (res, code, errors, message)=> {
    return res.status(code).json({code,message});
}

export const success = (res,code, data, message )=> {
    return res.status(code).json({ code,message,data });
}

export const validateMessage = (errors:ValidationError[]) => {
    var message = '';
    errors.forEach(element => {
        message = message + element.constraints.isNotEmpty +' ';
    });
    return message;
}

