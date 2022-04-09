// Global
var raw_entries = [];
let currObj = "";
let currCat = "";
function flip(b) {return b = !b;}
let objInfo = "Equipment Info";
const d = new Date();
document.getElementById("eqpInfo").style.display = "none";
document.getElementById("editInfo").style.display = "none";
document.getElementById("plotFunc").style.display = "none";
// Global



// Reading JSON
async function fetchData() {
    let file = 'http://localhost:8001/inventory-data';
    let r = await fetch(file);
    return await r.json();
}
let objMap = new Map([]);
async function useData() {
    let s = await fetchData();
    for (let i = 0; i < s.length; i += 1) {raw_entries.push(s[i].Name);}
    for (let i = 0; i < raw_entries.length; i += 1) {objMap.set(raw_entries[i], s[i]);}
}
useData();
// Reading JSON



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
    let location = objMap.get(name).URI;
    objInfo = location;
    currObj = name;
    console.log(currObj);
    addPoint(pointMap.get(location).x, pointMap.get(location).y);
}
// Dropdown List



// Change Image
function changeImage(img) {
    removePoint();
    // needs improvement with regex
    // document.querySelector('.location').textContent = img.substr(4, 7);
    document.querySelector('.image').src = img;
}
// Change Image



// Add/Remove/Edit Points
const pointMap = new Map([
  ["location1", {x:250, y:250}],
  ["location2", {x:250, y:500}],
  ["location3", {x:500, y:500}],
  ["location4", {x:500, y:250}],
  ["location5", {x:375, y:375}],
  ["location6", {x:400, y:600}]
]);

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
        addPoint(e.pageX - 10, e.pageY - 10);
        pointStatus = false;
        childStatus = false;
    }
    childStatus = true;
}

function addPoint(x, y) {
    changeImage('/static/img/Plan 00.png');
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
    button.style.left = pointMap.get(objMap.get(name).URI).x + 'px';
    button.style.top = pointMap.get(objMap.get(name).URI).y + 'px';
    button.innerHTML = '<div class="circle">' + num + '</br>' + objMap.get(name).URI + '</div>';
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
    if (addMode) {
        document.getElementById("eqpInfo").style.display = "none";
    } else {
        document.getElementById("eqpInfo").style.display = "block";
    }
    addMode = !addMode;
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
    if (editMode) {
        document.getElementById("editInfo").style.display = "none";
    } else {
        document.getElementById("editInfo").style.display = "block";
        if (currObj != "") {
            document.querySelector('.objTitle').innerText = currObj;
        } else{
            document.querySelector('.objTitle').innerText = "No object selected!";
        }
    }
    editMode = !editMode;
}

edit.addEventListener('click', function onClick() {
  if (pointStatus) {
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
history.addEventListener('click', function onClick() {
    if (historyMode) {
        history.classList.remove("history");
        history.classList.add("clkdhistory");
    } else {
        history.classList.add("history");
        history.classList.remove("clkdhistory");
    }
})
let historyMode = false;
function stopPlot() {
    if (historyMode) {
        document.getElementById("plotFunc").style.display = "none";
    } else {
        document.getElementById("plotFunc").style.display = "block";
    }
    historyMode = !historyMode;
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

window.onload = function() {
  searchbar.addEventListener("keyup", onSearchHandler);

  for (let n = 0; n < raw_entries.length; n += 1) {
    entries[n] = raw_entries[n];
    for (let i = 0; i < word_mapping.length; i += 1) {
      entries[n] = entries[n].replace(word_mapping[i][0], word_mapping[i][1]);
    }
    entries[n] = entries[n].toLowerCase()
  }

  onSearchHandler();
}
// Search Engine


// Data fetch

var env_data = {};

var ws = new WebSocket("ws://127.0.0.1:8000/ws");

var requestData = function() {
  ws.send("hello");
}

ws.onopen = function () {
  console.log("Connection success");
};

ws.onmessage = function (e) {
  var data = e.data;
  data = JSON.parse(data);
  // console.log("recv");
  console.log(data);
  env_data = data;

//   env_data[0].x.push(data["/node0/timestamp"]);
//   env_data[0].y.push(data["/node0/temperature"]);
//   env_data[1].x.push(data["/node0/timestamp"]);
//   env_data[1].y.push(data["/node1/temperature"]);

//   env_data[0].x = env_data[0].x.slice(-600);
//   env_data[0].y = env_data[0].y.slice(-600);
//   env_data[1].x = env_data[1].x.slice(-600);
//   env_data[1].y = env_data[1].y.slice(-600);

//   Plotly.redraw('plot');
};

ws.onclose = function () {
  console.log("Connection is closed...");
};

setInterval(requestData, 5000);



// Data Plot
var layout = {
    legend: {"orientation": "h"},
    colorway: ['red', 'green', 'blue', 'red', 'green', 'blue', 'red', 'green', 'blue'],
    grid: {rows: 3, columns: 1, roworder: 'bottom to top'},
    autosize: false, width: 445, height: 900, paper_bgcolor: 'ffffff', plot_bgcolor: 'ffffff',
    margin: {l: 35, r: 25, b: 30, t: 20, pad: 0},
    annotations: [
    {text: "Temperature", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.1, xref: 'x1 domain', yref: 'y1 domain'},
    {text: "Humidity", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.1, xref: 'x2 domain', yref: 'y2 domain'},
    {text: "Noise", font: {size: 20, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1.1, xref: 'x3 domain', yref: 'y3 domain'}
    ],
    xaxis1: {showgrid: false, showticklabels: false, matches: 'x3', zeroline: false},
    xaxis2: {showgrid: false, showticklabels: false, matches: 'x3', zeroline: false},
    xaxis3: {showgrid: false, zeroline: false, title: {text: 'Time', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}},
    yaxis1: {showgrid: false, title: {text: '°C', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}},
    yaxis2: {showgrid: false, zeroline: false, title: {text: '%', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}},
    yaxis3: {showgrid: false, zeroline: false, title: {text: 'dB', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}}}
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

function getData() {
    return env_data["/node0/temperature"];
}

let grow = 1;
function growth() {
    grow += 1;
    return grow;
}

Plotly.plot('chart', data, layout);

setInterval(function() {
    for (var i = 0; i < numPlots; i += 1) {
        for (var j = 0; j < numRooms; j += 1){
            data[i * numPlots + j].x.push(growth());
            data[i * numPlots + j].y.push(getData());
            data[i * numPlots + j].x = data[i * numPlots + j].x.slice(-10);
            data[i * numPlots + j].y = data[i * numPlots + j].y.slice(-10);
        }
    }

    if (!historyMode) {
        Plotly.redraw('chart');
    }
}, 5000);
// Data Plot









