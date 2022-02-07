import { NeuralNetLink } from "./net";
import { decodeFloat, encodeFloat, getHex } from "../util";

export const createRandomGene = () => {
    return encodeGene({
        source: [Math.round(Math.random() * 255), Math.round(Math.random() * 255)],
        dest: [Math.round(Math.random() * 255), Math.round(Math.random() * 255)],
        weight: Math.random() * 512 - 256, // -256 to 256
    })
}

export const encodeGene = (l: NeuralNetLink): string => {
    return [
        getHex(l.source[0]),
        getHex(l.source[0]),
        getHex(l.dest[0]),
        getHex(l.dest[0]),
        encodeFloat(l.weight),
    ].join('')
}

export const decodeGene = (g: string): NeuralNetLink => ({
    source: [parseInt(g.substring(0, 2), 16), parseInt(g.substring(2, 4), 16)],
    dest: [parseInt(g.substring(4, 6), 16), parseInt(g.substring(6, 8), 16)],
    weight: decodeFloat(g.substring(8, 16)),
})