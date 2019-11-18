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
            let best_result = document.getElementById("best_result");
            if (best_result.innerText === "inf" || +best_result.innerText > +current_result.innerText) {
                best_result.innerText = current_result.innerText;
                localStorage.setItem("best_result", best_result.innerText);
            }
            alert("Congrats! Your score: " + current_result.innerText);
            let result = confirm("Do you want to play one more game?");
            if (result) {
                generatingField();
            }
        }

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

function generatingField() {
    let current_result = document.getElementById("current_result");
    current_result.innerText = "0";
    let field = generatingSequence();
    console.log(field);
    let svg = document.getElementById("field");
    {
        d3.select("#field").selectAll("*").remove();
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("class", "rect_field");
        svg.append(rect);
    }
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

