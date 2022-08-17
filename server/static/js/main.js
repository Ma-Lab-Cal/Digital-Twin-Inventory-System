// Global
let currObj = "0";
let currCat = "";
let objInfo = "Equipment Info";
var canvasW = 850;
var canvasH = 1000;
// Global



// Initialization
document.getElementById("editInfo").style.display = "none";
document.getElementById("addInfo").style.display = "none";
document.getElementById("plotFunc").style.display = "none";
let now = new Date();
document.getElementById("End").value = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);//time_to_text(new Date().getTime() / 1000, true);
document.getElementById('nameinfo').value = "No object selected!";

document.getElementById("locationlist").style.display = "none";

// Initialization



// Markdown
const markdownReader = (text) => {
    const toHTML = text
        .replaceAll(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a class="md" target="_blank" href="$2">$1</a>') // hyperlink
        .replaceAll(/^### (.*$)/gim, '<h3>$1</h3>') // h3 tag
        .replaceAll(/^## (.*$)/gim, '<h2>$1</h2>') // h2 tag
        .replaceAll(/^# (.*$)/gim, '<h1>$1</h1>') // h1 tag
        // .replace(/\\(.)\\*/gim, '<b>$1</b>') // bold text
        // .replace(/\(.)\*/gim, '<i>$1</i>'); // italic text
    return toHTML.trim(); // using trim method to remove whitespace
}
// Markdown



// Time
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
	/* exported gapiLoaded */
    /* exported gisLoaded */
    /* exported handleAuthClick */
    /* exported handleSignoutClick */

      // TODO(developer): Set to client ID and API key from the Developer Console
      const CLIENT_ID = "968225988580-1r4j1b3ooh2s6vn6k41gac4a4idbjkrn.apps.googleusercontent.com";
      const API_KEY = "AIzaSyDyXKIvKG94DNfUX9JRPJJ9U6RG0EwIEsI";

      // Discovery doc URL for APIs used by the quickstart
      const DISCOVERY_DOC = "https://sheets.googleapis.com/$discovery/rest?version=v4";

      // Authorization scopes required by the API; multiple scopes can be
      // included, separated by spaces.
      const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

      let tokenClient;

      /**
       * Callback after api.js is loaded.
       */
      function gapiOnLoadHandler() {
        gapi.load("client", async function() {
          await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
        });
      }

      /**
       * Callback after Google Identity Services are loaded.
       */
      function gisOnLoadHandler() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: "", // defined later
        });
      }

      search_btn_dom.addEventListener("click", async function() {
        if (!gapi.client) return
        // console.log(gapi.client.getToken())
          await listMajors();
        // tokenClient.callback = async (resp) => {
        //   if (resp.error !== undefined) {
        //     throw (resp);
        //   }
        //   await listMajors();
        // };
        // if (gapi.client.getToken() === null) {
        //   // Prompt the user to select a Google Account and ask for consent to share their data
        //   // when establishing a new session.
        //   tokenClient.requestAccessToken({prompt: "consent"});
        // } else {
          
        //   // Skip display of account chooser and consent dialog for an existing session.
        //   tokenClient.requestAccessToken({prompt: ""});
        // }
      });

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken("");
          document.getElementById('content').innerText = '';
          document.getElementById('authorize_button').innerText = 'Authorize';
          document.getElementById('signout_button').style.visibility = 'hidden';
        }
      }

	  var output = [];
	  var values = [];
	  var outmap = new Map([]);

      /**
       * Print the names and majors of students in a sample spreadsheet:
       * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
       */
      async function listMajors() {
        let response;
        try {
          // Fetch first 10 files
          response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: '1Lsk2p7Jz0Ul2nC2Y4gxID0TZXlIJPO0zi0HwbjfiDKo',
            range: 'PublicStorage!A1:J',
          });
        } catch (err) {
            list_itself_dom.innerText = err.message;
          return;
        }
        const range = response.result;
        if (!range || !range.values || range.values.length == 0) {
            list_itself_dom.innerText = 'No values found.';
          return;
        }
        // Flatten to string to display
        output = range.values;
        // console.log(range)
        list_itself_dom.innerHTML = "";
        values = output[0];
        for (let i in output) {
            if (i != 0) {
                let row = output[i];
				outmap.set(row[values.indexOf('SKU')], row);
				entries.set(row[values.indexOf('SKU')], row[values.indexOf('Name')].toLowerCase());
          		list_itself_dom.innerHTML += "<div class=\"search-result\" id=\"" + row[values.indexOf('SKU')] + "\"><a href=\"javascript: void();\" onclick=\"return objSelect(\'" + row[values.indexOf('SKU')] + "\')\">" + row[values.indexOf('Name')] + "</a></div>";
        	} 
        }
    }

	function objSelect(name) {
		clearPoint();
		if (currObj != "") {
			document.getElementById(currObj).classList.add("search-result");
			document.getElementById(currObj).classList.remove("search-selected");
		}
		currObj = name;
		let curr = outmap.get(currObj);
		addPoint(curr);
		document.getElementById("ttl").innerText = curr[values.indexOf('Name')];
		document.getElementById("sku").innerHTML = curr[values.indexOf('SKU')];
		document.getElementById("uri").innerHTML = curr[values.indexOf('Location')];
		document.getElementById("qty").innerHTML = curr[values.indexOf('Quantity')];
		document.getElementById("tag").innerHTML = curr[values.indexOf('Type')];
		document.getElementById("des").innerHTML = markdownReader(curr[values.indexOf('Description')]);

		document.getElementById('nameinfo').value = curr[values.indexOf('Name')];
		document.getElementById("skuInfo").innerHTML = curr[values.indexOf('SKU')];
		document.getElementById("uriInfo").value = curr[values.indexOf('Location')];
		document.getElementById("qtyInfo").value = curr[values.indexOf('Quantity')];
		document.getElementById("tagInfo").value = curr[values.indexOf('Type')];
		document.getElementById("desInfo").value = curr[values.indexOf('Description')];

		document.getElementById(currObj).classList.add("search-selected");
		document.getElementById(currObj).classList.remove("search-result");    
	}
