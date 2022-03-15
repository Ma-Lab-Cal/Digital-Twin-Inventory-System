

import time
import random
import json
import asyncio

import websockets
import serial


ser = serial.Serial("COM3", baudrate=115200, timeout=0.2)

while True:
    c = ser.read()
    buf = b""
    while c:
        buf += c
        c = ser.read()
    
    
    print(buf)


def getData():
    return {
        "/timestamp": time.time(),
        "/node0/temperature": random.random() * 50,
        "/node1/temperature": random.random() * 50,
        "/node0/humidity": random.random(),
        "/node1/humidity": random.random(),
        "/node0/pressure": random.random() * 10000,
        "/node1/pressure": random.random() * 10000,
        }






async def echo(websocket):
    async for message in websocket:
        print(time.time(), message)
        await websocket.send(json.dumps(getData()))

async def main():
    async with websockets.serve(echo, "localhost", 8080):
        await asyncio.Future()  # run forever

asyncio.run(main())


