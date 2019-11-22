function onClickImage(name, field) {
    let rect = document.getElementById("rect_" + name);
    let text = document.getElementById("text_" + name);
    let x = rect.getAttribute("x");
    let y = rect.getAttribute("y");
    let coord_cell_x = Math.round(x / 125);
    let coord_cell_y = Math.round(y / 125);
    let empty_x = +localStorage.getItem("x_empty");
    let empty_y = +localStorage.getItem("y_empty");
    if (Math.abs(coord_cell_x - empty_x) + Math.abs(coord_cell_y - empty_y) === 1) {
        rect.setAttribute("x", +rect.getAttribute("x") + 125 * (empty_x - coord_cell_x));
        rect.setAttribute("y", +rect.getAttribute("y") + 125 * (empty_y - coord_cell_y));

        text.setAttribute("x", +text.getAttribute("x") + 125 * (empty_x - coord_cell_x));
        text.setAttribute("y", +text.getAttribute("y") + 125 * (empty_y - coord_cell_y));

        localStorage.setItem("x_empty", coord_cell_x.toString());
        localStorage.setItem("y_empty", coord_cell_y.toString());

        let it1 = 4 * coord_cell_y + coord_cell_x;
        let it2 = 4 * empty_y + empty_x;
        [field[it1], field[it2]] = [field[it2], field[it1]];

        let current_result = document.getElementById("current_result");
        current_result.innerText = (+current_result.innerText + 1).toString();

        if (isFinished(field)) {
            let best_time = document.getElementById("best_time");
            let current_time = document.getElementById("stopwatch");

            addResult({score: +current_result.innerText, time: current_time.innerText});

            let best_result = document.getElementById("best_result");
            if (best_result.innerText === "inf" || +best_result.innerText > +current_result.innerText) {
                best_result.innerText = current_result.innerText;
                localStorage.setItem("best_result", best_result.innerText);
            }

            if (best_time.innerText === "inf" || best_time.innerText > current_time.innerText) {
                best_time.innerText = current_time.innerText;
                localStorage.setItem("best_time", current_time.innerText);
            }
            alert("Congrats! Your score: " + current_result.innerText);
            oneMoreGame("Do you want to play one more game?");
        }

    }
}

function oneMoreGame(str) {
    let result = confirm(str);
    if (result) {
        generatingField();
    } else {
        console.log("We are going to stop this stopwatch: " + localStorage.getItem("id_stopwatch"));
        clearInterval(+localStorage.getItem("id_stopwatch"));
        localStorage.removeItem("id_stopwatch");

        let svg = document.getElementById("field");
        svg.setAttribute("class", "unclickable");
    }
}

function isFinished(array) {
    if (array[array.length - 1] !== 0) {
        return false;
    }
    for (let i = 1; i < array.length - 1; ++i) {
        if (array[i] < array[i - 1]) {
            return false;
        }
    }
    return true;
}

function moveCell(dx, dy, field, position) {
    let empty_x = +localStorage.getItem("x_empty");
    let empty_y = +localStorage.getItem("y_empty");
    let cell_x = empty_x - dx;
    let cell_y = empty_y - dy;
    if (0 <= cell_x && cell_x < 4 && 0 <= cell_y && cell_y < 4) {
        //name -- initial position in field
        let name = position[field[cell_x + 4 * cell_y]].toString();
        onClickImage(name, field);
    }
}

