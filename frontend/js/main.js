// Global
let currObj = "obj01";
let currCat = "cat01";
// Global



// Reading JSON
let s = JSON.parse(sample);
// Reading JSON



// Dropdown List
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

function dropList(name, a) {
    currCat = name;
    dropDown(a);
}
// Dropdown List



// Change Image
function changeImage(img) {
    removePoint();
    document.querySelector('.location').textContent = img.substr(4, 7);
    document.querySelector('.image').src = img;
}
// Change Image



// Add Point
function removePoint() {
    if (hasCircle) {
        document.body.removeChild(document.body.lastChild);
        hasCircle = false;
    }
}

let sw = false;
let ct = false;
let hasCircle = false
function switcher() {
    ct = false;
    sw = !sw;
}

function addPoint(x, y) {
    changeImage('img/Plan 00.png');
    var button = document.createElement('div');
    button.style.position = 'fixed';
    button.style.left = x + 'px';
    button.style.top = y + 'px';
    button.innerHTML = '<div class="circle"></div>';
    removePoint();
    document.body.appendChild(button);
    hasCircle = true
}

function objClick(name, x, y) {
    currObj = name;
    addPoint(x, y);
}

document.onclick = function(e) {
    if (sw && ct) {
        clearStyle();
        addPoint(e.pageX - 10, e.pageY - 10);
        sw = false;
        ct = false;
    }
    ct = true;
}
// Add Point



// Add and Edit
function clearStyle() {
    add.classList.add("add");
    add.classList.remove("clkdadd");
    edit.classList.add("edit");
    edit.classList.remove("clkdedit");
}

const add = document.querySelector('.add');
const edit = document.querySelector('.edit');

add.addEventListener('click', function onClick() {
    if (sw) {
        add.classList.remove("add");
        add.classList.add("clkdadd");
    } else {
        clearStyle();
    }
})

edit.addEventListener('click', function onClick() {
  if (sw) {
        edit.classList.remove("edit");
        edit.classList.add("clkdedit");
    } else {
        clearStyle();
    }
})
// Add and Edit



// Data Plot
let plotNum = 1;

function getData() {
    switch(plotNum) {
      case 1:
        return Math.random();
        break;
      case 2:
        return Math.random() + 1;
        break;
      default:
        return Math.random();
    }
}

Plotly.plot('chart', [{y: [getData()], type:'line'}]);

let time = 0;
let range = 0

setInterval(function() {
    Plotly.extendTraces('chart',{y: [[getData()]]}, [0]);
    time ++;
    if (!paused) {
        range = time;
        if(range > 100) {
            Plotly.relayout('chart', {xaxis: {range: [range - 100, range]}});
        }
    }
},15);
// Data Plot



// Pause & Switch
const pause = document.querySelector('.pause');
pause.addEventListener('click', function onClick() {
    if (paused) {
        pause.classList.remove("pause");
        pause.classList.add("clkdpause");
    } else {
        pause.classList.add("pause");
        pause.classList.remove("clkdpause");
    }
})
let paused = false;
function stopPlot() {
    paused = !paused;
}

const plots = document.querySelector('.plots');
const switches = document.querySelector('.switch');
let maxPlot = 2;
function switchPlot() {
    if (plotNum != maxPlot) {
        plotNum++;
    } else {
        plotNum = 1;
    }
    switches.textContent = 'Plot ' + plotNum;
}
// Pause & Switch









