from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import httpx
import json

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@ticker"

@app.get("/")
async def root():
    return {"message": "Arbix Backend is running"}

@app.get("/price/{symbol}")
async def get_price(symbol: str):
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol.upper()}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

@app.websocket("/ws/trading")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        # Connect to Binance WebSocket and stream to client
        async with httpx.AsyncClient() as client:
            while True:
                # We'll use the REST API point provided by user as a fallback or 
                # better yet, use a real websocket connection to Binance if possible.
                # For simplicity and following user's prompt exactly, let's poll 
                # the Binance API every second and push via WebSocket.
                url = "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT"
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    await websocket.send_json({
                        "symbol": data["symbol"],
                        "price": data["lastPrice"],
                        "change": data["priceChangePercent"],
                        "high": data["highPrice"],
                        "low": data["lowPrice"],
                        "volume": data["volume"]
                    })
                await asyncio.sleep(1)
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
