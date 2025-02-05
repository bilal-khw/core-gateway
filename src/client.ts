
import { AxiosInstance } from "axios";
import { calc3 } from "./native";
import { base64EncodeString } from "./utils";
import { EncryptUtil } from "./encrypt";
import { waitOTP } from './utils'
import { IUser, User } from "./userdata";
import { logger } from "./logger";

export const device = {
    androidId: "a7626cd18a1be623",
    aId: "6ee61041-211e-4f89-b4c1-d1be7666947c",
    intalledAt: 1738173044467,
    playServiceVersion: "245034029",
    webViewVersion: "-1",
    os: "12",
    root: false,
    emu: false,
    adbEnabled: false,
    timeZone: "Europe\/Monaco",
    region: "IR",
    model: "SM-A525F",
    manufacturer: "samsung",
    sdkVersion: 31,
}

export const app = {
    fingerprint: "3F:FF:F6:57:03:0C:EA:55:2B:53:3C:2C:9A:2A:56:94:61:33:42:CB",
    algo: "SHA-1",
    distributionCode: 30,
    hostId: 1,
    appVersion: "7.4.3",
    language: "en",
    packageName: "com.sibche.aspardproject.app"
}

export class Client {
    userData: User;
    httpClient: AxiosInstance;

    constructor(httpClient: AxiosInstance, userData: IUser) {
        this.userData = userData;
        this.httpClient = httpClient;
    }

    async sendRequest(endpoint: string, op: number, options: any = {}) {
        const ap = options.ap ?? 0;

        const body = JSON.stringify({
            auth: "",
            hi: app.hostId,
            se: "",
            mo: "",
            av: `${app.language};${app.appVersion};${app.hostId};${app.distributionCode}`,
            de: base64EncodeString(`${device.androidId}|${device.aId}|${device.intalledAt}`),
            pn: app.packageName,
            kd: app.fingerprint,
            ka: app.algo,
            te: Math.floor(new Date().getTime() / 1000).toString(),
            md:
            {
                ntn: "",
                ncn: "unknown",
                gpv: device.playServiceVersion,
                wvv: device.webViewVersion,
                os: device.os,
                root: device.root,
                sr: 99,
                emu: device.emu,
                devo: device.adbEnabled,
                xlon: calc3(ap, this.userData.lastTransaction, op)
            },
            timeZone: device.timeZone,
            region: device.region,
            tr: this.userData.lastTransaction,
            op: op,
            ...options,
        })

        logger.info(body, "Requst body");

        const util = new EncryptUtil(this.userData.lastTransaction);
        const finalBody = util.encryptRequest(body);

        const headers = {
            "X-OS": "Android",
            "X-OSVersion": `${device.os};${device.sdkVersion}`,
            "X-DeviceModel": `${device.model};${device.manufacturer}`,
            "X-OpCode": op.toString(),
            "X-AppVersion": app.appVersion.toString(),
            "X-Root": device.root ? "true" : "false",
            "X-AppId": options.ap ?? "N",
            "Content-Type": "text/plain; charset=utf-8",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip",
            "User-Agent": "okhttp/4.12.0"
        }

        const res = await this.httpClient.post(endpoint, finalBody, {
            headers: headers,
        });
        const response = util.decryptRequest(res.data);

        logger.info(response, "Response body");
        const result = JSON.parse(response);


        if (result.st != 0) {
            throw new Error("Client Error: " + result.ds);
        }

        this.userData.increaseTR();
        this.userData.saveTimeDiff(result.sm);
        return result;
    }
}



export class AuthService {
    private authClient: AuthClient;

    constructor(authClient: AuthClient) {
        this.authClient = authClient;
    }

    async login(phone: string) {
        const cc2 = await this.authClient.initLogin();
        console.log(cc2);
        const cc3 = await this.authClient.requestOtp(phone, cc2.activation_id, cc2.register_token);
        console.log(cc3);
        const otp = await waitOTP();
        const cc4 = await this.authClient.sendOtp(phone, cc2.activation_id, cc2.register_token, otp);
        console.log(cc4);
        const cc5 = await this.authClient.finalizeLogin(phone, cc2.activation_id, cc2.register_token);
        console.log(cc5);
        return cc5;
    }

    async refreshLogin(phone: string, appId: string, refreshToken: string) {
        return await this.authClient.refreshToken(phone, appId, refreshToken);
    }
}

export class AuthClient {
    client: Client;
    private static URL = "https://apms.asanpardakht.ir/as/w01/auth/1/10009";

    constructor(client: Client) {
        this.client = client;
    }

    async initLogin() {
        const op = 1010;
        const options = {
            ej: {
                distribution_type: app.distributionCode
            }
        }
        const result = await this.client.sendRequest(AuthClient.URL, op, options);
        return result.ej;
    }

    /*async secondRequest(phone: string, activationId: string, registerToken: string) {
        const op = 3011;
        const options = {
            mo: phone,
            ej: {
                net: "wifi",
                activation_id: activationId,
                register_token: registerToken,
                region: device.region,
            }
        }

        const result = await this.client.sendRequest(AuthClient.URL, op, options);
        return result.ej;
    }*/

    async requestOtp(phone: string, activationId: string, registerToken: string) {
        const op = 1012;
        const options = {
            mo: phone,
            ej: {
                activation_id: activationId,
                register_token: registerToken,
                region: device.region,
            }
        }
        return await this.client.sendRequest(AuthClient.URL, op, options);
    }

    async sendOtp(phone: string, activationId: string, registerToken: string, activationCode: string) {
        const op = 1013;
        const options = {
            mo: phone,
            ej: {
                activation_id: activationId,
                register_token: registerToken,
                region: device.region,
                activation_code: activationCode,
            }
        }
        return await this.client.sendRequest(AuthClient.URL, op, options);
    }

    async finalizeLogin(phone: string, activationId: string, registerToken: string) {
        const op = 1014;
        const options = {
            mo: phone,
            ej: {
                activation_id: activationId,
                register_token: registerToken,
                os_version: `Android ${device.os} (${device.sdkVersion})`,
                device_type: 1,
                device_model: `${device.model} (${device.manufacturer})`,
                device_identifiers: {
                    NETWORK_MAC: "",
                    ADVERTISING_ID: device.aId,
                    UUID: device.androidId,
                },
                root_access: device.root,
                webview_version: device.webViewVersion,
                play_service_version: device.playServiceVersion
            }
        }
        const result = await this.client.sendRequest(AuthClient.URL, op, options);
        return result.ej;
    }

    async refreshToken(phone: string, appId: string, refreshToken: string) {
        const op = 1015;

        const options = {
            mo: phone,
            ap: appId,
            ej: {
                app_id: appId,
                refresh_token: refreshToken
            }
        }
        return await this.client.sendRequest(AuthClient.URL, op, options);
    }
}
