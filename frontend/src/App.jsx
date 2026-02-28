import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Affinity from './pages/Affinity';
import Segments from './pages/Segments';
import Recommend from './pages/Recommend';
import Intelligence from './pages/Intelligence';
import Insights from './pages/Insights';
import { useState, useEffect } from 'react';
import { Activity, Database, GitBranch, CheckCircle2 } from 'lucide-react';
import CustomCursor from './components/CustomCursor';

function App() {
  const [appInitializing, setAppInitializing] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    // Simulated ML Pipeline Loading Sequence for Demo Mode
    const stages = [
      { step: 1, duration: 800 },
      { step: 2, duration: 1200 },
      { step: 3, duration: 1000 }
    ];

    let timer1 = setTimeout(() => setLoadingStep(1), stages[0].duration);
    let timer2 = setTimeout(() => setLoadingStep(2), stages[0].duration + stages[1].duration);
    let timer3 = setTimeout(() => {
      setLoadingStep(3);
      setTimeout(() => setAppInitializing(false), 500); // fade out
    }, stages[0].duration + stages[1].duration + stages[2].duration);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  if (appInitializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white transition-opacity duration-1000 fixed inset-0 z-50">
        <div className="max-w-md w-full p-8 border border-white/10 rounded-none bg-[#111] shadow-2xl">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-[#111] border border-gold rounded-none shadow-[0_0_30px_rgba(232,197,71,0.1)] flex items-center justify-center animate-pulse">
              <Activity size={32} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-8">Shopper<span className="text-indigo-500">IQ</span> Pipeline</h2>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-none border flex items-center justify-center font-mono text-[11px] ${loadingStep >= 0 ? 'bg-gold text-black border-gold' : 'bg-[#111] text-[#555] border-[#333]'}`}>
                {loadingStep > 0 ? <CheckCircle2 size={16} /> : <Database size={16} className="animate-pulse" />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${loadingStep >= 0 ? 'text-white' : 'text-gray-500'}`}>Loading core matrix data...</p>
                <div className="w-full h-1 bg-[#1A1A1A] mt-2 overflow-hidden rounded-none">
                  <div className={`h-full bg-gold transition-all duration-700 ${loadingStep > 0 ? 'w-full' : 'w-1/2'}`}></div>
                </div>
              </div>
            </div>

            <div className={`flex items-center space-x-4 transition-opacity duration-500 ${loadingStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-none border flex items-center justify-center font-mono text-[11px] ${loadingStep >= 1 ? 'bg-gold text-black border-gold' : 'bg-[#111] text-[#555] border-[#333]'}`}>
                {loadingStep > 1 ? <CheckCircle2 size={16} /> : <GitBranch size={16} className={loadingStep === 1 ? 'animate-pulse' : ''} />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${loadingStep >= 1 ? 'text-white' : 'text-gray-500'}`}>Analyzing centroids & schemas...</p>
                <div className="w-full h-1 bg-[#1A1A1A] mt-2 overflow-hidden rounded-none">
                  <div className={`h-full bg-gold transition-all duration-1000 ${loadingStep > 1 ? 'w-full' : loadingStep === 1 ? 'w-2/3' : 'w-0'}`}></div>
                </div>
              </div>
            </div>

            <div className={`flex items-center space-x-4 transition-opacity duration-500 ${loadingStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-none border flex items-center justify-center font-mono text-[11px] ${loadingStep >= 2 ? 'bg-gold text-black border-gold' : 'bg-[#111] text-[#555] border-[#333]'}`}>
                {loadingStep > 2 ? <CheckCircle2 size={16} /> : <Activity size={16} className={loadingStep === 2 ? 'animate-pulse' : ''} />}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${loadingStep >= 2 ? 'text-white' : 'text-gray-500'}`}>Computing behavior networks...</p>
                <div className="w-full h-1 bg-[#1A1A1A] mt-2 overflow-hidden rounded-none">
                  <div className={`h-full bg-green-500 transition-all duration-700 ${loadingStep > 2 ? 'w-full' : loadingStep === 2 ? 'w-3/4' : 'w-0'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-base text-offwhite font-sans relative">
        <CustomCursor />
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto w-full z-0 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/affinity" element={<Affinity />} />
            <Route path="/segments" element={<Segments />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/intelligence" element={<Intelligence />} />
            <Route path="/insights" element={<Insights />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
