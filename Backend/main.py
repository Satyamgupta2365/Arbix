from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import httpx
import json
import websockets as ws_client

app = FastAPI()

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

@app.websocket("/ws/trading/{symbol}")
async def websocket_endpoint(websocket: WebSocket, symbol: str):
    await websocket.accept()
    # Binance Stream URL for symbol ticker (mini ticker or individual symbol ticker)
    # เราจะใช้ <symbol>@ticker สำหรับข้อมูลราคา/high/low/volume แบบ real-time
    binance_ws_url = f"wss://stream.binance.com:9443/ws/{symbol.lower()}@ticker"
    
    try:
        async with ws_client.connect(binance_ws_url) as bws:
            while True:
                data = await bws.recv()
                msg = json.loads(data)
                
                # Format to our frontend expectations
                # e: event type, s: symbol, p: price change, P: price change %, w: weight-avg, x: prev close
                # c: last price, Q: last quantity, b: best bid, B: best bid qty, a: best ask, A: best ask qty
                # o: open price, h: high price, l: low price, v: base vol, q: quote vol
                
                await websocket.send_json({
                    "symbol": msg["s"],
                    "price": msg["c"],
                    "change": msg["P"],
                    "high": msg["h"],
                    "low": msg["l"],
                    "volume": msg["v"]
                })
    except WebSocketDisconnect:
        print(f"Client disconnected for {symbol}")
    except Exception as e:
        print(f"WebSocket error for {symbol}: {e}")
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
