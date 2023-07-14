const GENERATE_MAZE_BTN = "#generate-maze-btn";
const SIMULATE_BTN = "#simulate-btn";
const TOTAL_PATH_LENGTH_INFO = "#total-path-length-info";

const app = () => {
    let maze = null;

    document.querySelector(GENERATE_MAZE_BTN).onclick = () => {
        document.querySelector(GENERATE_MAZE_BTN).disabled = true;
        document.querySelector(SIMULATE_BTN).disabled = false;

        document.querySelector(TOTAL_PATH_LENGTH_INFO).textContent = "Total path lenght: 0";

        setTimeout(() => {
            maze = generate_maze();
            document.querySelectorAll("#maze > .cell").forEach(e => e.remove());
            visualize_maze(maze);
            document.querySelector(GENERATE_MAZE_BTN).disabled = false;
        }, 50);
    };

    document.querySelector(SIMULATE_BTN).onclick = () => {
        solve_maze(maze);
        document.querySelector(SIMULATE_BTN).disabled = true;
    };
}

function generate_maze() {
    const minWidth = 10;
    const maxWidth = 40;
    const width = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
    let mazeElement = document.querySelector('#maze');
    const height = Math.floor(width * mazeElement.offsetHeight / mazeElement.offsetWidth)

    let maze = [];
    for (let i = 0; i < width; ++i) {
        maze.push([]);
        for (let j = 0; j < height; ++j) {
            maze[i].push(1);
        }
    }
    for (let i = 0; i < width; ++i) {
        maze[i][0] = 0;
        maze[i][height - 1] = 0;
    }
    for (let i = 0; i < height; ++i) {
        maze[0][i] = 0;
        maze[width - 1][i] = 0;
    }

    const totalCellsCount = width * height;
    const emptyCellsCount = Math.floor(0.3 * totalCellsCount);
    let insertedEmptyCells = 0;
    const maxTries = 10000;
    let tries = 0;
    while (insertedEmptyCells < emptyCellsCount) {
        ++tries;

        // This is a hack, nasty hack; but in practice it works quite well
        // at least until I implement smarter maze generation algorithm
        if (tries > maxTries) {
            return generate_maze();
        }

        let i = Math.floor(Math.random() * width);
        let j = Math.floor(Math.random() * height);
        if (maze[i][j] === 0) {
            continue;
        }
        if (i === 1 && j === 1) {
            continue;
        }
        if ((i === width - 2) && (j === height - 2)) {
            continue;
        }

        maze[i][j] = 0;
        ++insertedEmptyCells;

        if (!dfs(maze, {x: 1, y: 1}, {x: width - 2, y: height - 2}, [], [])) {
            maze[i][j] = 1;
            --insertedEmptyCells;
        }
    }

    return maze;
}

function solve_maze(maze) {
    let path = [];
    let path_found = dfs(maze, {x: 1, y: 1}, {x: maze.length - 2, y: maze[0].length - 2}, [], path);
    if (path_found) {
        visualize_path(maze, path, "cell-path");
    }
}

function visualize_path(maze, path, subclass) {
    const pointToIndex = (p) => {
        return p.y * maze.length + p.x;
    };

    const buildQuery = (n) => {
        return "#maze :nth-child(" + (n + 1).toString() + ") .cell-content";
    };

    let timeout = 0;
    for (let i = 0; i < path.length; ++i) {
        const index = pointToIndex(path[i]);
        const query = buildQuery(index);
        let element = document.querySelector(query);

        timeout += 200;
        setTimeout(() => {
            element.classList.add(subclass);
            let mouseElement = document.createElement("div");
            mouseElement.id = "mouse";

            let oldMouse = document.querySelector("#mouse");
            element.append(mouseElement);
            if (oldMouse) {
                oldMouse.remove();
            }

            if (element.querySelector("#cheese")) {
                element.querySelector("#cheese").remove();
            }

            document.querySelector(TOTAL_PATH_LENGTH_INFO).textContent
                = "Total path lenght: " + (i+1).toString();

            incrementCellLabelCount(maze, path[i]);

        }, timeout);
    }
}

