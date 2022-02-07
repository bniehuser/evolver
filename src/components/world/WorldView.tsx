import React, { FC, MutableRefObject, useEffect, useRef } from 'react';
import {ReactComponent as Grid} from '../../img/grid.svg';
import { useAnimationFrame } from "../../hooks/animation";
import { Creature } from "../../sim";

interface IProps {
    world: MutableRefObject<[Creature[], any[][], (s: number) => void]>,
}

export const WorldView: FC<IProps> = ({ world }) => {
    const canvas = useRef<HTMLCanvasElement>(null);
    useAnimationFrame(t => {
        const ctx = canvas.current?.getContext('2d');
        if(canvas.current && ctx) {
            ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
            const xMax = world.current?.[1]?.length || 0;
            for (let x=0; x<xMax; x++) {
                const yMax = world.current?.[1]?.[x]?.length || 0;
                for (let y=0; y < yMax; y++) {
                    const c = world.current?.[1]?.[x][y].occupant;
                    if (c) {
                        ctx.beginPath()
                        ctx.arc(x * 8 + 4, y * 8 + 4, 3, 0, 2 * Math.PI);
                        ctx.fillStyle = c.color;
                        ctx.fill();
                    }
                }
            }
        }
    })
    useEffect(() => {
        const sizer = document.getElementById('world-view')?.getBoundingClientRect();
        if (sizer && canvas.current) {
            console.log(sizer);
            canvas.current.height = sizer.height;
            canvas.current.width = sizer.width;
        }
    }, [])

    return (
        <div id="world-view">
            <Grid id="grid" style={{position:'absolute'}} />
            <canvas style={{position:'absolute'}} id="world-content" ref={canvas} width="100%" height="100%" />
        </div>
    )
}