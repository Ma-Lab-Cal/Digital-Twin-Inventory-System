import os
import sqlite3
import time

class EnvDatabase:
    def __init__(self, name, path="."):
        self.name = name
        self.path = path

        if self.name[-3:] != ".db":
            self.name = self.name + ".db"

        self._conn = sqlite3.connect(os.path.join(path, self.name))

        self.keys = [
            "timestamp", 
            "node_name", 
            "temperature", 
            "humidity",
            "pm1_0",
            "pm2_5",
            "pm10",
            "particles_0_3_um",
            "particles_1_um",
            "particles_10_um",
            "lux",
            "magnetic_x",
            "magnetic_y",
            "magnetic_z",
            "noise",
        ]

        self.initTable()

    def initTable(self):
        self._conn.execute("""CREATE TABLE IF NOT EXISTS environmental_data (
                timestamp     DATETIME PRIMARY KEY,
                node_name     TINYTEXT NOT NULL,
                temperature   DOUBLE,
                humidity      DOUBLE,
                pm1_0         DOUBLE,
                pm2_5         DOUBLE,
                pm10          DOUBLE,
                particles_0_3_um  DOUBLE,
                particles_1_um    DOUBLE,
                particles_10_um   DOUBLE,
                lux           DOUBLE,
                magnetic_x    DOUBLE,
                magnetic_y    DOUBLE,
                magnetic_z    DOUBLE,
                noise         DOUBLE
            );""")
    
    def addData(self, data):
        # data filtering
        timestamp =         data.get("timestamp")
        node_name =         data.get("node_name")
        temperature =       data.get("temperature") if data.get("temperature") else -1
        humidity =          data.get("humidity") if data.get("humidity") else -1
        pm1_0 =             data.get("pm1_0") if data.get("pm1_0") else -1
        pm2_5 =             data.get("pm2_5") if data.get("pm2_5") else -1
        pm10 =              data.get("pm10") if data.get("pm10") else -1
        particles_0_3_um =  data.get("particles_0_3_um") if data.get("particles_0_3_um") else -1
        particles_1_um =    data.get("particles_1_um") if data.get("particles_1_um") else -1
        particles_10_um =   data.get("particles_10_um") if data.get("particles_10_um") else -1
        lux =               data.get("lux") if data.get("lux") else -1
        magnetic_x =        data.get("magnetic_x") if data.get("magnetic_x") else -1
        magnetic_y =        data.get("magnetic_y") if data.get("magnetic_y") else -1
        magnetic_z =        data.get("magnetic_z") if data.get("magnetic_z") else -1
        noise =             data.get("noise") if data.get("noise") else -1

        assert timestamp != None
        assert node_name != None

        exe_str = """INSERT INTO environmental_data ({keys})
            VALUES (
                {timestamp}, "{node_name}", {temperature}, {humidity}, 
                {pm1_0}, {pm2_5}, {pm10}, {particles_0_3_um}, {particles_1_um}, {particles_10_um}, 
                {lux}, {magnetic_x}, {magnetic_y}, {magnetic_z}, {noise}
                );""".format(
                    keys=", ".join(self.keys),
                    timestamp=timestamp,
                    node_name=node_name,
                    temperature=temperature,
                    humidity=humidity,
                    pm1_0=pm1_0,
                    pm2_5=pm2_5,
                    pm10=pm10,
                    particles_0_3_um=particles_0_3_um,
                    particles_1_um=particles_1_um,
                    particles_10_um=particles_10_um,
                    lux=lux,
                    magnetic_x=magnetic_x,
                    magnetic_y=magnetic_y,
                    magnetic_z=magnetic_z,
                    noise=noise,
                )

        print(exe_str)
        cur = self._conn.cursor()
        cur.execute(exe_str)

        self._conn.commit()
    
    def getData(self):
        cur = self._conn.cursor()
        cur.execute("SELECT * FROM environmental_data")
        data = cur.fetchall()
        processed_data = []
        for entry in data:
            processed_data.append(dict(zip(self.keys, entry)))
        
        return processed_data

    def close(self):
        self._conn.close()

db = EnvDatabase("env_data.db", "G:\\Shared drives\\Ma Lab SPA\\Test-EnvData")

db.addData({
    "timestamp": time.time(),
    "node_name": "node_0",
    "temperature": 31,
})

print(db.getData())

db.close()
