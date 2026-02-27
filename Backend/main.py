from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import httpx
import json
import websockets as ws_client
from contextlib import asynccontextmanager

# ── Supabase Config ──
SUPABASE_URL = "https://icdqhsxbceugjeasunom.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZHFoc3hiY2V1Z2plYXN1bm9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMzg3OTYsImV4cCI6MjA4NzcxNDc5Nn0.pqgUr7js-DlvweLQ3J5jNlYh_lcKJuLEbNqnZKMFKUU"
SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

TOP_COINS = [
    "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
    "DOGEUSDT", "ADAUSDT", "AVAXUSDT", "DOTUSDT", "MATICUSDT"
]

# ── Background task: Fetch & store top 10 coin prices every 60s ──
async def price_collector():
    """Fetches top 10 coin prices from Binance and stores them in Supabase every 60 seconds."""
    while True:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                # Fetch all 24hr tickers from Binance
                response = await client.get("https://api.binance.com/api/v3/ticker/24hr")
                all_tickers = response.json()

                # Filter to our top 10 coins
                rows = []
                for ticker in all_tickers:
                    if ticker["symbol"] in TOP_COINS:
                        rows.append({
                            "symbol": ticker["symbol"],
                            "price": float(ticker["lastPrice"]),
                            "change_percent": float(ticker["priceChangePercent"]),
                            "high_24h": float(ticker["highPrice"]),
                            "low_24h": float(ticker["lowPrice"]),
                            "volume": float(ticker["volume"]),
                        })

                if rows:
                    # Insert into Supabase
                    insert_url = f"{SUPABASE_URL}/rest/v1/coin_prices"
                    res = await client.post(insert_url, headers=SUPABASE_HEADERS, json=rows)
                    if res.status_code in (200, 201):
                        print(f"✅ Stored {len(rows)} coin prices to Supabase")
                    else:
                        print(f"⚠️ Supabase insert status {res.status_code}: {res.text}")

        except Exception as e:
            print(f"❌ Price collector error: {e}")

        await asyncio.sleep(60)


async def kline_collector():
    """Fetches 24h kline (5m interval) data from Binance for all top coins and stores in Supabase."""
    while True:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                for symbol in TOP_COINS:
                    try:
                        # Fetch 24h of 5-minute klines (288 candles)
                        url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval=5m&limit=288"
                        response = await client.get(url)
                        klines = response.json()

                        if not isinstance(klines, list):
                            continue

                        rows = []
                        for k in klines:
                            rows.append({
                                "symbol": symbol,
                                "open_time": int(k[0]),
                                "open_price": float(k[1]),
                                "high_price": float(k[2]),
                                "low_price": float(k[3]),
                                "close_price": float(k[4]),
                                "volume": float(k[5]),
                                "close_time": int(k[6]),
                            })

                        if rows:
                            # Delete old klines for this symbol first
                            delete_url = f"{SUPABASE_URL}/rest/v1/coin_klines?symbol=eq.{symbol}"
                            await client.delete(delete_url, headers=SUPABASE_HEADERS)

                            # Insert new klines in batches of 100
                            for i in range(0, len(rows), 100):
                                batch = rows[i:i + 100]
                                insert_url = f"{SUPABASE_URL}/rest/v1/coin_klines"
                                res = await client.post(insert_url, headers=SUPABASE_HEADERS, json=batch)
                                if res.status_code not in (200, 201):
                                    print(f"⚠️ Kline insert error for {symbol}: {res.status_code}")

                        # Small delay between coins to avoid rate limits
                        await asyncio.sleep(0.5)

                    except Exception as e:
                        print(f"❌ Kline fetch error for {symbol}: {e}")

                print(f"📊 Updated 24h kline data for {len(TOP_COINS)} coins")

        except Exception as e:
            print(f"❌ Kline collector error: {e}")

        await asyncio.sleep(300)  # Every 5 minutes


