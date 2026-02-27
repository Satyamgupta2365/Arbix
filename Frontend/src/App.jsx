import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import {
    Zap, LayoutDashboard, BarChart3, Activity, Wallet, Settings,
    ArrowRight, ChevronRight, Search, TrendingUp, Cpu, RefreshCw,
    Shield, Eye, Brain, Layers, Globe, Lock, ArrowUpRight, Play,
    Target, Gauge, LineChart, Server, CheckCircle, Clock, Users,
    Sparkles, ChevronDown, ExternalLink, Star, Award, Hexagon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ═══════════════════════════════════════════════════════
// LOGO COMPONENT
// ═══════════════════════════════════════════════════════

const ArbixLogo = ({ size = 'default' }) => {
    const sizes = {
        small: { icon: 24, text: '1rem', gap: '0.4rem' },
        default: { icon: 32, text: '1.5rem', gap: '0.5rem' },
        large: { icon: 40, text: '2rem', gap: '0.6rem' },
    };
    const s = sizes[size];
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: s.gap }}>
            <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#FCD535" />
                <path d="M20 8L28 28H22L20 22.5L18 28H12L20 8Z" fill="#000" strokeLinejoin="round" />
                <circle cx="20" cy="14" r="2" fill="#000" opacity="0.3" />
            </svg>
            <span style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: s.text,
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#fff',
            }}>
                ARB<span style={{ color: '#FCD535' }}>IX</span>
            </span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// ANIMATED NUMBER COUNTER
// ═══════════════════════════════════════════════════════

const AnimatedCounter = ({ end, prefix = '', suffix = '', decimals = 0, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasAnimated) {
                    setHasAnimated(true);
                    const startTime = Date.now();
                    const animate = () => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3);
                        setCount(eased * end);
                        if (progress < 1) requestAnimationFrame(animate);
                    };
                    requestAnimationFrame(animate);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration, hasAnimated]);

    return <span ref={ref}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
};

// ═══════════════════════════════════════════════════════
// LIVE PRICE CARD (for landing page)
// ═══════════════════════════════════════════════════════