// Inventory



// Search Engine
var word_mapping = [["Ø", "phi"], ["µm", "um"], ["°", "deg"]];
var entries = new Map([]);

var onSearchHandler = function(e) {
    clearPoint();

    words = searchbar.value.toLowerCase();

    if (!words) {
        list_itself_dom.innerHTML = "";
		for (const [SKU, obj] of outmap) {
			list_itself_dom.innerHTML += "<div class=\"search-result\" id=\"" + SKU + "\"><a href=\"javascript: void();\" onclick=\"return objSelect(\'" + SKU + "\')\">" + obj[values.indexOf('Name')] + "</a></div>";
		}
		return;
    }

  tokens = words.split(" ");
  autofill_results = [];
  autofill_list = [];

  for (let i = 0; i < tokens.length; i += 1) {
    if (!tokens[i]) continue;

    for (const [SKU, obj] of entries) {
      let pos = obj.indexOf(tokens[i]);
      if (pos != -1) {
        let display_text = outmap.get(SKU)[values.indexOf('Name')].substring(0, pos) + "<span class=\"highlight\">" + outmap.get(SKU)[values.indexOf('Name')].substring(pos, pos + tokens[i].length) + "</span>" + outmap.get(SKU)[values.indexOf('Name')].substring(pos + tokens[i].length);
        autofill_list.push(SKU)
        autofill_results.push(display_text);
      }
    }

    // for (let n = 0; n < entries.length; n += 1) {
    //     if (!autofill_list.includes(raw_entries[n])) {
    //         let eTags = objMap.get(raw_entries[n]).tag.toLowerCase();
    //         if (eTags.includes(tokens[i] + ";")) {
    //             let display_text = raw_entries[n] + " " + "<span class=\"highlight\">(" + tokens[i] + ")</span>";
    //             autofill_list.push(raw_entries[n])
    //             autofill_results.push(display_text);
    //         }
    //     }
    // }
  }

  	list_itself_dom.innerHTML = "";
    for (let i = 0; i < autofill_results.length; i += 1) {
        list_itself_dom.innerHTML += "<div class=\"search-result\" id=\"" + autofill_list[i] + "\"><a href=\"javascript: void();\" onclick=\"return objSelect('" + autofill_list[i] + "')\">" + autofill_results[i] + "</a></div>";
    }
    if (autofill_results.length <= 5) {
        // changeImage('/static/img/Plan 00.png');
        for (let i = 0; i < autofill_list.length; i += 1) {
			addPoint(outmap.get(autofill_list[i]));
        }
    }
}
// Search Engine



