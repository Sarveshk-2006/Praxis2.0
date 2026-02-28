import { useState, useEffect } from 'react';

export function useCountUp(end, duration = 800) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        let animationFrame;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;

            // easeOutQuad
            const easeProgress = 1 - Math.pow(1 - Math.min(progress / duration, 1), 2);

            setCount(end * easeProgress);

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                setCount(end); // Force final value
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return count;
}
