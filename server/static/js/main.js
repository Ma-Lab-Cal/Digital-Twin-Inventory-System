// 	// This can also be used to update information on a certain item
//     // server will auto choose to add or update based on the "key" provided
// 		var inventory_addItem = function() {
// 			var socket = new WebSocket("ws://localhost:8080");
// 			socket.addEventListener("open", function(e) {
// 				var request = {
// 					"method": "SET",
// 					"params": {
// 						"key": "/inventory_item/202204050005",
//                         // The key (same as sku) to identify equipments, uses yyyymmddCODE, where CODE accumulates from 0000
// 						"value": {
// 								"sku": "202204050005",
// 								"uri": "",
// 								"name": "RIDGID 1/2'' Close Quarters Tubing Cutter Model 103",
// 								"qty": "1",
// 								"description": "",
// 								"tag": "tools",
// 								"img": ""
// 						}
//                         // Get input data from add and put into this "value" field
// 					}
// 				}
// 				socket.send(JSON.stringify(request)+"\n");
// 			});

// 			socket.addEventListener("message", function(e) {
// 				console.log(e.data);
// 			});
// 		};

// Global
let currObj = "";
let currCat = "";
function flip(b) {return b = !b;}
let objInfo = "Equipment Info";
document.getElementById("eqpInfo").style.display = "none";
document.getElementById("editInfo").style.display = "none";
document.getElementById("plotFunc").style.display = "none";
// Global