function visualize_maze(maze) {
    let mazeElement = document.querySelector('#maze');

    const widthCellCount = maze.length;
    const heightCellCount = maze[0].length;
    const mazeWidth = mazeElement.offsetWidth;
    const mazeHeight = mazeElement.offsetHeight;


    const cellWidth = Math.round(mazeWidth / maze.length);
    const cellHeight = Math.round(mazeHeight / maze[0].length);

    mazeElement.style.width = (cellWidth * widthCellCount).toString() + "px";
    mazeElement.style.height = (cellHeight * heightCellCount).toString() + "px";

    for (let j = 0; j < maze[0].length; ++j) {
        for (let i = 0; i < maze.length; ++i) {
            const cellType = maze[i][j];
            let cellElement = null;
            if (cellType === 0) {
                cellElement = create_maze_cell(cellWidth, cellHeight, "cell-wall");
            } else if (cellType === 1) {
                cellElement = create_maze_cell(cellWidth, cellHeight, "cell-empty");
            }
            if (i === 1 && j === 1) {
                let mouseElement = document.createElement("div");
                mouseElement.id = "mouse";
                cellElement.children[0].appendChild(mouseElement);
            } else if (i === maze.length - 2 && j === maze[0].length - 2) {
                let cheeseElement = document.createElement("div");
                cheeseElement.id = "cheese";
                cellElement.children[0].appendChild(cheeseElement);
            }
            mazeElement.appendChild(cellElement);
        }
    }
}

function create_maze_cell(width, height, subclass) {
    let element = document.createElement("div");
    element.classList.add("cell", subclass);
    element.style.width = width.toString() + "px";
    element.style.height = height.toString() + "px";

    let subelement = document.createElement("div");
    subelement.classList.add("cell-content");
    element.appendChild(subelement);

    let debugNumberElement = document.createElement("div");
    debugNumberElement.className = "debug";
    debugNumberElement.innerHTML = "<p>0</p>";
    debugNumberElement.style.visibility = "hidden";
    subelement.appendChild(debugNumberElement);

    return element;
}

function dfs(maze, current_position, end_position, visited, path) {
    visited.push(current_position);
    path.push(current_position);

    if (current_position.x === end_position.x && current_position.y === end_position.y) {
        return true;
    }

    let new_positions = [
        { x: current_position.x - 1, y: current_position.y },
        { x: current_position.x, y: current_position.y + 1 },
        { x: current_position.x + 1, y: current_position.y },
        { x: current_position.x, y: current_position.y - 1 },
    ];

    const is_valid = (pos) => {
        if (maze[pos.x][pos.y] === 0) {
            return false;
        }

        if (visited.find(e => e.x === pos.x && e.y == pos.y)) {
            return false;
        }

        return true;
    }

    const filter_positions = (positions) => {
        let filtered_positions = [];
        for (const p of positions) {
            if (is_valid(p)) {
                filtered_positions.push(p);
            }
        }
        return filtered_positions;
    }

    new_positions = filter_positions(new_positions);
    shuffleArray(new_positions);

    for (const p of new_positions) {
        if (dfs(maze, p, end_position, visited, path)) {
            return true;
        } else {
            path.push(current_position);
        }
    }

    return false;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function incrementCellLabelCount(maze, position) {
    const pointToIndex = (p) => {
        return p.y * maze.length + p.x;
    };

    const buildQuery = (n) => {
        return "#maze :nth-child(" + (n + 1).toString() + ") .cell-content .debug p";
    };

    const index = pointToIndex(position);
    const query = buildQuery(index);
    let element = document.querySelector(query);
    let counter = element.textContent;
    if (counter) {
        element.textContent = (parseInt(counter) + 1).toString();
    } else {
        element.textContent = "1";
    }
    element.style.visibility = "visible";
}

document.addEventListener("DOMContentLoaded", app);