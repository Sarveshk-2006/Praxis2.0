import React from 'react';

export default function Loader() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-base z-[50]">
            <div className="w-64 h-[2px] bg-surface relative overflow-hidden mb-4">
                <style>{`
                    @keyframes slide {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                `}</style>
                <div
                    className="absolute inset-0 bg-[#2DD4BF] w-full"
                    style={{ animation: 'slide 1.5s ease-in-out infinite' }}
                ></div>
            </div>
            <div className="font-mono text-[10px] text-muted tracking-widest uppercase">LOADING DATA...</div>
        </div>
    );
}
