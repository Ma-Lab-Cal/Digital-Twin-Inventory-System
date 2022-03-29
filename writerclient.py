import json
import socket
import time
import datetime
import os


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
    s.send(json.dumps({"func": "getAll", "params": {}}).encode())
    try:
        buffer = s.recv(1024)
    except (ConnectionResetError, ConnectionAbortedError):

        ## error reporting
        import datetime
        from smtplib import SMTP_SSL as SMTP
        from email.mime.text import MIMEText
        from email.utils import formataddr

        content = """
        content: Writer Client cannot connect to server
        datetime: {0}
        """.format(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        msg = MIMEText(content, "plain")
        msg["Subject"] = "[Ma Lab Env Sys]: [Error]: Server Down!"
        msg["From"] = formataddr(("MaLabBot", "tk@uncertainty.email"))

        conn = SMTP("hwsmtp.exmail.qq.com")
        conn.login("tk@uncertainty.email", "bGGzXR4Ndo4a4Erf")
        conn.sendmail("tk@uncertainty.email", ["tk.uncertainty@gmail.com"], msg.as_string())
        conn.quit()

        print("[Ma Lab Env Sys]: [Error]: Server Down! reported to admin")

        time.sleep(10)

        ## END error reporting

        s = resetConnection()

        
        ## error reporting
        content = """
        content: Writer Client establish server connection
        datetime: {0}
        """.format(datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

        msg = MIMEText(content, "plain")
        msg["Subject"] = "[Ma Lab Env Sys]: [Info]: Server Back Online"
        msg["From"] = formataddr(("MaLabBot", "tk@uncertainty.email"))

        conn = SMTP("hwsmtp.exmail.qq.com")
        conn.login("tk@uncertainty.email", "bGGzXR4Ndo4a4Erf")
        conn.sendmail("tk@uncertainty.email", ["tk.uncertainty@gmail.com"], msg.as_string())
        conn.quit()
        print("[Ma Lab Env Sys]: [Info]: Server Back Online reported to admin")
        ## END error reporting

        continue
    
    if not buffer:
        continue
    
    data = json.loads(buffer.decode())
    folder_path = "H:\\Shared drives\\Ma Lab SPA\\Test-EnvData\\"
    with open(os.path.join(folder_path, "{0}_node0.csv".format(datetime.datetime.now().strftime("%Y-%m-%d"))), "a", encoding="utf-8") as f:
        entry = data.get("params")
        csv_entry = "{timestamp},{temperature},{humidity},{barometric},{pm1_0},{pm2_5},{pm10},{particles_0_3_um},{particles_1_um},{particles_10_um},{lux},{magnetic_x},{magnetic_y},{magnetic_z}".format(
            timestamp=entry.get("/node0/timestamp"), 
            temperature=entry.get("/node0/temperature"),
            humidity=entry.get("/node0/humidity"),
            barometric=-1,
            pm1_0=entry.get("/node0/pm1_0"),
            pm2_5=entry.get("/node0/pm2_5"),
            pm10=entry.get("/node0/pm10"),
            particles_0_3_um=entry.get("/node0/particles_0_3_um"),
            particles_1_um=entry.get("/node0/particles_1_um"),
            particles_10_um=entry.get("/node0/particles_10_um"),
            lux=entry.get("/node0/lux"),
            magnetic_x=entry.get("/node0/magnetic_x"),
            magnetic_y=entry.get("/node0/magnetic_y"),
            magnetic_z=entry.get("/node0/magnetic_z"),
            )
        f.write(csv_entry + "\n")
    
    with open(os.path.join(folder_path, "{0}_node1.csv".format(datetime.datetime.now().strftime("%Y-%m-%d"))), "a", encoding="utf-8") as f:
        entry = data.get("params")
        csv_entry = "{timestamp},{temperature},{humidity}".format(
            timestamp=entry.get("/node0/timestamp"), 
            temperature=entry.get("/node1/temperature"),
            humidity=entry.get("/node1/humidity"),
            )
        f.write(csv_entry + "\n")

    time.sleep(5)
    print(data)
