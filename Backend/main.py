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

@app.get("/")
async def root():
    return {"message": "Arbix Multi-Coin Backend is running"}

@app.get("/price/{symbol}")
async def get_price(symbol: str):
    url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol.upper()}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

@app.websocket("/ws/trading/{symbol}")
async def websocket_endpoint(websocket: WebSocket, symbol: str):
    await websocket.accept()
    try:
        async with httpx.AsyncClient() as client:
            while True:
                # Poll Binance 24hr ticker for the specific symbol
                url = f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol.upper()}"
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
                else:
                    await websocket.send_json({"error": "Symbol not found"})
                    break
                await asyncio.sleep(1)
    except WebSocketDisconnect:
        print(f"Client disconnected for {symbol}")
    except Exception as e:
        print(f"Error for {symbol}: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
