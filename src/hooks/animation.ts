import React from 'react';

type AnimateFunc = (t: number) => void;

export const useAnimationFrame = (callback: AnimateFunc) => {
    const requestRef = React.useRef<number>(0);
    const previousTimeRef = React.useRef<number>();

    React.useEffect(() => {
        const animate = (time: number) => {
            if (previousTimeRef.current !== undefined) {
                const deltaTime = time - previousTimeRef.current;
                callback(deltaTime)
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        }

        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [callback]);
}
