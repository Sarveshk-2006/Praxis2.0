import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { X, AlertCircle } from 'lucide-react';
import AnimatedNumber from '../components/AnimatedNumber';
import Loader from '../components/Loader';
import { SEGMENT_COLORS } from '../constants/segments';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const CAT_COLORS = {
    'Clothing': '#2DD4BF',
    'Footwear': '#818CF8',
    'Accessories': '#FB923C',
    'Outerwear': '#44403C'
};

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Demo Mode States
    const [showBanner, setShowBanner] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const fileInputRef = useRef(null);

    const [aiInsight, setAiInsight] = useState('');
    const [loadingInsight, setLoadingInsight] = useState(false);
    const [insightError, setInsightError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_URL}/api/stats`);
            setData(res.data);
        } catch (err) {
            console.error("Error fetching dashboard data:", err);
            setError('Unable to connect to server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setUploadStatus(null);

        try {
            await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadStatus('success');
            fetchData();
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadStatus('error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const generateGeminiInsight = async () => {
        if (!data) return;

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            setInsightError('Please add your VITE_GEMINI_API_KEY to the .env file.');
            return;
        }

        setLoadingInsight(true);
        setInsightError('');

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const topCat = Object.keys(data.category_breakdown)[0] || 'Unknown';
            const prompt = `You are a retail business analyst. Look at these stats for a store:
      - Total Customers: ${data.total_customers}
      - Avg Purchase Amount: $${data.avg_purchase_amount.toFixed(2)}
      - Subscription Rate: ${data.subscription_rate.toFixed(1)}%
      - Discount Usage Rate: ${data.discount_usage_rate.toFixed(1)}%
      - Top Category: ${topCat}
      - Male vs Female split: ${data.gender_split['Male']?.toFixed(1) || 0}% Male, ${data.gender_split['Female']?.toFixed(1) || 0}% Female
      
      Write exactly 3 sentences of natural language business insight based on this data. Make it sound professional and actionable.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAiInsight(response.text());
        } catch (err) {
            console.error(err);
            setInsightError('Failed to generate insight from Gemini API.');
        } finally {
            setLoadingInsight(false);
        }
    };

    if (error) {
        return (
            <div className="absolute inset-0 pt-8 px-12 animate-in">
                <div className="card max-w-2xl border-danger">
                    <AlertCircle className="w-12 h-12 text-danger mb-4" />
                    <h3 className="heading text-[24px] mb-2">System Error</h3>
                    <p className="text-muted mb-6">{error}</p>
                    <button onClick={fetchData} className="num text-[12px] bg-white/5 px-4 py-2 hover:bg-white/10 transition-colors">RETRY CONNECTION</button>
                </div>
            </div>
        );
    }

    if (loading || !data) {
        return <Loader />;
    }

    const catData = Object.entries(data.category_breakdown).map(([name, value]) => ({ name, value }));
    const topCat = catData.sort((a, b) => b.value - a.value)[0]?.name || 'items';
    const topSeason = [...data.season_revenue].sort((a, b) => b.total_revenue - a.total_revenue)[0]?.season || 'Winter';
    const subRate = data.subscription_rate.toFixed(1);

    const tickerItems = [
        `POWER SHOPPERS DRIVE REVENUE`,
        `${topSeason.toUpperCase()} IS PEAK SEASON FOR ${topCat.toUpperCase()}`,
        `${subRate}% OF CUSTOMERS ARE SUBSCRIBED`,
        `AVERAGE LIFETIME RATING IS ${data.avg_rating.toFixed(2)}★`,
        `DISCOUNT UTILIZATION AT ${data.discount_usage_rate.toFixed(1)}%`
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#1C1A17', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '12px', padding: '10px 14px' }} className="shadow-2xl z-50">
                    <p className="text-muted text-[10px] mb-1">{payload[0].name || payload[0].payload.season}</p>
                    <p className="text-[#2DD4BF] font-bold">
                        {payload[0].name ? payload[0].value.toFixed(1) + '%' : '$' + payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="page absolute inset-0 bg-base overflow-x-hidden flex flex-col justify-between">
            <style>{`
                @keyframes ticker {
                    0% { transform: translateX(100vw); }
                    100% { transform: translateX(-100%); }
                }
                .ticker-content {
                    display: inline-block;
                    white-space: nowrap;
                    animation: ticker 30s linear infinite;
                    will-change: transform;
                }
                .recharts-pie-label-text {
                    font-family: 'DM Mono', monospace;
                    font-size: 10px;
                    fill: var(--offwhite);
                }
                .recharts-pie-label-line {
                    stroke: var(--muted);
                }
            `}</style>

            <div className="absolute top-8 right-12 z-50 flex items-center space-x-6">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="nav-link flex items-center gap-2">
                    {uploading ? 'UPLOADING...' : 'UPLOAD CSV'}
                </button>
                <button onClick={() => setShowModal(true)} className="nav-link flex items-center gap-2 text-[#2DD4BF] hover:text-[#2DD4BF]/80">
                    KEY FINDINGS
                </button>
            </div>

            <div className="flex-1 px-12 pt-20 pb-12 w-full max-w-[1500px] mx-auto flex flex-col justify-center animate-in">
                {/* TOP SECTION — HEADLINE ROW */}
                <div className="flex flex-col md:flex-row mb-16">
                    <div className="w-full md:w-[60%] pr-8">
                        <div className="label mb-6">SHOPPER BEHAVIOR ANALYSIS PLATFORM</div>
                        <h1 className="heading text-[72px] leading-[1.0] text-offwhite mb-4">
                            3,900 Customers.<br />Decoded.
                        </h1>
                        <p className="font-sans font-light text-[15px] text-[#8A8480] max-w-lg leading-relaxed">
                            Real-time segmentation tracking demographics, price elasticity, and behavior clusters across <span className="text-white font-medium">{data.total_customers.toLocaleString()}</span> footprints.
                        </p>
                    </div>

                    <div className="w-full md:w-[40%] pl-8 border-l border-[rgba(45,212,191,0.3)] mt-12 md:mt-2 flex flex-col justify-center gap-6">
                        <div className="flex justify-between items-end num text-[13px] w-full">
                            <span className="text-muted tracking-widest text-[11px]">TOTAL CUSTOMERS</span>
                            <span className="flex-1 border-b border-dotted border-muted/30 mx-3 mb-[3px]"></span>
                            <span className="text-offwhite"><AnimatedNumber value={data.total_customers} /></span>
                        </div>
                        <div className="flex justify-between items-end num text-[13px] w-full">
                            <span className="text-muted tracking-widest text-[11px]">AVG PURCHASE</span>
                            <span className="flex-1 border-b border-dotted border-muted/30 mx-3 mb-[3px]"></span>
                            <span className="text-offwhite">$<AnimatedNumber value={data.avg_purchase_amount} isFloat decimals={2} /></span>
                        </div>
                        <div className="flex justify-between items-end num text-[13px] w-full">
                            <span className="text-muted tracking-widest text-[11px]">AVG RATING</span>
                            <span className="flex-1 border-b border-dotted border-muted/30 mx-3 mb-[3px]"></span>
                            <span className="text-offwhite"><AnimatedNumber value={data.avg_rating} isFloat decimals={2} />★</span>
                        </div>
                        <div className="flex justify-between items-end num text-[13px] w-full">
                            <span className="text-muted tracking-widest text-[11px]">SUBSCRIPTION RATE</span>
                            <span className="flex-1 border-b border-dotted border-muted/30 mx-3 mb-[3px]"></span>
                            <span className="text-offwhite"><AnimatedNumber value={data.subscription_rate} isFloat decimals={1} />%</span>
                        </div>
                        <div className="flex justify-between items-end num text-[13px] w-full">
                            <span className="text-muted tracking-widest text-[11px]">DISCOUNT USAGE</span>
                            <span className="flex-1 border-b border-dotted border-muted/30 mx-3 mb-[3px]"></span>
                            <span className="text-offwhite"><AnimatedNumber value={data.discount_usage_rate} isFloat decimals={1} />%</span>
                        </div>
                    </div>
                </div>

                {/* MIDDLE SECTION — CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="w-full h-[300px] relative">
                        <div className="label mb-8">REVENUE BY SEASON</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.season_revenue} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                                <XAxis dataKey="season" stroke="#8A8480" tickLine={false} axisLine={false} tick={{ fontFamily: 'DM Mono', fontSize: 10, fill: '#8A8480' }} dy={10} />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                                <Bar dataKey="total_revenue" fill="#2DD4BF" activeBar={{ fill: '#5EEAD4' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="w-full h-[300px] relative">
                        <div className="label mb-8 text-right">PURCHASE CATEGORIES</div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={catData}
                                    innerRadius={60}
                                    outerRadius={90}
                                    dataKey="value"
                                    stroke="none"
                                    label={({ name }) => name.toUpperCase()}
                                >
                                    {catData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CAT_COLORS[entry.name] || '#888888'} stroke={entry.name === 'Outerwear' ? '#8A8480' : 'none'} />
                                    ))}
                                </Pie>
                                <RechartsTooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* BOTTOM SECTION — INSIGHT TICKER */}
            <div className="w-full border-y border-[rgba(255,255,255,0.07)] bg-surface py-3 mt-auto shrink-0 overflow-hidden z-20">
                <div className="ticker-content font-mono text-[11px] tracking-widest text-[#8A8480]">
                    {tickerItems.map((item, idx) => (
                        <span key={idx}>
                            <span className="text-[#2DD4BF] mx-8">◆</span>
                            {item}
                        </span>
                    ))}
                    {tickerItems.map((item, idx) => (
                        <span key={`dup-${idx}`}>
                            <span className="text-[#2DD4BF] mx-8">◆</span>
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* KEY FINDINGS MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-base/90 backdrop-blur-sm z-50 flex items-center justify-center animate-in">
                    <div className="card w-full max-w-2xl mx-4 card-accent">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-muted hover:text-offwhite transition-colors">
                            <X size={24} />
                        </button>

                        <div className="label mb-6">LIVE PIPELINE FINDINGS</div>

                        <div className="space-y-6">
                            <div className="flex border-b border-border pb-4">
                                <span className="w-1/3 num text-[11px] text-muted">VOLUME DRIVER</span>
                                <span className="w-2/3 font-sans text-[15px]">{Object.keys(data.category_breakdown)[0]} represents {Object.values(data.category_breakdown)[0].toFixed(1)}% of total platform volume.</span>
                            </div>
                            <div className="flex border-b border-border pb-4">
                                <span className="w-1/3 num text-[11px] text-muted">DEMOGRAPHICS</span>
                                <span className="w-2/3 font-sans text-[15px]">Ratio leans {(Math.max(data.gender_split['Male'] || 0, data.gender_split['Female'] || 0)).toFixed(1)}% towards {data.gender_split['Male'] > data.gender_split['Female'] ? 'Male' : 'Female'} customers.</span>
                            </div>
                            <div className="flex border-b border-border pb-4">
                                <span className="w-1/3 num text-[11px] text-muted">REVENUE PEAK</span>
                                <span className="w-2/3 font-sans text-[15px]">Peak revenue driven in {data.season_revenue.sort((a, b) => b.total_revenue - a.total_revenue)[0]?.season} at ${(data.season_revenue.sort((a, b) => b.total_revenue - a.total_revenue)[0]?.total_revenue / 1000).toFixed(1)}k.</span>
                            </div>
                            <div className="flex border-b border-border pb-4">
                                <span className="w-1/3 num text-[11px] text-muted">LOYALTY</span>
                                <span className="w-2/3 font-sans text-[15px]">Subscription rate holds at {data.subscription_rate.toFixed(1)}% alongside a {data.discount_usage_rate.toFixed(1)}% discount utilization.</span>
                            </div>
                            <div className="flex">
                                <span className="w-1/3 num text-[11px] text-muted">SATISFACTION</span>
                                <span className="w-2/3 font-sans text-[15px]">Strong {data.avg_rating.toFixed(2)}★ average rating across {data.total_customers.toLocaleString()} active users.</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
