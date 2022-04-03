import time
import json
import socket

import random

import serial

time.sleep(5)

ser = serial.Serial("COM3", baudrate=115200, timeout=1)

data = {}

while True:
    c = ser.read()
    buffer = b""
    while c:
        buffer += c
        c = ser.read()
    
    if not buffer:
        continue
    try:
        data = json.loads(buffer.decode())
    except json.decoder.JSONDecodeError as e:
        print(e)
        print(buffer)
        continue
    print(data)
        
    data["/node0/timestamp"] = time.time()
    
    print("sending data")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    while True:
        try:
            s.connect(("127.0.0.1", 8000))
        except ConnectionRefusedError:
            print("retrying...")
            continue
        break

    s.sendall(json.dumps({"func": "set", "params": data}).encode() + b"\n")
    
    print("reading response")
    try:
        data = s.recv(1024)
    except ConnectionResetError:
        continue
    print(data)
    s.close()
