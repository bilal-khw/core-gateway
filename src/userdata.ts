import fs from 'fs'

interface IUserData {
    appId: number;
    accessToken: string;
    expiration: number;
    phone: string;
    refreshToken: string;
    lastTransaction: number;
    timeDiff: number;
}

export interface IUser {
    appId: number;
    accessToken: string;
    expiration: number;
    phone: string;
    refreshToken: string;
    lastTransaction: number;
    timeDiff: number;
    save: () => void;
    increaseTR: () => void;
    saveTimeDiff: (sm: string) => void;

}

export class User implements IUser {
    appId: number;
    accessToken: string;
    expiration: number;
    phone: string;
    refreshToken: string;
    lastTransaction: number;
    timeDiff: number;


    constructor(data: Partial<IUserData>) {
        this.appId = data.appId ?? 0;
        this.accessToken = data.accessToken ?? "";
        this.expiration = data.expiration ?? 0;
        this.refreshToken = data.refreshToken ?? "";
        this.phone = data.phone ?? "";
        this.lastTransaction = data.lastTransaction ?? 1500;
        this.timeDiff = data.timeDiff ?? 0;
    }


    public static load() {
        const userData = JSON.parse(fs.readFileSync("user_data.json").toString());
        return new User(userData);
    }

    public save() {
        fs.writeFileSync("user_data.json", JSON.stringify(this, null, 2));
    }

    public increaseTR() {
        this.lastTransaction++;
        this.save();
    }

    public saveTimeDiff(sm: string) {
        this.timeDiff = parseInt(sm.split(";")[0]) - Math.floor(new Date().getTime() / 1000);
        this.save();
    }
}
