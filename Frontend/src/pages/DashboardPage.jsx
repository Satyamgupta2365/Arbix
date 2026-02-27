import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createChart, ColorType } from 'lightweight-charts';
import {
    LayoutDashboard, BarChart3, Search, Globe, Clock,
    Brain, Target, Wallet, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import ArbixLogo from '../components/ArbixLogo';
import Sidebar from '../components/Sidebar';

const DashboardPage = () => {
    const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
    const [searchInput, setSearchInput] = useState('');
    const [chartType, setChartType] = useState('area');
    const [marketData, setMarketData] = useState(null);
    const [topCoins, setTopCoins] = useState([]);
    const [storedPrices, setStoredPrices] = useState({});
    const [timezone, setTimezone] = useState('IST');
    const [currentTime, setCurrentTime] = useState(new Date());
    const chartContainerRef = useRef();
    const chartRef = useRef();
    const seriesRef = useRef();
    const wsRef = useRef(null);

    // Live clock updater
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getTimeInZone = (tz) => {
        const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
        if (tz === 'IST') {
            return currentTime.toLocaleTimeString('en-IN', { ...options, timeZone: 'Asia/Kolkata' });
        } else {
            return currentTime.toLocaleTimeString('en-US', { ...options, timeZone: 'America/New_York' });
        }
    };

    const getTzOffsetSeconds = () => {
        return timezone === 'IST' ? 5.5 * 3600 : -5 * 3600;
    };

    const coins = [
        { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
        { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
        { symbol: 'BNBUSDT', name: 'BNB', icon: '🔶' },
        { symbol: 'SOLUSDT', name: 'Solana', icon: '◎' },
        { symbol: 'XRPUSDT', name: 'XRP', icon: '✕' },
        { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
        { symbol: 'ADAUSDT', name: 'Cardano', icon: '₳' },
        { symbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺' },
        { symbol: 'DOTUSDT', name: 'Polkadot', icon: '●' },
        { symbol: 'MATICUSDT', name: 'Polygon', icon: '⬡' },
    ];

    // Fetch latest stored prices from Supabase
    useEffect(() => {
        const fetchStoredPrices = async () => {
            try {
                const { data, error } = await supabase
                    .from('coin_prices')
                    .select('symbol, price, change_percent, high_24h, low_24h, volume, recorded_at')
                    .order('recorded_at', { ascending: false });

                if (data && !error) {
                    const latest = {};
                    data.forEach(row => {
                        if (!latest[row.symbol]) {
                            latest[row.symbol] = row;
                        }
                    });
                    setStoredPrices(latest);
                }
            } catch (e) {
                console.log('Supabase fetch:', e);
            }
        };
        fetchStoredPrices();
        const interval = setInterval(fetchStoredPrices, 30000);
        return () => clearInterval(interval);
    }, []);

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
                const offset = getTzOffsetSeconds();
                const formatted = data.map(d => ({ time: Math.floor(d[0] / 1000) + offset, value: parseFloat(d[4]) }));
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
                    seriesRef.current.update({ time: Math.floor(Date.now() / 1000) + getTzOffsetSeconds(), value: parseFloat(payload.price) });
                }
            } else {
                setSelectedCoin('BTCUSDT');
            }
        };
        return () => { if (wsRef.current) wsRef.current.close(); };
    }, [selectedCoin, timezone]);

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
            <Sidebar
                active="dashboard"
                topCoins={topCoins}
                selectedCoin={selectedCoin}
                onSelectCoin={setSelectedCoin}
            />

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
                        <button
                            className="status-badge"
                            onClick={() => setTimezone(tz => tz === 'IST' ? 'EST' : 'IST')}
                            style={{ cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
                            title="Click to toggle timezone"
                        >
                            <Globe size={12} color="var(--gold)" />
                            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{timezone}</span>
                        </button>
                        <div className="status-badge">
                            <Clock size={12} color="var(--text-muted)" />
                            <span style={{ color: 'var(--text-secondary)' }}>{getTimeInZone(timezone)}</span>
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

                {/* Pinned Assets — from Supabase */}
                <div style={{ marginTop: '2rem' }}>
                    <div className="assets-section-title">Top 10 Assets — Live from Supabase</div>
                    <div className="glass-grid">
                        {coins.map(coin => {
                            const sp = storedPrices[coin.symbol];
                            const change = sp ? parseFloat(sp.change_percent) : null;
                            return (
                                <motion.div
                                    key={coin.symbol}
                                    className={`coin-card ${selectedCoin === coin.symbol ? 'active' : ''}`}
                                    onClick={() => setSelectedCoin(coin.symbol)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1.3rem' }}>{coin.icon}</span>
                                        {change !== null && (
                                            <span style={{
                                                fontFamily: 'var(--mono)',
                                                fontSize: '0.72rem',
                                                fontWeight: 700,
                                                color: change >= 0 ? 'var(--green)' : 'var(--red)',
                                            }}>
                                                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.15rem' }}>{coin.name}</div>
                                    {sp ? (
                                        <>
                                            <div style={{ fontFamily: 'var(--mono)', fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.15rem' }}>
                                                ${parseFloat(sp.price).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                            <div style={{ fontFamily: 'var(--mono)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                                Vol: {parseFloat(sp.volume).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--mono)' }}>
                                            {coin.symbol}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
