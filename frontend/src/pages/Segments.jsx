import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { Activity } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';
import Loader from '../components/Loader';
import { getSegmentColor, getSegmentHexClass } from '../constants/segments';

const BASE = import.meta.env.VITE_API_URL;

export default function Segments() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Demo Mode: Explainer State
    const [lookupId, setLookupId] = useState('');
    const [explainerData, setExplainerData] = useState(null);
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState('');

    useEffect(() => {
        fetchSegments();
    }, []);

    const fetchSegments = () => {
        setLoading(true);
        setError('');
        fetch(`${BASE}/api/segments`)
            .then(res => res.json())
            .then(data => {
                setData(data);
            })
            .catch(err => {
                console.error("Error fetching segments:", err);
                setError('Unable to fetch segmentation data.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleLookup = async (e) => {
        e.preventDefault();
        if (!lookupId) return;
        setLookupLoading(true);
        setLookupError('');
        setExplainerData(null);

        try {
            const res = await fetch(`${BASE}/api/explain/customer?id=${lookupId}`);
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw { response: { data: errData } };
            }
            const data = await res.json();
            setExplainerData(data);
        } catch (err) {
            setLookupError(err.response?.data?.detail || 'Customer ID not found or explainer data unavailable.');
        } finally {
            setLookupLoading(false);
        }
    };

    if (error) {
        return (
            <div className="absolute inset-0 pt-8 px-12 animate-in flex items-center justify-center">
                <div className="card text-center border-danger">
                    <p className="text-danger mb-4 font-mono">{error}</p>
                    <button onClick={fetchSegments} className="num text-[12px] bg-white/5 px-4 py-2 hover:bg-white/10 transition-colors">RETRY CONNECTION</button>
                </div>
            </div>
        );
    }

    if (loading || !data) {
        return <Loader />;
    }

    const scatterData = data?.scatter_data || [];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const d = payload[0].payload;
            return (
                <div style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '12px', padding: '10px 14px' }} className="shadow-2xl z-50">
                    <div className="text-muted text-[10px] mb-2 uppercase border-b border-white/10 pb-1">CUSTOMER ID {d.customer_id || 'UNKNOWN'}</div>
                    <div className="text-[#2DD4BF] font-bold mb-1" style={{ color: getSegmentColor(d.segment_name) }}>{d.segment_name}</div>
                    <div className="text-offwhite">Spend: ${d.purchase_amount}</div>
                    <div className="text-offwhite">Prev Purchases: {d.previous_purchases}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page page-container absolute inset-0 bg-base overflow-x-hidden flex flex-col justify-start">
            <div className="px-12 pt-12 pb-24 w-full max-w-[1500px] mx-auto space-y-20 animate-in">

                {/* HEADLINE SECTION AND LOOKUP */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
                    <div>
                        <div className="label mb-4">BEHAVIORAL FOOTPRINTS</div>
                        <h2 className="heading text-[48px] leading-tight text-offwhite mb-2">Customer Segments</h2>
                        <p className="font-sans font-light text-[15px] text-muted max-w-xl">
                            Four distinct clusters engineered via K-Means based on behavioral and engagement metrics.
                        </p>
                    </div>

                    {/* LIVE CUSTOMER LOOKUP */}
                    <div className="w-full lg:w-[450px] bg-surface border border-border p-6 relative flex flex-col justify-end">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-border"></div>
                        <div className="flex items-center justify-between mb-6">
                            <span className="label">LIVE EXPLAINER</span>
                        </div>
                        <form onSubmit={handleLookup} className="flex gap-4 items-end mb-2">
                            <div className="flex-1">
                                <label className="label mb-2 block text-muted">CUSTOMER ID (1-3900)</label>
                                <input
                                    type="number"
                                    min="1" max="3900"
                                    placeholder="42"
                                    className="w-full bg-[#161513] border border-[rgba(255,255,255,0.1)] px-[14px] py-[10px] text-[#F0EDE8] font-mono text-[14px] rounded-none focus:outline-none focus:border-[rgba(45,212,191,0.4)] transition-colors"
                                    value={lookupId}
                                    onChange={e => setLookupId(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={lookupLoading}
                                className="bg-transparent hover:bg-[rgba(45,212,191,0.08)] text-[#2DD4BF] px-[20px] py-[10px] font-mono text-[11px] tracking-[0.12em] uppercase h-[42px] transition-colors flex items-center justify-center border border-[rgba(45,212,191,0.4)] rounded-none"
                            >
                                {lookupLoading ? '...' : 'ANALYZE'}
                            </button>
                        </form>
                        {lookupError && <div className="text-danger text-[12px] font-mono mt-2">{lookupError}</div>}
                    </div>
                </div>

                {/* MODAL FOR EXPLAINER RESULT (Floats over content) */}
                {explainerData && (
                    <div className="fixed inset-0 bg-base/90 backdrop-blur-md z-[100] flex items-center justify-center animate-in">
                        <div className="card w-full max-w-3xl mx-4 border border-border p-8 relative">
                            <button onClick={() => setExplainerData(null)} className="absolute top-6 right-6 text-muted hover:text-offwhite font-mono text-[12px]">CLOSE [X]</button>
                            <div className="label mb-4 border-b border-border pb-2 w-full flex justify-between">
                                <span>PIPELINE EXPLANATION</span>
                                <span className="flex items-center gap-2 text-[#818CF8]"><Activity size={12} /> HIGH CONFIDENCE</span>
                            </div>
                            <h3 className="heading text-[32px] mb-6" style={{ color: getSegmentColor(explainerData.segment) }}>
                                {explainerData.segment}
                            </h3>
                            <p className="font-sans text-[16px] leading-relaxed text-offwhite border-l-2 pl-4 mb-8" style={{ borderColor: getSegmentColor(explainerData.segment) }}>
                                "{explainerData.explanation}"
                            </p>

                            <div className="label mb-4">FEATURE CONTRIBUTIONS</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {explainerData.feature_contributions.map((feat, idx) => (
                                    <div key={idx} className="bg-base border border-border p-4 flex justify-between items-center">
                                        <span className="font-mono text-muted text-[11px] uppercase">{feat.feature}</span>
                                        <div className="text-right flex flex-col">
                                            <span className="text-offwhite font-mono text-[14px]">{typeof feat.value === 'number' && !Number.isInteger(feat.value) ? feat.value.toFixed(1) : feat.value}</span>
                                            <span className={`text-[10px] font-mono uppercase ${feat.impact.toLowerCase() === 'high' ? 'text-[#818CF8]' : 'text-muted'}`}>{feat.impact} Impact</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* SEGMENT CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {data.segment_summary.map((seg, idx) => {
                        return (
                            <div key={idx} className="bg-surface border border-border p-6 relative flex flex-col justify-between overflow-hidden h-64 shadow-2xl">
                                {/* Decorative faint number */}
                                <div className="absolute top-2 left-4 font-display text-[48px] text-white/[0.03] leading-none select-none">
                                    0{idx + 1}
                                </div>

                                <div className="relative z-10 mb-6 flex flex-col items-center">
                                    <div className="label mb-2" style={{ color: getSegmentColor(seg.segment_name) }}>{seg.segment_name}</div>
                                    <div className="heading text-[36px] text-offwhite"><AnimatedNumber value={seg.count} /></div>
                                </div>

                                <div className="relative z-10 space-y-3 mt-auto">
                                    <div className="flex justify-between items-end num text-[12px] w-full">
                                        <span className="text-muted tracking-wide text-[10px]">AVG SPEND</span>
                                        <span className="flex-1 border-b border-dotted border-muted/30 mx-2 mb-[3px]"></span>
                                        <span className="text-offwhite">$<AnimatedNumber value={seg.avg_spend} isFloat decimals={2} /></span>
                                    </div>
                                    <div className="flex justify-between items-end num text-[12px] w-full">
                                        <span className="text-muted tracking-wide text-[10px]">TOP ITEM</span>
                                        <span className="flex-1 border-b border-dotted border-muted/30 mx-2 mb-[3px]"></span>
                                        <span className="text-offwhite truncate max-w-[100px] text-right" title={seg.top_item}>{seg.top_item}</span>
                                    </div>
                                    <div className="flex justify-between items-end num text-[12px] w-full">
                                        <span className="text-muted tracking-wide text-[10px]">DISCOUNT</span>
                                        <span className="flex-1 border-b border-dotted border-muted/30 mx-2 mb-[3px]"></span>
                                        <span className="text-offwhite"><AnimatedNumber value={seg.discount_affinity} isFloat decimals={0} />%</span>
                                    </div>
                                </div>

                                {/* Bottom colored bar */}
                                <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${getSegmentHexClass(seg.segment_name)}`}></div>
                            </div>
                        );
                    })}
                </div>

                {/* SCATTER PLOT */}
                <div className="w-full h-[400px] relative">
                    <div className="label mb-8 text-center">FREQUENCY vs. SPEND — BY SEGMENT</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis type="number" dataKey="previous_purchases" name="Prev Purchases" stroke="#8A8480" tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#888' }} dy={10} />
                            <YAxis type="number" dataKey="purchase_amount" name="Amount" stroke="#8A8480" tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#888' }} dx={-10} />
                            <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.07)' }} />
                            <Scatter name="Customers" data={scatterData} shape="circle">
                                {scatterData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getSegmentColor(entry.segment_name)} opacity={0.6} r={3} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                {/* COMPARISON TABLE */}
                <div className="w-full">
                    <div className="label mb-6">SEGMENT COMPARATIVE ANALYSIS</div>
                    <div className="w-full border border-border border-b-0">
                        {/* Table Header */}
                        <div className="flex bg-base border-b border-border">
                            <div className="w-1/4 p-4 label text-left">Segment</div>
                            <div className="w-[10%] p-4 label text-right">Count</div>
                            <div className="w-[15%] p-4 label text-right">Avg Spend</div>
                            <div className="w-[10%] p-4 label text-right">Rating</div>
                            <div className="w-[15%] p-4 label text-right">Top Cat</div>
                            <div className="w-[15%] p-4 label text-right">Top Item</div>
                            <div className="w-[10%] p-4 label text-right">Discount</div>
                        </div>
                        {/* Table Rows */}
                        {data.segment_summary.map((seg, idx) => (
                            <div key={idx} className={`flex border-b border-border items-center ${idx % 2 === 0 ? 'bg-[#161513]' : 'bg-base'} relative transition-colors duration-150 hover:bg-[rgba(45,212,191,0.04)]`}>
                                {/* Left colored border */}
                                <div className={`absolute top-0 bottom-0 left-0 w-[3px]`} style={{ backgroundColor: getSegmentColor(seg.segment_name) }}></div>

                                <div className="w-1/4 p-4 pl-6 font-mono text-[12px] text-offwhite whitespace-nowrap overflow-hidden text-ellipsis uppercase">{seg.segment_name}</div>
                                <div className="w-[10%] p-4 font-mono text-[12px] text-[#8A8480] text-right"><AnimatedNumber value={seg.count} /></div>
                                <div className="w-[15%] p-4 font-mono text-[12px] text-[#2DD4BF] text-right">$<AnimatedNumber value={seg.avg_spend} isFloat decimals={2} /></div>
                                <div className="w-[10%] p-4 font-mono text-[12px] text-offwhite text-right"><AnimatedNumber value={seg.avg_rating} isFloat decimals={1} />★</div>
                                <div className="w-[15%] p-4 font-mono text-[12px] text-[#8A8480] uppercase text-right tracking-wider">{seg.top_category}</div>
                                <div className="w-[15%] p-4 font-mono text-[12px] text-offwhite text-right whitespace-nowrap overflow-hidden text-ellipsis uppercase" title={seg.top_item}>{seg.top_item}</div>
                                <div className="w-[10%] p-4 font-mono text-[12px] text-[#818CF8] text-right"><AnimatedNumber value={seg.discount_affinity} isFloat decimals={0} />%</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
