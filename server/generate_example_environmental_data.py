

import time
import random
import json
import asyncio
import threading

import websockets
import serial

data = {
    "/timestamp": time.time(),
    "/node0/temperature": random.random() * 50,
    "/node1/temperature": random.random() * 50,
    "/node0/humidity": random.random(),
    "/node1/humidity": random.random(),
    "/node0/pressure": random.random() * 10000,
    "/node1/pressure": random.random() * 10000,
    }
stopped = False

ser = serial.Serial("COM3", baudrate=115200, timeout=0.2)

def serialHandler():
    global data
    while not stopped:
        c = ser.read()
        buf = b""
        while c:
            buf += c
            c = ser.read()
        
        if not buf:
            continue

        ser_data = json.loads(buf.decode())

        data["/timestamp"] = time.time()
        data["/node0/temperature"] = ser_data["temp"]
        data["/node0/humidity"] = ser_data["humidity"]
        data["/node1/temperature"] = random.random() * 5 + 20

        print(ser_data)


def getData():
    global data
    return data


t = threading.Thread(target=serialHandler)
t.start()



async def echo(websocket):
    async for message in websocket:
        print(time.time(), message)
        await websocket.send(json.dumps(getData()))

async def main():
    async with websockets.serve(echo, "localhost", 8080):
        await asyncio.Future()  # run forever

try:
    asyncio.run(main())
except KeyboardInterrupt:
    print("stop")
    stopped = True