function generatingField() {
    if (localStorage.getItem("id_stopwatch")) {
        console.log("We need to stop this watch, because nobody else can't do it :D");
        clearInterval(+localStorage.getItem("id_stopwatch"));
        localStorage.removeItem("id_stopwatch");
    }

    let current_result = document.getElementById("current_result");
    current_result.innerText = "0";
    let field = generatingSequence();

    let position = {};
    for (let it = 0; it < 16; ++it) {
        position[field[it]] = it;
    }

    console.log(field);

    function keyPressed(event) {
        switch (event.code) {
            case "KeyA":
            case "ArrowLeft":
                moveCell(-1, 0, field, position);
                break;
            case "KeyD":
            case "ArrowRight":
                moveCell(1, 0, field, position);
                break;
            case "KeyW":
            case "ArrowUp":
                moveCell(0, -1, field, position);
                break;
            case "KeyS":
            case "ArrowDown":
                moveCell(0, 1, field, position);
                break;
        }
    }

    document.onkeyup = keyPressed;

    let svg = document.getElementById("field");
    {
        d3.select("#field").selectAll("*").remove();
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", "rect_field");
        svg.append(rect);
    }
    svg.removeAttribute("class"); // It will remove unclickable class if it exists

    for (let i = 0; i < 16; ++i) {
        let x = i % 4;
        let y = Math.floor(i / 4);
        // field[i] -> (x, y)

        let name = i.toString();
        let new_svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        new_svg.setAttribute("id", "cell_" + name);

        if (field[i] !== 0) {
            new_svg.onclick = () => onClickImage(name, field);
            let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("id", "rect_" + name);
            rect.setAttribute("class", "rect_cell");
            rect.setAttribute("x", (x * 125).toString());
            rect.setAttribute("y", (y * 125).toString());

            new_svg.append(rect);
        }

        let dx = 40;
        let dy = 90;

        if (field[i] >= 10) {
            dx = 10;
        }

        if (field[i] === 0) {
            localStorage.setItem("x_empty", x.toString());
            localStorage.setItem("y_empty", y.toString());
        } else {
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("id", "text_" + name);
            text.setAttribute("class", "text_cell");
            text.setAttribute("x", (dx + 125 * x).toString());
            text.setAttribute("y", (dy + 125 * y).toString());
            text.innerHTML = field[i];

            new_svg.append(text);
        }

        svg.append(new_svg);
    }
    let start_time = new Date();
    let start_stamp = start_time.getTime();
    localStorage.setItem("start_stamp", start_stamp.toString());
    console.log("START_TIME: ", start_time);
    let id = setInterval(stopwatchFunction, 1000);
    console.log("We start stopwatch: " + id);
    localStorage.setItem("id_stopwatch", id.toString());

    getResults();
}

function generatingSequence() {
    let array = [];
    for (let i = 0; i < 16; ++i) {
        array.push(i);
    }
    while (true) {
        shuffle(array);
        if (checkSequence(array)) {
            break;
        }
    }
    return array;
}

function checkSequence(array) {
    let sum = 0;
    for (let i = 0; i < array.length; ++i) {
        for (let j = i + 1; j < array.length; ++j) {
            if (array[i] !== 0 && array[j] !== 0) {
                sum += (array[i] > array[j]);
            }
        }
    }
    let pos = array.indexOf(0);
    return (sum + Math.floor(pos / 4)) % 2;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function stopwatchFunction() {
    let start_stamp = localStorage.getItem("start_stamp");
    let start_time = new Date(+start_stamp);

    let now = new Date();
    let delta = now.getTime() - start_time;

    delta = Math.floor(delta / 1000);
    let hours = "0" + Math.floor(delta / (60 * 60));
    let minutes = "0" + Math.floor((delta % 3600) / 60);
    let seconds = "0" + Math.floor(delta % 60);

    if (+hours >= 100) {
        alert("NOW_TIME: " + now);
        oneMoreGame("Your time is expired. Do you want to start a new game?");
    }

    let stopwatch = document.getElementById("stopwatch");
    stopwatch.innerText = hours.slice(-2) + ":" + minutes.slice(-2) + ":" + seconds.slice(-2);
}

function getServerURL() {
    // "http://127.0.0.1:5000"
    return "https://8df74a82.ngrok.io";
}

async function getResults(sort="score") {
    let basic_url = getServerURL();
    let url = basic_url + "/api/get_results";

    let params = new URLSearchParams();
    params.append("sort", sort);

    url += "?" + params;

    try {
        let response = await fetch(url);
        console.log(response.status);
        if (response.ok) {
            let results = await response.json();
            let table = document.getElementById("table_id");
            d3.select("#table_id").selectAll("tr").filter((d, i) => i > 0).remove();
            for (let key in results) {
                let tr = document.createElement("tr");
                tr.innerHTML = `<td>${+key + 1}</td> <td>${results[key].score} <td>${results[key].time}</td>`;
                table.append(tr);
            }
        } else {
            alert(response.status);
        }
    } catch (e) {
        console.log("ERROR: " + e);
    }
}

async function addResult(result) {
    let basic_url = getServerURL();
    let url = basic_url + "/api/add_result";

    try {
        let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(result)
        });
        if (response.ok) {
            await getResults();
        } else {
            alert(response.status);
        }
    }  catch (e) {
        console.log("ERROR: " + e);
    }
}

function checkVersion(current_version) {
    let best_result = document.getElementById("best_result");
    let best_time = document.getElementById("best_time");
    if (!localStorage.getItem("version")) {
        localStorage.clear();
        localStorage.setItem("version", current_version);
    } else {
        // later we can refresh some information which will be updated
        if (localStorage.getItem("version") >= "v0.10") {
            best_result.innerText = localStorage.getItem("best_result");
            best_time.innerHTML = localStorage.getItem("best_time");
        }
        localStorage.clear();
        localStorage.setItem("version", current_version);
    }
    localStorage.setItem("best_result", best_result.innerText);
    localStorage.setItem("best_time", best_time.innerText);
}