// Dropdown List
function dropList(name, a) {
    currCat = name;
    dropDown(a);
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
// Dropdown List



// Change Image
function changeImage(img) {
    clearPoint();
    document.querySelector('.map').src = img;
}
// Change Image



// Add/Remove/Edit Points
const pointMap = new Map([
  ["Location 0", {x:0.25, y:0.25}],
  ["Location 1", {x:0.25, y:0.5}],
  ["Location 2", {x:0.5, y:0.5}],
  ["Location 3", {x:0.5, y:0.25}]
]);
// manually set the point locations, become ratios once canvas is used

function addPoint(obj) {
	let loc = obj[values.indexOf('Location')];
	let x = pointMap.get(loc).x * canvasW;
	let y = pointMap.get(loc).y * canvasH;
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.fillStyle = 'red';
	ctx.beginPath();
	ctx.arc(x, y, 10, 0, 2 * Math.PI);
	ctx.fill();
	ctx.fillStyle = 'blue';
	ctx.font = "20px Arial";
	ctx.fillText(loc, x + 15, y + 7.5);
}

function clearPoint(){
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	ctx.clearRect(0, 0, canvasW, canvasH)
}
// Add/Remove/Edit Points



// Add and Edit Buttons
const add = document.querySelector('.add');
let addMode = false;
const edit = document.querySelector('.edit');
let editMode = false;

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
			let curr = outmap.get(currObj);
			document.getElementById('nameinfo').value = curr[values.indexOf('Name')];
			document.getElementById("skuInfo").innerHTML = curr[values.indexOf('SKU')];
			document.getElementById("uriInfo").value = curr[values.indexOf('Location')];
			document.getElementById("qtyInfo").value = curr[values.indexOf('Quantity')];
			document.getElementById("tagInfo").value = curr[values.indexOf('Type')];
			document.getElementById("desInfo").value = curr[values.indexOf('Description')];
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

// function inventory_addItem() {
//     var socket = new WebSocket("ws://localhost:8080");
//     socket.addEventListener("open", function(e) {
//         var request = {
//             "method": "SET",
//             "params": {
//                 "key": "/inventory_item/" + addsku,
//                 "value": {
//                         "sku": addsku,
//                         "uri": adduri,
//                         "name": addname,
//                         "qty": addqty,
//                         "description": adddes,
//                         "tag": addtag,
//                         "img": ""
//                 }
//             }
//         }
//         socket.send(JSON.stringify(request)+"\n");
//     });

//     socket.addEventListener("message", function(e) {
//     });
// };

function addEvent() {
    if (addMode) {
        getAddData();
        if (!stopit) {
            // inventory_addItem();
            // raw_entries = [];
            // objMap = new Map([]);
            // inventory_list = [];
            // inventory_fetchAll();
            // setTimeout(useData, 2500);
            // autofill.innerHTML = "";
            // setTimeout(window.onload = function() {
            //     searchbar.addEventListener("keyup", onSearchHandler);
            
            //     for (let n = 0; n < raw_entries.length; n += 1) {
            //     entries[n] = raw_entries[n];
            //     for (let i = 0; i < word_mapping.length; i += 1) {
            //         entries[n] = entries[n].replace(word_mapping[i][0], word_mapping[i][1]);
            //     }
            //     entries[n] = entries[n].toLowerCase()
            //     }
                
            //     onSearchHandler();
            // }, 2500);
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
        // inventory_addItem();
        // raw_entries = [];
        // objMap = new Map([]);
        // inventory_list = [];
        // inventory_fetchAll();
        // setTimeout(useData, 2500);
        // autofill.innerHTML = "";
        // setTimeout(window.onload = function() {
        //     searchbar.addEventListener("keyup", onSearchHandler);
        
        //     for (let n = 0; n < raw_entries.length; n += 1) {
        //     entries[n] = raw_entries[n];
        //     for (let i = 0; i < word_mapping.length; i += 1) {
        //         entries[n] = entries[n].replace(word_mapping[i][0], word_mapping[i][1]);
        //     }
        //     entries[n] = entries[n].toLowerCase()
        //     }
            
        //     onSearchHandler();
        // }, 2500);
        editEqp();
        edit.classList.remove("clkdedit");
        edit.classList.add("edit");
        document.getElementById("ttl").innerText = "No object selected!";
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



// History
const history = document.querySelector('.history');
let historyMode = false;
function stopPlot() {
    historyMode = !historyMode;
    if (historyMode) {
        history.classList.remove("history");
        history.classList.add("clkdhistory");
        history.innerHTML = 'Present';
        let now = new Date();
        console.log(new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16));
        document.getElementById("End").value = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        document.getElementById("plotFunc").style.display = "block";
    } else {
        document.getElementById("plotFunc").style.display = "none";
        let now = new Date();
        document.getElementById("End").value = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        history.innerHTML = 'History';
        history.classList.add("history");
        history.classList.remove("clkdhistory");
    }
    fetchEnvData();
}
// History



// Location List
var locli = document.getElementById("locationlist");
locli.innerHTML += "<div class=\"locations\">" + "Shelf A" + "(3)" + "</div>";
locli.innerHTML += "<div class=\"locations\">" + "Desk I" + "(1)" + "</div>";
locli.innerHTML += "<div class=\"locations\">" + "Student 2" + "(2)" + "</div>";
// Location List



// Data Fetch
var g_plot_data = [
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x1", yaxis: "y1", legendgroup: "4", name: "Room 3", mode: "lines", type: "scatter"},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x2", yaxis: "y2", legendgroup: "4", name: "Room 3", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x3", yaxis: "y3", legendgroup: "4", name: "Room 3", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x4", yaxis: "y4", legendgroup: "4", name: "Room 3", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x5", yaxis: "y5", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x5", yaxis: "y5", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x5", yaxis: "y5", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x5", yaxis: "y5", legendgroup: "4", name: "Room 3", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x6", yaxis: "y6", legendgroup: "1", name: "Room 0", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x6", yaxis: "y6", legendgroup: "2", name: "Room 1", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x6", yaxis: "y6", legendgroup: "3", name: "Room 2", mode: "lines", type: "scatter", showlegend: false},
  {x: [], y: [], xaxis: "x6", yaxis: "y6", legendgroup: "4", name: "Room 3", mode: "lines", type: "scatter", showlegend: false}
  ];

var range = 60 * 60; // default to be 1 hour
var end = new Date().getTime();

const keys = ["timestamp", "node", "temperature", "humidity", "num_particles_0_3_um", "num_particles_1_um", "num_particles_10_um", "magnetic_x", "magnetic_y", "magnetic_z", "lux"];

var fetchEnvData = function() {
  var socket = new WebSocket("ws://localhost:8000");

  end = new Date().getTime();

  if (historyMode) {
    end = Date.parse(document.getElementById('End').value); //2022-07-26T23:19 1658902740000
    // console.log(end);
    // console.log(new Date().toISOString().slice(0, 16));
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
    colorway: ['darkorange', 'seagreen', 'royalblue', 'purple', 'darkorange', 'seagreen', 'royalblue', 'purple', 'darkorange', 'seagreen', 'royalblue', 'purple'],
    grid: {rows: 3, columns: 2, roworder: 'bottom to top', pattern: 'independent', ygap: 0.05},
    autosize: false, width: 1200, height: 1000,
    margin: {l: 25, r: 25, b: 10, t: 10, pad: 0},
    annotations: [
    {text: "Temperature", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x1 domain', yref: 'y1 domain'},
    {text: "Humidity", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x2 domain', yref: 'y2 domain'},
    {text: "0.3um particles", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x3 domain', yref: 'y3 domain'},
	{text: "1um particles", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x4 domain', yref: 'y4 domain'},
    {text: "Brightness", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x5 domain', yref: 'y5 domain'},
    {text: "Magnetic", font: {size: 15, color: 'black'}, showarrow: false, align: 'center', x: 0.01, y: 1, xref: 'x6 domain', yref: 'y6 domain'}
    ],
    xaxis1: {automargin: true, tickangle: 90, title: {standoff: 10, text: 'Time', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, showticklabels: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis2: {automargin: true, tickangle: 90, title: {standoff: 10, text: 'Time', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, showticklabels: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis3: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis4: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis5: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    xaxis6: {zeroline: false, showgrid: false, showline: true, showticklabels: false, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis1: {automargin: true, title: {standoff: 10, text: '°C', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis2: {automargin: true, title: {standoff: 10, text: '%', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis3: {automargin: true, title: {standoff: 10, text: '/0.1L', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
	yaxis4: {automargin: true, title: {standoff: 10, text: '/0.1L', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis5: {automargin: true, title: {standoff: 10, text: 'lux', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',},
    yaxis6: {automargin: true, title: {standoff: 10, text: 'uT', font: {family: 'Arial, Helvrtica, sans-serif', size: 15, color: '#000000'}}, zeroline: false, showgrid: false, showline: true, linecolor: 'black', linewidth: 2, ticks: 'inside', tickfont: 'font_dict', mirror: 'allticks', tickwidth: 2, tickcolor: 'black',}
    };

let numPlots = 8;
let numRooms = 4;
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
      case "node2":
        placement = 2;
        break;
	case "node5":
        placement = 3;
        break;
      default:
        placement = -1;
        break;
    }
    if (placement == -1) {
      break;
    }
    const updatelist = ["temperature", "humidity", "num_particles_0_3_um", "num_particles_1_um", "lux", "magnetic"];
    for (let item in updatelist) {
      if (data_records[i][keys.indexOf(updatelist[item])] != -1) {
        let pushpoint = data_records[i][keys.indexOf(updatelist[item])];
        if (updatelist[item] == "temperature") {
          pushpoint = data_records[i][keys.indexOf(updatelist[item])] - 273.15;
        } else if (updatelist[item] == "humidity") {
          pushpoint = data_records[i][keys.indexOf(updatelist[item])] * 100;
        } else if (updatelist[item] == "magnetic") {
			let x = data_records[i][keys.indexOf("magnetic_x")];
			let y = data_records[i][keys.indexOf("magnetic_y")];
			let z = data_records[i][keys.indexOf("magnetic_z")];
			pushpoint = Math.sqrt(x * x + y * y + z * z);
		} else {
			pushpoint = data_records[i][keys.indexOf(updatelist[item])];
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
    btn4w.classList.remove("clkdintv");
    btn4w.classList.add("intv");
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
        case "4w":
            range = 30 * 24 * 60 * 60;
            target = btn4w;
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
}, 1000);

window.onload = function() {
  fetchEnvData();
//   handleAuthClick();
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