async def cleanup_old_data():
    """Deletes price records older than 24 hours to keep the database lean."""
    while True:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                from datetime import datetime, timedelta, timezone
                cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).strftime('%Y-%m-%dT%H:%M:%S')
                delete_url = f"{SUPABASE_URL}/rest/v1/coin_prices?recorded_at=lt.{cutoff}"
                res = await client.delete(delete_url, headers=SUPABASE_HEADERS)
                if res.status_code in (200, 204):
                    print(f"🧹 Cleaned old price records (before {cutoff})")
                else:
                    print(f"⚠️ Cleanup status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"❌ Cleanup error: {e}")

        await asyncio.sleep(600)  # Every 10 minutes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: launch background tasks. Shutdown: cancel them."""
    collector_task = asyncio.create_task(price_collector())
    kline_task = asyncio.create_task(kline_collector())
    cleanup_task = asyncio.create_task(cleanup_old_data())
    print("🚀 Arbix Backend started — price collector & kline collector active")
    yield
    collector_task.cancel()
    kline_task.cancel()
    cleanup_task.cancel()
    print("🛑 Arbix Backend stopped")


app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Arbix Ultra-Realtime Backend is running"}


@app.get("/price/{symbol}")
async def get_price(symbol: str):
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol.upper()}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()


@app.get("/api/prices/history/{symbol}")
async def get_price_history(symbol: str, hours: int = 24):
    """Get stored price history for a coin from Supabase."""
    try:
        from datetime import datetime, timedelta, timezone
        cutoff = (datetime.now(timezone.utc) - timedelta(hours=hours)).strftime('%Y-%m-%dT%H:%M:%S')
        url = (
            f"{SUPABASE_URL}/rest/v1/coin_prices"
            f"?symbol=eq.{symbol.upper()}"
            f"&recorded_at=gte.{cutoff}"
            f"&order=recorded_at.asc"
            f"&select=price,change_percent,high_24h,low_24h,volume,recorded_at"
        )
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url, headers=SUPABASE_HEADERS)
            return res.json()
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/prices/latest")
async def get_latest_prices():
    """Get the latest stored price for each top 10 coin."""
    try:
        results = []
        async with httpx.AsyncClient(timeout=10) as client:
            for symbol in TOP_COINS:
                url = (
                    f"{SUPABASE_URL}/rest/v1/coin_prices"
                    f"?symbol=eq.{symbol}"
                    f"&order=recorded_at.desc"
                    f"&limit=1"
                    f"&select=symbol,price,change_percent,high_24h,low_24h,volume,recorded_at"
                )
                res = await client.get(url, headers=SUPABASE_HEADERS)
                data = res.json()
                if data and isinstance(data, list) and len(data) > 0:
                    results.append(data[0])
        return results
    except Exception as e:
        return {"error": str(e)}


@app.get("/api/klines/{symbol}")
async def get_klines(symbol: str):
    """Get stored 24h kline data for a coin from Supabase."""
    try:
        url = (
            f"{SUPABASE_URL}/rest/v1/coin_klines"
            f"?symbol=eq.{symbol.upper()}"
            f"&order=open_time.asc"
            f"&select=open_time,open_price,high_price,low_price,close_price,volume"
        )
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(url, headers=SUPABASE_HEADERS)
            data = res.json()
            if isinstance(data, list):
                return data
            return []
    except Exception as e:
        return {"error": str(e)}


@app.websocket("/ws/trading/{symbol}")
async def websocket_endpoint(websocket: WebSocket, symbol: str):
    await websocket.accept()
    binance_ws_url = f"wss://stream.binance.com:9443/ws/{symbol.lower()}@ticker"

    try:
        async with ws_client.connect(
            binance_ws_url,
            ping_interval=20,
            ping_timeout=10,
            close_timeout=5
        ) as bws:
            while True:
                try:
                    data = await asyncio.wait_for(bws.recv(), timeout=30)
                    msg = json.loads(data)

                    await websocket.send_json({
                        "symbol": msg.get("s", symbol),
                        "price": msg.get("c", "0"),
                        "change": msg.get("P", "0"),
                        "high": msg.get("h", "0"),
                        "low": msg.get("l", "0"),
                        "volume": msg.get("v", "0")
                    })
                except asyncio.TimeoutError:
                    # Send a ping to keep the connection alive
                    continue
                except WebSocketDisconnect:
                    print(f"Client disconnected for {symbol}")
                    break
    except WebSocketDisconnect:
        print(f"Client disconnected for {symbol}")
    except Exception as e:
        print(f"WebSocket error for {symbol}: {e}")
        try:
            await websocket.send_json({"error": str(e)})
            await websocket.close()
        except:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
