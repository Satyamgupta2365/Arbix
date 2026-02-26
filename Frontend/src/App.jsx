import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    LayoutDashboard,
    Wallet,
    History,
    Settings,
    Cpu,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    BarChart3,
    ShieldCheck,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
    const [data, setData] = useState(null);
    const [trades, setTrades] = useState([
        { id: 1, type: 'BUY', price: 64231.50, amount: '0.042', time: '14:20:01', status: 'COMPLETED' },
        { id: 2, type: 'SELL', price: 64245.20, amount: '0.015', time: '14:21:45', status: 'COMPLETED' },
        { id: 3, type: 'BUY', price: 64210.10, amount: '0.105', time: '14:23:12', status: 'COMPLETED' },
    ]);
    const chartContainerRef = useRef();
    const seriesRef = useRef();
    const wsRef = useRef(null);

    useEffect(() => {
        // WebSocket Connection
        wsRef.current = new WebSocket('ws://localhost:8000/ws/trading');

        wsRef.current.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            setData(payload);

            // Update chart with real price
            if (seriesRef.current) {
                seriesRef.current.update({
                    time: Math.floor(Date.now() / 1000),
                    value: parseFloat(payload.price)
                });
            }
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#000000' },
                textColor: '#848e9c',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 450,
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            rightPriceScale: {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            }
        });

        const series = chart.addAreaSeries({
            lineColor: '#FCD535',
            topColor: 'rgba(252, 213, 53, 0.2)',
            bottomColor: 'rgba(252, 213, 53, 0)',
            lineWidth: 2,
        });

        seriesRef.current = series;

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
        <div className="app-container" style={{ backgroundColor: '#000' }}>
            <aside className="sidebar" style={{ backgroundColor: '#0a0a0a', borderRight: '1px solid #1a1a1a' }}>
                <div className="logo">
                    <Zap size={32} color="#FCD535" fill="#FCD535" strokeWidth={1} />
                    <span style={{ color: '#FCD535', fontSize: '1.5rem', fontWeight: 800 }}>ARBIX</span>
                </div>

                <nav>
                    <a href="#" className="nav-link active">
                        <LayoutDashboard size={20} /> Dashboard
                    </a>
                    <a href="#" className="nav-link">
                        <BarChart3 size={20} /> Markets
                    </a>
                    <a href="#" className="nav-link">
                        <Activity size={20} /> Intelligence
                    </a>
                    <a href="#" className="nav-link">
                        <Wallet size={20} /> Wallet
                    </a>
                    <a href="#" className="nav-link">
                        <ShieldCheck size={20} /> Security
                    </a>
                    <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <a href="#" className="nav-link">
                            <Settings size={20} /> Settings
                        </a>
                    </div>
                </nav>
            </aside>

            <main className="main-content" style={{ background: '#000' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.4rem', color: '#FCD535', letterSpacing: '-0.02em' }}>Trading Terminal</h1>
                        <p style={{ color: '#848e9c', fontSize: '0.95rem' }}>BTC/USDT Spot • Real-time intelligence node</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '0.7rem 1.4rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#111', border: '1px solid #222' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ecb81', boxShadow: '0 0 15px #0ecb81' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0ecb81', letterSpacing: '0.05em' }}>ENGINE ACTIVE</span>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', fontWeight: 700 }}>
                            <RefreshCw size={14} /> LIVE SYNC
                        </button>
                    </div>
                </header>

                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    {/* Top Bar Stats */}
                    <div className="glass-card" style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'space-between', padding: '1.2rem 2.5rem', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                        <div className="stat-group">
                            <span className="stat-label">Last Price</span>
                            <span className="stat-value" style={{ color: '#fff', fontSize: '1.4rem' }}>{data ? formatPrice(data.price) : '---'}</span>
                        </div>
                        <div className="stat-group">
                            <span className="stat-label">24h Change</span>
                            <span className={`stat-value ${parseFloat(data?.change) >= 0 ? 'delta-up' : 'delta-down'}`} style={{ fontSize: '1.4rem' }}>
                                {data ? (parseFloat(data.change) >= 0 ? '+' : '') + data.change + '%' : '---'}
                            </span>
                        </div>
                        <div className="stat-group">
                            <span className="stat-label">24h High</span>
                            <span className="stat-value" style={{ color: '#fff', fontSize: '1.4rem' }}>{data ? formatPrice(data.high) : '---'}</span>
                        </div>
                        <div className="stat-group">
                            <span className="stat-label">24h Low</span>
                            <span className="stat-value" style={{ color: '#fff', fontSize: '1.4rem' }}>{data ? formatPrice(data.low) : '---'}</span>
                        </div>
                        <div className="stat-group">
                            <span className="stat-label">24h Volume</span>
                            <span className="stat-value" style={{ color: '#fff', fontSize: '1.4rem' }}>{data ? parseFloat(data.volume).toFixed(2) : '---'} BTC</span>
                        </div>
                    </div>

                    {/* Main Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel chart-container"
                        style={{ gridColumn: 'span 3', padding: '1.8rem', background: '#050505', border: '1px solid #1a1a1a' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                <h3 style={{ color: '#FCD535', fontSize: '1.2rem', fontWeight: 700 }}>Market Depth Flow</h3>
                                <div style={{ display: 'flex', background: '#111', borderRadius: '6px', padding: '3px', border: '1px solid #222' }}>
                                    {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                        <button key={tf} style={{ background: tf === '1m' ? '#FCD535' : 'transparent', border: 'none', color: tf === '1m' ? '#000' : '#848e9c', padding: '5px 12px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>{tf}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div ref={chartContainerRef} style={{ width: '100%' }} />
                    </motion.div>

                    {/* Right Panel: Trade Log */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel"
                        style={{ gridColumn: 'span 1', padding: '1.8rem', display: 'flex', flexDirection: 'column', background: '#050505', border: '1px solid #1a1a1a' }}
                    >
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#FCD535', fontWeight: 700 }}>Execution Log</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {trades.map(trade => (
                                <div key={trade.id} className="glass-card" style={{ padding: '1rem', background: '#0a0a0a', border: '1px solid #1a1a1a' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ color: trade.type === 'BUY' ? '#0ecb81' : '#f6465d', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.05em' }}>{trade.type}</span>
                                        <span style={{ color: '#848e9c', fontSize: '0.75rem' }}>{trade.time}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>{formatPrice(trade.price)}</span>
                                        <span style={{ color: '#848e9c', fontSize: '0.9rem' }}>{trade.amount} BTC</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2.5rem' }}>
                            <div className="glass-card" style={{ background: 'rgba(252, 213, 53, 0.03)', border: '1px dashed rgba(252, 213, 53, 0.3)', padding: '1.5rem' }}>
                                <p style={{ color: '#FCD535', fontSize: '0.8rem', textAlign: 'center', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1.2rem' }}>TERMINAL CONTROLS</p>
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.9rem', fontWeight: 800 }}>BUY</button>
                                    <button className="btn" style={{ flex: 1, fontSize: '0.9rem', fontWeight: 800, background: '#1a1a1a', color: '#fff', border: '1px solid #333' }}>SELL</button>
                                </div>
                                <button className="btn" style={{ width: '100%', marginTop: '0.8rem', background: 'transparent', color: '#848e9c', fontSize: '0.8rem', border: '1px solid #222' }}>CANCEL ALL</button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{
                __html: `
        .stat-group { display: flex; flex-direction: column; }
        .stat-label { color: #848e9c; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.4rem; font-weight: 500; }
        .stat-value { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: -0.01em; }
        .nav-link.active { color: #FCD535 !important; border-left: 3px solid #FCD535; border-radius: 0; background: linear-gradient(90deg, rgba(252, 213, 53, 0.08) 0%, transparent 100%); font-weight: 700; }
        .btn-primary { background: #FCD535 !important; color: #000 !important; box-shadow: 0 4px 15px rgba(252, 213, 53, 0.2); }
        .btn-primary:hover { background: #f3ba2f !important; transform: translateY(-2px); }
        .delta-up { color: #0ecb81 !important; }
        .delta-down { color: #f6465d !important; }
      `}} />
        </div>
    );
};

export default App;
