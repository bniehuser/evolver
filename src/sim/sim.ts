import { createPopulation, Creature, updateCreature } from "./creature";
import { INPUTS, OUTPUTS } from "./brain";
import { comparePos } from "./util";

const runStep = (pop: Creature[], step: number, world: any[][]) => {
    pop.forEach(c => updateCreature(c, step, world))
}

export const createWorld = (worldSize: [number, number], brainSize: number[], numGenes: number, popSize: number, seedPop: Creature[]|undefined = undefined): [Creature[], any[][], (s: number) => void] => {
    const layerSize = [Object.values(INPUTS).length, ...brainSize, Object.values(OUTPUTS).length];
    const pop = createPopulation(worldSize, popSize, numGenes, layerSize, seedPop);
    const world: any[][] = []; // TODO: actual world tile grid?  should update with occupied
    for (let x = 0; x < worldSize[0]; x++) {
        world[x] = [];
        for (let y = 0; y < worldSize[1]; y++) {
            world[x][y] = {occupant: pop.filter(p => comparePos(p.position, [x, y]))?.[0]};
        }
    }
    const step = (s: number) => { runStep(pop, s, world); }
    return [pop, world, step];
}
