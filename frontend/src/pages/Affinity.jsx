import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

const BASE = import.meta.env.VITE_API_URL;

export default function Affinity() {
    const [activeTab, setActiveTab] = useState('heatmap');
    const [data, setData] = useState({
        segmentCat: null,
        demographic: null,
        priceSen: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [segCatRes, demoRes, priceRes] = await Promise.all([
                fetch(`${BASE}/api/affinity/segment-category`).then(r => r.json()),
                fetch(`${BASE}/api/affinity/demographic`).then(r => r.json()),
                fetch(`${BASE}/api/price-sensitivity`).then(r => r.json())
            ]);
            setData({
                segmentCat: segCatRes,
                demographic: demoRes,
                priceSen: priceRes
            });
        } catch (err) {
            console.error(err);
            setError('Unable to fetch affinity insights.');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="absolute inset-0 pt-8 px-12 animate-in flex items-center justify-center">
                <div className="card text-center border-danger">
                    <p className="text-danger mb-4 font-mono">{error}</p>
                    <button onClick={fetchData} className="num text-[12px] bg-white/5 px-4 py-2 hover:bg-white/10 transition-colors">RETRY CONNECTION</button>
                </div>
            </div>
        );
    }

    if (loading || (!data.segmentCat && !data.demographic && !data.priceSen)) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="num text-[#2DD4BF] animate-pulse text-[14px]">LOADING MATRICES...</div>
            </div>
        );
    }

    const priceData = data.priceSen ? Object.keys(data.priceSen).map(seg => ({
        name: seg,
        "With Discount": data.priceSen[seg].avg_spend_with_discount,
        "No Discount": data.priceSen[seg].avg_spend_no_discount,
        promoRate: data.priceSen[seg].promo_code_usage_rate
    })) : [];

    const getHeatmapColor = (val) => {
        if (val > 60) return 'rgba(45, 212, 191, 0.8)';
        if (val > 40) return 'rgba(45, 212, 191, 0.5)';
        if (val > 20) return 'rgba(45, 212, 191, 0.3)';
        return 'rgba(45, 212, 191, 0.1)';
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface border border-border p-3 shadow-2xl text-sm font-mono z-50">
                    <p className="text-muted text-[10px] mb-1">{payload[0].payload.name}</p>
                    {payload.map((p, idx) => (
                        <p key={idx} style={{ color: p.color || p.fill }} className="font-bold">
                            {p.dataKey === 'promoRate' ? p.value.toFixed(1) + '%' : '$' + p.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Extract categories explicitly for the heatmap columns
    const heatCategories = data.segmentCat && Object.keys(data.segmentCat).length > 0
        ? Object.keys(Object.values(data.segmentCat)[0])
        : [];
    const heatSegments = data.segmentCat ? Object.keys(data.segmentCat) : [];

    return (
        <div className="absolute inset-0 bg-base overflow-x-hidden flex flex-col justify-start">
            <div className="px-12 pt-12 pb-24 w-full max-w-[1500px] mx-auto animate-in space-y-12">

                {/* HEADLINE & TABS */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 border-b border-border pb-4">
                    <div>
                        <div className="label mb-2">NETWORK EXPLORATION</div>
                        <h2 className="heading text-[48px] leading-tight text-offwhite">Affinity & Behavior</h2>
                    </div>

                    <div className="flex space-x-8">
                        {['heatmap', 'demographic', 'price'].map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`font-mono uppercase text-[12px] tracking-wider pb-4 transition-colors relative ${activeTab === t ? 'text-offwhite' : 'text-muted hover:text-offwhite'}`}
                            >
                                {t === 'heatmap' ? 'Segment × Category' : t === 'price' ? 'Price Sensitivity' : 'Demographics'}
                                {activeTab === t && <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#2DD4BF]"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* TAB CONTENT */}
                <div className="w-full">
                    {/* HEATMAP TAB */}
                    {activeTab === 'heatmap' && data.segmentCat && heatCategories.length > 0 && (
                        <div className="animate-in fade-in space-y-8">
                            <p className="font-sans font-light text-[15px] text-muted max-w-2xl mb-8">
                                Cross-correlation matrix showing the percentage of total segment purchases directed toward specific target categories. Darker squares indicate higher absolute affinity.
                            </p>

                            <div className="w-full border border-border border-b-0">
                                {/* Heatmap Header */}
                                <div className="grid grid-cols-5 bg-base border-b border-border">
                                    <div className="p-4 label">Segment // Category</div>
                                    {heatCategories.map((cat, i) => (
                                        <div key={i} className="p-4 label text-center border-l border-border">{cat}</div>
                                    ))}
                                </div>

                                {/* Heatmap Rows */}
                                {heatSegments.map((seg, i) => (
                                    <div key={i} className="grid grid-cols-5 border-b border-border bg-surface">
                                        <div className="p-4 font-mono text-[12px] text-offwhite flex items-center uppercase text-left">{seg}</div>
                                        {heatCategories.map((cat, j) => {
                                            const val = data.segmentCat[seg][cat] || 0;
                                            return (
                                                <div key={j} className="border-l border-border relative h-24 sm:h-32 flex items-center justify-center overflow-hidden">
                                                    <div className="absolute inset-0" style={{ backgroundColor: getHeatmapColor(val) }}></div>
                                                    <span className="relative z-10 font-mono font-bold text-[18px] text-offwhite drop-shadow-md">
                                                        {val.toFixed(1)}%
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* DEMOGRAPHIC TAB */}
                    {activeTab === 'demographic' && data.demographic && (
                        <div className="animate-in fade-in space-y-16">

                            {/* Gender Matrix */}
                            <div>
                                <div className="label mb-6">TOP ITEMS BY DEMOGRAPHIC: GENDER</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.keys(data.demographic.gender || {}).map(g => (
                                        <div key={g} className="border border-border p-6 bg-surface">
                                            <h4 className="font-mono text-[14px] text-[#2DD4BF] uppercase mb-6 flex items-center">
                                                <span className="text-muted mr-2">{'//'}</span> {g} PREFERENCE
                                            </h4>
                                            <ol className="space-y-4">
                                                {data.demographic.gender[g].map((item, idx) => (
                                                    <li key={idx} className="flex items-center text-offwhite font-sans text-[14px]">
                                                        <span className="text-muted font-mono text-[11px] w-6">0{idx + 1}.</span>
                                                        <span className="flex-1">{item}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Age Bracket Matrix */}
                            <div>
                                <div className="label mb-6">TOP ITEMS BY DEMOGRAPHIC: AGE BRACKET</div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {Object.keys(data.demographic.age_group || {}).map(ag => (
                                        <div key={ag} className="border-t border-border pt-4">
                                            <h4 className="font-mono text-[13px] text-[#818CF8] mb-4 uppercase text-center bg-white/5 py-1">Ages {ag}</h4>
                                            <ul className="space-y-2 text-center">
                                                {data.demographic.age_group[ag].slice(0, 4).map((item, idx) => (
                                                    <li key={idx} className="font-sans text-[13px] text-muted truncate px-2" title={item}>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* PRICE SENSITIVITY TAB */}
                    {activeTab === 'price' && priceData.length > 0 && (
                        <div className="animate-in fade-in space-y-16">

                            <div className="w-full h-[400px] relative">
                                <div className="label mb-8">AVERAGE DEAL SPEND PER SEGMENT</div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={priceData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                        <XAxis dataKey="name" stroke="#8A8480" tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#888' }} dy={10} />
                                        <YAxis stroke="#8A8480" tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#888' }} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                        <Legend wrapperStyle={{ fontFamily: 'DM Mono', fontSize: '10px', paddingTop: '20px' }} iconType="square" />
                                        <Bar dataKey="With Discount" fill="#818CF8" />
                                        <Bar dataKey="No Discount" fill="#FF4D4D" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="w-full h-[300px] relative">
                                <div className="label mb-8 text-right">PROMO CODE USAGE RATIO</div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={priceData} margin={{ top: 0, right: 0, bottom: 0, left: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                        <XAxis type="number" domain={[0, 100]} stroke="#8A8480" tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#888' }} />
                                        <YAxis dataKey="name" type="category" stroke="#8A8480" tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#888' }} width={120} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                        <Bar dataKey="promoRate" fill="#2DD4BF" barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
