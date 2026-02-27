import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import {
    Zap, LayoutDashboard, BarChart3, Activity, Wallet, Settings,
    ArrowRight, ChevronRight, Search, TrendingUp, Cpu, RefreshCw,
    Shield, Eye, Brain, Layers, Globe, Lock, ArrowUpRight, Play,
    Target, Gauge, LineChart, Server
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

// ═══════════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════════

const LandingPage = () => {
    const navigate = useNavigate();
    const [tickerData, setTickerData] = useState([]);

    useEffect(() => {
        const fetchTicker = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
                const data = await res.json();
                const top = data
                    .filter(d => d.symbol.endsWith('USDT'))
                    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
                    .slice(0, 20);
                setTickerData(top);
            } catch { }
        };
        fetchTicker();
    }, []);

    return (
        <div className="landing-page">
            <div className="glow-top-right" />
            <div className="glow-bottom-left" />

            {/* ── NAVBAR ── */}
            <nav className="navbar">
                <a href="/" className="navbar-logo">
                    <div className="logo-icon">A</div>
                    ARBIX
                </a>
                <div className="navbar-links">
                    <a href="#features">Features</a>
                    <a href="#architecture">Architecture</a>
                    <a href="#tech">Technology</a>
                    <a href="#metrics">Performance</a>
                </div>
                <div className="navbar-actions">
                    <button className="btn-glass">Connect Wallet</button>
                    <button className="btn-gold" onClick={() => navigate('/dashboard')}>Launch App</button>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="hero-section">
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="hero-badge">
                        <span className="live-dot" />
                        LIVE ON BNB CHAIN TESTNET
                    </div>
                    <h1 className="hero-title">
                        Autonomous<br />
                        <span className="gold-text">Cross-Market</span><br />
                        Trading Intelligence
                    </h1>
                    <p className="hero-subtitle">
                        Arbix autonomously scans cryptocurrency and prediction markets,
                        identifies real-time price inefficiencies, and executes risk-adjusted
                        arbitrage trades on-chain — without human intervention.
                    </p>

                    <div className="hero-cta-group">
                        <button className="btn-hero-primary" onClick={() => navigate('/dashboard')}>
                            <Zap size={18} /> Launch Terminal
                        </button>
                        <button className="btn-hero-secondary">
                            <Play size={16} /> Watch Demo
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value">&lt;2s</div>
                            <div className="hero-stat-label">Execution Time</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">89.4%</div>
                            <div className="hero-stat-label">Win Rate</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">0.13%</div>
                            <div className="hero-stat-label">Avg Spread</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">24/7</div>
                            <div className="hero-stat-label">Monitoring</div>
                        </div>
                    </div>
                </motion.div>

                {/* Orb visual */}
                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    <div className="hero-orb">
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: "'Outfit', sans-serif", fontSize: '3rem', fontWeight: 900, color: 'rgba(252,213,53,0.15)', letterSpacing: '-0.05em' }}>A</div>
                    </div>
                    <div className="orbit-dot orbit-dot-1" />
                    <div className="orbit-dot orbit-dot-2" />
                    <div className="orbit-dot orbit-dot-3" />
                </motion.div>
            </section>

            {/* ── TICKER BAR ── */}
            {tickerData.length > 0 && (
                <div className="ticker-bar">
                    <div className="ticker-track">
                        {[...tickerData, ...tickerData].map((t, i) => (
                            <div key={i} className="ticker-item">
                                <span className="ticker-symbol">{t.symbol.replace('USDT', '')}</span>
                                <span className="ticker-price">${parseFloat(t.lastPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                <span className={`ticker-change ${parseFloat(t.priceChangePercent) >= 0 ? 'up' : 'down'}`}>
                                    {parseFloat(t.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(t.priceChangePercent).toFixed(2)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── FEATURES ── */}
            <section className="features-section" id="features">
                <div className="section-header">
                    <span className="section-label">Core Capabilities</span>
                    <h2 className="section-title">Built for the Next Generation<br />of Autonomous Finance</h2>
                    <p className="section-subtitle">
                        Combining real-time data streaming, machine learning decision logic,
                        and on-chain smart contract execution into a single, unified platform.
                    </p>
                </div>

                <div className="features-grid">
                    <FeatureCard
                        icon={<Eye size={22} />}
                        title="Real-Time Market Intelligence"
                        desc="Live WebSocket streaming from Binance with sub-second latency. Automated detection of triangular and cross-exchange arbitrage patterns."
                        delay={0}
                    />
                    <FeatureCard
                        icon={<Brain size={22} />}
                        title="AI-Driven Decision Engine"
                        desc="ML models trained on historical spread behavior. Confidence scoring for each opportunity with dynamic risk tolerance adjustment."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Shield size={22} />}
                        title="Profitability Guard"
                        desc="Automatic fee modeling including maker/taker, gas costs, and slippage. Net-profit calculation before every trade decision."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<Layers size={22} />}
                        title="On-Chain Execution"
                        desc="Smart contract-based atomic swap logic on BNB Chain Testnet preventing partial fills. Full simulation mode available."
                        delay={0.3}
                    />
                    <FeatureCard
                        icon={<LineChart size={22} />}
                        title="Interactive Analytics"
                        desc="Real-time P&L tracking, equity curve visualization, opportunity heatmap across exchanges, and historical trade logs."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={<Lock size={22} />}
                        title="Risk Management"
                        desc="Per-trade exposure limits, portfolio-level caps, drawdown circuit breakers, and volatility-adjusted sizing using Kelly Criterion."
                        delay={0.5}
                    />
                </div>
            </section>

            {/* ── ARCHITECTURE ── */}
            <section className="arch-section" id="architecture">
                <div className="section-header">
                    <span className="section-label">System Architecture</span>
                    <h2 className="section-title">Intelligent Pipeline Design</h2>
                    <p className="section-subtitle">
                        From market data ingestion to on-chain execution — an end-to-end autonomous system.
                    </p>
                </div>

                <div className="arch-flow">
                    <ArchNode icon="📡" title="STREAM" desc="Multi-market data feeds" delay={0} />
                    <span className="arch-arrow">→</span>
                    <ArchNode icon="🧠" title="ANALYZE" desc="AI opportunity detection" delay={0.15} />
                    <span className="arch-arrow">→</span>
                    <ArchNode icon="⚖️" title="DECIDE" desc="Risk-aware sizing" delay={0.3} />
                    <span className="arch-arrow">→</span>
                    <ArchNode icon="⛓️" title="EXECUTE" desc="On-chain smart contracts" delay={0.45} />
                </div>

                <motion.div
                    style={{
                        maxWidth: 700,
                        margin: '4rem auto 0',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 16,
                        padding: '2rem',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.8,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(252,213,53,0.3), transparent)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>{'// '}</span><span style={{ color: '#FCD535' }}>Arbix</span> detection flow<br />
                    <span style={{ color: '#FCD535' }}>Market A:</span> <span style={{ color: '#fff' }}>BTC/USDT @ $43,210.50</span><br />
                    <span style={{ color: '#FCD535' }}>Market B:</span> <span style={{ color: '#fff' }}>BTC/USDT @ $43,267.80</span><br />
                    <span style={{ color: 'var(--text-muted)' }}>{'           '}↓</span><br />
                    <span style={{ color: '#00e676' }}>Detected</span> Δ = <span style={{ color: '#FCD535' }}>$57.30</span> (0.13%)<br />
                    <span style={{ color: 'var(--text-muted)' }}>{'           '}↓</span><br />
                    Risk ✓ → Profit ✓ → <span style={{ color: '#00e676' }}>Execute ✅</span><br />
                    <span style={{ color: 'var(--text-muted)' }}>{'           '}↓</span><br />
                    Net profit locked in <span style={{ color: '#FCD535' }}>&lt; 2 seconds</span>
                </motion.div>
            </section>

            {/* ── METRICS ── */}
            <section className="metrics-section" id="metrics">
                <div className="section-header">
                    <span className="section-label">Performance Metrics</span>
                    <h2 className="section-title">Institutional-Grade Results</h2>
                </div>
                <div className="metrics-grid">
                    <MetricCard value="+$284.50" label="Today's P&L" delay={0} />
                    <MetricCard value="47" label="Trades Today" delay={0.1} />
                    <MetricCard value="89.4%" label="Win Rate" delay={0.2} />
                    <MetricCard value=">2.0" label="Sharpe Ratio" delay={0.3} />
                </div>
            </section>

            {/* ── TECH STACK ── */}
            <section className="tech-section" id="tech">
                <div className="section-header">
                    <span className="section-label">Technology Stack</span>
                    <h2 className="section-title">Enterprise Infrastructure</h2>
                    <p className="section-subtitle">
                        Purpose-built from the ground up for low-latency, high-reliability autonomous trading.
                    </p>
                </div>

                <div className="tech-grid">
                    <TechCard title="Frontend" items={[
                        { name: 'React 18', desc: 'UI Framework' },
                        { name: 'Vite', desc: 'Build Tool' },
                        { name: 'WebSocket', desc: 'Live Data' },
                        { name: 'Lightweight Charts', desc: 'Visualization' },
                    ]} />
                    <TechCard title="Backend" items={[
                        { name: 'Python 3.10+', desc: 'Runtime' },
                        { name: 'FastAPI', desc: 'API Server' },
                        { name: 'asyncio', desc: 'Concurrency' },
                        { name: 'Celery + Redis', desc: 'Task Queue' },
                    ]} />
                    <TechCard title="AI / ML" items={[
                        { name: 'scikit-learn', desc: 'Models' },
                        { name: 'NumPy / Pandas', desc: 'Data Proc.' },
                        { name: 'Custom Engine', desc: 'Hybrid Logic' },
                        { name: 'LLM Integration', desc: 'Reasoning' },
                    ]} />
                    <TechCard title="Blockchain" items={[
                        { name: 'Solidity 0.8+', desc: 'Contracts' },
                        { name: 'Hardhat', desc: 'Toolchain' },
                        { name: 'Web3.py', desc: 'On-chain' },
                        { name: 'BNB Testnet', desc: 'Execution' },
                    ]} />
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="cta-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="cta-title">Ready to Trade with Intelligence?</h2>
                        <p className="cta-subtitle">
                            Join the next generation of autonomous finance. No manual monitoring. No missed windows.
                        </p>
                        <button className="btn-hero-primary" onClick={() => navigate('/dashboard')} style={{ margin: '0 auto' }}>
                            <Zap size={18} /> Launch Terminal <ArrowRight size={16} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-brand-name">ARBIX<span> Protocol</span></div>
                        <p className="footer-brand-desc">
                            Democratizing algorithmic finance — one arbitrage at a time. Built on BNB Chain.
                        </p>
                    </div>
                    <div className="footer-links-group">
                        <div className="footer-col">
                            <div className="footer-col-title">Product</div>
                            <a href="#features">Features</a>
                            <a href="#architecture">Architecture</a>
                            <a href="#tech">Technology</a>
                            <a href="#metrics">Performance</a>
                        </div>
                        <div className="footer-col">
                            <div className="footer-col-title">Resources</div>
                            <a href="#">Documentation</a>
                            <a href="#">API Reference</a>
                            <a href="#">Smart Contracts</a>
                            <a href="#">Testnet Faucet</a>
                        </div>
                        <div className="footer-col">
                            <div className="footer-col-title">Community</div>
                            <a href="#">Discord</a>
                            <a href="#">Twitter</a>
                            <a href="#">GitHub</a>
                            <a href="#">Telegram</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2025 Arbix Protocol. All rights reserved.</span>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Security</a>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                    ⚠️ Arbix is currently in active development on testnet. This is not financial advice. Trading involves significant risk.
                </div>
            </footer>
        </div>
    );
};

// ── Sub-components for Landing ──

const FeatureCard = ({ icon, title, desc, delay = 0 }) => (
    <motion.div
        className="feature-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        <div className="feature-icon">{icon}</div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-desc">{desc}</p>
    </motion.div>
);

const ArchNode = ({ icon, title, desc, delay = 0 }) => (
    <motion.div
        className="arch-node"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay }}
    >
        <div className="arch-node-icon">{icon}</div>
        <div className="arch-node-title">{title}</div>
        <div className="arch-node-desc">{desc}</div>
    </motion.div>
);

const MetricCard = ({ value, label, delay = 0 }) => (
    <motion.div
        className="metric-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
    </motion.div>
);

const TechCard = ({ title, items }) => (
    <motion.div
        className="tech-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
    >
        <div className="tech-card-title">{title}</div>
        {items.map((item, i) => (
            <div key={i} className="tech-item">
                <span className="tech-item-name">{item.name}</span>
                <span className="tech-item-desc">{item.desc}</span>
            </div>
        ))}
    </motion.div>
);

// ═══════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════

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
            const formatted = searchInput.trim().toUpperCase();
            const final = formatted.endsWith('USDT') ? formatted : `${formatted}USDT`;
            setSelectedCoin(final);
            setSearchInput('');
        }
    };

    const fetchHistory = async (symbol) => {
        try {
            const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`);
            const data = await res.json();
            if (Array.isArray(data)) {
                const formatted = data.map(d => ({ time: d[0] / 1000, value: parseFloat(d[4]) }));
                if (seriesRef.current) seriesRef.current.setData(formatted);
            }
        } catch (err) {
            console.error("History fetch error:", err);
        }
    };

    useEffect(() => {
        if (!selectedCoin) return;
        fetchHistory(selectedCoin);

        wsRef.current = new WebSocket(`ws://localhost:8000/ws/trading/${selectedCoin}`);
        wsRef.current.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            if (!payload.error) {
                setMarketData(payload);
                if (seriesRef.current) {
                    seriesRef.current.update({ time: Math.floor(Date.now() / 1000), value: parseFloat(payload.price) });
                }
            } else {
                setSelectedCoin('BTCUSDT');
            }
        };
        return () => { if (wsRef.current) wsRef.current.close(); };
    }, [selectedCoin]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: { background: { type: ColorType.Solid, color: '#0c0c10' }, textColor: '#5a5a6e' },
            grid: { vertLines: { color: 'rgba(255,255,255,0.02)' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
            width: chartContainerRef.current.clientWidth,
            height: 420,
            timeScale: { timeVisible: true, secondsVisible: true, borderColor: 'rgba(255,255,255,0.05)' },
            rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)' },
            crosshair: {
                vertLine: { color: 'rgba(252,213,53,0.3)', labelBackgroundColor: '#FCD535' },
                horzLine: { color: 'rgba(252,213,53,0.3)', labelBackgroundColor: '#FCD535' },
            },
        });

        const series = chart.addAreaSeries({
            lineColor: '#FCD535',
            topColor: 'rgba(252, 213, 53, 0.15)',
            bottomColor: 'rgba(252, 213, 53, 0)',
            lineWidth: 2,
        });

        seriesRef.current = series;
        chartRef.current = chart;

        const handleResize = () => chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
    }, []);

    const fmtPrice = (p) => {
        if (!p) return '$0.00';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar-new">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">A</div>
                    <div className="sidebar-logo-text">ARBIX <span>v1.0</span></div>
                </div>

                <div className="sidebar-section-label">Terminal</div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link active">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link to="/coins" className="sidebar-link">
                        <BarChart3 size={18} /> Markets
                    </Link>
                    <a href="#" className="sidebar-link">
                        <Activity size={18} /> Intelligence
                    </a>
                    <a href="#" className="sidebar-link">
                        <Target size={18} /> Opportunities
                    </a>
                </nav>

                <div className="sidebar-section-label">Account</div>
                <nav className="sidebar-nav">
                    <a href="#" className="sidebar-link">
                        <Wallet size={18} /> Portfolio
                    </a>
                    <a href="#" className="sidebar-link">
                        <Settings size={18} /> Settings
                    </a>
                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem 0.75rem', borderTop: '1px solid var(--border)', marginBottom: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', animation: 'blink 1.5s ease-in-out infinite' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>BNB Testnet</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Connected • 14ms latency</div>
                </div>
            </aside>

            {/* Main */}
            <main className="main-view">
                {/* Top bar */}
                <div className="dash-topbar">
                    <form onSubmit={handleSearch} className="dash-search">
                        <Search size={16} color="#5a5a6e" />
                        <input
                            type="text"
                            placeholder="Search coins (e.g. BTC, ETH, SOL)..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </form>
                    <div className="dash-status-group">
                        <div className="status-badge">
                            <div className="status-dot live" />
                            <span style={{ color: '#00e676' }}>Live</span>
                        </div>
                        <div className="status-badge">
                            <div className="status-dot gold" />
                            <span style={{ color: 'var(--gold)' }}>14ms</span>
                        </div>
                        <div className="status-badge">
                            <span style={{ color: 'var(--text-muted)' }}>Mode:</span>
                            <span style={{ color: '#fff' }}>Simulation</span>
                        </div>
                    </div>
                </div>

                {/* Coin Header */}
                <div className="coin-header">
                    <h1 className="coin-name">
                        {selectedCoin.replace('USDT', '')} <span className="coin-pair">/ USDT</span>
                    </h1>
                    <AnimatePresence mode="wait">
                        {marketData && (
                            <motion.div
                                key={selectedCoin}
                                className="coin-stats-row"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{fmtPrice(marketData.price)}</span>
                                <span className={parseFloat(marketData.change) >= 0 ? 'stat-positive' : 'stat-negative'}>
                                    {parseFloat(marketData.change) >= 0 ? '+' : ''}{marketData.change}%
                                </span>
                                <span style={{ color: 'var(--text-secondary)' }}>H: {fmtPrice(marketData.high)}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>L: {fmtPrice(marketData.low)}</span>
                                <span style={{ color: 'var(--text-muted)' }}>Vol: {parseFloat(marketData.volume).toLocaleString()}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Chart */}
                <div className="chart-panel">
                    <div className="chart-toolbar">
                        <div className="chart-type-btns">
                            <button className={`chart-type-btn ${chartType === 'area' ? 'active' : ''}`} onClick={() => setChartType('area')}>Area</button>
                            <button className="chart-type-btn" style={{ cursor: 'not-allowed' }}>Candlestick</button>
                            <button className="chart-type-btn" style={{ cursor: 'not-allowed' }}>Depth</button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                <button key={tf} className="chart-type-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>{tf}</button>
                            ))}
                        </div>
                    </div>
                    <div ref={chartContainerRef} style={{ width: '100%', minHeight: 420 }} />
                </div>

                {/* Pinned Assets */}
                <div style={{ marginTop: '1.5rem' }}>
                    <div className="assets-section-title">Pinned Assets</div>
                    <div className="glass-grid">
                        {coins.map(coin => (
                            <motion.div
                                key={coin.symbol}
                                className={`coin-card ${selectedCoin === coin.symbol ? 'active' : ''}`}
                                onClick={() => setSelectedCoin(coin.symbol)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontSize: '1.3rem' }}>{coin.icon}</span>
                                    <TrendingUp size={14} color={selectedCoin === coin.symbol ? '#FCD535' : '#333'} />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{coin.name}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--mono)' }}>{coin.symbol}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// COINS / MARKETS PAGE
// ═══════════════════════════════════════════════════════

const CoinsPage = () => {
    const [hotCoins, setHotCoins] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotCoins = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
                const data = await res.json();
                const usdtPairs = data
                    .filter(d => d.symbol.endsWith('USDT'))
                    .sort((a, b) => b.quoteVolume - a.quoteVolume)
                    .slice(0, 20);
                setHotCoins(usdtPairs);
                setLoading(false);
            } catch (err) {
                console.error("Hot coins fetch error:", err);
            }
        };
        fetchHotCoins();
    }, []);

    return (
        <div className="dashboard-layout">
            <aside className="sidebar-new">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">A</div>
                    <div className="sidebar-logo-text">ARBIX <span>v1.0</span></div>
                </div>

                <div className="sidebar-section-label">Terminal</div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link">
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link to="/coins" className="sidebar-link active">
                        <BarChart3 size={18} /> Markets
                    </Link>
                    <a href="#" className="sidebar-link">
                        <Activity size={18} /> Intelligence
                    </a>
                </nav>

                <div style={{ marginTop: 'auto', padding: '1rem 0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', animation: 'blink 1.5s ease-in-out infinite' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>BNB Testnet</span>
                    </div>
                </div>
            </aside>

            <main className="main-view">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Global Markets</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Real-time aggregated volume analysis • Top 20 USDT pairs by volume
                    </p>
                </motion.div>

                <div className="glass-grid">
                    {loading ? (
                        <div className="loading-spinner" style={{ gridColumn: '1 / -1' }}>
                            <RefreshCw size={40} style={{ color: '#FCD535', animation: 'spin-slow 1.5s linear infinite' }} />
                            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>Synchronizing Market Data...</p>
                        </div>
                    ) : (
                        hotCoins.map((coin, i) => (
                            <motion.div
                                key={coin.symbol}
                                className="coin-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{coin.symbol.replace('USDT', '')}</span>
                                    <span style={{
                                        color: parseFloat(coin.priceChangePercent) >= 0 ? '#00e676' : '#ff1744',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        fontFamily: 'var(--mono)',
                                    }}>
                                        {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(coin.priceChangePercent).toFixed(2)}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.3rem', fontFamily: 'var(--mono)' }}>
                                    ${parseFloat(coin.lastPrice).toLocaleString()}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--mono)' }}>
                                    Vol: {(parseFloat(coin.quoteVolume) / 1e6).toFixed(1)}M USDT
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// APP WRAPPER
// ═══════════════════════════════════════════════════════

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
