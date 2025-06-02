export function calc(data: Buffer) {
    const checksum = data.slice(0, 7).reduce((a, b) => a + b, 0);
    data[7] = checksum;
    return data;
}

export function calc2(data: Buffer, j: number) {
    let uVar6 = 0;
    let uVar2 = 0;
    let bVar1 = false;
    do {
        do {
            uVar2 = j % 10 + uVar6;
            bVar1 = 9 < j;
            uVar6 = uVar2;
            j = Math.floor(j / 10);
        } while (bVar1);
        uVar6 = 0;
        j = uVar2;
    } while (9 < uVar2);
    data[6] = uVar2;
    return data;
}

export function calc3(param_3: number, param_4: number, param_5: number) {
    let bVar1 = false;
    let lVar2 = 0;
    let uVar3 = param_4 + param_3 + param_5;
    if (uVar3 != 0) {
        do {
            bVar1 = 9 < uVar3;
            lVar2 = uVar3 % 10 + lVar2;
            uVar3 = Math.floor(uVar3 / 10);
        } while (bVar1);
    }
    return lVar2;
}