// Time
const d = new Date();
function timeConverter(timestamp) {
  var t = new Date(timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = t.getFullYear();
  var month = months[t.getMonth()];
  var date = t.getDate();
  date = date.toString();
  if (date.length == 1) {
      date = '0' + date;
  }
  var hour = t.getHours();
  hour = hour.toString();
  if (hour.length == 1) {
      hour = '0' + hour;
  }
  var min = t.getMinutes();
  min = min.toString();
  if (min.length == 1) {
      min = '0' + min;
  }
  var sec = t.getSeconds();
  sec = sec.toString();
  if (sec.length == 1) {
      sec = '0' + sec;
  }
  // var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  var time = month + ' ' + date + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

function timeReader(timestamp) {
    var t = new Date(timestamp * 1000);
    var year = t.getFullYear();
    var month = t.getMonth() + 1;
    month = month.toString();
    if (month.length == 1) {
        month = '0' + month;
    }
    var date = t.getDate();
    date = date.toString();
    if (date.length == 1) {
        date = '0' + date;
    }
    var hour = t.getHours();
    hour = hour.toString();
    if (hour.length == 1) {
        hour = '0' + hour;
    }
    var min = t.getMinutes();
    min = min.toString();
    if (min.length == 1) {
        min = '0' + min;
    }
    var sec = t.getSeconds();
    sec = sec.toString();
    if (sec.length == 1) {
        sec = '0' + sec;
    }
    var time = month + '/' + date + '/' + year + " " + hour + ':' + min + ':' + sec;
    return time;
  }

function timeRecognizer(texttime) {
    const [dateComponents, timeComponents] = texttime.split(' ');
    const [month, day, year] = dateComponents.split('/');
    const [hours, minutes, seconds] = timeComponents.split(':');
    const date = new Date(+year, month - 1, +day, +hours, +minutes, +seconds);
    const unixTimestamp = date.getTime() / 1000;
    return unixTimestamp;
}
// Time



// JSON
var raw_entries = [];
let objMap = new Map([]);
var inventory_list = [];
var inventory_fetchAll = function() {
    var socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("open", function(e) {
        var request = {
            "method": "GET",
            "params": {
                "key": "/inventory_item/%"
            }
        }
        socket.send(JSON.stringify(request) + "\n");
    });
    socket.addEventListener("message", function(e) {
        let data = JSON.parse(e.data);
        inventory_list = [];
        for (let i=0; i<data.length; i+=1) {
            inventory_list.push(JSON.parse(data[i][1]));
        }
    });
};
inventory_fetchAll();
function useData() {
    for (let i = 0; i < inventory_list.length; i += 1) {
        raw_entries.push(inventory_list[i].name);
    }
    for (let i = 0; i < raw_entries.length; i += 1) {
        objMap.set(raw_entries[i], inventory_list[i]);
    }
}
setTimeout(useData, 2500);

// async function fetchData() {
//     let file = 'json/sample.json';
//     let r = await fetch(file);
//     return await r.json();
// }
// async function useData() {
//     let s = await fetchData();
//     for (let i = 0; i < s.length; i += 1) {raw_entries.push(s[i].Name);}
//     for (let i = 0; i < raw_entries.length; i += 1) {objMap.set(raw_entries[i], s[i]);}
// }
// useData();
// JSON



// Dropdown List
function dropList(name, a) {
    currCat = name;
    dropDown(a);
    console.log(currCat);
}

function dropDown(a) {
    let li = a.parentElement,
        submenu = li.getElementsByTagName('ul')[0];
    if (submenu.style.display == "block") {
        submenu.style.display = "none";
    } else {
        submenu.style.display = "block";
    }
    return false;
}

function objSelect(name) {
    let location = objMap.get(name).uri;
    objInfo = location;
    currObj = name;
    addPoint(pointMap.get(location).x, pointMap.get(location).y); // update with canvas
}
// Dropdown List



// Change Image
// needs improvement with regex
function changeImage(img) {
    removePoint(); // update with canvas
    document.querySelector('.image').src = img;
}
// Change Image



// Add/Remove/Edit Points
// update with canvas
const pointMap = new Map([
  ["Test0", {x:250, y:250}],
  ["Test2", {x:250, y:500}],
  ["Test5", {x:500, y:500}],
  ["Test8", {x:500, y:250}],
  [" ", {x:2500, y:2500}]
]); // manually set the point locations, become ratios once canvas is used

// const pointMap = new Map([
//     ["location1", {x:250, y:250}],
//     ["location2", {x:250, y:500}],
//     ["location3", {x:500, y:500}],
//     ["location4", {x:500, y:250}],
//     ["location5", {x:375, y:375}],
//     ["location6", {x:400, y:600}]
//   ]);

let pointStatus = false;
let childStatus = false;
let hasCircle = false
function pointStatusChange() {
    childStatus = false;
    pointStatus = !pointStatus;
}

document.onclick = function(e) {
    if (pointStatus && childStatus) {
        clearStyle();
        addPoint(e.pageX - 10, e.pageY - 10); // do something to record the latest point addition location
        pointStatus = false;
        childStatus = false;
    }
    childStatus = true;
}

function addPoint(x, y) {
    changeImage('/static/img/Plan 00.png');
    // changeImage('img/Plan 00.png');
    var button = document.createElement('div');
    button.style.position = 'absolute';
    button.style.left = x + 'px';
    button.style.top = y + 'px';
    button.innerHTML = '<div class="circle"></br>' + objInfo + '</div>';
    removePoint();
    document.body.appendChild(button);
    hasCircle = true
}

function freeAdd(name, num) {
    var button = document.createElement('div');
    button.style.position = 'absolute';
    button.style.left = pointMap.get(objMap.get(name).uri).x + 'px';
    button.style.top = pointMap.get(objMap.get(name).uri).y + 'px';
    button.innerHTML = '<div class="circle">' + num + '</br>' + objMap.get(name).uri + '</div>'; // replace with y-axis info
    document.body.appendChild(button);
    hasCircle = true
}

function removePoint() {
    document.querySelectorAll('.circle').forEach(e => e.remove());
}
// Add/Remove/Edit Points



// Add and Edit Buttons
const add = document.querySelector('.add');
const edit = document.querySelector('.edit');

let addMode = false;
function addEqp() {
    addMode = !addMode;
    if (addMode) {
        document.getElementById("eqpInfo").style.display = "block";
    } else {
        document.getElementById("eqpInfo").style.display = "none";
    }
}

add.addEventListener('click', function onClick() {
    if (addMode) {
        add.classList.remove("add");
        add.classList.add("clkdadd");
    } else {
        add.classList.remove("clkdadd");
        add.classList.add("add");
    }
})

let editMode = false;
function editEqp() {
    editMode = !editMode;
    if (!editMode) {
        document.getElementById("editInfo").style.display = "none";
    } else {
        document.getElementById("editInfo").style.display = "block";
        if (currObj != "") {
            document.querySelector('.objTitle').innerText = currObj;
            document.getElementById("locInfo").value = objMap.get(currObj).uri;
            document.getElementById("qtyInfo").value = objMap.get(currObj).qty;
            document.getElementById("desInfo").value = objMap.get(currObj).description;
        } else{
            document.querySelector('.objTitle').innerText = "No object selected!";
        }
    }
}

edit.addEventListener('click', function onClick() {
  if (editMode) {
        edit.classList.remove("edit");
        edit.classList.add("clkdedit");
    } else {
        edit.classList.remove("clkdedit");
        edit.classList.add("edit");
    }
})
// Add and Edit Buttons



// History & Download
const history = document.querySelector('.history');
let historyMode = false;
history.addEventListener('click', function onClick() {
    if (historyMode) {
        history.classList.remove("history");
        history.classList.add("clkdhistory");
    } else {
        history.classList.add("history");
        history.classList.remove("clkdhistory");
    }
})
function stopPlot() {
    historyMode = !historyMode;
    if (!historyMode) {
        document.getElementById("Interval").value = 120;
        document.getElementById("End").value = timeReader(new Date().getTime() / 1000);
        document.getElementById("plotFunc").style.display = "none";
    } else {
        document.getElementById("plotFunc").style.display = "block";
        document.getElementById("Interval").value = 120;
        document.getElementById("End").value = timeReader(new Date().getTime() / 1000);
    }
}
// History & Download



// Search Engine
var word_mapping = [["Ø", "phi"], ["µm", "um"], ["°", "deg"]];
var entries = [];

var onSearchHandler = function(e) {
    removePoint();

    words = searchbar.value.toLowerCase();

    if (!words) {
        autofill.innerHTML = "";
        for (let n = 0; n < entries.length; n += 1) {
            autofill.innerHTML += "<div class=\"search-result\"><a href=\"javascript: void();\" onclick=\"return objSelect('" + raw_entries[n] + "')\">" + raw_entries[n] + "</a></div>";
        }
        return;
    }

  tokens = words.split(" ");
  autofill_results = [];
  autofill_list = [];

  for (let i = 0; i < tokens.length; i += 1) {
    if (!tokens[i]) continue;

    for (let n = 0; n < entries.length; n += 1) {
      let pos = entries[n].indexOf(tokens[i]);
      if (pos != -1) {
        let display_text = raw_entries[n].substring(0, pos) + "<span class=\"highlight\">" + raw_entries[n].substring(pos, pos + tokens[i].length) + "</span>" + raw_entries[n].substring(pos + tokens[i].length);
        autofill_list.push(raw_entries[n])
        autofill_results.push(display_text);
      }
    }

    for (let n = 0; n < entries.length; n += 1) {
        if (!autofill_list.includes(raw_entries[n])) {
            let eTags = objMap.get(raw_entries[n]).tag.toLowerCase();
            if (eTags.includes(tokens[i] + ";")) {
                let display_text = raw_entries[n] + " " + "<span class=\"highlight\">(" + tokens[i] + ")</span>";
                autofill_list.push(raw_entries[n])
                autofill_results.push(display_text);
            }
        }
    }
  }

    autofill.innerHTML = "";
    for (let i = 0; i < autofill_results.length; i += 1) {
        autofill.innerHTML += "<div class=\"search-result\"><a href=\"javascript: void();\" onclick=\"return objSelect('" + autofill_list[i] + "')\">" + autofill_results[i] + "</a></div>";
    }
    if (autofill_results.length <= 5) {
        changeImage('/static/img/Plan 00.png');
        for (let i = 0; i < autofill_results.length; i += 1) {
            freeAdd(autofill_list[i], i + 1);
        }
    }
}

setTimeout(window.onload = function() {
    searchbar.addEventListener("keyup", onSearchHandler);
  
    for (let n = 0; n < raw_entries.length; n += 1) {
      entries[n] = raw_entries[n];
      for (let i = 0; i < word_mapping.length; i += 1) {
        entries[n] = entries[n].replace(word_mapping[i][0], word_mapping[i][1]);
      }
      entries[n] = entries[n].toLowerCase()
    }
    
    onSearchHandler();
  }, 2500);
// Search Engine



// Data Fetch
var env_data = [];
var interval = 120;
var end = new Date().getTime() / 1000;
var env_fetch = function() {
    var socket = new WebSocket("ws://localhost:8000");
    socket.addEventListener("open", function(e) {
        var request = {
            "method": "GET",
            "params": {
                "type": "range",
                "range": [end - interval, end]
            }
        }
        socket.send(JSON.stringify(request)+"\n");
    });
    socket.addEventListener("message", function(e) {
    let data = JSON.parse(e.data);
    data = data.data;
    env_data = data;
    });
};
// Data Fetch



// Data Plot
// var layout = {
//     legend: {"orientation": "h", x: 0, y: 1.05, yanchor: 'top'},
//     colorway: ['red', 'green', 'blue', 'red', 'green', 'blue', 'red', 'green', 'blue'],
//     grid: {rows: 3, columns: 1, roworder: 'bottom to top'},
//     autosize: false, width: 445, height: 900, paper_bgcolor: 'ffffff', plot_bgcolor: 'f4f4f4',
//     margin: {l: 35, r: 25, b: 150, t: 20, pad: 0},
//     annotations: [
//     {text: "Temperature", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.1, xref: 'x1 domain', yref: 'y1 domain'},
//     {text: "Humidity", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.1, xref: 'x2 domain', yref: 'y2 domain'},
//     {text: "Brightness", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.1, xref: 'x3 domain', yref: 'y3 domain'}
//     ],
//     xaxis1: {showgrid: false, showticklabels: false, matches: 'x3', zeroline: false},
//     xaxis2: {showgrid: false, showticklabels: false, matches: 'x3', zeroline: false},
//     xaxis3: {showgrid: false, zeroline: false, title: {text: 'Time', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}},
//     yaxis1: {showgrid: false, title: {text: '°C', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}},
//     yaxis2: {showgrid: false, zeroline: false, title: {text: '%', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}},
//     yaxis3: {showgrid: false, zeroline: false, title: {text: 'lux', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}}
//     };

var layout = {
    legend: {"orientation": "v", x: 1.35, y: 1.05, yanchor: 'top', xanchor: 'right'},
    colorway: ['red', 'green', 'blue', 'red', 'green', 'blue', 'red', 'green', 'blue'],
    grid: {rows: 3, columns: 1, roworder: 'bottom to top', pattern: 'independent'},
    autosize: false, width: 445, height: 900,
    margin: {l: 35, r: 25, b: 150, t: 20, pad: 0},
    annotations: [
    {text: "Temperature", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.2, xref: 'x1 domain', yref: 'y1 domain'},
    {text: "Humidity", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.2, xref: 'x2 domain', yref: 'y2 domain'},
    {text: "Brightness", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.2, xref: 'x3 domain', yref: 'y3 domain'}
    ],
    xaxis1: {automargin: true, tickangle: 90, title: {standoff: 10, text: 'Time', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, showticklabels: true, linecolor: 'black', linewidth: 2, ticks: 'outside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis2: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'outside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis3: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'outside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis1: {automargin: true, title: {standoff: 10, text: '°C', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'outside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis2: {automargin: true, title: {standoff: 10, text: '%', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'outside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis3: {automargin: true, title: {standoff: 10, text: 'lux', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'outside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',}
    };

var data = [
      {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "1", name: "Room 1", mode: "lines", type: "scatter"},
      {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "2", name: "Room 2", mode: "lines", type: "scatter"},
      {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "3", name: "Room 3", mode: "lines", type: "scatter"},
      {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "1", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
      {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "2", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
      {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "3", name: "Room 3", mode: "lines", type: "scatter", showlegend: false},
      {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "1", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
      {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "2", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
      {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "3", name: "Room 3", mode: "lines", type: "scatter", showlegend: false},
      ];

let numPlots = 3;
let numRooms = 3;

// function getData() {return Math.random();}
function getData(l, p, r) {
    if (r = 0) {
        switch (p) {
            case 0:
            return env_data[l]["temperature"];
            case 1:
            return env_data[l]["humidity"];
            case 2:
            return env_data[l]["lux"];
        }
    } else if (r = 1) {
        switch (p) {
            case 0:
            return env_data[l]["temperature"];
            case 1:
            return env_data[l]["humidity"];
            case 2:
            return env_data[l]["lux"];
        }
    } else if (r = 2) {
        switch (p) {
            case 0:
            return env_data[l]["temperature"];
            case 1:
            return env_data[l]["humidity"];
            case 2:
            return env_data[l]["lux"];
        }
    }
}

// function growth() {return timeConverter(Date.now());}

function growth(i) {return timeConverter(env_data[i]["timestamp"]);}

Plotly.plot('chart', data, layout);

function getFormData() {
    if (!historyMode) {
        interval = 120;
        end = new Date().getTime() / 1000;
    } else {
        var int = document.getElementById('Interval').value;
        var en = document.getElementById('End').value;
        interval = int;
        end = timeRecognizer(en);
    }
    return false;
    }

setInterval(function() {
    getFormData();
    env_fetch();
    for (var l = 0; l < env_data.length; l += 1) {
        for (var i = 0; i < numPlots; i += 1) {
            for (var j = 0; j < numRooms; j += 1){
                data[i * numPlots + j].x.push(growth(l));
                // data[i * numPlots + j].y.push(getData());
                data[i * numPlots + j].y.push(getData(l, i, j));
                data[i * numPlots + j].x = data[i * numPlots + j].x.slice(-interval / 6);
                data[i * numPlots + j].y = data[i * numPlots + j].y.slice(-interval / 6);
            }
        }
    }
    Plotly.redraw('chart');
}, 5000);
// Data Plot









