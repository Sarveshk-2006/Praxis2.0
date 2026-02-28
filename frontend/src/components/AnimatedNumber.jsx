import React from 'react';
import { useCountUp } from '../hooks/useCountUp';

export default function AnimatedNumber({ value, isFloat = false, decimals = 1 }) {
    const count = useCountUp(value || 0);

    if (isFloat) {
        return <>{count.toFixed(decimals)}</>;
    }
    return <>{Math.round(count).toLocaleString()}</>;
}
