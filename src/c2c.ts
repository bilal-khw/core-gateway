import { AxiosInstance } from "axios";
import crypto, { KeyObject } from 'crypto'
import { Client } from "./client";
import { waitOTP } from "./utils";
import { IUser, User } from "./userdata";
import { createHttpClient } from "./http-client";

interface CartInfo {
    cardDetails: string;
    publicKey: string;
    cvv: string;
    expireDate: string;
}


export class C2CServiceFactory {
    static create(user: IUser) {
        const httpClient = createHttpClient();
        const client = new Client(httpClient, user);
        const c2cClient = new C2CClient(client, user);
        return new C2CService(c2cClient);
    }
}

export class C2CService {
    client: C2CClient;
    //cardClient: CardClient;

    constructor(client: C2CClient/*, cardClient: CardClient*/) {
        this.client = client;
        //this.cardClient = cardClient;
    }

    async getCards() {
        const result = await this.client.getCards();
        return result.allCards.map((el: any) => {
            return JSON.stringify({
                cid: el.cid,
                cno: el.cno,
                bid: el.bid,
                sut: 1,
                tkt: el.tkt,
                reg: 0,
                lst: 0,
                csd: "",
                pbc: false,
                chn: "",
                pwt: 0
            })
        })
    }

    async transfer(card: CartInfo, destination: string, amount: number) {
        const result = await this.client.createTransfer(card.cardDetails, amount, destination);
        const optResponse = await this.client.requestOtp(card.cardDetails, amount, destination, result.trsd);
        const otp = await waitOTP();
        //const publicKey = await this.cardClient.getCardKey(card.transactionId, card.keyId);
        const publicKey = crypto.createPublicKey({
            key: Buffer.from(card.publicKey, "base64"),
            format: "der",
            type: 'spki'
        })

        return await this.client.finalizeTransfer(
            card.cardDetails,
            amount,
            destination,
            result.trsd,
            card.cvv,
            card.expireDate,
            otp,
            publicKey,
            optResponse.hsd
        );
    }
}

export class C2CClient {
    client: Client;
    user: User;

    constructor(client: Client, user: User) {
        this.client = client;
        this.user = user;
    }

    async getCards() {
        const url = "https://apms.asanpardakht.ir/as/w01/s01/1/10009";
        const op = 251;
        const options = {
            ao: 0,
            currency: "IRR",
            an: "",
            nn: "",
            ap: this.user.appId,
            acct: this.user.accessToken,
            at: "",
            mo: this.user.phone,
            ej: {
                rmCards: [],
                apOtpBankIds: [],
                apOtpCardIds: [],
            },
        }
        const result = await this.client.sendRequest(url, op, options);
        return result.ej;
    }


    async createTransfer(card: string, amount: number, destination: string) {
        const url = "https://apms.asanpardakht.ir/as/ctc/app/1/10009";
        const op = 360;
        const options = {
            ao: amount,
            currency: "IRR",
            an: card,
            nn: "",
            ap: this.user.appId,
            acct: this.user.accessToken,
            at: "",
            mo: this.user.phone,
            ej: {
                dc: destination,
                desc: ""
            },
        }

        const result = await this.client.sendRequest(url, op, options);
        return result.ej;
    }


    async startCardRegistration() {
        const url = "https://apms.asanpardakht.ir/as/ctc/app/1/10009";
        const op = 660;
        const options = {
            ap: this.user.appId,
            acct: this.user.accessToken,
            at: "",
            mo: this.user.phone,
            ej: {
                callbackDeeplink: "aps://www.733.ir/?typ=2&aid=13&out=1&tran_id={}&keyId={}"
            },
        }

        const result = await this.client.sendRequest(url, op, options);
        return result.ej;
    }

    async finlizeCardRegistration(strid: string) {
        const url = "https://apms.asanpardakht.ir/as/ctc/app/1/10009";
        const op = 661;
        const options = {
            ap: this.user.appId,
            acct: this.user.accessToken,
            at: "",
            mo: this.user.phone,
            ej: {
                strid: strid
            },
        }

        const result = await this.client.sendRequest(url, op, options);
        return result.ej;
    }



    async requestOtp(card: string, amount: number, destination: string, trsd: string) {
        const url = "https://apms.asanpardakht.ir/as/ctc/app/1/10009";
        const op = 700;

        const options = {
            ao: amount,
            currency: "IRR",
            an: card,
            nn: "",
            ap: this.user.appId,
            acct: this.user.accessToken,
            at: "",
            mo: this.user.phone,
            ej: {
                dc: destination,
                trsd: trsd,
                orgop: 220,
                a: {
                    dc: destination,
                    trsd: trsd,
                }
            },
        }

        const result = await this.client.sendRequest(url, op, options);
        return result.ej;
    }

    async finalizeTransfer(
        card: string,
        amount: number,
        destination: string,
        trsd: string,
        ccv: string,
        expireDate: string,
        otp: string,
        publicKey: KeyObject,
        hsd: string
    ) {

        const url = "https://apms.asanpardakht.ir/as/ctc/app/1/10009";
        const op = 220;

        const cvv2Data = `${ccv}|${otp}|${amount}|${destination}|`;
        const cvvEncrypted = crypto.publicEncrypt({
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING
        }, Buffer.from(cvv2Data)).toString("base64");

        const nn = {
            svexpd: 1,
            pin: "",
            cvv: cvvEncrypted,
            expd: expireDate
        }


        const options = {
            ao: amount,
            currency: "IRR",
            an: card,
            nn: JSON.stringify(nn),
            ap: this.user.appId,
            acct: this.user.accessToken,
            at: "",
            mo: this.user.phone,
            ed: [],
            ej: {
                dc: destination,
                trsd: trsd,
                hsd: hsd,
            },
        }

        const result = await this.client.sendRequest(url, op, options);
        return result;
    }
}


export class CardClient {
    private httpClient: AxiosInstance;

    constructor(httpClient: AxiosInstance) {
        this.httpClient = httpClient;
    }

    async getCardKey(transactionId: string, keyId: string) {
        const url = "https://tsm.shaparak.ir/mobileApp/getKey";
        const body = {
            transactionId: transactionId,
            keyId: keyId
        }

        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Connection": "Keep-Alive",
            "Accept-Encoding": "gzip",
            "User-Agent": "okhttp/4.12.0"
        }

        const res = await this.httpClient.post(url, body, {
            headers
        });

        const keyData = res.data.keyData;
        return keyData;

    }
}
