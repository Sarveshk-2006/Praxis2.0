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
        <div className="page page-container max-w-5xl space-y-8 animate-in fade-in duration-500 pb-12 pt-20">
            <div>
                <h2 className="text-3xl font-bold">Find My Style Persona</h2>
                <p className="text-[#8A8480] mt-1 font-sans">Discover dynamic, cross-category lifestyle pairings matched directly to behavioral clusters.</p>
            </div>

            <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] p-[32px] px-[40px] rounded-none mb-[32px]">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-between items-end gap-6">

                    <div className="flex-1 space-y-2">
                        <label className="font-mono text-[10px] uppercase text-[#8A8480] flex items-center justify-between">
                            AGE <span className="font-mono text-[24px] text-[#F0EDE8]">{formData.age}</span>
                        </label>
                        <input
                            type="range"
                            min="18" max="70"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                            className="w-full h-[2px] bg-[#333] rounded-none appearance-none cursor-pointer accent-[#2DD4BF]"
                        />
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="font-mono text-[10px] uppercase text-[#8A8480] mb-[8px] block">GENDER</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={`font-mono text-[11px] uppercase transition-colors rounded-none outline-none ${formData.gender === 'Male' ? 'bg-[#2DD4BF] border border-[#2DD4BF] text-[#0F0E0C]' : 'bg-transparent border border-[#333] text-[#8A8480]'} px-[20px] py-[8px] flex-1`}
                                onClick={() => setFormData({ ...formData, gender: 'Male' })}
                            >
                                Male
                            </button>
                            <button
                                type="button"
                                className={`font-mono text-[11px] uppercase transition-colors rounded-none outline-none ${formData.gender === 'Female' ? 'bg-[#2DD4BF] border border-[#2DD4BF] text-[#0F0E0C]' : 'bg-transparent border border-[#333] text-[#8A8480]'} px-[20px] py-[8px] flex-1`}
                                onClick={() => setFormData({ ...formData, gender: 'Female' })}
                            >
                                Female
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2 relative">
                        <label className="font-mono text-[10px] uppercase text-[#8A8480] block">SEASON</label>
                        <select
                            className="w-[160px] bg-[#0F0E0C] border border-[rgba(255,255,255,0.1)] text-[#F0EDE8] font-mono text-[12px] rounded-none px-[14px] py-[10px] appearance-none focus:outline-none focus:border-[rgba(45,212,191,0.5)] transition-colors"
                            value={formData.season}
                            onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                        >
                            {['Winter', 'Spring', 'Summer', 'Fall'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 space-y-2 relative">
                        <label className="font-mono text-[10px] uppercase text-[#8A8480] block">CATEGORY</label>
                        <select
                            className="w-[160px] bg-[#0F0E0C] border border-[rgba(255,255,255,0.1)] text-[#F0EDE8] font-mono text-[12px] rounded-none px-[14px] py-[10px] appearance-none focus:outline-none focus:border-[rgba(45,212,191,0.5)] transition-colors"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            {['Clothing', 'Footwear', 'Accessories', 'Outerwear'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="flex-none">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#0F0E0C] font-mono text-[12px] tracking-[0.12em] uppercase px-[28px] py-[12px] border-none rounded-none cursor-pointer transition-colors"
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

                    <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-[28px] px-[40px] shadow-lg w-full border-l-[4px]" style={{ borderLeftColor: getSegmentColor(result.segment_match) }}>
                        <h4 className="font-mono text-[10px] text-[#8A8480] uppercase mb-1">YOU MATCH THE</h4>
                        <h3 className="font-display text-[32px] mb-4" style={{ color: getSegmentColor(result.segment_match) }}>
                            {result.segment_match}
                        </h3>
                        <h4 className="font-mono text-[10px] text-[#8A8480] uppercase mt-2 mb-1">YOUR CUSTOMER PROFILE</h4>
                        <p className="text-[#8A8480] font-sans text-[14px] leading-relaxed">{getSegmentDescription(result.segment_match)}</p>
                    </div>

                    <div className="mt-12">
                        <h4 className="font-mono text-[10px] text-[#8A8480] uppercase mb-6 tracking-widest">TOP RECOMMENDED ITEMS</h4>
                        {result.recommended_items.length === 0 ? (
                            <div className="p-8 text-center text-[#555] bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none shadow-inner">
                                <Info className="w-12 h-12 mx-auto mb-3 text-[#333]" />
                                <p className="font-mono text-xs">No perfect matches found for this demographic cross-section.</p>
                            </div>
                        ) : (
                            <div className="flex flex-row gap-6">
                                {result.recommended_items.map((item, idx) => (
                                    <div key={idx} className="bg-[#161513] border border-[rgba(255,255,255,0.07)] border-l-[3px] rounded-none p-[20px] px-[24px] shadow-md flex-1 flex flex-col justify-between"
                                        style={{ borderLeftColor: getSegmentColor(result.segment_match) }}>
                                        <div>
                                            <h4 className="font-sans font-medium text-[#F0EDE8] text-[16px] mb-3">{item.name}</h4>
                                            {item.why && (
                                                <p className="font-mono text-[11px] text-[#8A8480] mb-4 leading-relaxed line-clamp-3">
                                                    {item.why}
                                                </p>
                                            )}
                                        </div>
                                        <div className="mt-auto w-full">
                                            <div className="w-full h-[2px] bg-[rgba(255,255,255,0.06)] rounded-none overflow-hidden">
                                                <div className="h-full rounded-none" style={{ width: `${item.confidence * 100}%`, backgroundColor: getSegmentColor(result.segment_match) }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

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
                </div>
            )}
        </div>
    );
}
