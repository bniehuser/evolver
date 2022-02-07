import React, { useEffect, useRef, useState } from 'react';
import './style/main.scss';
import { WorldView } from "./components/world/WorldView";
import { createWorld, Creature } from "./sim";

interface AppSettings {
    steps: number;
    numGenes: number;
    brainSize: number[];
    autoNext: boolean;
}

const STEP_SPEED = 1000/60; // frame speed, more or less

function App() {
    const [generation, setGeneration] = useState<number>(1);
    const [running, setRunning] = useState<boolean>(false);
    const [settings, setSettings] = useState<AppSettings>({
        steps: 250,
        numGenes: 12,
        brainSize: [4, 4],
        autoNext: false,
    });

    const worldRef = useRef<[Creature[], any[][], (s: number) => void]>(createWorld([128, 128], settings.brainSize, settings.numGenes, 1000));
    const step = useRef<number>(0);
    const intRef = useRef<number>(0);

    useEffect(() => {
        step.current = 0;
        setRunning(true);
        intRef.current = setInterval(() => {
            if(step.current > settings.steps) {
                clearInterval(intRef.current);
                setRunning(false);
                if(settings.autoNext) {
                    nextGen();
                }
                return false;
            }
            if(!(step.current % 10)) {
                console.log('ran', step.current);
            }
            (worldRef.current?.[2] as (s: number) => void)?.(step.current);
            step.current++;
        }, STEP_SPEED) as unknown as number; // darn 'Timer'
        return () => clearInterval(intRef.current);
    }, [generation])

    const nextGen = () => {
        const seedPop = worldRef.current[0]
            // .filter(c => c.position[0] > 64)
            .filter(c => c.hasMoved)
            .filter(c => c.hasNeighbors < 2)
            .filter(c => c.position[0] < 121)
            .filter(c => c.position[1] < 121)
            .filter(c => c.position[0] > 7)
            .filter(c => c.position[1] > 7)
        //    .filter(p => p.touchedWalls.filter(Boolean).length > 1)
        ;
        worldRef.current = createWorld([128, 128], settings.brainSize, settings.numGenes, 1000, seedPop);
        setGeneration(generation => generation + 1);
    }

  return (
    <div id="main">
        <header id="header">
            <h1>
                Generation {generation}{' '}
                {running ? <em>running...</em> : <button onClick={nextGen}>next gen &gt;</button>}{' '}
                <span style={{fontSize: '50%'}}>
                <input type="checkbox" checked={settings.autoNext} onChange={e => setSettings(s => ({...s, autoNext: e.target.checked}))} /> Auto?
                </span>
            </h1>
        </header>
        <WorldView world={worldRef} />
        <div id="controls">
            <form>

            </form>
        </div>
    </div>
  );
}

export default App;
