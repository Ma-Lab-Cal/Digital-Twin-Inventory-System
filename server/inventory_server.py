import json

from flask import Flask, render_template


test_data = [{
        "SKU":"1",
        "URI" :"location1",
        "Name": "0603 +/  10uF1111111",
        "Qty":"20",
        "Description":"0603 SMT Capacitor 10uF",
        "Tag":"Capacitor;",
        "Img":"https://www.mouser.com/images/avx/images/MLCC_SPL.jpg"
    },
    {
        "SKU":"1",
        "URI":"location2",
        "Name":"0603 SMT  10uF22222222",
        "Qty":"20",
        "Description":"0603 SMT Capacitor 10uF",
        "Tag":"Electronics;",
        "Img":"https://www.mouser.com/images/avx/images/MLCC_SPL.jpg"
    },
    {
        "SKU":"1",
        "URI":"location3",
        "Name":"0603 SMT Capacitor 10uF3333333",
        "Qty":"20",
        "Description":"0603 SMT Capacitor 10uF",
        "Tag":"Small;",
        "Img":"https://www.mouser.com/images/avx/images/MLCC_SPL.jpg"
    },
    {
        "SKU":"1",
        "URI":"location4",
        "Name":"06 SMT Capacitor 10uF44444",
        "Qty":"20",
        "Description":"0603 SMT Capacitor 10uF",
        "Tag":"Capacitor; Electronics; Small;",
        "Img":"https://www.mouser.com/images/avx/images/MLCC_SPL.jpg"
    },
    {
        "SKU":"1",
        "URI":"location5",
        "Name":"06 SMT Capacitor 10uF555555",
        "Qty":"20",
        "Description":"0603 SMT Capacitor 10uF",
        "Tag":"Capacitor; Electronics;",
        "Img":"https://www.mouser.com/images/avx/images/MLCC_SPL.jpg"
    },
    {
        "SKU":"1",
        "URI":"location6",
        "Name":"SMT Capacitor 10uF666666",
        "Qty":"20",
        "Description":"0603 SMT Capacitor 10uF",
        "Tag":"Electronics; Small;",
        "Img":"https://www.mouser.com/images/avx/images/MLCC_SPL.jpg"
    }
]



app = Flask(__name__)

@app.route("/")
def homepage():
    return render_template("index.html")

@app.route("/inventory-data")
def hello_world():
    return json.dumps(test_data).encode()

app.run(host="0.0.0.0", port="8001", debug=True)
