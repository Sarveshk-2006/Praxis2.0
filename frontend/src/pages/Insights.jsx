import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle, Heart, AlertTriangle, MessageSquareQuote, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Loader from '../components/Loader';

const BASE = import.meta.env.VITE_API_URL;

export default function Insights() {
    const [data, setData] = useState({
        products: null,
        discounts: null,
        insights: null
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
            const [prodRes, discRes, insRes] = await Promise.all([
                fetch(`${BASE}/api/sentiment/products`).then(r => r.json()),
                fetch(`${BASE}/api/sentiment/discount-correlation`).then(r => r.json()),
                fetch(`${BASE}/api/sentiment/insights`).then(r => r.json())
            ]);
            setData({
                products: prodRes,
                discounts: discRes,
                insights: insRes
            });
        } catch (err) {
            console.error(err);
            setError('Unable to fetch Sentiment Insights. Ensure pipeline has been run.');
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="max-w-6xl space-y-8 animate-in fade-in">
                <h2 className="heading text-4xl font-black text-[#F5F0E8] flex items-center">Sentiment Intelligence</h2>
                <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-8 text-center shadow-lg">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-300 mb-6">{error}</p>
                </div>
            </div>
        );
    }

    if (loading || !data.products) {
        return <Loader />;
    }

    // Format Discount Chart Data
    const discData = Object.keys(data.discounts).map(cat => ({
        category: cat,
        "With Discount": data.discounts[cat].avg_rating_with_discount,
        "No Discount": data.discounts[cat].avg_rating_no_discount,
        diff: data.discounts[cat].discount_impact_difference,
        hypothesis: data.discounts[cat].hypothesis_result
    }));

    // Find biggest discount mover
    const biggestMover = [...discData].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0];
    const discountEffectText = biggestMover ? `Discounts ${biggestMover.diff > 0 ? 'help' : 'hurt'} satisfaction most for ${biggestMover.category} customers (${biggestMover.diff > 0 ? '+' : ''}${biggestMover.diff.toFixed(2)}★)` : "Discount effects are neutral across categories";

    return (
        <div className="page page-container max-w-[1400px] space-y-10 animate-in fade-in duration-500 pb-16">

            <div className="border-b border-[rgba(255,255,255,0.07)] pb-6">
                <h2 className="heading text-4xl font-black text-[#F5F0E8] flex items-center">
                    Sentiment & Product Intelligence
                </h2>
                <p className="text-[#8A8480] font-sans mt-2 text-lg">NLP-engine outputs tracking customer satisfaction, rating shifts, and product health.</p>
            </div>

            {/* SECTION 1: HEALTH BOARD */}
            <section>
                <h3 className="label mb-6">Product Health Board</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Top Rated */}
                    <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg">
                        <h4 className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8A8480] pb-[12px] border-b border-[rgba(255,255,255,0.07)] mb-4 flex items-center">
                            TOP RATED PRODUCTS
                        </h4>
                        <div className="space-y-4">
                            {data.products.top_delighted.map((item, idx) => (
                                <div key={idx} className="bg-[#1C1A17] border border-[rgba(45,212,191,0.15)] border-l-[3px] border-l-[#2DD4BF] p-4 rounded-none flex justify-between items-center transition-colors">
                                    <div>
                                        <h5 className="font-sans font-medium text-[#F0EDE8] text-[15px] mb-1">{item.name}</h5>
                                        <div className="font-mono text-[11px] tracking-[0.05em] text-[#8A8480] flex items-center space-x-3">
                                            <span className="flex items-center"><Star size={10} className="mr-1 text-[#FBBF24]" /> {item.avg_rating.toFixed(1)}</span>
                                            <span className="uppercase">PEAK: {item.top_season}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[#2DD4BF] font-mono font-medium text-[18px]">{item.delighted_pct.toFixed(0)}%</span>
                                        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#2DD4BF]">DELIGHTED</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Needs Attention */}
                    <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg">
                        <h4 className="font-mono text-[10px] tracking-[0.15em] uppercase text-[#8A8480] pb-[12px] border-b border-[rgba(255,255,255,0.07)] mb-4 flex items-center">
                            NEEDS ATTENTION
                        </h4>
                        <div className="space-y-4">
                            {data.products.top_frustrating.map((item, idx) => (
                                <div key={idx} className="bg-[#1C1A17] border border-[rgba(248,113,113,0.15)] border-l-[3px] border-l-[#F87171] p-4 rounded-none flex justify-between items-center transition-colors">
                                    <div>
                                        <h5 className="font-sans font-medium text-[#F0EDE8] text-[15px] mb-1">{item.name}</h5>
                                        <div className="font-mono text-[11px] tracking-[0.05em] text-[#8A8480] flex items-center space-x-3">
                                            <span className="flex items-center"><Star size={10} className="mr-1 text-[#FBBF24]" /> {item.avg_rating.toFixed(1)}</span>
                                            <span className="uppercase">HEAVY DROPOFF: {item.top_segment}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[#F87171] font-mono font-medium text-[18px]">{item.dissatisfied_pct.toFixed(0)}%</span>
                                        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#F87171]">DISSATISFIED</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </section>

            {/* SECTION 2: DISCOUNT EFFECT */}
            <section className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg">
                <div className="md:flex justify-between items-end mb-8 border-b border-[rgba(255,255,255,0.07)] pb-4">
                    <div>
                        <h3 className="label">The Discount Effect</h3>
                        <p className="font-sans font-light text-[#8A8480] mt-1">Comparing average ratings between discounted vs full-price purchases.</p>
                    </div>
                    <div className="mt-4 md:mt-0 font-mono text-[10px] uppercase tracking-wider bg-transparent border border-gold text-gold px-4 py-2 rounded-none flex items-center">
                        {biggestMover && biggestMover.diff > 0 ? <TrendingUp size={12} className="mr-2" /> : <TrendingDown size={12} className="mr-2" />}
                        {discountEffectText}
                    </div>
                </div>

                <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={discData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                            <XAxis dataKey="category" stroke="#9CA3AF" tickLine={false} axisLine={false} />
                            <YAxis stroke="#9CA3AF" domain={[3, 5]} tickLine={false} axisLine={false} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(255,255,255,0.15)', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '12px', padding: '10px 14px' }}
                                cursor={{ fill: '#374151', opacity: 0.2 }}
                                formatter={(val) => [val.toFixed(2) + '★']}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="With Discount" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                            <Bar dataKey="No Discount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </section>

            {/* SECTION 3: AUTO-GENERATED INSIGHTS */}
            <section>
                <h3 className="label mb-6">Auto-Generated Product Insights</h3>
                <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.insights.map((insight, idx) => {
                            // Extract Rating roughly for visual badge if possible, otherwise generic star
                            const ratingMatch = insight.insight.match(/(\d\.\d)★/);
                            const extractedRating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
                            const isGood = extractedRating >= 4.0;
                            const isBad = extractedRating <= 3.0;

                            return (
                                <div key={idx} className="bg-transparent border border-[rgba(255,255,255,0.07)] p-5 rounded-none hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-sans font-medium text-offwhite text-lg">{insight.item}</span>
                                        <span className={`px-2 py-1 rounded-none text-[10px] font-mono tracking-widest uppercase border flex items-center ${isGood ? 'border-mint text-mint' : isBad ? 'border-danger text-danger' : 'border-gold text-gold'}`}>
                                            <Star size={10} className="mr-1" /> {extractedRating || '?'}
                                        </span>
                                    </div>
                                    <p className="font-sans font-light text-[#888] leading-relaxed border-l-2 border-[rgba(255,255,255,0.07)] pl-3">
                                        {insight.insight}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

        </div>
    );
}
