import crypto from 'crypto'
import fs from 'fs'
import { base64Decode, base64Encode } from './utils';
import { calc, calc2 } from './native';

export class EncryptUtil {
    private publicKey: string;
    private aesKey: Buffer;
    private iv: Buffer;

    constructor(j: number) {
        this.publicKey = fs.readFileSync("../public_key.crt").toString();
        this.aesKey = this.generateAesKey();
        this.iv = this.generateIV(j);
    }

    generateAesKey() {
        let key = crypto.randomBytes(16);
        key = calc(key);
        return key;
    }

    generateIV(j: number) {
        let iv = crypto.randomBytes(12);
        iv = calc2(iv, j);
        return iv;
    }

    aesEncrypt(data: Buffer) {
        const cipher = crypto.createCipheriv("aes-128-gcm", this.aesKey, this.iv);
        return Buffer.concat([cipher.update(data), cipher.final(), cipher.getAuthTag()]);
    }


    aesDecrypt(data: Buffer, iv: Buffer) {
        const cipher = crypto.createDecipheriv("aes-128-gcm", this.aesKey, iv);
        const dataWithoutTag = data.slice(0, data.length - 16);
        const tag = data.slice(data.length - 16, data.length);
        cipher.setAuthTag(tag);
        return Buffer.concat([cipher.update(dataWithoutTag), cipher.final()]);
    }

    rsaEncrypt(data: Buffer) {
        const key = crypto.createPublicKey(this.publicKey).export({ type: 'spki', format: 'pem' });
        return crypto.publicEncrypt({
            key,
            padding: crypto.constants.RSA_PKCS1_PADDING
        },
            data
        );
    }

    encryptRequest(body: string) {
        const key = base64Encode(this.rsaEncrypt(this.aesKey));
        const iv = base64Encode(this.iv);
        const data = base64Encode(this.aesEncrypt(Buffer.from(body)));
        return `2#${key}#${iv}#${data}`;
    }

    decryptRequest(body: string) {
        const parts = body.split("#");
        if (parts.length < 3) return "";
        const iv = base64Decode(parts[1]);
        const data = base64Decode(parts[2]);
        return this.aesDecrypt(data, iv).toString();
    }
}
