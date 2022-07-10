// Global
let currObj = "";
let currCat = "";
function flip(b) {return b = !b;}
let objInfo = "Equipment Info";
// document.getElementById("eqpInfo").style.display = "none";
document.getElementById("editInfo").style.display = "none";
document.getElementById("addInfo").style.display = "none";
// document.getElementById("Interval").value = 3600;
document.getElementById("End").value = timeReader(new Date().getTime() / 1000);
document.getElementById("plotFunc").style.display = "none";
document.getElementById('nameinfo').value = "No object selected!";
// document.getElementById("chart").style.display = "none";
// Global



// Markdown
const markdownParser = (text) => {

    const toHTML = text

        .replaceAll(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a class="md" href="$2">$1</a>')

        .replaceAll(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag

        .replaceAll(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag

        .replaceAll(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag

        // .replace(/\\(.)\\*/gim, '<b>$1</b>') // bold text

        // .replace(/\(.)\*/gim, '<i>$1</i>'); // italic text

    return toHTML.trim(); // using trim method to remove whitespace

}
// Markdown



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
    // console.log(currCat);
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
    removePoint();
    if (currObj != "") {
        document.getElementById(currObj).classList.add("search-result");
        document.getElementById(currObj).classList.remove("search-selected");
    }

    let location = objMap.get(name).uri;
    objInfo = location;
    currObj = name;
    if (location != "" && pointMap.get(location) != null) {
        addPoint(pointMap.get(location).x, pointMap.get(location).y); // update with canvas
    }
    document.querySelector('.title').innerText = currObj;
    document.getElementById("sku").innerHTML = objMap.get(currObj).sku;
    document.getElementById("uri").innerHTML = objMap.get(currObj).uri;
    document.getElementById("qty").innerHTML = objMap.get(currObj).qty;
    document.getElementById("tag").innerHTML = objMap.get(currObj).tag;
    document.getElementById("des").innerHTML = markdownParser(objMap.get(currObj).description);

    document.getElementById('nameinfo').value = currObj;
    document.getElementById("skuInfo").innerHTML = objMap.get(currObj).sku;
    document.getElementById("uriInfo").value = objMap.get(currObj).uri;
    document.getElementById("qtyInfo").value = objMap.get(currObj).qty;
    document.getElementById("tagInfo").value = objMap.get(currObj).tag;
    document.getElementById("desInfo").value = objMap.get(currObj).description;

    document.getElementById(currObj).classList.add("search-selected");
    document.getElementById(currObj).classList.remove("search-result");    
}
// Dropdown List



// Change Image
// needs improvement with regex
function changeImage(img) {
    removePoint(); // update with canvas
    document.querySelector('.map').src = img;
}
// Change Image



// Add/Remove/Edit Points
// update with canvas
const pointMap = new Map([
  ["Test0", {x:250, y:250}],
  ["Test2", {x:250, y:500}],
  ["Test5", {x:500, y:500}],
  ["Test8", {x:500, y:250}],
  [" ", {x:1000, y:1000}],
  ["Daniel", {x:1500, y:1500}]
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
        document.getElementById("eqpInfo").style.display = "none";
        document.getElementById("addInfo").style.display = "block";
    } else {
        document.getElementById("addInfo").style.display = "none";
        document.getElementById("eqpInfo").style.display = "block";
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
        document.getElementById("eqpInfo").style.display = "block";
    } else {
        document.getElementById("eqpInfo").style.display = "none";
        document.getElementById("editInfo").style.display = "block";
        if (currObj != "") {
            document.getElementById('nameinfo').value = currObj;
            document.getElementById("skuInfo").innerHTML = objMap.get(currObj).sku;
            document.getElementById("uriInfo").value = objMap.get(currObj).uri;
            document.getElementById("qtyInfo").value = objMap.get(currObj).qty;
            document.getElementById("tagInfo").value = objMap.get(currObj).tag;
            document.getElementById("desInfo").value = objMap.get(currObj).description;
        } else{
            document.querySelector('.objTitle').innerText = "No object selected!";
            document.getElementById("skuInfo").innerHTML = "";
            document.getElementById("uriInfo").value = "";
            document.getElementById("qtyInfo").value = "";
            document.getElementById("tagInfo").value = "";
            document.getElementById("desInfo").value = "";
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



// Add and Edit
var addname;
var addsku;
var adduri;
var addqty;
var addtag;
var adddes;
var stopit = false;

function getAddData() {
    var name = document.getElementById('addname').value;
    var sku = document.getElementById('addsku').value;
    var uri = document.getElementById('adduri').value;
    var qty = document.getElementById('addqty').value;
    var tag = document.getElementById('addtag').value;
    var des = document.getElementById('adddes').value;
    addname = name;
    addsku = sku;
    adduri = uri;
    addqty = qty;
    addtag = tag;
    adddes = des;
    if (name == "" || sku == ""){
        stopit = true;
    } else {
        stopit = false;
    }
}

function getEditData() {
    var name = document.getElementById('nameinfo').value;
    var uri = document.getElementById('uriInfo').value;
    var qty = document.getElementById('qtyInfo').value;
    var tag = document.getElementById('tagInfo').value;
    var des = document.getElementById('desInfo').value;
    addname = name;
    addsku = objMap.get(currObj).sku;
    adduri = uri;
    addqty = qty;
    addtag = tag;
    adddes = des;
    if (name == ""){
        stopit = true;
    } else {
        stopit = false;
    }
}

function inventory_addItem() {
    var socket = new WebSocket("ws://localhost:8080");
    socket.addEventListener("open", function(e) {
        var request = {
            "method": "SET",
            "params": {
                "key": "/inventory_item/" + addsku,
                "value": {
                        "sku": addsku,
                        "uri": adduri,
                        "name": addname,
                        "qty": addqty,
                        "description": adddes,
                        "tag": addtag,
                        "img": ""
                }
            }
        }
        socket.send(JSON.stringify(request)+"\n");
    });

    socket.addEventListener("message", function(e) {
        // console.log(e.data);
    });
};

function addEvent() {
    if (addMode) {
        getAddData();
        if (!stopit) {
            inventory_addItem();
            raw_entries = [];
            objMap = new Map([]);
            inventory_list = [];
            inventory_fetchAll();
            setTimeout(useData, 2500);
            autofill.innerHTML = "";
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
            document.getElementById("addname").value = "";
            document.getElementById("addsku").value = "";
            document.getElementById("adduri").value = "";
            document.getElementById("addqty").value = "";
            document.getElementById("addtag").value = "";
            document.getElementById("adddes").value = "";
            addEqp();
            add.classList.remove("clkdadd");
            add.classList.add("add");
        }
    }
    return false;
}

function editEvent() {
    if (editMode) {
        getEditData();
        if (!stopit) {
        inventory_addItem();
        raw_entries = [];
        objMap = new Map([]);
        inventory_list = [];
        inventory_fetchAll();
        setTimeout(useData, 2500);
        autofill.innerHTML = "";
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
        editEqp();
        edit.classList.remove("clkdedit");
        edit.classList.add("edit");
        document.querySelector('.title').innerText = "No object selected!";
            document.getElementById("sku").innerHTML = "";
            document.getElementById("uri").innerHTML = "";
            document.getElementById("qty").innerHTML = "";
            document.getElementById("tag").innerHTML = "";
            document.getElementById("des").innerHTML = "";
        }
    }
    return false;
}
// Add and Edit



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
    historyEvent();
    if (!historyMode) {
        // document.getElementById("Interval").value = 3600;
        document.getElementById("End").value = timeReader(new Date().getTime() / 1000);
        document.getElementById("plotFunc").style.display = "none";
    } else {
        document.getElementById("plotFunc").style.display = "block";
        // document.getElementById("Interval").value = 3600;
        document.getElementById("End").value = timeReader(new Date().getTime() / 1000);
    }
}
// History & Download



// Location List
var locli = document.getElementById("locationlist");
locli.innerHTML += "<div class=\"locations\">" + "Shelf A" + "(3)" + "</div>";
locli.innerHTML += "<div class=\"locations\">" + "Desk I" + "(1)" + "</div>";
locli.innerHTML += "<div class=\"locations\">" + "Student 2" + "(2)" + "</div>";
// Location List



// Search Engine
var word_mapping = [["Ø", "phi"], ["µm", "um"], ["°", "deg"]];
var entries = [];

var onSearchHandler = function(e) {
    removePoint();

    words = searchbar.value.toLowerCase();

    if (!words) {
        autofill.innerHTML = "";
        for (let n = 0; n < entries.length; n += 1) {
            let quoteless = raw_entries[n].replaceAll(/\'/gim, '\\\'');
            autofill.innerHTML += "<div class=\"search-result\" id=\"" + raw_entries[n] + "\"><a href=\"javascript: void();\" onclick=\"return objSelect(\'" + quoteless + "\')\">" + raw_entries[n] + "</a></div>";
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
        let quoteless = autofill_list[i].replaceAll(/\'/gim, '\\\'');
        autofill.innerHTML += "<div class=\"search-result\" id=\"" + autofill_list[i] + "\"><a href=\"javascript: void();\" onclick=\"return objSelect('" + quoteless + "')\">" + autofill_results[i] + "</a></div>";
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
var node0 = [];
var node1 = [];
var node2 = [];
var interval = 3600;
// var interval = 300;
var end = new Date().getTime() / 1000;
var env_fetch = function() {
    var socket = new WebSocket("ws://localhost:8000");
    socket.addEventListener("open", function(e) {
        var request = {
            "method": "GET",
            "params": {
                "type": "range",
                // "range": [end - interval * numRooms, end]
                "range": [end - interval * 2, end]
            }
        }
        socket.send(JSON.stringify(request)+"\n");
    });
    socket.addEventListener("message", function(e) {
    let data = JSON.parse(e.data);
    env_data = data.data;
    node0 = [];
    node1 = [];
    node2 = [];
    for (var i = 0; i < env_data.length; i += 1) {
        if (env_data[i][1] == "node0") {
            node0.push(env_data[i]);
            node2.push(env_data[i]);
        } else if (env_data[i][1] == "node1") {
            node1.push(env_data[i]);
        } else if (env_data[i][1] == "node5") {
            node2.push(env_data[i]);
        }
    }
    });
};

var g_plot_data = [
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  ];

var past_time_range = 5*60; // default to be 5 minutes

var fetchEnvData = function() {
  var socket = new WebSocket("ws://localhost:8000");

  var end = new Date().getTime();
  var interval = past_time_range;

  socket.addEventListener("open", function(e) {
    var request = {
      "method": "GET",
      "params": {
        "type": "range",
        "range": [new Date(end).getTime() / 1000 - interval, new Date(end).getTime() / 1000]
      }
    }
    socket.send(JSON.stringify(request)+"\n");
  });

  socket.addEventListener("message", function(e) {
    let data = JSON.parse(e.data);
    let data_records = data.data;

    updatePlot(data_records);
    chart_loading_blocker.style["display"] = "none";
  });
};

// Data Fetch



// Data Plot
var layout = {
    legend: {"orientation": "v", x: 1, y: 1, yanchor: 'top', xanchor: 'right', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}, bgcolor: 'rgba(0, 0, 0, 0)'},
    colorway: ['darkorange', 'seagreen', 'royalblue', 'darkorange', 'seagreen', 'royalblue', 'darkorange', 'seagreen', 'royalblue'],
    grid: {rows: 4, columns: 1, roworder: 'bottom to top', pattern: 'independent', ygap: 0.05},
    autosize: false, width: 445, height: 900,
    margin: {l: 25, r: 25, b: 10, t: 10, pad: 0},
    annotations: [
    {text: "Temperature", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1, xref: 'x1 domain', yref: 'y1 domain'},
    {text: "Humidity", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1, xref: 'x2 domain', yref: 'y2 domain'},
    {text: "PM 2.5", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1, xref: 'x3 domain', yref: 'y3 domain'},
    {text: "Light", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0, y: 1, xref: 'x4 domain', yref: 'y4 domain'}
    ],
    xaxis1: {automargin: true, tickangle: 90, title: {standoff: 10, text: 'Time', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, showticklabels: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis2: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis3: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis4: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis1: {automargin: true, title: {standoff: 10, text: '°C', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis2: {automargin: true, title: {standoff: 10, text: '%', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis3: {automargin: true, title: {standoff: 10, text: 'μg/m³', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis4: {automargin: true, title: {standoff: 10, text: 'lx', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',}
    };

// var data = [
//       {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "1", name: "Room 1", mode: "lines", type: "scatter"},
//       {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "2", name: "Room 2", mode: "lines", type: "scatter"},
//       {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "3", name: "Room 3", mode: "lines", type: "scatter"},
//       {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "1", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
//       {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "2", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
//       {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "3", name: "Room 3", mode: "lines", type: "scatter", showlegend: false},
//       {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "1", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
//       {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "2", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
//       {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "3", name: "Room 3", mode: "lines", type: "scatter", showlegend: false},
//       ];

let numPlots = 3;
let numRooms = 3;

const keys = ["timestamp", "node", "temperature", "humidity", "pm1_0", "pm2_5", "pm10", "magnetic_x", "magnetic_y", "magnetic_z", "lux"];

/**
 * Renders the plot with updated data. This function will filter out invalid data.
 * 
 * @param {*} data_records 
 */
var updatePlot = function(data_records) {

  for (let idx in g_plot_data) {
    g_plot_data[idx].x = [];
    g_plot_data[idx].y = [];
  }

  for (var i=0; i<data_records.length; i+=1) {
    switch (data_records[i][keys.indexOf("node")]) {
      case "node0":
        // update temperature
        if (data_records[i][keys.indexOf("temperature")] != -1)
          g_plot_data[0].y.push(data_records[i][keys.indexOf("temperature")] - 273.15);
        g_plot_data[0].x.push(data_records[i][keys.indexOf("timestamp")]);
        // update humidity
        if (data_records[i][keys.indexOf("humidity")] != -1)
          g_plot_data[3].y.push(data_records[i][keys.indexOf("humidity")] * 100);
        g_plot_data[3].x.push(data_records[i][keys.indexOf("timestamp")]);
        // update pm2.5
        if (data_records[i][keys.indexOf("pm2_5")] != -1)
          g_plot_data[6].y.push(data_records[i][keys.indexOf("pm2_5")]);
        g_plot_data[6].x.push(data_records[i][keys.indexOf("timestamp")]);
        // update fiat lux
        if (data_records[i][keys.indexOf("lux")] != -1)
          g_plot_data[9].y.push(data_records[i][keys.indexOf("lux")]);
        g_plot_data[9].x.push(data_records[i][keys.indexOf("timestamp")]);
        break;
      case "node1":
        // update temperature
        if (data_records[i][keys.indexOf("temperature")] != -1)
          g_plot_data[1].y.push(data_records[i][keys.indexOf("temperature")] - 273.15);
        g_plot_data[1].x.push(data_records[i][keys.indexOf("timestamp")]);
        // update humidity
        if (data_records[i][keys.indexOf("humidity")] != -1)
          g_plot_data[4].y.push(data_records[i][keys.indexOf("humidity")] * 100);
        g_plot_data[4].x.push(data_records[i][keys.indexOf("timestamp")]);
        // update pm2.5
        if (data_records[i][keys.indexOf("pm2_5")] != -1)
          g_plot_data[7].y.push(data_records[i][keys.indexOf("pm2_5")]);
        g_plot_data[7].x.push(data_records[i][keys.indexOf("timestamp")]);
        if (data_records[i][keys.indexOf("lux")] != -1)
          g_plot_data[10].y.push(data_records[i][keys.indexOf("lux")]);
        g_plot_data[10].x.push(data_records[i][keys.indexOf("timestamp")]);
        break;
      case "node5":
        // update temperature
        if (data_records[i][keys.indexOf("temperature")] != -1)
          g_plot_data[2].y.push(data_records[i][keys.indexOf("temperature")] - 273.15);
        g_plot_data[2].x.push(data_records[i][keys.indexOf("timestamp")]);
        // update humidity
        if (data_records[i][keys.indexOf("humidity")] != -1)
          g_plot_data[5].y.push(data_records[i][keys.indexOf("humidity")] * 100);
        g_plot_data[5].x.push(data_records[i][keys.indexOf("timestamp")]);
        // update pm2.5
        if (data_records[i][keys.indexOf("pm2_5")] != -1)
          g_plot_data[8].y.push(data_records[i][keys.indexOf("pm2_5")]);
        g_plot_data[8].x.push(data_records[i][keys.indexOf("timestamp")]);
        if (data_records[i][keys.indexOf("lux")] != -1)
          g_plot_data[11].y.push(data_records[i][keys.indexOf("lux")]);
        g_plot_data[11].x.push(data_records[i][keys.indexOf("timestamp")]);
        break;
    }
  }
  Plotly.redraw("chart");
}

// function getData() {return Math.random();}
function getData(l, p, r) {
    if (r == 0) {
        switch (p) {
            case 0:
            return node0[l][keys.indexOf("temperature")];
            case 1:
            return node0[l][keys.indexOf("humidity")] * 100;
            case 2:
            return node0[l][keys.indexOf("pm2_5")];
        }
    } else if (r == 1) {
        switch (p) {
            case 0:
            return node1[l]["temperature"];
            case 1:
            return node1[l]["humidity"] * 100;
            case 2:
            return node1[l]["pm2_5"];
        }
    } else if (r == 2) {
        switch (p) {
            case 0:
            return node0[l]["temperature"];
            case 1:
            return node0[l]["humidity"] * 100;
            case 2:
            return node0[l]["pm2_5"];
        }
    }
}

// function growth(i) {return timeConverter(env_data[numRooms * i]["timestamp"]);}
function growth(i) {return timeConverter(env_data[i * 2]["timestamp"]);}

Plotly.plot("chart", g_plot_data, layout);

function getHistoryData() {
    if (!historyMode) {
        end = new Date().getTime() / 1000;
    } else {
        var en = document.getElementById('End').value;
        end = timeRecognizer(en);
    }
    return false;
}

var sub = 1;

function historyEvent() {
    getHistoryData();
    env_fetch();
    let lul = Math.min(node0.length, node1.length, node2.length);
    sub = Math.floor(lul / 300);
    for (var l = 0; l < lul; l += sub) {
        for (var i = 0; i < numPlots; i += 1) {
            for (var j = 0; j < numRooms; j += 1){
                data[i * numPlots + j].x.push(growth(l));
                // data[i * numPlots + j].y.push(getData());
                data[i * numPlots + j].y.push(getData(l, i, j));
                data[i * numPlots + j].x = data[i * numPlots + j].x.slice(-(lul / 2) / sub);
                data[i * numPlots + j].y = data[i * numPlots + j].y.slice(-(lul / 2) / sub);
            }
        }
    }
    Plotly.redraw('chart');
}

var renderPressedButton = function(target_btn) {
  chart_loading_blocker.style["display"] = "block";

  env_data_show_5min_btn.style["border-style"] = "";
  env_data_show_1hr_btn.style["border-style"] = "";
  env_data_show_12hr_btn.style["border-style"] = "";
  target_btn.style["border-style"] = "inset";
}


env_data_show_5min_btn.addEventListener("click", function() {
  renderPressedButton(this);
  past_time_range = 5 * 60;
  fetchEnvData();
});

env_data_show_1hr_btn.addEventListener("click", function() {
  renderPressedButton(this);
  past_time_range = 60 * 60;
  fetchEnvData();
});

env_data_show_12hr_btn.addEventListener("click", function() {
  renderPressedButton(this);
  past_time_range = 12 * 60 * 60;
  fetchEnvData();
});


setInterval(function() {
    // if (!historyMode) {
    //     historyEvent();
    // }
  fetchEnvData();
}, 1000);

window.onload = function() {
  fetchEnvData();
}







