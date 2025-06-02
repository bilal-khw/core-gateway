import { AuthServiceFactory } from '../auth'
import { C2CServiceFactory } from './c2c'
import { User } from './userdata'

export async function Login(phone: string) {
    try {
        const user = new User({
            phone,
        });
    
        const authService = AuthServiceFactory.create(user);
        return await authService.login(user.phone);
        
        // user.accessToken = res.access_token;
        // user.refreshToken = res.refresh_token;
        // user.expiration = res.expiration;
        // user.appId = res.app_id;
        user.save();
        return user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
        
    }
}
export async function verifyOtpFn(phone: string, activationId: string, registerToken: string, otp: string) {
    try {
        const user = new User({
            phone,
        });
    
        const authService = AuthServiceFactory.create(user);
        return await authService.verifyOtp(phone, activationId, registerToken, otp);
        
        // user.accessToken = res.access_token;
        // user.refreshToken = res.refresh_token;
        // user.expiration = res.expiration;
        // user.appId = res.app_id;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
        
    }
}
export async function refreshTokenFn(phone: string, appId: string, token: string) {
    try {
        const user = new User({
            phone,
        });
    
        const authService = AuthServiceFactory.create(user);
        return await authService.refreshLogin(phone, appId, token);
        
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
        
    }
}

async function testC2C() {

    const user = User.load();

    const c2cService = C2CServiceFactory.create(user);

    const cards = await c2cService.getCards();

    const cardInfo = {
        cardDetails: cards[0],
        publicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh6VEcG1DrHhgXQEAsp3ipHKVtwpHQBTzJCyZkUypXj1OtBmMBa4MUqCQ7YbdgtLpG43dajCluCPDDIhibtv7c1gckuomwbNFKiwyHVMfKHMMwco5gnE5oXGuGhUBCVII0iooNyVp01/iEj4yvWBhvBOt3Q3mC55bv18t/rWVWQ99h+cJkvENQEyTfdoc9jq2Yyak77zJGoP11aVU9hllfJSxoq3DOB+tnvCqDziiiD+4qWmDAXwT+LgTifbn6ht065W3rO6jsc71sVrjYDhM8i2sLcXQvJ9QBDWj4zy3VPowBuVeSsrCLKidbleSOhBdwyayXBUb8nel0SMvhNNOAQIDAQAB",
        cvv: "5854",
        expireDate: "0808"
    };

    await c2cService.transfer(cardInfo, "6219861827796359", 200000);
}
