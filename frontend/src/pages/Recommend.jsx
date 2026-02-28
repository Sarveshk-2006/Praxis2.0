import { useState } from 'react';
import { Search, Info, AlertCircle, ShoppingBag, Palette, Tag } from 'lucide-react';
import { getSegmentColor } from '../constants/segments';

const BASE = import.meta.env.VITE_API_URL;

export default function Recommend() {
    const getSegmentDescription = (segment) => {
        switch (segment) {
            case 'Power Shoppers': return 'Elite, high-volume customers who spend the most and buy with high frequency. They are rarely swayed by discounts and form the highest LTV backbone of the business.';
            case 'Loyal Deal Seekers': return 'Regular shoppers who are highly engaged but specifically hunt for promotions. They offer stable revenue when appropriately incentivized with bundles or coupons.';
            case 'Casual Browsers': return 'Younger, trend-driven shoppers exploring entry-level products. They transact less frequently but respond well to seasonal marketing and new arrivals.';
            case 'Dormant Customers': return 'Previously active shoppers whose engagement has recently dropped off. They respond best to targeted re-engagement campaigns like cashback or exclusive discounts.';
            default: return 'A dynamic behavioral cluster identified by our machine learning pipelines.';
        }
    };

    const [formData, setFormData] = useState({
        age: 25,
        gender: 'Male',
        season: 'Winter',
        category: 'Clothing'
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const qs = new URLSearchParams(formData).toString();
            const res = await fetch(`${BASE}/api/recommend?${qs}`);
            const data = await res.json();
            setResult(data);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch recommendations. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page max-w-5xl space-y-8 animate-in fade-in duration-500 pb-12 pt-20">
            <div>
                <h2 className="text-3xl font-bold">Find My Style Persona</h2>
                <p className="text-[#8A8480] mt-1 font-sans">Discover dynamic, cross-category lifestyle pairings matched directly to behavioral clusters.</p>
            </div>

            <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-8 shadow-lg">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">

                    <div className="space-y-2 lg:col-span-1">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-[#8A8480]">Age: {formData.age}</label>
                        <input
                            type="range"
                            min="18" max="70"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                            className="w-full h-[1px] bg-[#333] rounded-none appearance-none cursor-pointer accent-[#2DD4BF]"
                        />
                    </div>

                    <div className="space-y-2 lg:col-span-1">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-[#8A8480]">Gender</label>
                        <div className="flex bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none">
                            <button
                                type="button"
                                className={`flex-1 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors border-none rounded-none outline-none ${formData.gender === 'Male' ? 'bg-[#2DD4BF] text-[#0F0E0C] font-bold' : 'bg-transparent text-[#8A8480] hover:text-white'}`}
                                onClick={() => setFormData({ ...formData, gender: 'Male' })}
                            >
                                Male
                            </button>
                            <button
                                type="button"
                                className={`flex-1 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors border-none rounded-none outline-none ${formData.gender === 'Female' ? 'bg-[#2DD4BF] text-[#0F0E0C] font-bold' : 'bg-transparent text-[#8A8480] hover:text-white'}`}
                                onClick={() => setFormData({ ...formData, gender: 'Female' })}
                            >
                                Female
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2 lg:col-span-1 relative">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-[#8A8480]">Season</label>
                        <div className="relative">
                            <select
                                className="w-full bg-[#161513] border border-[rgba(255,255,255,0.07)] text-[#F0EDE8] font-mono rounded-none px-3 py-2.5 appearance-none focus:outline-none focus:border-[#2DD4BF] transition-colors"
                                value={formData.season}
                                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                            >
                                {['Winter', 'Spring', 'Summer', 'Fall'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#2DD4BF] font-mono">▾</span>
                        </div>
                    </div>

                    <div className="space-y-2 lg:col-span-1 relative">
                        <label className="font-mono text-[10px] uppercase tracking-wider text-[#8A8480]">Category</label>
                        <div className="relative">
                            <select
                                className="w-full bg-[#161513] border border-[rgba(255,255,255,0.07)] text-[#F0EDE8] font-mono rounded-none px-3 py-2.5 appearance-none focus:outline-none focus:border-[#2DD4BF] transition-colors"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {['Clothing', 'Footwear', 'Accessories', 'Outerwear'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#2DD4BF] font-mono">▾</span>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full disabled:opacity-50 btn-primary"
                        >
                            {loading ? 'ANALYZING...' : 'MATCH STYLE'}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-start space-x-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                    <p className="text-red-300">{error}</p>
                </div>
            )}

            {loading && !error && (
                <div className="space-y-6 animate-pulse">
                    <div className="h-10 w-96 bg-[#161513] rounded-none mt-12 pb-2"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none h-48"></div>)}
                    </div>
                </div>
            )}

            {result && !loading && !error && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                    <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-8 shadow-lg inline-block md:min-w-[500px] border-t-4" style={{ borderTopColor: getSegmentColor(result.segment_match) }}>
                        <h3 className="text-2xl font-bold text-white flex items-center mb-6">
                            You match the <span className="mx-2" style={{ color: getSegmentColor(result.segment_match) }}>{result.segment_match}</span> persona.
                        </h3>
                        <div className="bg-[#0F0E0C] border border-[rgba(255,255,255,0.07)] rounded-none p-5 max-w-2xl">
                            <h4 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8A8480] mb-2">Your Customer Profile</h4>
                            <p className="text-[#F0EDE8] font-sans font-light text-[14px] leading-relaxed">{getSegmentDescription(result.segment_match)}</p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h4 className="label mb-6">Top Recommended Items</h4>
                        {result.recommended_items.length === 0 ? (
                            <div className="p-8 text-center text-[#555] bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none shadow-inner">
                                <Info className="w-12 h-12 mx-auto mb-3 text-[#333]" />
                                <p className="font-mono text-xs">No perfect matches found for this demographic cross-section.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {result.recommended_items.map((item, idx) => (
                                    <div key={idx} className="bg-[#161513] border border-[rgba(255,255,255,0.07)] border-l-[3px] rounded-none p-6 shadow-md hover:bg-[#1C1A17] transition-all flex flex-col justify-between"
                                        style={{ borderLeftColor: getSegmentColor(result.segment_match) }}>
                                        <div>
                                            <h4 className="font-sans font-medium text-offwhite text-lg mb-3 line-clamp-2">{item.name}</h4>
                                            {item.why && (
                                                <p className="font-mono text-[11px] text-[#555] mb-4 leading-relaxed pr-2">
                                                    {item.why}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2 mt-auto pt-4 border-t border-[rgba(255,255,255,0.04)]">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-mono text-[10px] uppercase text-muted tracking-wide flex items-center"><Tag size={12} className="mr-2 opacity-50" /> Category</span>
                                                <span className="text-[#2DD4BF] font-mono text-[11px] uppercase tracking-wide">{item.category}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-mono text-[10px] uppercase text-muted tracking-wide flex items-center"><Palette size={12} className="mr-2 opacity-50" /> Trend Color</span>
                                                <span className="text-[#818CF8] font-mono text-[11px] capitalize flex items-center">
                                                    <span className="w-1.5 h-1.5 rounded-none mr-1.5" style={{ backgroundColor: item.color === 'Unknown' ? 'transparent' : item.color.toLowerCase() }}></span>
                                                    {item.color}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {result.cross_category_suggestions && result.cross_category_suggestions.length > 0 && (
                        <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg mt-8">
                            <h4 className="label mb-4">Others like you also paired this with:</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.cross_category_suggestions.map((cat, i) => (
                                    <span key={i} className="px-3 py-1 bg-transparent text-[#F0EDE8] border border-[rgba(255,255,255,0.07)] rounded-none font-mono text-[11px] uppercase cursor-default transition-colors">
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
}