const LivePriceWidget = () => {
    const [prices, setPrices] = useState([]);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
                const data = await res.json();
                const top = data
                    .filter(d => d.symbol.endsWith('USDT'))
                    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
                    .slice(0, 6);
                setPrices(top);
            } catch { }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 10000);
        return () => clearInterval(interval);
    }, []);

    const icons = { BTC: '₿', ETH: 'Ξ', BNB: '🔶', SOL: '◎', XRP: '✕', DOGE: 'Ð', USDC: '$', USDT: '₮', ADA: '₳', AVAX: '🔺' };

    if (prices.length === 0) return null;

    return (
        <div className="live-prices-grid">
            {prices.map((coin, i) => {
                const sym = coin.symbol.replace('USDT', '');
                const change = parseFloat(coin.priceChangePercent);
                return (
                    <motion.div
                        key={coin.symbol}
                        className="live-price-card"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                    >
                        <div className="lpc-top">
                            <span className="lpc-icon">{icons[sym] || sym.charAt(0)}</span>
                            <span className={`lpc-change ${change >= 0 ? 'up' : 'down'}`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                            </span>
                        </div>
                        <div className="lpc-name">{sym}</div>
                        <div className="lpc-price">${parseFloat(coin.lastPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className="lpc-vol">Vol: {(parseFloat(coin.quoteVolume) / 1e9).toFixed(2)}B</div>
                    </motion.div>
                );
            })}
        </div>
    );
};

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
                <a href="/" className="navbar-logo-link">
                    <ArbixLogo size="default" />
                </a>
                <div className="navbar-links">
                    <a href="#how-it-works">How It Works</a>
                    <a href="#features">Features</a>
                    <a href="#markets">Live Markets</a>
                    <a href="#security">Security</a>
                </div>
                <div className="navbar-actions">
                    <button className="btn-glass">Connect Wallet</button>
                    <button className="btn-gold" onClick={() => navigate('/dashboard')}>
                        Launch App <ArrowRight size={14} />
                    </button>
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
                    <h1 className="hero-title">
                        Scan. Detect.<br />
                        <span className="gold-text">Execute. Profit.</span>
                    </h1>
                    <p className="hero-subtitle">
                        The AI-powered trading agent that never sleeps. Arbix monitors
                        markets 24/7, identifies cross-exchange price gaps in milliseconds,
                        and executes profitable trades autonomously on-chain.
                    </p>

                    <div className="hero-cta-group">
                        <button className="btn-hero-primary" onClick={() => navigate('/dashboard')}>
                            <Zap size={18} /> Start Trading
                        </button>
                        <button className="btn-hero-secondary">
                            <Play size={16} /> Watch Demo
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value"><AnimatedCounter end={2} prefix="<" suffix="s" /></div>
                            <div className="hero-stat-label">Execution Speed</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value"><AnimatedCounter end={89.4} suffix="%" decimals={1} /></div>
                            <div className="hero-stat-label">Win Rate</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value"><AnimatedCounter end={47} suffix="" /></div>
                            <div className="hero-stat-label">Trades / Day</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value">24/7</div>
                            <div className="hero-stat-label">Always On</div>
                        </div>
                    </div>
                </motion.div>

                {/* Animated Orb: sits beside hero content, vertically centered and right-aligned */}
                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="hero-orb">
                        <svg width="60" height="60" viewBox="0 0 40 40" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
                            <path d="M20 6L30 30H24L20 22L16 30H10L20 6Z" fill="rgba(252,213,53,0.25)" />
                        </svg>
                    </div>
                    <div className="orbit-dot orbit-dot-1" />
                    <div className="orbit-dot orbit-dot-2" />
                    <div className="orbit-dot orbit-dot-3" />
                    {/* Floating data labels around the orb */}
                    <div className="orbit-label orbit-label-1">BTC +2.4%</div>
                    <div className="orbit-label orbit-label-2">ETH △$3,210</div>
                    <div className="orbit-label orbit-label-3">Spread 0.13%</div>
                </motion.div>
            </section>

            {/* ── TRUSTED BY ── */}
            <section className="trusted-section">
                <div className="trusted-inner">
                    <span className="trusted-label">Powered by</span>
                    <div className="trusted-logos">
                        <span className="trusted-logo">⛓ BNB Chain</span>
                        <span className="trusted-divider" />
                        <span className="trusted-logo">📡 Binance API</span>
                        <span className="trusted-divider" />
                        <span className="trusted-logo">🧠 Machine Learning</span>
                        <span className="trusted-divider" />
                        <span className="trusted-logo">📜 Smart Contracts</span>
                    </div>
                </div>
            </section>

            {/* ── LIVE TICKER ── */}
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

            {/* ── HOW IT WORKS ── */}
            <section className="how-section" id="how-it-works">
                <div className="section-header">
                    <span className="section-label">How It Works</span>
                    <h2 className="section-title">Three Steps to<br />Autonomous Profits</h2>
                    <p className="section-subtitle">
                        From market signal to on-chain execution — fully automated, zero manual intervention required.
                    </p>
                </div>

                <div className="steps-row">
                    <StepCard
                        number="01"
                        icon={<Eye size={24} />}
                        title="Connect & Configure"
                        desc="Link your wallet, set your risk tolerance and position sizing. Arbix handles the rest — continuously scanning thousands of trading pairs in real time."
                        delay={0}
                    />
                    <div className="step-connector"><ChevronRight size={20} /></div>
                    <StepCard
                        number="02"
                        icon={<Brain size={24} />}
                        title="AI Detects Opportunities"
                        desc="Our ML engine identifies cross-exchange price inefficiencies, scores confidence levels, and runs a full profitability check including all fees and slippage."
                        delay={0.15}
                    />
                    <div className="step-connector"><ChevronRight size={20} /></div>
                    <StepCard
                        number="03"
                        icon={<Zap size={24} />}
                        title="Auto-Execute On-Chain"
                        desc="Profitable trades are executed atomically via smart contracts on BNB Chain. Profit is locked in under 2 seconds with zero risk of partial fills."
                        delay={0.3}
                    />
                </div>
            </section>

            {/* ── FEATURES ── */}
            <section className="features-section" id="features">
                <div className="section-header">
                    <span className="section-label">Why Arbix</span>
                    <h2 className="section-title">The Unfair Advantage<br />in Every Trade</h2>
                    <p className="section-subtitle">
                        Institutional-grade intelligence, now accessible to everyone. No more missed windows, no more human error.
                    </p>
                </div>

                <div className="features-grid">
                    <FeatureCard
                        icon={<Activity size={22} />}
                        title="Sub-Second Latency"
                        desc="Live WebSocket streaming with data normalization across multiple exchanges simultaneously. Opportunities detected before they vanish."
                        delay={0}
                    />
                    <FeatureCard
                        icon={<Brain size={22} />}
                        title="AI Decision Engine"
                        desc="ML models trained on millions of historical spreads. Every opportunity receives a confidence score — only high-conviction trades are executed."
                        delay={0.1}
                    />
                    <FeatureCard
                        icon={<Shield size={22} />}
                        title="Built-In Risk Management"
                        desc="Per-trade exposure limits, portfolio caps, drawdown circuit breakers, and Kelly Criterion position sizing — all running autonomously."
                        delay={0.2}
                    />
                    <FeatureCard
                        icon={<Layers size={22} />}
                        title="Atomic Execution"
                        desc="Smart contract-based trades that either succeed completely or revert entirely. No stuck positions, no partial fills, no stranded capital."
                        delay={0.3}
                    />
                    <FeatureCard
                        icon={<LineChart size={22} />}
                        title="Real-Time Dashboard"
                        desc="Track P&L, view live charts, monitor opportunity heatmaps, and review every trade with full attribution — all from one terminal."
                        delay={0.4}
                    />
                    <FeatureCard
                        icon={<Lock size={22} />}
                        title="Non-Custodial & Secure"
                        desc="Your keys, your funds. Arbix never holds your assets. All execution happens through verified, audited smart contracts on-chain."
                        delay={0.5}
                    />
                </div>
            </section>

            {/* ── LIVE MARKETS ── */}
            <section className="markets-section" id="markets">
                <div className="section-header">
                    <span className="section-label">Live Markets</span>
                    <h2 className="section-title">Real-Time Market Pulse</h2>
                    <p className="section-subtitle">
                        Top assets by volume, updated every 10 seconds. The same data our AI is scanning right now.
                    </p>
                </div>
                <LivePriceWidget />
                <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                    <button className="btn-hero-secondary" onClick={() => navigate('/dashboard')} style={{ display: 'inline-flex' }}>
                        <BarChart3 size={16} /> View All Markets <ArrowRight size={14} />
                    </button>
                </div>
            </section>

            {/* ── PERFORMANCE METRICS ── */}
            <section className="metrics-section" id="security">
                <div className="section-header">
                    <span className="section-label">Performance</span>
                    <h2 className="section-title">Numbers That Speak</h2>
                </div>
                <div className="metrics-grid">
                    <MetricCard icon={<Gauge size={20} />} value="+$284" label="Today's P&L" delay={0} />
                    <MetricCard icon={<TrendingUp size={20} />} value="89.4%" label="Win Rate" delay={0.1} />
                    <MetricCard icon={<Clock size={20} />} value="<2s" label="Avg Execution" delay={0.2} />
                    <MetricCard icon={<Target size={20} />} value=">2.0" label="Sharpe Ratio" delay={0.3} />
                </div>
            </section>

            {/* ── SECURITY & TRUST ── */}
            <section className="trust-section">
                <div className="trust-container">
                    <div className="trust-left">
                        <span className="section-label">Security First</span>
                        <h2 className="section-title" style={{ textAlign: 'left' }}>Your Assets.<br />Your Control.</h2>
                        <p className="section-subtitle" style={{ textAlign: 'left', margin: 0 }}>
                            Arbix is built with security at its core. Non-custodial architecture means your funds never leave your wallet until a verified profitable trade executes.
                        </p>
                    </div>
                    <div className="trust-checks">
                        <TrustItem text="Non-custodial — your keys, your crypto" />
                        <TrustItem text="Audited smart contracts on BNB Chain" />
                        <TrustItem text="Automatic circuit breakers on anomaly detection" />
                        <TrustItem text="Rate-limited API with full input validation" />
                        <TrustItem text="No private keys stored — zero attack surface" />
                        <TrustItem text="Full simulation mode for risk-free testing" />
                    </div>
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
                        <h2 className="cta-title">Ready to Trade Smarter?</h2>
                        <p className="cta-subtitle">
                            Join thousands leveraging AI to find profits in cross-market price inefficiencies. Start in under 60 seconds.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn-hero-primary" onClick={() => navigate('/dashboard')}>
                                <Zap size={18} /> Launch Terminal
                            </button>
                            <button className="btn-hero-secondary">
                                Read Documentation <ExternalLink size={14} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <ArbixLogo size="small" />
                        <p className="footer-brand-desc" style={{ marginTop: '1rem' }}>
                            AI-powered autonomous cross-market trading intelligence. Democratizing algorithmic finance — one arbitrage at a time.
                        </p>
                    </div>
                    <div className="footer-links-group">
                        <div className="footer-col">
                            <div className="footer-col-title">Product</div>
                            <a href="#how-it-works">How It Works</a>
                            <a href="#features">Features</a>
                            <a href="#markets">Live Markets</a>
                            <a href="#security">Performance</a>
                        </div>
                        <div className="footer-col">
                            <div className="footer-col-title">Resources</div>
                            <a href="#">Documentation</a>
                            <a href="#">API Reference</a>
                            <a href="#">Status Page</a>
                            <a href="#">Changelog</a>
                        </div>
                        <div className="footer-col">
                            <div className="footer-col-title">Company</div>
                            <a href="#">About</a>
                            <a href="#">Careers</a>
                            <a href="#">Blog</a>
                            <a href="#">Contact</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <span>© 2025 Arbix. All rights reserved.</span>
                    <div className="footer-bottom-links">
                        <a href="#">Privacy</a>
                        <a href="#">Terms</a>
                        <a href="#">Security</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// ── Landing Sub-Components ──

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

const StepCard = ({ number, icon, title, desc, delay = 0 }) => (
    <motion.div
        className="step-card"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        <div className="step-number">{number}</div>
        <div className="step-icon">{icon}</div>
        <h3 className="step-title">{title}</h3>
        <p className="step-desc">{desc}</p>
    </motion.div>
);

const MetricCard = ({ icon, value, label, delay = 0 }) => (
    <motion.div
        className="metric-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
    >
        <div style={{ color: 'var(--gold)', marginBottom: '0.75rem' }}>{icon}</div>
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
    </motion.div>
);

const TrustItem = ({ text }) => (
    <div className="trust-item">
        <CheckCircle size={18} color="#FCD535" />
        <span>{text}</span>
    </div>
);

// ═══════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════

const DashboardPage = () => {
    const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
    const [searchInput, setSearchInput] = useState('');
    const [chartType, setChartType] = useState('area');
    const [marketData, setMarketData] = useState(null);
    const [topCoins, setTopCoins] = useState([]);
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();
    const wsRef = useRef(null);

    const coins = [
        { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
        { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
        { symbol: 'BNBUSDT', name: 'BNB', icon: '🔶' },
        { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
        { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
    ];

    // Fetch top coins real-time data for the sidebar
    useEffect(() => {
        const fetchTopCoins = async () => {
            try {
                const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
                const data = await res.json();
                const top = data
                    .filter(d => d.symbol.endsWith('USDT'))
                    .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
                    .slice(0, 10);
                setTopCoins(top);
            } catch { }
        };
        fetchTopCoins();
        const interval = setInterval(fetchTopCoins, 8000);
        return () => clearInterval(interval);
    }, []);

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
            layout: { background: { type: ColorType.Solid, color: '#0a0a0e' }, textColor: '#5a5a6e' },
            grid: { vertLines: { color: 'rgba(255,255,255,0.02)' }, horzLines: { color: 'rgba(255,255,255,0.02)' } },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: { timeVisible: true, secondsVisible: true, borderColor: 'rgba(255,255,255,0.05)' },
            rightPriceScale: { borderColor: 'rgba(255,255,255,0.05)' },
            crosshair: {
                vertLine: { color: 'rgba(252,213,53,0.3)', labelBackgroundColor: '#FCD535' },
                horzLine: { color: 'rgba(252,213,53,0.3)', labelBackgroundColor: '#FCD535' },
            },
        });

        const series = chart.addAreaSeries({
            lineColor: '#FCD535',
            topColor: 'rgba(252, 213, 53, 0.12)',
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
                    <ArbixLogo size="small" />
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

                {/* Live market mini-feed in sidebar */}
                <div className="sidebar-section-label" style={{ marginTop: '1.5rem' }}>Live Prices</div>
                <div className="sidebar-prices">
                    {topCoins.slice(0, 5).map(c => {
                        const change = parseFloat(c.priceChangePercent);
                        return (
                            <div
                                key={c.symbol}
                                className="sidebar-price-row"
                                onClick={() => setSelectedCoin(c.symbol)}
                                style={{ cursor: 'pointer', background: selectedCoin === c.symbol ? 'rgba(252,213,53,0.06)' : 'transparent' }}
                            >
                                <span className="spr-symbol">{c.symbol.replace('USDT', '')}</span>
                                <span className="spr-price">${parseFloat(c.lastPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                <span className={`spr-change ${change >= 0 ? 'up' : 'down'}`}>
                                    {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="sidebar-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <div className="status-dot-inline live" />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>Connected</span>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>BNB Chain • 14ms</div>
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
                            placeholder="Search any coin (BTC, ETH, SOL...)"
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
                            <Clock size={12} color="var(--text-muted)" />
                            <span style={{ color: 'var(--text-secondary)' }}>{new Date().toLocaleTimeString()}</span>
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
                                key={selectedCoin + marketData.price}
                                className="coin-stats-row"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0 }}
                            >
                                <span className="coin-live-price">{fmtPrice(marketData.price)}</span>
                                <span className={parseFloat(marketData.change) >= 0 ? 'stat-positive' : 'stat-negative'}>
                                    {parseFloat(marketData.change) >= 0 ? '▲' : '▼'} {marketData.change}%
                                </span>
                                <span className="stat-label">H: {fmtPrice(marketData.high)}</span>
                                <span className="stat-label">L: {fmtPrice(marketData.low)}</span>
                                <span className="stat-label dim">Vol: {parseFloat(marketData.volume).toLocaleString()}</span>
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
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                                <button key={tf} className={`chart-type-btn ${tf === '1m' ? 'active' : ''}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}>{tf}</button>
                            ))}
                        </div>
                    </div>
                    <div ref={chartContainerRef} style={{ width: '100%', minHeight: 400 }} />
                </div>

                {/* Quick Stats Below Chart */}
                {marketData && (
                    <div className="dash-quick-stats">
                        <div className="dqs-item">
                            <span className="dqs-label">24h Change</span>
                            <span className={`dqs-value ${parseFloat(marketData.change) >= 0 ? 'up' : 'down'}`}>
                                {parseFloat(marketData.change) >= 0 ? '+' : ''}{marketData.change}%
                            </span>
                        </div>
                        <div className="dqs-item">
                            <span className="dqs-label">24h High</span>
                            <span className="dqs-value">{fmtPrice(marketData.high)}</span>
                        </div>
                        <div className="dqs-item">
                            <span className="dqs-label">24h Low</span>
                            <span className="dqs-value">{fmtPrice(marketData.low)}</span>
                        </div>
                        <div className="dqs-item">
                            <span className="dqs-label">Volume</span>
                            <span className="dqs-value">{parseFloat(marketData.volume).toLocaleString()}</span>
                        </div>
                    </div>
                )}

                {/* Pinned Assets */}
                <div style={{ marginTop: '2rem' }}>
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
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--mono)' }}>{coin.symbol}</div>
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
                    .slice(0, 24);
                setHotCoins(usdtPairs);
                setLoading(false);
            } catch (err) {
                console.error("Hot coins fetch error:", err);
            }
        };
        fetchHotCoins();
        const interval = setInterval(fetchHotCoins, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-layout">
            <aside className="sidebar-new">
                <div className="sidebar-logo">
                    <ArbixLogo size="small" />
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
                <div className="sidebar-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="status-dot-inline live" />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>Connected</span>
                    </div>
                </div>
            </aside>

            <main className="main-view">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Global Markets</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                        Top 24 USDT pairs by volume • Auto-refreshing every 10s
                    </p>
                </motion.div>

                <div className="glass-grid">
                    {loading ? (
                        <div className="loading-spinner" style={{ gridColumn: '1 / -1' }}>
                            <RefreshCw size={36} style={{ color: '#FCD535', animation: 'spin-slow 1.5s linear infinite' }} />
                            <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>Synchronizing...</p>
                        </div>
                    ) : (
                        hotCoins.map((coin, i) => (
                            <motion.div
                                key={coin.symbol}
                                className="coin-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.025 }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                                    <span style={{ fontWeight: 800, fontSize: '1rem' }}>{coin.symbol.replace('USDT', '')}</span>
                                    <span style={{
                                        color: parseFloat(coin.priceChangePercent) >= 0 ? '#00e676' : '#ff1744',
                                        fontWeight: 700, fontSize: '0.8rem', fontFamily: 'var(--mono)',
                                    }}>
                                        {parseFloat(coin.priceChangePercent) >= 0 ? '+' : ''}{parseFloat(coin.priceChangePercent).toFixed(2)}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--mono)', marginBottom: '0.3rem' }}>
                                    ${parseFloat(coin.lastPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--mono)' }}>
                                    Vol: {(parseFloat(coin.quoteVolume) / 1e6).toFixed(1)}M
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
