import { Router } from "express";
import { AuthenticatedUser, Login, LoginAbonner,codeVerification, Logout, Refresh, 
Register, verifyAuth, ResetPasswordAbonner,
SendResetPasswordCode} from "../controller/auth.controller";

export const authentication = (router: Router) => {
    router.post('/api/auth/register', Register)
    //router.post('/auth/registernew', RegisterPassport)
    //router.post('/auth/loginnew', LoginPassport)
    router.post('/api/sendrestepasswordcode/abonner', SendResetPasswordCode)
    router.post('/api/resetpassword/abonner', ResetPasswordAbonner)
    // router.post('/api/register/client', RegisterClient)
    // router.post('/api/login/client', LoginClient)
    router.post('/api/login/abonner', LoginAbonner)
    router.post('/api/checkverification',codeVerification)
    router.post('/api/auth/login', Login)
    router.get('/api/auth/user', AuthenticatedUser)
    router.post('/api/auth/refresh', Refresh)
    router.post('/api/auth/verify_token', verifyAuth)
    router.get('/api/auth/logout', Logout)
}