import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, BarChart3, Search, Brain, Target,
    Zap, Shield, Clock, RefreshCw, Activity, Layers, LineChart
} from 'lucide-react';
import { motion } from 'framer-motion';
import ArbixLogo from '../components/ArbixLogo';

const API = 'http://localhost:8000';

const AgentPage = () => {
    const navigate = useNavigate();
    const [agentStatus, setAgentStatus] = useState(null);
    const [opportunities, setOpportunities] = useState([]);
    const [decisions, setDecisions] = useState([]);
    const [portfolio, setPortfolio] = useState(null);
    const [spreads, setSpreads] = useState([]);
    const [regime, setRegime] = useState(null);
    const [anomalies, setAnomalies] = useState([]);
    const [activity, setActivity] = useState([]);
    const [wsConnected, setWsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const wsRef = useRef(null);

    // ── Fetch all data ──
    const fetchAll = async () => {
        try {
            const [statusRes, oppsRes, decsRes, portRes, spreadRes, regimeRes, anomRes, actRes] = await Promise.allSettled([
                fetch(`${API}/api/agent/status`),
                fetch(`${API}/api/agent/opportunities`),
                fetch(`${API}/api/agent/decisions?limit=30`),
                fetch(`${API}/api/agent/portfolio`),
                fetch(`${API}/api/prices/spreads`),
                fetch(`${API}/api/market/regime`),
                fetch(`${API}/api/market/anomalies?limit=20`),
                fetch(`${API}/api/agent/activity?limit=40`),
            ]);
            if (statusRes.status === 'fulfilled') setAgentStatus(await statusRes.value.json());
            if (oppsRes.status === 'fulfilled') { const d = await oppsRes.value.json(); setOpportunities(d.opportunities || []); }
            if (decsRes.status === 'fulfilled') { const d = await decsRes.value.json(); setDecisions(d.decisions || []); }
            if (portRes.status === 'fulfilled') setPortfolio(await portRes.value.json());
            if (spreadRes.status === 'fulfilled') { const d = await spreadRes.value.json(); setSpreads(d.spreads || []); }
            if (regimeRes.status === 'fulfilled') setRegime(await regimeRes.value.json());
            if (anomRes.status === 'fulfilled') { const d = await anomRes.value.json(); setAnomalies(d.anomalies || []); }
            if (actRes.status === 'fulfilled') setActivity(await actRes.value.json());
        } catch (e) { console.error('Fetch error', e); }
    };

    useEffect(() => {
        fetchAll();
        const interval = setInterval(fetchAll, 6000);
        return () => clearInterval(interval);
    }, []);

    // ── WebSocket for live agent stream ──
    useEffect(() => {
        let isMounted = true;
        const connect = () => {
            if (!isMounted) return;
            const ws = new WebSocket('ws://localhost:8000/ws/agent');
            ws.onopen = () => { if (isMounted) setWsConnected(true); };
            ws.onclose = () => {
                if (isMounted) {
                    setWsConnected(false);
                    setTimeout(connect, 3000);
                }
            };
            ws.onerror = () => {}; // suppress console errors
            ws.onmessage = (e) => {
                try {
                    const msg = JSON.parse(e.data);
                    if (!msg || !msg.type) return;
                    if (msg.type === 'status' && msg.data) setAgentStatus(msg.data);
                    if (msg.type === 'opportunity' && msg.data) setOpportunities(prev => [msg.data, ...prev].slice(0, 30));
                    if (msg.type === 'decision' && msg.data?.decision_id) setDecisions(prev => [msg.data, ...prev].slice(0, 30));
                    if (msg.type === 'trade') fetchAll();
                    if (msg.type === 'state_change' || msg.type === 'scan_complete') {
                        setActivity(prev => [msg, ...prev].slice(0, 40));
                    }
                } catch {}
            };
            wsRef.current = ws;
        };
        connect();
        return () => {
            isMounted = false;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.close();
            }
        };
    }, []);

    const stateColors = {
        INITIALIZING: '#ffab40', SCANNING: '#40c4ff', ANALYZING: '#7c4dff',
        OPPORTUNITY_DETECTED: '#ffd740', EXECUTING: '#69f0ae', COOLDOWN: '#ff5252', ERROR: '#ff1744',
    };
    const stateIcons = {
        INITIALIZING: <RefreshCw size={14} />, SCANNING: <Search size={14} />,
        ANALYZING: <Brain size={14} />, OPPORTUNITY_DETECTED: <Target size={14} />,
        EXECUTING: <Zap size={14} />, COOLDOWN: <Clock size={14} />, ERROR: <Shield size={14} />,
    };
    const regimeColors = {
        DISLOCATION: '#ff1744', VOLATILE: '#ff9100', RANGING: '#ffea00',
        TRENDING: '#00e676', CALM: '#40c4ff',
    };

    const perf = portfolio?.performance || {};
    const equity = portfolio?.equity_curve || [];
    const trades = portfolio?.recent_trades || [];

    return (
        <div className="dashboard-layout">
            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <ArbixLogo size="small" />
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="sidebar-link"><LayoutDashboard size={18} /><span>Dashboard</span></Link>
                    <Link to="/coins" className="sidebar-link"><BarChart3 size={18} /><span>Markets</span></Link>
                    <Link to="/agent" className="sidebar-link active"><Brain size={18} /><span>AI Agent</span></Link>
                    <Link to="/analytics" className="sidebar-link"><Activity size={18} /><span>Analytics</span></Link>
                </nav>
                <div className="sidebar-bottom">
                    <div className="sidebar-link" style={{ cursor: 'default', opacity: 0.7 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: wsConnected ? '#69f0ae' : '#ff5252',
                            boxShadow: wsConnected ? '0 0 8px #69f0ae' : '0 0 8px #ff5252',
                        }} />
                        <span style={{ fontSize: '0.75rem' }}>{wsConnected ? 'Agent Live' : 'Connecting...'}</span>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="dashboard-main" style={{ padding: '1.5rem', overflow: 'auto', flex: 1, minWidth: 0 }}>
                {/* ── Top Bar ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
                            <Brain size={24} style={{ marginRight: 8, color: '#FCD535', verticalAlign: 'middle' }} />
                            AI Agent Command Center
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>
                            Autonomous Arbitrage Intelligence • Bellman-Ford • Cross-Chain
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['overview', 'opportunities', 'decisions', 'portfolio'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none',
                                background: activeTab === tab ? '#FCD535' : 'var(--card-bg)',
                                color: activeTab === tab ? '#000' : 'var(--text-secondary)',
                                fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer',
                                textTransform: 'capitalize',
                            }}>{tab}</button>
                        ))}
                    </div>
                </div>

                {/* ═══ Agent Status Strip ═══ */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.8rem', marginBottom: '1.2rem',
                }}>
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem' }}>AGENT STATE</div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: stateColors[agentStatus?.state] || '#fff', fontWeight: 800, fontSize: '0.95rem',
                        }}>
                            {stateIcons[agentStatus?.state]}
                            {agentStatus?.state || 'OFFLINE'}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem' }}>TOTAL SCANS</div>
                        <div style={{ fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--mono)', color: '#40c4ff' }}>
                            {agentStatus?.scan_count?.toLocaleString() || '0'}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem' }}>MARKET REGIME</div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: regimeColors[regime?.regime] || '#fff' }}>
                            {regime?.regime || '—'}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '0.2rem' }}>
                            {regime?.description?.slice(0, 50) || ''}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem' }}>WIN RATE</div>
                        <div style={{ fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--mono)', color: '#69f0ae' }}>
                            {perf.win_rate != null ? `${perf.win_rate.toFixed(1)}%` : '—'}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem' }}>PORTFOLIO</div>
                        <div style={{
                            fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--mono)',
                            color: (perf.total_pnl || 0) >= 0 ? '#69f0ae' : '#ff5252',
                        }}>
                            ${perf.balance?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '10,000'}
                        </div>
                    </div>
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, marginBottom: '0.5rem' }}>UPTIME</div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', fontFamily: 'var(--mono)', color: '#fff' }}>
                            {agentStatus?.uptime || '0s'}
                        </div>
                    </div>
                </div>

                {/* ═══ Tab Content ═══ */}

                {activeTab === 'overview' && <OverviewTab activity={activity} spreads={spreads} anomalies={anomalies} />}
                {activeTab === 'opportunities' && <OpportunitiesTab opportunities={opportunities} />}
                {activeTab === 'decisions' && <DecisionsTab decisions={decisions} />}
                {activeTab === 'portfolio' && <PortfolioTab perf={perf} equity={equity} trades={trades} />}
            </main>
        </div>
    );
};

