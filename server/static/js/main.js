// Global (F)
let currObj = "";
let currCat = "";
let objInfo = "Equipment Info";
// Global



// Initialization (F)
document.getElementById("editInfo").style.display = "none";
document.getElementById("addInfo").style.display = "none";
document.getElementById("plotFunc").style.display = "none";

document.getElementById("End").value = time_to_text(new Date().getTime() / 1000, true);
document.getElementById('nameinfo').value = "No object selected!";
// Initialization



// Markdown (F)
const markdownReader = (text) => {
    const toHTML = text
        .replaceAll(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a class="md" href="$2">$1</a>') // hyperlink
        .replaceAll(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
        .replaceAll(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
        .replaceAll(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
        // .replace(/\\(.)\\*/gim, '<b>$1</b>') // bold text
        // .replace(/\(.)\*/gim, '<i>$1</i>'); // italic text
    return toHTML.trim(); // using trim method to remove whitespace
}
// Markdown



// Time (F)
function time_to_text(timestamp, read = false) {
    var time = new Date(timestamp * 1000);
    var months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = time.getFullYear();
    var num = time.getMonth() + 1
    var month = months[num];
    num = num.toString();
    if (num.length == 1) {num = '0' + num;}
    var day = time.getDate().toString();
    if (day.length == 1) {day = '0' + day;}
    var hour = time.getHours().toString();
    if (hour.length == 1) {hour = '0' + hour;}
    var min = time.getMinutes().toString();
    if (min.length == 1) {min = '0' + min;}
    var sec = time.getSeconds().toString();
    if (sec.length == 1) {sec = '0' + sec;}
    if (read) {return time = num + '/' + day + '/' + year + " " + hour + ':' + min + ':' + sec;}
    // return day + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return month + ' ' + day + ' ' + hour + ':' + min + ':' + sec;
}

function text_to_time(text) {
    const [date, time] = text.split(' ');
    const [month, day, year] = date.split('/');
    const [hour, min, sec] = time.split(':');
    return new Date(year, month - 1, day, hour, min, sec).getTime();
}
// Time



// Inventory
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
// Inventory



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
    document.getElementById("des").innerHTML = markdownReader(objMap.get(currObj).description);

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
        add.classList.remove("add");
        add.classList.add("clkdadd");
        document.getElementById("eqpInfo").style.display = "none";
        document.getElementById("addInfo").style.display = "block";
    } else {
        add.classList.remove("clkdadd");
        add.classList.add("add");
        document.getElementById("addInfo").style.display = "none";
        document.getElementById("eqpInfo").style.display = "block";
    }
}

let editMode = false;
function editEqp() {
    editMode = !editMode;
    if (!editMode) {
        edit.classList.remove("clkdedit");
        edit.classList.add("edit");
        document.getElementById("editInfo").style.display = "none";
        document.getElementById("eqpInfo").style.display = "block";
    } else {
        edit.classList.remove("edit");
        edit.classList.add("clkdedit");
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
    var uri = document.getElementById('adduri').options[select.selectedIndex].value;
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
    var uri = document.getElementById('uriInfo').options[select.selectedIndex].value;
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



// History (F)
const history = document.querySelector('.history');
let historyMode = false;
function stopPlot() {
    historyMode = !historyMode;
    if (historyMode) {
        history.classList.remove("history");
        history.classList.add("clkdhistory");
        history.innerHTML = 'Present';
        document.getElementById("plotFunc").style.display = "block";
        document.getElementById("End").value = time_to_text(new Date().getTime() / 1000, true);
    } else {
        document.getElementById("End").value = time_to_text(new Date().getTime() / 1000, true);
        document.getElementById("plotFunc").style.display = "none";
        history.innerHTML = 'History';
        history.classList.add("history");
        history.classList.remove("clkdhistory");
    }
}
// History



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
var g_plot_data = [
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x5", yaxis: "y5", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x5", yaxis: "y5", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x5", yaxis: "y5", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x6", yaxis: "y6", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x6", yaxis: "y6", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x6", yaxis: "y6", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false}
  ];

var range = 60 * 60; // default to be 1 hour
var end = new Date().getTime();

const keys = ["timestamp", "node", "temperature", "humidity", "pm1_0", "pm2_5", "pm10", "magnetic_x", "magnetic_y", "magnetic_z", "lux"];

var fetchEnvData = function() {
  var socket = new WebSocket("ws://localhost:8000");

  end = new Date().getTime();

  if (historyMode) {
    end = text_to_time(document.getElementById('End').value);
  }

  socket.addEventListener("open", function(e) {
    var request = {
      "method": "GET",
      "params": {
        "type": "range",
        "range": [new Date(end).getTime() / 1000 - range, new Date(end).getTime() / 1000]
      }
    }
    socket.send(JSON.stringify(request)+"\n");
  });

  socket.addEventListener("message", function(e) {
    let data = JSON.parse(e.data);
    let data_records = data.data;

    for (idx in data_records) {
        data_records[idx][0] = parseInt(data_records[idx][0] - new Date(end).getTime() / 1000);
    }

    updatePlot(data_records);
    chart_loading_blocker.style["display"] = "none";
  });
};

// Data Fetch



// Data Plot
var layout = {
    legend: {"orientation": "v", x: 1, y: 0.98, yanchor: 'top', xanchor: 'right', font: {family: 'Arial, Helvrtica, sans-serif', size: 10, color: '#000000'}, bgcolor: 'rgba(0, 0, 0, 0)'},
    colorway: ['darkorange', 'seagreen', 'royalblue', 'darkorange', 'seagreen', 'royalblue', 'darkorange', 'seagreen', 'royalblue'],
    grid: {rows: 3, columns: 2, roworder: 'bottom to top', pattern: 'independent', ygap: 0.05},
    autosize: false, width: 1200, height: 900,
    margin: {l: 25, r: 25, b: 10, t: 10, pad: 0},
    annotations: [
    {text: "Temperature", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x1 domain', yref: 'y1 domain'},
    {text: "Humidity", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x2 domain', yref: 'y2 domain'},
    {text: "PM 2.5", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x3 domain', yref: 'y3 domain'},
    {text: "Brightness", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x4 domain', yref: 'y4 domain'},
    {text: "Magnetic X", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x5 domain', yref: 'y5 domain'},
    {text: "Magnetic Y", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x6 domain', yref: 'y6 domain'}
    ],
    xaxis1: {automargin: true, tickangle: 90, title: {standoff: 10, text: 'Time', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, showticklabels: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis2: {automargin: true, tickangle: 90, title: {standoff: 10, text: 'Time', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, showticklabels: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis3: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis4: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis5: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis6: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis1: {automargin: true, title: {standoff: 10, text: '°C', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis2: {automargin: true, title: {standoff: 10, text: '%', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis3: {automargin: true, title: {standoff: 10, text: 'μg/m³', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis4: {automargin: true, title: {standoff: 10, text: 'lux', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis5: {automargin: true, title: {standoff: 10, text: 'mT', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis6: {automargin: true, title: {standoff: 10, text: 'mT', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',}
    };

let numPlots = 8;
let numRooms = 3;
let placement = 0;
let tm = end - range;
let tmstmp = "";
let alignto = "";

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

  alignto = data_records[0][keys.indexOf("node")];

  for (var i=0; i<data_records.length; i+=1) {
    if (data_records[i][keys.indexOf("node")] == alignto) {
      tm = end / 1000 + data_records[i][keys.indexOf("timestamp")];
    }
    tmstmp = new Date(tm * 1000);
    switch (data_records[i][keys.indexOf("node")]) {
      case "node0":
        placement = 0;
        break;
      case "node1":
        placement = 1;
        break;
      case "node5":
        placement = 2;
        break;
      default:
        placement = -1;
        break;
    }
    if (placement == -1) {
      break;
    }
    const updatelist = ["temperature", "humidity", "pm2_5", "lux", "magnetic_x", "magnetic_y"];
    for (let item in updatelist) {
      if (data_records[i][keys.indexOf(updatelist[item])] != -1) {
        let pushpoint = data_records[i][keys.indexOf(updatelist[item])];
        if (updatelist[item] == "temperature") {
          pushpoint -= 273.15;
        }
        if (updatelist[item] == "humidity") {
          pushpoint *= 100;
        }
        g_plot_data[placement].y.push(pushpoint);
        g_plot_data[placement].x.push(tmstmp);
      }
      placement += numRooms;
    }
  }
  Plotly.redraw("chart");
}

Plotly.plot("chart", g_plot_data, layout);

function changeInterval(btn) {
    let target = btn1h;
    chart_loading_blocker.style["display"] = "block";
    btn5m.classList.remove("clkdintv");
    btn5m.classList.add("intv");
    btn1h.classList.remove("clkdintv");
    btn1h.classList.add("intv");
    btn1d.classList.remove("clkdintv");
    btn1d.classList.add("intv");
    btn1w.classList.remove("clkdintv");
    btn1w.classList.add("intv");
    switch (btn) {
        case "5m":
            target = btn5m;
            range = 5 * 60;
            break;
        case "1h":
            range = 60 * 60;
            target = btn1h;
            break;
        case "1d":
            range = 24 * 60 * 60;
            target = btn1d;
            break;
        case "1w":
            range = 7 * 24 * 60 * 60;
            target = btn1w;
            break;
    }
    target.classList.add("clkdintv");
    target.classList.remove("intv");
    fetchEnvData();
}

setInterval(function() {
    if (!historyMode) {
        fetchEnvData();
    }
}, 5000);

window.onload = function() {
  fetchEnvData();
}
// Data Plot


// Lab Selection
function labsw() {
    var labSelector = document.getElementById('labslct');
    var labChoice = labSelector.options[labSelector.selectedIndex].value;
    var labName = document.getElementById('labName');
    labName.innerHTML = labChoice;
    switch (labChoice) {
        case "Main Lab":
            changeImage("/static/img/Plan 00.png");
            break;
        case "All Labs":
            changeImage("/static/img/Plan 00.png");
            break;
        case "Pre Lab":
            changeImage("/static/img/Plan 01.png");
            break;
        case "Office":
            changeImage("/static/img/Plan 01.png");
            break;
    }
}
// Lab Selection



// New Location/User
function newLocationE() {
    var locSelector = document.getElementById('uriInfo');
    var locChoice = locSelector.options[locSelector.selectedIndex].value;
    if (locChoice == "new") {
        return false;
    }
    return false;
}

function newLocationA() {
    var locSelector = document.getElementById('adduri');
    var locChoice = locSelector.options[locSelector.selectedIndex].value;
    if (locChoice == "new") {
        return false;
    }
    return false;
}

function newUser() {
    var usrSelector = document.getElementById('userEnter');
    var usrChoice = usrSelector.options[usrSelector.selectedIndex].value;
    if (usrChoice == "new") {
        return false;
    }
    return false;
}
// New Location/User