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
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const chartContainerRef = useRef();
    const seriesRef = useRef();
    const wsRef = useRef(null);

    useEffect(() => {
        // WebSocket Connection
        wsRef.current = new WebSocket('ws://localhost:8000/ws/trading');

        wsRef.current.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            setData(payload);

            // Update chart
            if (seriesRef.current) {
                seriesRef.current.update({
                    time: Math.floor(Date.now() / 1000),
                    value: parseFloat(payload.price)
                });
            }
        };

        wsRef.current.onclose = () => {
            console.log('WS Disconnected');
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
            }
        });

        const series = chart.addAreaSeries({
            lineColor: '#00f2fe',
            topColor: 'rgba(0, 242, 254, 0.4)',
            bottomColor: 'rgba(0, 242, 254, 0)',
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div className="logo">
                    <Cpu size={32} strokeWidth={2.5} />
                    <span>ARBIX</span>
                </div>

                <nav>
                    <a href="#" className="nav-link active">
                        <LayoutDashboard size={20} /> Dashboard
                    </a>
                    <a href="#" className="nav-link">
                        <Activity size={20} /> Live Arbitrage
                    </a>
                    <a href="#" className="nav-link">
                        <Wallet size={20} /> Portfolio
                    </a>
                    <a href="#" className="nav-link">
                        <History size={20} /> Trade History
                    </a>
                    <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <a href="#" className="nav-link">
                            <Settings size={20} /> Settings
                        </a>
                    </div>
                </nav>
            </aside>

            <main className="main-content">
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Market Intelligence</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Real-time autonomous scanning & execution engine.</p>
                    </div>
                    <div className="glass-panel" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>SYSTEM LIVE</span>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                            <RefreshCw size={16} /> Re-Sync
                        </button>
                    </div>
                </header>

                <div className="dashboard-grid">
                    {/* Stats Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card stat-card"
                    >
                        <span className="stat-label">Active Symbol</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <TrendingUp size={24} color="var(--primary)" />
                            <span className="stat-value">{data?.symbol || 'BTC / USDT'}</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card stat-card"
                    >
                        <span className="stat-label">Current Price</span>
                        <span className="stat-value" style={{ color: '#fff' }}>
                            {data ? formatPrice(data.price) : 'Loading...'}
                        </span>
                        <div className={`stat-delta ${parseFloat(data?.change) >= 0 ? 'delta-up' : 'delta-down'}`}>
                            {parseFloat(data?.change) >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            {data?.change}% (24h)
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card stat-card"
                    >
                        <span className="stat-label">Performance Core</span>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span className="stat-value" style={{ color: 'var(--accent)' }}>94.2</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Confidence Score</span>
                        </div>
                    </motion.div>

                    {/* Chart Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-panel chart-container"
                        style={{ padding: '2rem' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Price Analytics</h3>
                            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                <span>H: {data ? formatPrice(data.high) : '-'}</span>
                                <span>L: {data ? formatPrice(data.low) : '-'}</span>
                            </div>
                        </div>
                        <div ref={chartContainerRef} style={{ width: '100%', height: '350px' }} />
                    </motion.div>

                    {/* Action Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-panel"
                        style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                    >
                        <h3 style={{ fontSize: '1.25rem' }}>Execution Quick-Action</h3>
                        <div className="glass-card" style={{ background: 'rgba(0, 242, 254, 0.05)', borderColor: 'rgba(0, 242, 254, 0.2)' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>AI OPPORTUNITY DETECTED</p>
                            <p style={{ fontSize: '1rem', fontWeight: 600 }}>Spread: 0.12% between Binance/Pancake</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn btn-primary" style={{ width: '100%' }}>Execute Trade</button>
                            <button className="btn" style={{ width: '100%', background: 'var(--surface-hover)', color: '#fff' }}>Ignore Signal</button>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                * All trades are evaluated against risk parameters before execution.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default App;
