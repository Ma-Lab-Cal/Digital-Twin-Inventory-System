import os
import sqlite3
import time
import json

conn = sqlite3.connect("test.db")

conn.execute("""CREATE TABLE IF NOT EXISTS NetworkTable (
    timestamp       BIGINT PRIMARY KEY,
    key             TEXT,
    value           LONGTEXT
);""")

for i in range(6307200):
    timestamp = i
    key = "/node0/"

    if not i % 5000:
        print(i, i/6307200)
        conn.commit()
    
    value = {
        "timestampp": 0, 
        "node_name": 123, 
        "temperature": 321, 
        "humidity": 123231,
        "pm1_0": 32132131,
        "pm2_5": 3241321312,
        "pm10": 1321.3,
        "particles_0_3_um": .3214213,
        "particles_1_um": 123421321,
        "particles_10_um": 3215.123213,
        "lux": 123153513412322,
        "magnetic_x": 321321,
        "magnetic_y": 1,
        "magnetic_z": 2,
        "noise": 3,
    }

    exe_str = """INSERT INTO NetworkTable (timestamp, key, value)
        VALUES (
        {timestamp}, "{key}", "{value}");""".format(
            timestamp=timestamp,
            key=key,
            value=json.dumps(value).replace("\"", "\"\"")
    )
    # print(exe_str)
    cur = conn.cursor()
    cur.execute(exe_str)

conn.commit()
conn.close()