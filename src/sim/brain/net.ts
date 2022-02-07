import { decodeGene } from "./genes";

export interface NeuralNetNode {
    value: number;
    inputs: NeuralNetLink[];
}

export interface NeuralNetLink {
    source: [number, number];
    dest: [number, number];
    weight: number;
}

export type NeuralNet = NeuralNetNode[][];

const WEIGHT_FACTOR = 4;

const fittedGene = (l: NeuralNetLink, s: number[]): NeuralNetLink => {
    const ll = s.length-1;
    const sl = l.source[0] % ll;
    const dl = 1 + l.dest[0] % ll;
    const sn = l.source[1] % s[sl];
    const dn = l.source[0] % s[dl];
    return {
        source: [sl, sn],
        dest: [dl, dn],
        weight: l.weight % WEIGHT_FACTOR,
    };
};

export const createNet = (layerSizes: number[], genes: string[] = []): NeuralNet => layerSizes.map(
    (s, l) => Array.from({length: s}).map((_, n) => ({
        value: 0,
        inputs: genes.map(g => fittedGene(decodeGene(g), layerSizes)).filter(k => k.dest[0] === l && k.dest[1] === n),
    }))
);

export const processNet = (nn: NeuralNet, inputs: number[]) => {
    for (let a = 0; a < nn[0].length; a++) {
        nn[0][a].value = inputs[a] || 0;
    }
    for (let i = 1; i < nn.length; i++) {
        for (let n=0; n < nn[i]?.length; n++) {
            nn[i][n].value = nn[i][n].inputs.reduce(
                // using tanh because it's simple
                (a, c) => Math.tanh(a + nn[c.source[0]][c.source[1]].value * c.weight),
                0,
            );
        }
    }
    return nn[nn.length-1].map(n => n.value);
}
