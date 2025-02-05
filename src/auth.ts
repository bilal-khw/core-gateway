import { Client, device, app } from "./client";
import { createHttpClient } from "./http-client";
import { IUser } from "./userdata";
import { waitOTP } from "./utils";


export class AuthServiceFactory {
    static create(user: IUser) {
        const httpClient = createHttpClient();
        const client = new Client(httpClient, user);
        const authClient = new AuthClient(client);
        return new AuthService(authClient);
    }
}

export class AuthService {
    private authClient: AuthClient;

    constructor(authClient: AuthClient) {
        this.authClient = authClient;
    }

    async login(phone: string) {
        phone = phone.replace(/^0/, "+");
        const initResponse = await this.authClient.initLogin();
        await this.authClient.requestOtp(phone, initResponse.activation_id, initResponse.register_token);
        const otp = await waitOTP();
        await this.authClient.sendOtp(phone, initResponse.activation_id, initResponse.register_token, otp);
        const loginData = await this.authClient.finalizeLogin(phone, initResponse.activation_id, initResponse.register_token);
        return loginData;
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
