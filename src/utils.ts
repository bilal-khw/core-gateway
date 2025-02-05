import readline from 'node:readline/promises';

export function base64Encode(data: Buffer) {
    return data.toString("base64").replace(new RegExp(`(.{1,76})`, "g"), "$1\n");
}

export function base64EncodeString(data: string) {
    return base64Encode(Buffer.from(data)).toString();
}

export function base64Decode(data: string): Buffer {
    return Buffer.from(data.split("\n").join(), "base64");
}

export async function waitOTP() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const result = await rl.question('otp: ');
    rl.close();
    return result;
}
