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
    Cpu,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Components ---

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="studio-container">
            <header className="studio-header">
                <div className="studio-logo" style={{ color: '#fff' }}>ARBIX<span style={{ color: '#FCD535' }}>STUDIO</span></div>
                <nav className="studio-nav">
                    <a href="#">Home</a>
                    <a href="#">Service</a>
                    <a href="#">Pricing</a>
                    <a href="#">About</a>
                </nav>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <a href="#" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Login</a>
                    <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>Sign Up</button>
                </div>
            </header>

            <main className="studio-hero">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="studio-title">
                        Trading is <span className="studio-subtitle-underlined">Intelligence</span> <br />
                        made visible
                    </h1>

                    <div className="studio-cta-group">
                        <button className="btn-studio" style={{ backgroundColor: '#FCD535', color: '#000' }} onClick={() => navigate('/dashboard')}>
                            Get Started
                        </button>
                        <button className="btn-outline">
                            <Activity size={24} color="#FCD535" /> Play Demo
                        </button>
                    </div>

                    <div className="studio-desc">
                        <p style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>*</span>
                            Arbix autonomously scans markets to bridge the gap between opportunity and execution via risk-adjusted intelligence.
                        </p>
                    </div>
                </motion.div>
            </main>

            {/* Geometric Background Elements */}
            <div className="geo-shapes">
                <div className="shape-white"></div>
                <div className="shape-orange" style={{ backgroundColor: '#FCD535' }}></div>
                <div className="shape-pink" style={{ backgroundColor: '#f3ba2f' }}></div>
            </div>
            <div className="circle-yellow" style={{ backgroundColor: '#ff9900', opacity: 0.6 }}></div>
            <div className="circle-outline"></div>
        </div>
    );
};

