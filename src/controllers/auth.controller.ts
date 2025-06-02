import { Request, Response } from 'express';
import { Login, refreshTokenFn, verifyOtpFn } from '../services/authService';
import UserModel from "../models/User"
export const signup = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    // TODO: Add validation, hashing, saving to DB
    return res.status(201).json({ message: 'User signed up', data: { email } });
};

export const login = async (req: Request, res: Response): Promise<any> => {
    try {
        const {
            name,
            // blu_id,
            user_id,
            vendor_name,
            client_login_name,
            email,
            phone_number,
            card_number,
            supported_banks
        } = req.body;

        // Save user
        // const resp = await Login( phone_number )
        // console.log("login resp == >>",JSON.parse(JSON.stringify(resp,null, 2)))
        // CHECK IF USER_id exists
        const exists =  await UserModel.findOne({user_id})
        console.log("🚀 ~ login ~ exists:", exists)
        if (!exists){
            //auto gen blu_id with timetsmap and random salt
            const blu_id = `blu_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
            const user = new UserModel({
                name,
                blu_id,
                user_id,
                vendor_name,
                client_login_name,
                email,
                phone_number,
                card_number,
                supported_banks
            });
    
            await user.save();
        }

        return res.status(201).json({
            message: 'Otp has been sent to your phone',
            // ...resp
        });
    } catch (error : any) {
        //error
        console.error("🚀 ~ login ~ error:", error);
        return res.status(500).json({ message: 'Login failed', error: error.message });
    }
};


export const verifyOtp = async (req: Request, res: Response): Promise<any> => {
    try {
        const { phone_number, activationId, registerToken, otp } = req.body;
        // const resp = await verifyOtpFn(phone_number, activationId, registerToken, otp)
        //verify true in db
        const user = await UserModel.findOneAndUpdate(
            { phone_number },
            { is_verified: true },
            { new: true }
        );
        //create a jwt token with user_id and blu_id


        return res.status(200).json({ message: 'OTP verified', data: { //...resp,
            kyc : user?.KYC_status} });
    } catch (error : any) {
        console.log("🚀 ~ verifyOtp ~ error:", error)
        res.status(400).json({ message: 'OTP verification failed', error: error.message });
    }
};


export const refreshToken = async (req: Request, res: Response): Promise<any> => {
    try {
        const { token, appId, phone } = req.body;
        // TODO: Validate and issue new token
        const resp = await refreshTokenFn(phone, appId, token)
        return res.status(200).json({ message: 'Token refreshed', ...resp });
    } catch (error : any) {
        // Handle error
        console.error("🚀 ~ refreshToken ~ error:", error)
        return res.status(500).json({ message: 'Token refresh failed', error: error.message });
    }
};