// ═══════════════════════════════════════════════════════
// TAB: OVERVIEW
// ═══════════════════════════════════════════════════════

const OverviewTab = ({ activity, spreads, anomalies }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Live Activity Feed */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={16} style={{ color: '#FCD535' }} /> Live Activity Feed
            </h3>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {(Array.isArray(activity) ? activity : []).slice(0, 20).map((a, i) => (
                    <div key={i} style={{
                        padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: a.type === 'trade' ? '#69f0ae' : a.type === 'opportunity' ? '#ffd740' : '#40c4ff',
                            }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {a.type || a.event || 'scan'}
                            </span>
                        </div>
                        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
                            {a.timestamp ? new Date(a.timestamp * 1000).toLocaleTimeString() : ''}
                        </span>
                    </div>
                ))}
                {(!activity || activity.length === 0) && (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                        Agent starting — waiting for first scan...
                    </div>
                )}
            </div>
        </div>

        {/* Spread Heatmap */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} style={{ color: '#FCD535' }} /> Cross-Source Spread Heatmap
            </h3>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {spreads.slice(0, 15).map((s, i) => {
                    const intensity = Math.min(s.spread_pct / 0.5, 1);
                    return (
                        <div key={i} style={{
                            padding: '0.5rem 0.7rem', marginBottom: '0.4rem', borderRadius: '0.4rem',
                            background: `rgba(${Math.round(255 * intensity)}, ${Math.round(215 * (1 - intensity))}, 53, ${0.08 + intensity * 0.15})`,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{s.symbol?.replace('USDT', '')}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: '0.5rem' }}>
                                    {s.source_a} ↔ {s.source_b}
                                </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{
                                    fontWeight: 800, fontSize: '0.85rem', fontFamily: 'var(--mono)',
                                    color: s.spread_pct > 0.1 ? '#ffd740' : '#aaa',
                                }}>
                                    {s.spread_pct?.toFixed(4)}%
                                </span>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                                    ${s.price_a?.toFixed(2)} → ${s.price_b?.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {spreads.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
                        Collecting multi-source prices...
                    </div>
                )}
            </div>
        </div>

        {/* Anomalies — spans full width */}
        <div className="glass-card" style={{ padding: '1.2rem', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={16} style={{ color: '#ff5252' }} /> Anomaly Detection
            </h3>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {anomalies.slice(0, 10).map((a, i) => (
                    <div key={i} style={{
                        padding: '0.6rem 0.9rem', borderRadius: '0.5rem',
                        background: a.severity === 'high' ? 'rgba(255,23,68,0.12)' :
                                    a.severity === 'medium' ? 'rgba(255,171,64,0.12)' : 'rgba(64,196,255,0.12)',
                        border: `1px solid ${a.severity === 'high' ? 'rgba(255,23,68,0.3)' :
                                              a.severity === 'medium' ? 'rgba(255,171,64,0.3)' : 'rgba(64,196,255,0.3)'}`,
                    }}>
                        <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>{a.symbol?.replace('USDT', '')} — {a.type}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            {a.description?.slice(0, 80) || `z-score: ${a.z_score?.toFixed(2)}`}
                        </div>
                    </div>
                ))}
                {anomalies.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>
                        No anomalies detected — market is calm.
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════
// TAB: OPPORTUNITIES
// ═══════════════════════════════════════════════════════

const OpportunitiesTab = ({ opportunities }) => (
    <div className="glass-card" style={{ padding: '1.2rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={16} style={{ color: '#ffd740' }} /> Detected Arbitrage Opportunities ({opportunities.length})
        </h3>
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {['#', 'Type', 'Pair', 'Buy @', 'Sell @', 'Gross %', 'Net %', 'Route', 'Time'].map(h => (
                            <th key={h} style={{ padding: '0.6rem 0.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {opportunities.map((o, i) => {
                        const buyStep = o.path?.find(p => p.action === 'BUY');
                        const sellStep = o.path?.find(p => p.action === 'SELL');
                        const sym = (o.symbols || []).map(s => s.replace('USDT', '')).join('/');
                        return (
                        <tr key={o.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--mono)', fontSize: '0.7rem' }}>{o.id?.split('-').pop()}</td>
                            <td style={{ padding: '0.6rem 0.5rem' }}>
                                <span style={{
                                    padding: '0.15rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.7rem', fontWeight: 700,
                                    background: o.type === 'triangular' ? 'rgba(124,77,255,0.2)' :
                                                o.type === 'cross_chain' ? 'rgba(255,171,64,0.2)' : 'rgba(64,196,255,0.2)',
                                    color: o.type === 'triangular' ? '#b388ff' :
                                           o.type === 'cross_chain' ? '#ffab40' : '#40c4ff',
                                }}>
                                    {o.type}
                                </span>
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', fontWeight: 700 }}>{sym || '—'}</td>
                            <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--mono)' }}>${buyStep?.price?.toLocaleString(undefined, {maximumFractionDigits: 4}) || '—'}</td>
                            <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'var(--mono)' }}>${sellStep?.price?.toLocaleString(undefined, {maximumFractionDigits: 4}) || '—'}</td>
                            <td style={{
                                padding: '0.6rem 0.5rem', fontFamily: 'var(--mono)', fontWeight: 700,
                                color: (o.gross_spread_pct || 0) > 0 ? '#69f0ae' : '#ff5252',
                            }}>{o.gross_spread_pct?.toFixed(4)}%</td>
                            <td style={{
                                padding: '0.6rem 0.5rem', fontFamily: 'var(--mono)', fontWeight: 800,
                                color: (o.net_profit_pct || 0) > 0 ? '#69f0ae' : '#ff5252',
                            }}>{o.net_profit_pct?.toFixed(4)}%</td>
                            <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                {(o.sources || []).join(' → ')}
                            </td>
                            <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.7rem', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
                                {o.timestamp ? new Date(o.timestamp * 1000).toLocaleTimeString() : ''}
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
            {opportunities.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', fontSize: '0.9rem' }}>
                    <Target size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} /><br />
                    No opportunities detected yet — agent is scanning...
                </div>
            )}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════
// TAB: DECISIONS  (FIXED: risk_factors is an object, not array)
// ═══════════════════════════════════════════════════════

const DecisionsTab = ({ decisions }) => (
    <div className="glass-card" style={{ padding: '1.2rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={16} style={{ color: '#b388ff' }} /> XAI Decision Audit Trail ({decisions.filter(d => d && d.decision).length})
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {decisions.filter(d => d && d.decision).map((d, i) => {
                const isExec = d.decision === 'EXECUTE';
                const syms = (d.symbols || []).map(s => s.replace('USDT', '')).join('/');
                const netPct = d.profit_analysis?.net_profit || '—';
                const kellyPct = d.position_sizing?.kelly_fraction != null
                    ? `${(d.position_sizing.kelly_fraction * 100).toFixed(1)}%` : '—';

                // risk_factors is an OBJECT like { slippage: {score, label}, fee_impact: {score, label}, ... }
                const riskFactors = d.reasoning?.risk_factors;
                const riskEntries = riskFactors && typeof riskFactors === 'object' && !Array.isArray(riskFactors)
                    ? Object.entries(riskFactors)
                    : [];

                return (
                <motion.div key={d.decision_id || i}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    style={{
                        padding: '1rem', borderRadius: '0.6rem',
                        background: isExec ? 'rgba(105,240,174,0.06)' : 'rgba(255,82,82,0.06)',
                        border: `1px solid ${isExec ? 'rgba(105,240,174,0.15)' : 'rgba(255,82,82,0.15)'}`,
                    }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '0.15rem 0.5rem', borderRadius: '0.3rem', fontSize: '0.7rem', fontWeight: 800,
                                background: isExec ? 'rgba(105,240,174,0.2)' : 'rgba(255,82,82,0.2)',
                                color: isExec ? '#69f0ae' : '#ff5252',
                            }}>{d.decision}</span>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{syms}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{d.opportunity_type}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
                            {d.decision_id}
                        </span>
                    </div>

                    {/* Verdict */}
                    <div style={{ fontSize: '0.75rem', marginBottom: '0.4rem', color: isExec ? '#69f0ae' : '#ffab40' }}>
                        {d.verdict}
                    </div>

                    {/* Scores */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem', fontSize: '0.78rem', flexWrap: 'wrap' }}>
                        <span>Confidence: <strong style={{ color: '#40c4ff' }}>{d.confidence}</strong>/100</span>
                        <span>Risk: <strong style={{ color: '#ff5252' }}>{d.risk}</strong>/100</span>
                        <span>Net: <strong style={{ color: '#ffd740', fontFamily: 'var(--mono)' }}>{netPct}</strong></span>
                        <span>Kelly: <strong style={{ fontFamily: 'var(--mono)' }}>{kellyPct}</strong></span>
                        <span>Size: <strong style={{ fontFamily: 'var(--mono)', color: '#b388ff' }}>{d.position_sizing?.recommended_size_usd || '—'}</strong></span>
                    </div>

                    {/* Execution Path + Reasoning */}
                    {d.execution_path && d.execution_path.length > 0 && (
                        <div style={{
                            padding: '0.6rem', borderRadius: '0.4rem', background: 'rgba(0,0,0,0.3)',
                            fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--mono)',
                            lineHeight: 1.6, marginTop: '0.3rem',
                        }}>
                            {d.execution_path.map((step, j) => (
                                <div key={j}>{step}</div>
                            ))}
                            {d.reasoning?.primary_reason && (
                                <div style={{ marginTop: '0.3rem', color: '#ffd740' }}>💡 {d.reasoning.primary_reason}</div>
                            )}
                            {/* Render risk_factors as object entries */}
                            {riskEntries.map(([key, val]) => (
                                <div key={key} style={{ color: '#ff8a80' }}>
                                    ⚠ {key.replace(/_/g, ' ')}: {typeof val === 'object' ? val.label || `score ${val.score}` : val}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
                );
            })}
            {decisions.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    <Brain size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} /><br />
                    No decisions yet — agent is learning market patterns...
                </div>
            )}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════
// TAB: PORTFOLIO
// ═══════════════════════════════════════════════════════

const PortfolioTab = ({ perf, equity, trades }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Performance Metrics — full width */}
        <div className="glass-card" style={{ padding: '1.2rem', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LineChart size={16} style={{ color: '#69f0ae' }} /> Portfolio Performance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem' }}>
                {[
                    { label: 'Balance', value: `$${perf.balance?.toLocaleString(undefined, { maximumFractionDigits: 2 }) || '10,000'}`, color: '#fff' },
                    { label: 'Total P&L', value: `${(perf.total_pnl || 0) >= 0 ? '+' : ''}$${perf.total_pnl?.toFixed(2) || '0'}`, color: (perf.total_pnl || 0) >= 0 ? '#69f0ae' : '#ff5252' },
                    { label: 'Win Rate', value: perf.win_rate != null ? `${perf.win_rate.toFixed(1)}%` : '—', color: '#40c4ff' },
                    { label: 'Sharpe Ratio', value: perf.sharpe_ratio?.toFixed(2) || '—', color: '#b388ff' },
                    { label: 'Profit Factor', value: perf.profit_factor?.toFixed(2) || '—', color: '#ffd740' },
                    { label: 'Max Drawdown', value: perf.max_drawdown_pct != null ? `${perf.max_drawdown_pct.toFixed(2)}%` : '—', color: '#ff5252' },
                    { label: 'Total Trades', value: perf.total_trades || '0', color: '#fff' },
                    { label: 'Circuit Breaker', value: perf.circuit_breaker_active ? '🔴 ACTIVE' : '🟢 OK', color: perf.circuit_breaker_active ? '#ff5252' : '#69f0ae' },
                ].map((m, i) => (
                    <div key={i} style={{ padding: '0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.03)' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{m.label}</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--mono)', color: m.color }}>{m.value}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Equity Curve */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem' }}>📈 Equity Curve</h3>
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '2px', padding: '0 0.5rem' }}>
                {equity.slice(-60).map((e, i) => {
                    const min = Math.min(...equity.slice(-60).map(x => x.balance));
                    const max = Math.max(...equity.slice(-60).map(x => x.balance));
                    const range = max - min || 1;
                    const h = ((e.balance - min) / range) * 180;
                    return (
                        <div key={i} style={{
                            flex: 1, height: `${h}px`, borderRadius: '2px 2px 0 0',
                            background: e.balance >= 10000 ? 'rgba(105,240,174,0.6)' : 'rgba(255,82,82,0.6)',
                            minWidth: '2px',
                        }} title={`$${e.balance.toFixed(2)}`} />
                    );
                })}
                {equity.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', width: '100%', alignSelf: 'center' }}>
                        No trades yet
                    </div>
                )}
            </div>
        </div>

        {/* Recent Trades */}
        <div className="glass-card" style={{ padding: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '1rem' }}>📋 Recent Trades</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {trades.map((t, i) => (
                    <div key={i} style={{
                        padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem',
                    }}>
                        <div>
                            <span style={{ fontWeight: 700 }}>{t.symbol?.replace('USDT', '')}</span>
                            <span style={{
                                marginLeft: '0.5rem', fontSize: '0.65rem', fontWeight: 700,
                                color: t.result === 'WIN' ? '#69f0ae' : '#ff5252',
                            }}>{t.result}</span>
                        </div>
                        <span style={{
                            fontFamily: 'var(--mono)', fontWeight: 700,
                            color: t.pnl >= 0 ? '#69f0ae' : '#ff5252',
                        }}>
                            {t.pnl >= 0 ? '+' : ''}{t.pnl?.toFixed(2)}
                        </span>
                    </div>
                ))}
                {trades.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        No trades executed yet
                    </div>
                )}
            </div>
        </div>
    </div>
);

export default AgentPage;
