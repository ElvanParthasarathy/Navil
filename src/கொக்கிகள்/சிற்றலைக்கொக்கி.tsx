import React, { useState, useCallback } from 'react';

interface Ripple {
    id: number;
    x: number;
    y: number;
    size: number;
}

export const useRipple = () => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const createRipple = useCallback((e: React.PointerEvent<HTMLElement> | React.MouseEvent<HTMLElement>) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const newRipple: Ripple = {
            id: Date.now() + Math.random(),
            x,
            y,
            size,
        };

        setRipples((prev) => [...prev, newRipple]);
    }, []);

    const removeRipple = useCallback((id: number) => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const renderRipples = () => (
        <span className="ripple-container" aria-hidden="true">
            {ripples.map((ripple) => (
                <span
                    key={ripple.id}
                    className="ripple-wave"
                    style={{
                        top: ripple.y,
                        left: ripple.x,
                        width: ripple.size,
                        height: ripple.size,
                    }}
                    onAnimationEnd={() => removeRipple(ripple.id)}
                />
            ))}
        </span>
    );

    return { createRipple, renderRipples };
};

export const சிற்றலைக்கொக்கி = useRipple;
export default useRipple;
