export const getHex = (i: number) => ('00' + i.toString(16)).slice(-2);

export const encodeFloat = (i: number) => {
    const view = new DataView(new ArrayBuffer(4));
    view.setFloat32(0, i);
    return Array.from({ length: 4 }).map((_, i) => getHex(view.getUint8(i))).join('');
}
export const decodeFloat = (s: string) => {
    const view = new DataView(new ArrayBuffer(4));
    for (let i=0; i<4; i++) {
        view.setUint8(i, parseInt(s.substring(i*2, i*2+2), 16));
    }
    return view.getFloat32(0);
}

export const arrayRand = (arr: any[] | undefined) => arr && arr[Math.floor(Math.random()*arr.length)];
export const comparePos = (p1: [number, number], p2: [number, number]) => p1[0] === p2[0] && p1[1] === p2[1];

const djb2 = (str: string) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    }
    return hash;
};

export const hashStringToColor = (str: string) => {
    const hash = djb2(str);
    const r = (hash & 0xFF0000) >> 16;
    const g = (hash & 0x00FF00) >> 8;
    const b = hash & 0x0000FF;
    return "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2);
};