const DashboardPage = () => {
    const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
    const [searchInput, setSearchInput] = useState('');
    const [chartType, setChartType] = useState('area');
    const [marketData, setMarketData] = useState(null);
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();
    const wsRef = useRef(null);

    const coins = [
        { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
        { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
        { symbol: 'BNBUSDT', name: 'BNB Chain', icon: '🔶' },
        { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
        { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchInput.trim()) {
            const formattedSymbol = searchInput.trim().toUpperCase();
            const finalSymbol = formattedSymbol.endsWith('USDT') ? formattedSymbol : `${formattedSymbol}USDT`;
            setSelectedCoin(finalSymbol);
            setSearchInput('');
        }
    };

    // Fetch Historical Data to populate the chart
    const fetchHistory = async (symbol) => {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`);
            const data = await response.json();
            if (Array.isArray(data)) {
                const formattedData = data.map(d => ({
                    time: d[0] / 1000,
                    value: parseFloat(d[4]) // Close price
                }));
                if (seriesRef.current) {
                    seriesRef.current.setData(formattedData);
                }
            }
        } catch (error) {
            console.error("History fetch error:", error);
        }
    };

    useEffect(() => {
        if (!selectedCoin) return;

        fetchHistory(selectedCoin);

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
            } else {
                console.error("Symbol error:", payload.error);
                setSelectedCoin('BTCUSDT'); // Fallback
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
            lineColor: '#FCD535',
            topColor: 'rgba(252, 213, 53, 0.2)',
            bottomColor: 'rgba(252, 213, 53, 0)',
            lineWidth: 2,
        });

        seriesRef.current = series;
        chartRef.current = chart;

        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    const formatPrice = (price) => {
        if (!price) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="dashboard-layout">
            <aside className="sidebar-new">
                <div className="logo" style={{ marginBottom: '3rem', fontSize: '1.2rem', fontWeight: 800 }}>
                    <Zap color="#FCD535" fill="#FCD535" size={24} /> ARBIX NODE
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/dashboard" style={{ color: '#FCD535', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem', background: 'rgba(252, 213, 53, 0.05)', borderRadius: '10px' }}>
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
                    <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#111', padding: '0.5rem 1.5rem', borderRadius: '50px', width: '400px', border: searchInput ? '1px solid #FCD535' : '1px solid transparent' }}>
                        <Search size={18} color="#848e9c" />
                        <input
                            type="text"
                            placeholder="Search coins (e.g. BTC, ETH, SOL)..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%' }}
                        />
                    </form>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ background: '#111', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#848e9c' }}>Status:</span> <span style={{ color: '#0ecb81' }}>Live</span>
                        </div>
                        <div style={{ background: '#111', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                            <span style={{ color: '#848e9c' }}>latency:</span> <span style={{ color: '#FCD535' }}>14ms</span>
                        </div>
                    </div>
                </header>

                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2.5rem' }}>{selectedCoin.replace('USDT', '')} <span style={{ color: '#848e9c', fontSize: '1rem' }}>/ USDT</span></h1>
                            <AnimatePresence mode="wait">
                                {marketData && (
                                    <motion.div
                                        key={selectedCoin}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}
                                    >
                                        <span style={{ color: parseFloat(marketData?.change) >= 0 ? '#0ecb81' : '#f6465d', fontWeight: 700 }}>{marketData?.change}%</span>
                                        <span style={{ color: '#fff' }}>H: {formatPrice(marketData?.high)}</span>
                                        <span style={{ color: '#fff' }}>L: {formatPrice(marketData?.low)}</span>
                                        <span style={{ color: '#848e9c' }}>V: {parseFloat(marketData?.volume).toFixed(2)}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setChartType('area')} style={{ background: chartType === 'area' ? '#222' : 'transparent', border: '1px solid #333', color: '#fff', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Area</button>
                            <button style={{ background: 'transparent', border: '1px solid #333', color: '#848e9c', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'not-allowed' }}>Candlestick</button>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', background: '#070707', border: '1px solid #111' }}>
                        <div ref={chartContainerRef} style={{ width: '100%', minHeight: '400px' }} />
                    </div>

                    <div style={{ marginTop: '3rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#848e9c' }}>Pinned Assets</h3>
                        <div className="glass-grid">
                            {coins.map(coin => (
                                <div
                                    key={coin.symbol}
                                    className={`coin-card ${selectedCoin === coin.symbol ? 'active' : ''}`}
                                    onClick={() => setSelectedCoin(coin.symbol)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '1.5rem' }}>{coin.icon}</span>
                                        <TrendingUp size={16} color={selectedCoin === coin.symbol ? '#FCD535' : '#444'} />
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
    const [hotCoins, setHotCoins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotCoins = async () => {
            try {
                const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
                const data = await response.json();
                // Filter top 15 by volume or just take a slice
                const usdtPairs = data.filter(d => d.symbol.endsWith('USDT')).sort((a, b) => b.quoteVolume - a.quoteVolume).slice(0, 15);
                setHotCoins(usdtPairs);
                setLoading(false);
            } catch (error) {
                console.error("Hot coins fetch error:", error);
            }
        };
        fetchHotCoins();
    }, []);

    return (
        <div className="dashboard-layout">
            <aside className="sidebar-new">
                <div className="logo" style={{ marginBottom: '3rem', fontSize: '1.2rem', fontWeight: 800 }}>
                    <Zap color="#FCD535" fill="#FCD535" size={24} /> ARBIX
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/dashboard" style={{ color: '#848e9c', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem' }}>
                        <LayoutDashboard size={20} /> Terminal
                    </Link>
                    <Link to="/coins" style={{ color: '#FCD535', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem', background: 'rgba(252, 213, 53, 0.05)', borderRadius: '10px' }}>
                        <BarChart3 size={20} /> Markets
                    </Link>
                </nav>
            </aside>
            <main className="main-view">
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Global Markets</h1>
                <p style={{ color: '#848e9c', marginBottom: '3rem' }}>Real-time aggregated heatmaps and volume analysis.</p>

                <div className="glass-grid">
                    {loading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem' }}>
                            <RefreshCw className="animate-spin" size={48} color="#FCD535" />
                            <p style={{ marginTop: '1rem' }}>Synchronizing Nodes...</p>
                        </div>
                    ) : (
                        hotCoins.map(coin => (
                            <div key={coin.symbol} className="coin-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontWeight: 800 }}>{coin.symbol.replace('USDT', '')}</span>
                                    <span style={{ color: parseFloat(coin.priceChangePercent) >= 0 ? '#0ecb81' : '#f6465d' }}>
                                        {parseFloat(coin.priceChangePercent).toFixed(2)}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                    ${parseFloat(coin.lastPrice).toLocaleString()}
                                </div>
                                <div style={{ color: '#848e9c', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                    Vol: {parseFloat(coin.quoteVolume).toLocaleString()} USDT
                                </div>
                            </div>
                        ))
                    )}
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
