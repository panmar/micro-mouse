const app = () => {
    create_maze(10)
}

const create_maze = (dim) => {
    let mazeElement = document.querySelector('#maze');

    for (let i = 0; i < dim; ++i) {
        for (let j = 0; j < dim; ++j) {
            let cellElement = document.createElement("div");
            cellElement.className = "cell";
            mazeElement.appendChild(cellElement);
        }
    }

    document.querySelectorAll(".cell").forEach((element) => {
        element.style.width = (600 / dim).toString() + "pt";
        element.style.height = (600 / dim).toString() + "pt";

        element.addEventListener("mouseover", (e) => {
            element.style.background = "white";
        });
    });
}

// TODO(panmar): This event is problematic;
// it fires (on Safari) when I am typing in the navigation bar
// it seems the browser is prefetching whole page before it is visible
document.addEventListener("DOMContentLoaded", app);