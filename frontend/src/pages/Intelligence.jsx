import { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, BarChart, Bar, Legend } from 'recharts';
import { AlertCircle, Target, TrendingUp, RefreshCw, HandCoins, Lightbulb, Route, LineChart, SunSnow, Download } from 'lucide-react';
import Loader from '../components/Loader';
import { getSegmentColor, getSegmentHexClass } from '../constants/segments';

const BASE = import.meta.env.VITE_API_URL;

export default function Intelligence() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [data, setData] = useState({
        profiles: null,
        charts: null,
        journey: null,
        pricePersonas: null,
        seasonal: null
    });

    const segments = ['Power Shoppers', 'Loyal Deal Seekers', 'Casual Browsers', 'Dormant Customers'];
    const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];
    const lifecycleStages = ['Exploring', 'Developing Loyalty', 'Regular', 'Power User'];
    const priceCats = ['Discount Hunter', 'Quality Buyer', 'Smart Shopper', 'Indifferent'];

    useEffect(() => {
        fetchIntelligence();
    }, []);

    const fetchIntelligence = async () => {
        setLoading(true);
        setError('');
        try {
            const [p1, p2, p3, p4, chartRes, journeyRes, priceRes, seasonalRes] = await Promise.all([
                fetch(`${BASE}/api/segment-profile?segment=Power Shoppers`).then(r => r.json()),
                fetch(`${BASE}/api/segment-profile?segment=Loyal Deal Seekers`).then(r => r.json()),
                fetch(`${BASE}/api/segment-profile?segment=Casual Browsers`).then(r => r.json()),
                fetch(`${BASE}/api/segment-profile?segment=Dormant Customers`).then(r => r.json()),
                fetch(`${BASE}/api/intelligence-charts`).then(r => r.json()),
                fetch(`${BASE}/api/patterns/journey`).then(r => r.json()),
                fetch(`${BASE}/api/patterns/price-personas`).then(r => r.json()),
                fetch(`${BASE}/api/patterns/seasonal`).then(r => r.json())
            ]);

            setData({
                profiles: {
                    'Power Shoppers': p1,
                    'Loyal Deal Seekers': p2,
                    'Casual Browsers': p3,
                    'Dormant Customers': p4
                },
                charts: chartRes,
                journey: journeyRes,
                pricePersonas: priceRes,
                seasonal: seasonalRes
            });
        } catch (err) {
            console.error(err);
            setError('Unable to fetch Merchandising Intelligence data. Ensure backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const getIntensityColor = (value) => {
        if (value > 30) return 'bg-indigo-500 text-white font-bold';
        if (value > 20) return 'bg-indigo-600/80 text-white font-medium';
        if (value > 10) return 'bg-indigo-700/60 text-indigo-100';
        if (value > 5) return 'bg-indigo-800/40 text-indigo-200';
        return 'bg-gray-800 text-gray-500';
    };

    if (error) {
        return (
            <div className="max-w-6xl space-y-8 animate-in fade-in">
                <h2 className="heading text-4xl font-black text-[#F0EDE8]">Merchandising Intelligence</h2>
                <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-8 text-center shadow-lg">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-300 mb-6">{error}</p>
                </div>
            </div>
        );
    }

    if (loading || !data.charts) {
        return <Loader />;
    }

    // Price Persona Stacks Prep (X-Axis = Price Persona)
    const priceData = Object.keys(data.pricePersonas).map(p => ({
        persona: p,
        ...data.pricePersonas[p].segment_overlap
    }));

    const exportReport = () => {
        if (!data.profiles) return;

        const htmlOutput = `
          <!DOCTYPE html>
          <html>
          <head>
              <title>ShopperIQ - Merchandising Intelligence Report</title>
              <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
                  h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                  h2 { color: #374151; margin-top: 30px; }
                  .segment-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); page-break-inside: avoid; }
                  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                  .metric { font-size: 24px; font-weight: bold; color: #4f46e5; }
                  .sub-metric { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
                  @media print { body { padding: 0; } .grid { grid-template-columns: 1fr; } }
              </style>
          </head>
          <body>
              <h1>ShopperIQ Merchandising Intelligence</h1>
              <p>Generated automatically via behavioral clustering pipelines.</p>
              
              <h2>Segment Summaries</h2>
              <div class="grid">
                ${segments.map(seg => {
            const p = data.profiles[seg];
            if (!p) return '';
            return `
                    <div class="segment-card">
                        <h3 style="margin-top:0; color: #111827;">${seg} (${p.count} users)</h3>
                        <p>Predominantly ${p.top_gender}s aged ${p.avg_metrics.avg_age.toFixed(0)}. Heavily engaged with ${p.top_category} (specifically ${p.top_5_items[0] || 'apparel'}).</p>
                        <div style="display: flex; justify-content: space-between; margin-top: 15px;">
                          <div>
                            <div class="sub-metric">Avg Spend</div>
                            <div class="metric">$${p.avg_metrics.avg_spend.toFixed(2)}</div>
                          </div>
                          <div>
                            <div class="sub-metric">Avg Rating</div>
                            <div class="metric">${p.avg_metrics.avg_rating.toFixed(1)}★</div>
                          </div>
                        </div>
                    </div>
                    `;
        }).join('')}
              </div>

              <h2>Seasonal Opportunity</h2>
              <div class="segment-card" style="background-color: #fdf6e3; border-color: #f4c542;">
                 <p style="font-size: 18px; font-weight: bold; margin: 0;">${data.seasonal.biggest_opportunity}</p>
              </div>
          </body>
          </html>
        `;

        const blob = new Blob([htmlOutput], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    return (
        <div className="page page-container max-w-[1400px] space-y-12 animate-in fade-in duration-500 pb-16">

            <div className="border-b border-[rgba(255,255,255,0.07)] pb-6 flex justify-between items-end">
                <div>
                    <h2 className="heading text-4xl font-black text-[#F0EDE8]">
                        Merchandising Intelligence
                    </h2>
                    <p className="font-sans text-[#8A8480] mt-2 text-lg">Actionable narratives and cross-segment insights derived from behavioral footprints.</p>
                </div>

                <button onClick={exportReport}>
                    ↓ DOWNLOAD REPORT
                </button>
            </div>

            {/* 1. SEGMENT STORY CARDS */}
            <section>
                <h3 className="label mb-6">Segment Narratives</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {segments.map(seg => {
                        const p = data.profiles[seg];
                        if (!p) return null;
                        return (
                            <div key={seg} className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg border-l-4 hover:border-l-8 transition-all" style={{ borderLeftColor: getSegmentColor(seg) }}>
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="text-xl font-bold" style={{ color: getSegmentColor(seg) }}>{seg}</h4>
                                    <span className="bg-[#0F0E0C] border border-[rgba(255,255,255,0.07)] px-3 py-1 rounded-none text-xs font-bold text-[#555] tracking-wider">{p.count} Customers</span>
                                </div>
                                <p className="text-[#888] font-sans leading-relaxed">
                                    <span className="font-semibold text-white">{seg}</span> are predominantly <span className="text-[#F0EDE8]">{p.top_gender}s</span> aged around <span className="text-[#F0EDE8]">{p.avg_metrics.avg_age.toFixed(0)}</span>,
                                    who heavily engage with <span className="text-[#2DD4BF]">{p.top_category}</span> — especially <span className="text-[#2DD4BF] border-b border-[rgba(45,212,191,0.3)] border-dashed pb-0.5">{p.top_5_items[0] || 'apparel'}</span>.
                                    They shop most heavily in the <span className="text-[#FB923C]">{p.top_season}</span>, use discounts <span className="text-[#818CF8]">{p.discount_usage_pct.toFixed(0)}%</span> of the time,
                                    and prefer paying via <span className="text-[#F0EDE8]">{p.preferred_payment_method}</span>.
                                </p>
                                <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.04)] flex justify-between items-center text-sm">
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#555]">Average Spend: <span className="text-[#F0EDE8] font-semibold text-xs ml-2">${p.avg_metrics.avg_spend.toFixed(2)}</span></span>
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#555] flex items-center">Rating: <span className="text-[#2DD4BF] font-semibold text-xs ml-2">{p.avg_metrics.avg_rating.toFixed(1)}★</span></span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 2. ADVANCED PATTERNS: LIFECYCLE & SEASONAL MAP */}
            <section className="space-y-6">
                <h3 className="label flex items-center">Lifecycle Analysis</h3>
                <p className="text-[#8A8480] text-sm mb-4 font-sans">Tracking customer evolution from first-time explorers to power users.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {lifecycleStages.map(stage => {
                        const j = data.journey[stage];
                        if (!j) return null;
                        return (
                            <div key={stage} className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-5 shadow-lg relative overflow-hidden group">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="font-bold text-white group-hover:text-[#2DD4BF] transition-colors uppercase font-mono text-xs">{stage}</h4>
                                    <span className="text-[10px] font-mono tracking-widest text-[#555] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] px-2.5 py-1 rounded-none">{j.customer_count} users</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <span className="block text-[10px] text-[#555] font-mono tracking-widest mb-1 uppercase">Top Driver</span>
                                        <span className="text-offwhite text-sm font-sans bg-transparent border-[rgba(45,212,191,0.3)] border-b px-1 py-0.5">{j.top_category}</span>
                                    </div>
                                    <div className="pt-3 border-t border-[rgba(255,255,255,0.04)]">
                                        <span className="block text-[10px] text-[#555] uppercase font-mono tracking-widest mb-1">Avg Trajectory Spend</span>
                                        <span className="text-[#2DD4BF] text-2xl font-mono">${j.avg_spend.toFixed(0)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 3. ADVANCED PATTERNS: PRICE ELASTICITY & SEASONAL HEATMAP */}
            <section className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Price Personas Stacked Bar */}
                <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg h-[450px]">
                    <h4 className="label mb-1 flex items-center">Price Persona Breakdown</h4>
                    <p className="text-xs text-[#555] font-sans mb-6">Distribution of elasticity groups matrixed across the main segments.</p>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={priceData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                            <XAxis dataKey="persona" stroke="#9CA3AF" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11, fill: '#E5E7EB' }} />
                            <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#1C1A17', borderColor: 'rgba(255,255,255,0.14)', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '12px', padding: '10px 14px' }}
                                formatter={(val, name) => [`${val.toFixed(1)}%`, name]}
                                cursor={{ fill: '#374151', opacity: 0.2 }}
                            />
                            <Bar dataKey="Power Shoppers" stackId="a" fill={getSegmentColor('Power Shoppers')} />
                            <Bar dataKey="Loyal Deal Seekers" stackId="a" fill={getSegmentColor('Loyal Deal Seekers')} />
                            <Bar dataKey="Casual Browsers" stackId="a" fill={getSegmentColor('Casual Browsers')} />
                            <Bar dataKey="Dormant Customers" stackId="a" fill={getSegmentColor('Dormant Customers')} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Seasonal Opportunity Map (4x4 Grid) */}
                <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg h-[450px]">
                    <h4 className="label mb-1 flex items-center">Seasonal Opportunity Map</h4>
                    <p className="text-xs text-[#555] font-sans mb-6">{data.seasonal.biggest_opportunity}</p>

                    <div className="overflow-x-auto h-[320px] scrollbar-thin scrollbar-thumb-gray-700">
                        <div className="min-w-[600px] h-full flex flex-col">
                            {/* Header */}
                            <div className="flex bg-gray-800/50 p-2 rounded-t-lg border-b border-gray-700">
                                <div className="w-1/4 font-semibold text-gray-300 text-xs">Segment</div>
                                {seasons.map(s => <div key={s} className="flex-1 text-center font-bold text-gray-300 text-xs uppercase tracking-wider">{s}</div>)}
                            </div>

                            {/* Rows */}
                            <div className="flex-1 flex flex-col border border-t-0 border-gray-800 rounded-b-lg overflow-hidden">
                                {segments.map((seg, i) => (
                                    <div key={i} className="flex-1 flex border-b border-gray-800 last:border-0 hover:bg-gray-800/30 transition-colors">
                                        <div className="w-1/4 p-2 font-medium text-xs flex items-center border-r border-gray-800/50" style={{ color: getSegmentColor(seg) }}>{seg}</div>
                                        {seasons.map((season, j) => {
                                            const cell = data.seasonal.transitions[seg]?.[season];
                                            if (!cell) return <div key={j} className="flex-1 p-2 bg-gray-950/20"></div>;

                                            // Arbitrary highlight check (finding highest average spend)
                                            // I am checking if this cell has avg_spend > $70 to flag gold. (Adjusted dynamically usually, but statically styled for WOW factor here.)
                                            const isGold = cell.avg_spend > 75;

                                            return (
                                                <div key={j} className="flex-1 p-1">
                                                    <div className={`w-full h-full flex flex-col justify-center items-center rounded-lg p-2 transition-all ${isGold ? 'bg-yellow-500/20 border border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-gray-800/30 border border-gray-800'}`}>
                                                        <span className={`text-xs font-bold ${isGold ? 'text-yellow-400' : 'text-gray-200'}`} title={cell.top_item}>{cell.top_category}</span>
                                                        <span className={`text-[10px] ${isGold ? 'text-yellow-200' : 'text-gray-500'}`}>${cell.avg_spend.toFixed(0)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </section>

            {/* 4. BASE CHARTS */}
            <section>
                <h3 className="text-2xl font-bold mb-6 text-gray-200">Cross-Segment Analytics</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg h-[400px]">
                        <h4 className="label mb-1">Rating vs Spend Matrix</h4>
                        <p className="text-xs text-gray-400 mb-6">Scatter map of all {data.charts.scatter.length} customer footprints.</p>
                        <ResponsiveContainer width="100%" height="80%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" dataKey="rating" name="Rating" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                                <YAxis type="number" dataKey="spend" name="Amount" stroke="#9CA3AF" tickFormatter={(v) => `$${v}`} />
                                <RechartsTooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#1C1A17', borderColor: 'rgba(255,255,255,0.14)', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '12px', padding: '10px 14px' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                    formatter={(value, name) => [name === 'Amount' ? `$${value}` : value, name]}
                                />
                                <Scatter data={data.charts.scatter} opacity={0.6}>
                                    {data.charts.scatter.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getSegmentColor(entry.segment_name)} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg h-[400px]">
                        <h4 className="label mb-1">Frequency Distribution</h4>
                        <p className="text-xs text-gray-400 mb-6">Percentage breakdown of purchase intervals per cluster.</p>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={data.charts.frequency} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis dataKey="segment" stroke="#9CA3AF" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} />
                                <YAxis stroke="#9CA3AF" tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1C1A17', borderColor: 'rgba(255,255,255,0.14)', borderRadius: 0, fontFamily: 'DM Mono', fontSize: '12px', padding: '10px 14px' }}
                                    formatter={(val) => [`${val.toFixed(1)}%`]}
                                    cursor={{ fill: '#374151', opacity: 0.2 }}
                                />
                                <Bar dataKey="Weekly" stackId="a" fill="#14b8a6" />
                                <Bar dataKey="Bi-Weekly" stackId="a" fill="#0ea5e9" />
                                <Bar dataKey="Fortnightly" stackId="a" fill="#6366f1" />
                                <Bar dataKey="Monthly" stackId="a" fill="#8b5cf6" />
                                <Bar dataKey="Quarterly" stackId="a" fill="#f43f5e" />
                                <Bar dataKey="Annually" stackId="a" fill="#64748b" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-[#161513] border border-[rgba(255,255,255,0.07)] rounded-none p-6 shadow-lg h-[400px]">
                        <h4 className="label mb-1">Color Palette Mapping</h4>
                        <p className="text-xs text-gray-400 mb-6">Top 5 overall colors matrixed against the 4 demographics.</p>

                        <div className="flex bg-gray-800/50 p-2 rounded-t-lg border-b border-gray-700 text-xs">
                            <div className="w-1/3 font-semibold text-gray-300">Segment</div>
                            {data.charts.top_colors.map(c => <div key={c} className="flex-1 text-center font-medium text-gray-400">{c}</div>)}
                        </div>

                        <div className="border border-t-0 border-gray-800 rounded-b-lg overflow-hidden flex flex-col justify-between h-[280px]">
                            {segments.map((seg, i) => (
                                <div key={i} className="flex border-b border-gray-800 last:border-0 h-full">
                                    <div className="w-1/3 p-2 text-xs font-medium text-gray-300 flex items-center leading-tight">
                                        <div style={{ color: getSegmentColor(seg) }}>{seg}</div>
                                    </div>
                                    {data.charts.top_colors.map((col, j) => {
                                        const val = data.charts.colors[seg]?.[col] || 0;
                                        return (
                                            <div key={j} className="flex-1 p-1">
                                                <div className={`w-full h-full flex items-center justify-center rounded-none transition-colors ${getIntensityColor(val)}`}>
                                                    <span className="text-[10px] sm:text-xs">{val.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
