import { useEffect, useState } from 'react';

export default function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            const tag = e.target.tagName.toLowerCase();
            const role = e.target.getAttribute('role');
            if (tag === 'button' || tag === 'a' || role === 'button' || e.target.closest('button') || e.target.closest('a')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, []);

    return (
        <>
            <div
                className="fixed top-0 left-0 pointer-events-none z-[99999] rounded-none transition-all duration-150 ease-out"
                style={{
                    transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
                    width: '32px',
                    height: '32px',
                    border: '1px solid rgba(45,212,191,0.5)',
                    backgroundColor: isHovering ? 'rgba(45,212,191,0.1)' : 'transparent',
                    scale: isHovering ? 1.5 : 1
                }}
            />
            <div
                className="fixed top-0 left-0 pointer-events-none z-[99999] bg-[#2DD4BF] rounded-none"
                style={{
                    transform: `translate(${position.x - 3}px, ${position.y - 3}px)`,
                    width: '6px',
                    height: '6px',
                }}
            />
        </>
    );
}
