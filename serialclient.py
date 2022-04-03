import time
import json
import socket

import random

import serial

time.sleep(5)

ser = serial.Serial("COM3", baudrate=115200, timeout=2)

def resetConnection():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    is_connected = False

    while not is_connected:
        try:
            s.connect(("127.0.0.1", 8000))
        except ConnectionRefusedError:
            print("retrying...")
            continue
        is_connected = True
    
    return s

s = resetConnection()

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
    s.send(json.dumps({"func": "set", "params": data}).encode())
    
    print("reading response")
    try:
        data = s.recv(1024)
    except ConnectionResetError:
        s = resetConnection()
        continue
    print(data)
