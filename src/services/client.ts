
import { AxiosInstance } from "axios";
import { calc3 } from "../utils/native";
import { base64EncodeString } from "../utils";
import { EncryptUtil } from "../utils/encrypt";
import { IUser, User } from "./userdata";
import { logger } from "../utils/logger";

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
        console.log("resp === >>",response)
        const result = JSON.parse(response);


        if (result.st != 0) {
            throw new Error("Client Error: " + result.ds);
        }

        this.userData.increaseTR();
        this.userData.saveTimeDiff(result.sm);
        return result;
    }
}
