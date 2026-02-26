import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import {
    Zap,
    LayoutDashboard,
    BarChart3,
    Activity,
    Wallet,
    Settings,
    ArrowRight,
    ChevronRight,
    Search,
    TrendingUp,
    Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Assets ---
const ORB_IMAGE = "/cyber-trading-orb.png"; // Placeholder for the generated image

// --- Components ---

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="hero-container">
            <nav className="navbar">
                <div className="logo" style={{ color: '#fff', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Zap color="#C5FF2B" fill="#C5FF2B" /> LEARNME
                </div>
                <div className="nav-links">
                    <a href="#">Home</a>
                    <a href="#">About</a>
                    <a href="#">Security</a>
                    <a href="#">Features</a>
                </div>
                <button className="btn-start" style={{ padding: '0.8rem 2rem' }}>Join Now</button>
            </nav>

            <div className="hero-content">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hero-text"
                >
                    <h1 className="hero-title">Keep Trading <br /> On Track</h1>
                    <p className="hero-subtitle">
                        Elevate your asset management with our cutting-edge autonomous intelligence.
                        Join Arbix for Comprehensive Real-time Insights.
                    </p>
                    <button className="btn-start" onClick={() => navigate('/dashboard')}>
                        Start Now <ArrowRight size={20} />
                    </button>
                </motion.div>

                <div className="hero-orb floating">
                    <img src={ORB_IMAGE} alt="Orb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
            </div>

            <div className="floating-cards">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mini-card card-pink">
                    <div className="card-title">Market <br /> Mastery</div>
                    <div className="card-desc">Learn the fundamentals of effective trading and risk management strategies.</div>
                </motion.div>
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="mini-card card-teal">
                    <div className="card-title">Strategic <br /> Arbitrage</div>
                    <div className="card-desc">Identify cross-market price gaps with sub-millisecond precision.</div>
                </motion.div>
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mini-card card-glass">
                    <div className="card-title">Autonomous <br /> Intelligence</div>
                    <div className="card-desc">Deploy AI agents to monitor and execute trades 24/7 without intervention.</div>
                </motion.div>
            </div>

            <div style={{ position: 'absolute', bottom: '5%', right: '5%', textAlign: 'right' }}>
                <div style={{ fontSize: '3rem', fontWeight: 800 }}>1.2K+</div>
                <div style={{ color: 'var(--text-muted)' }}>Active Intelligent Agents</div>
            </div>
        </div>
    );
};

const DashboardPage = () => {
    const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
    const [chartType, setChartType] = useState('area');
    const [marketData, setMarketData] = useState(null);
    const chartContainerRef = useRef();
    const seriesRef = useRef();
    const wsRef = useRef(null);

    const coins = [
        { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
        { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
        { symbol: 'BNBUSDT', name: 'BNB Chain', icon: '🔶' },
        { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
        { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
    ];

    useEffect(() => {
        // Connect to Backend WebSocket for the selected coin
        wsRef.current = new WebSocket(`ws://localhost:8000/ws/trading/${selectedCoin}`);

        wsRef.current.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (!payload.error) {
                setMarketData(payload);
                if (seriesRef.current) {
                    seriesRef.current.update({
                        time: Math.floor(Date.now() / 1000),
                        value: parseFloat(payload.price)
                    });
                }
            }
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [selectedCoin]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: '#000000' }, textColor: '#848e9c' },
            grid: { vertLines: { color: '#111' }, horzLines: { color: '#111' } },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: { timeVisible: true, secondsVisible: true },
        });

        const series = chart.addAreaSeries({
            lineColor: '#C5FF2B',
            topColor: 'rgba(197, 255, 43, 0.2)',
            bottomColor: 'rgba(197, 255, 43, 0)',
            lineWidth: 2,
        });

        seriesRef.current = series;
        return () => chart.remove();
    }, []);

    return (
        <div className="dashboard-layout">
            <aside className="sidebar-new">
                <div className="logo" style={{ marginBottom: '3rem', fontSize: '1.2rem', fontWeight: 800 }}>
                    <Zap color="#C5FF2B" fill="#C5FF2B" size={24} /> ARBIX NODE
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/dashboard" style={{ color: '#C5FF2B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem', background: 'rgba(197, 255, 43, 0.05)', borderRadius: '10px' }}>
                        <LayoutDashboard size={20} /> Terminal
                    </Link>
                    <Link to="/coins" style={{ color: '#848e9c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem' }}>
                        <BarChart3 size={20} /> Markets
                    </Link>
                    <a href="#" style={{ color: '#848e9c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem' }}>
                        <Activity size={20} /> Intelligence
                    </a>
                    <a href="#" style={{ color: '#848e9c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem' }}>
                        <Wallet size={20} /> Wallet
                    </a>
                </nav>
            </aside>

            <main className="main-view">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#111', padding: '0.5rem 1.5rem', borderRadius: '50px', width: '400px' }}>
                        <Search size={18} color="#848e9c" />
                        <input type="text" placeholder="Search Markets..." style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ background: '#111', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#848e9c' }}>Status:</span> <span style={{ color: '#0ecb81' }}>Live</span>
                        </div>
                        <div style={{ background: '#111', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#848e9c' }}>latency:</span> <span style={{ color: '#C5FF2B' }}>14ms</span>
                        </div>
                    </div>
                </header>

                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
                        <h1 style={{ fontSize: '2.5rem' }}>{selectedCoin.replace('USDT', '')} <span style={{ color: '#848e9c', fontSize: '1rem' }}>/ USDT</span></h1>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setChartType('area')} style={{ background: chartType === 'area' ? '#222' : 'transparent', border: '1px solid #333', color: '#fff', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Area</button>
                            <button onClick={() => setChartType('candle')} style={{ background: chartType === 'candle' ? '#222' : 'transparent', border: '1px solid #333', color: '#fff', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Candlestick</button>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: '#070707', border: '1px solid #111' }}>
                        <div ref={chartContainerRef} style={{ width: '100%', minHeight: '400px' }} />
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#848e9c' }}>Quick Access Assets</h3>
                        <div className="glass-grid">
                            {coins.map(coin => (
                                <div
                                    key={coin.symbol}
                                    className={`coin-card ${selectedCoin === coin.symbol ? 'active' : ''}`}
                                    onClick={() => setSelectedCoin(coin.symbol)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{coin.icon}</span>
                                        <TrendingUp size={16} color={selectedCoin === coin.symbol ? '#C5FF2B' : '#444'} />
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{coin.name}</div>
                                    <div style={{ color: '#848e9c', fontSize: '0.8rem' }}>{coin.symbol}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

const CoinsPage = () => {
    return (
        <div className="dashboard-layout">
            <aside className="sidebar-new">
                <div className="logo" style={{ marginBottom: '3rem', fontSize: '1.2rem', fontWeight: 800 }}>
                    <Zap color="#C5FF2B" fill="#C5FF2B" size={24} /> ARBIX
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/dashboard" style={{ color: '#848e9c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem' }}>
                        <LayoutDashboard size={20} /> Terminal
                    </Link>
                    <Link to="/coins" style={{ color: '#C5FF2B', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem', background: 'rgba(197, 255, 43, 0.05)', borderRadius: '10px' }}>
                        <BarChart3 size={20} /> Markets
                    </Link>
                </nav>
            </aside>
            <main className="main-view">
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Market Explorer</h1>
                <p style={{ color: '#848e9c', marginBottom: '3rem' }}>Monitor and analyze over 500+ algorithmic trading pairs.</p>

                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <Cpu size={64} color="#C5FF2B" style={{ marginBottom: '1.5rem' }} />
                    <h2>Intellegence Nodes Processing</h2>
                    <p style={{ color: '#848e9c', marginTop: '1rem' }}>The full market explorer is aggregating real-time order books from 12 exchanges.</p>
                    <button className="btn-start" style={{ marginTop: '2rem' }}>Enable Global Scan</button>
                </div>
            </main>
        </div>
    );
};

// --- App Wrapper ---

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/coins" element={<CoinsPage />} />
            </Routes>
        </Router>
    );
}

export default App;
