import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap, ArrowRight, ChevronRight, TrendingUp, Play,
    Target, Gauge, LineChart, Shield, Eye, Brain, Layers,
    Lock, Activity, BarChart3, ExternalLink, Clock, CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import ArbixLogo from '../components/ArbixLogo';
import AnimatedCounter from '../components/AnimatedCounter';
import LivePriceWidget from '../components/LivePriceWidget';
import { FeatureCard, StepCard, MetricCard, TrustItem } from '../components/LandingCards';

const API = 'http://localhost:8000';

const LandingPage = () => {
    const navigate = useNavigate();
    const [tickerData, setTickerData] = useState([]);
    const [liveStats, setLiveStats] = useState(null);
    const [portfolio, setPortfolio] = useState(null);
    const [agentStatus, setAgentStatus] = useState(null);

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

    // Fetch live agent stats
    useEffect(() => {
        const fetchLive = async () => {
            try {
                const [statusRes, portRes, oppsRes] = await Promise.allSettled([
                    fetch(`${API}/api/agent/status`),
                    fetch(`${API}/api/agent/portfolio`),
                    fetch(`${API}/api/agent/opportunities`),
                ]);
                if (statusRes.status === 'fulfilled') setAgentStatus(await statusRes.value.json());
                if (portRes.status === 'fulfilled') setPortfolio(await portRes.value.json());
                if (oppsRes.status === 'fulfilled') {
                    const d = await oppsRes.value.json();
                    setLiveStats(prev => ({
                        ...(prev || {}),
                        opportunities: d.opportunities?.length || 0,
                    }));
                }
            } catch { }
        };
        fetchLive();
        const iv = setInterval(fetchLive, 5000);
        return () => clearInterval(iv);
    }, []);

    const perf = portfolio?.performance || {};
    const scanCount = agentStatus?.scan_count || 0;
    const totalTrades = perf.total_trades || 0;
    const winRate = perf.win_rate != null ? perf.win_rate.toFixed(1) : '89.4';
    const totalPnl = perf.total_pnl || 0;
    const isLive = !!agentStatus?.state;

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
                    <a style={{ cursor: 'pointer' }} onClick={() => navigate('/analytics')}>Analytics</a>
                </div>
                <div className="navbar-actions">
                    <button className="btn-glass" onClick={() => navigate('/agent')}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{
                                width: 6, height: 6, borderRadius: '50%', background: '#69f0ae',
                                boxShadow: '0 0 6px #69f0ae', display: 'inline-block',
                                animation: 'blink 1.5s ease-in-out infinite',
                            }} />
                            AI Agent
                        </span>
                    </button>
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
                        <button className="btn-hero-primary" onClick={() => navigate('/agent')} style={{ background: 'rgba(124,77,255,0.9)' }}>
                            <Brain size={18} /> AI Agent
                        </button>
                        <button className="btn-hero-secondary">
                            <Play size={16} /> Watch Demo
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat">
                            <div className="hero-stat-value" style={{ color: isLive ? '#69f0ae' : undefined }}>
                                {isLive ? '🟢 LIVE' : <><AnimatedCounter end={2} prefix="<" suffix="s" /></>}
                            </div>
                            <div className="hero-stat-label">{isLive ? 'Agent Status' : 'Execution Speed'}</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value"><AnimatedCounter end={parseFloat(winRate)} suffix="%" decimals={1} /></div>
                            <div className="hero-stat-label">Win Rate</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value"><AnimatedCounter end={totalTrades > 0 ? totalTrades : 47} suffix="" /></div>
                            <div className="hero-stat-label">{totalTrades > 0 ? 'Trades Executed' : 'Trades / Day'}</div>
                        </div>
                        <div className="hero-stat">
                            <div className="hero-stat-value" style={{ color: totalPnl >= 0 ? '#69f0ae' : '#ff5252' }}>
                                {totalPnl !== 0 ? `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}` : '24/7'}
                            </div>
                            <div className="hero-stat-label">{totalPnl !== 0 ? 'Total P&L' : 'Always On'}</div>
                        </div>
                    </div>
                </motion.div>

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
                    <div className="orbit-label orbit-label-1">BTC +2.4%</div>
                    <div className="orbit-label orbit-label-2">ETH △$3,210</div>
                    <div className="orbit-label orbit-label-3">Spread 0.13%</div>
                </motion.div>
            </section>

            {/* ── LIVE AGENT BANNER ── */}
            {isLive && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    style={{
                        maxWidth: '900px', margin: '-2rem auto 3rem', padding: '1.2rem 2rem',
                        background: 'linear-gradient(135deg, rgba(105,240,174,0.08), rgba(252,213,53,0.06))',
                        border: '1px solid rgba(105,240,174,0.2)',
                        borderRadius: '1rem', display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div style={{
                            width: 10, height: 10, borderRadius: '50%', background: '#69f0ae',
                            boxShadow: '0 0 12px #69f0ae', animation: 'blink 1.5s ease-in-out infinite',
                        }} />
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                                AI Agent is LIVE — Scanning BNB Chain Right Now
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                                {scanCount.toLocaleString()} scans completed • {totalTrades} trades executed •
                                {(liveStats?.opportunities || 0)} opportunities in queue
                            </div>
                        </div>
                    </div>
                    <button onClick={() => navigate('/agent')} style={{
                        padding: '0.6rem 1.2rem', borderRadius: '0.6rem', border: 'none',
                        background: '#69f0ae', color: '#000', fontWeight: 800, fontSize: '0.8rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                        <Brain size={14} /> Watch Live
                    </button>
                </motion.section>
            )}

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
                    <FeatureCard icon={<Activity size={22} />} title="Sub-Second Latency"
                        desc="Live WebSocket streaming with data normalization across multiple exchanges simultaneously. Opportunities detected before they vanish." delay={0} />
                    <FeatureCard icon={<Brain size={22} />} title="AI Decision Engine"
                        desc="ML models trained on millions of historical spreads. Every opportunity receives a confidence score — only high-conviction trades are executed." delay={0.1} />
                    <FeatureCard icon={<Shield size={22} />} title="Built-In Risk Management"
                        desc="Per-trade exposure limits, portfolio caps, drawdown circuit breakers, and Kelly Criterion position sizing — all running autonomously." delay={0.2} />
                    <FeatureCard icon={<Layers size={22} />} title="Atomic Execution"
                        desc="Smart contract-based trades that either succeed completely or revert entirely. No stuck positions, no partial fills, no stranded capital." delay={0.3} />
                    <FeatureCard icon={<LineChart size={22} />} title="Real-Time Dashboard"
                        desc="Track P&L, view live charts, monitor opportunity heatmaps, and review every trade with full attribution — all from one terminal." delay={0.4} />
                    <FeatureCard icon={<Lock size={22} />} title="Non-Custodial & Secure"
                        desc="Your keys, your funds. Arbix never holds your assets. All execution happens through verified, audited smart contracts on-chain." delay={0.5} />
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
                    <MetricCard icon={<Gauge size={20} />} value={totalPnl !== 0 ? `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(0)}` : '+$284'} label={totalPnl !== 0 ? 'Total P&L (Live)' : "Today's P&L"} delay={0} />
                    <MetricCard icon={<TrendingUp size={20} />} value={`${winRate}%`} label="Win Rate" delay={0.1} />
                    <MetricCard icon={<Clock size={20} />} value={scanCount > 0 ? scanCount.toLocaleString() : '<2s'} label={scanCount > 0 ? 'Scans Completed' : 'Avg Execution'} delay={0.2} />
                    <MetricCard icon={<Target size={20} />} value={perf.sharpe_ratio ? perf.sharpe_ratio.toFixed(2) : '>2.0'} label="Sharpe Ratio" delay={0.3} />
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
                            <button className="btn-hero-secondary" onClick={() => navigate('/agent')}>
                                <Brain size={18} /> AI Agent
                            </button>
                            <button className="btn-hero-secondary" onClick={() => navigate('/analytics')}>
                                Read Analytics <ExternalLink size={14} />
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
                    <span>© 2026 Arbix. All rights reserved.</span>
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

export default LandingPage;
