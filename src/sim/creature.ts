import { createNet, NeuralNet, processNet } from "./brain/net";
import { createRandomGene } from "./brain/genes";
import { INPUTS } from "./brain/inputs";
import { arrayRand, comparePos, hashStringToColor } from "./util";
import { OUTPUTS } from "./brain";

export interface Creature {
    // stats
    health: number;
    age: number;
    hunger: number;
    thirst: number;
    exhaustion: number;
    // position
    position: [number, number];
    // fer thinkin'
    genes: string[],
    brain: NeuralNet;
    // can have a memory about
    destination?: [number, number];
    lastMove: number;
    touchedWalls: [boolean, boolean, boolean, boolean];
    hasMoved: boolean;
    hasNeighbors: number;
    // display
    color: string;
}

export const createPopulation = (worldSize: [number, number], popSize: number, numGenes: number, layerSizes: number[], seedPop: Creature[]|undefined = undefined) => {
    const pop: Creature[] = [];
    for (let i=0; i<popSize; i++) {
        const c = createCreature(numGenes, layerSizes, arrayRand(seedPop), arrayRand(seedPop));
        while(comparePos(c.position, [-1,-1]) || pop.some(p => comparePos(p.position, c.position))) {
            c.position = [Math.floor(Math.random() * worldSize[0]), Math.floor(Math.random() * worldSize[1])]
        }
        pop.push(c);
    }
    return pop;
}

export const createCreature = (numGenes: number, layerSizes: number[], parent1: Creature|undefined = undefined, parent2: Creature|undefined = undefined): Creature => {
    const genes = [];
    if (parent1) {
        if (parent2) {
            genes.push(...[...parent1.genes].sort(() => .5 - Math.random()).slice(0, numGenes / 2));
            genes.push(...[...parent2.genes].sort(() => .5 - Math.random()).slice(0, numGenes / 2));
        } else {
        genes.push(...parent1.genes);
        }
    }
    while(genes.length < numGenes) {
        genes.push(createRandomGene())
    }
    return {
        health: 100,
        age: 0,
        hunger: 0,
        thirst: 0,
        exhaustion: 0,
        position: [-1, -1],
        lastMove: 1,
        touchedWalls: [false, false, false, false],
        hasMoved: false,
        hasNeighbors: 0,
        genes,
        brain: createNet(layerSizes, genes),
        color: hashStringToColor(genes.join(''))
    }
}

export const getCreatureInputs = (c: Creature, step: number, world: any[][]): number[] => Object.values(INPUTS).map(i => {
    switch (i) {
        case INPUTS.RAND:
            return Math.random();
        case INPUTS.OSC:
            return Math.sin(step);
        case INPUTS.TIME:
            return step;
        case INPUTS.HEALTH:
            return c.health;
        case INPUTS.HUNGER:
            return c.hunger;
        case INPUTS.THIRST:
            return c.thirst;
        case INPUTS.EXHAUSTION:
            return c.exhaustion;
        case INPUTS.HASDEST:
            return c.destination ? 1 : 0;
        case INPUTS.POSX:
            return c.position[0] / world.length;
        case INPUTS.POSY:
            return c.position[1] / world[0].length;
        case INPUTS.OBSTRUCTED:
            return c.lastMove ? 0 : 1;
        case INPUTS.HASMOVED:
            return c.hasMoved ? 1 : 0;
        case INPUTS.TOUCHEDWALLS:
            return c.touchedWalls.filter(Boolean).length/4;
        case INPUTS.HASNEIGHBORS:
            return c.hasNeighbors/8;
        default:
            return 0;
    }
});

const processOutputs = (c: Creature, outputs: number[], world: any[][]) => Object.values(OUTPUTS).forEach(i => {
    let newP: [number, number] = [...c.position];
    let cw = world[c.position[0]]?.[c.position[1]]
    let w: any;
    switch (i) {
        case OUTPUTS.MOVR:
            if(outputs[i] > Math.random()) {
                newP = [
                    c.position[0] + Math.floor(Math.random() * 3) - 1,
                    c.position[1] + Math.floor(Math.random() * 3) - 1,
                ];
            }
            break;
        case OUTPUTS.MOVN:
            if(outputs[i] > Math.random()) {
                newP[1] -= 1;
            }
            break;
        case OUTPUTS.MOVE:
            if(outputs[i] > Math.random()) {
                newP[0] += 1;
            }
            break;
        case OUTPUTS.MOVS:
            if(outputs[i] > Math.random()) {
                newP[1] += 1;
            }
            break;
        case OUTPUTS.MOVW:
            if(outputs[i] > Math.random()) {
                newP[0] -= 1;
            }
            break;
        default:
            // do nothing
    }
    w = world[newP[0]]?.[newP[1]]
    if (w && w !== cw) {
        if (w && !w.occupant) {
            w.occupant = c;
            cw.occupant = undefined;
            c.position = newP;
            c.lastMove = 1;
            c.exhaustion += .001; // tired in 1000 steps?
            c.hasMoved = true;
        } else {
            c.lastMove = 0;
        }
    }
    c.age += .0001; // lives 10000 steps?
    c.hunger += .001; // hungry in 1000 steps?
    c.thirst += .001; // thirsty in 1000 steps?
    c.exhaustion += .001; // tired in 1000 steps?

    if (c.position[0] === 0) {
        c.touchedWalls[3] = true;
    }
    if (c.position[0] === world.length-1) {
        c.touchedWalls[1] = true;
    }
    if (c.position[1] === 0) {
        c.touchedWalls[0] = true;
    }
    if (c.position[1] === world[0].length-1) {
        c.touchedWalls[2] = true;
    }

    let neighbors = 0;
    for(let x = c.position[0] - 1; x < c.position[0] + 2; x++) {
        for(let y = c.position[1] - 1; y < c.position[1] + 2; y++) {
            const t = world[x]?.[y];
            if(t && t.occupant) {
                neighbors++;
            }
        }
    }
    c.hasNeighbors = neighbors;

    // handle needs issues (mostly just kill 'em)
});

export const updateCreature = (c: Creature, step: number, world: any[][]) => {
    processOutputs(c, processNet(c.brain, getCreatureInputs(c, step, world)), world);
}

