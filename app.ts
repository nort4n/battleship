document.addEventListener("DOMContentLoaded", () => {
const playerGrid = document.getElementById("bf1") as HTMLElement; 
const computerGrid = document.getElementById("bf2") as HTMLElement;
const rotateButton = document.getElementById("rotate") as HTMLElement;

const gridChars = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
for (let i = 0; i < gridChars.length; i++) {
    for (let j = 1; j <= 10; j++) {
        const playerId = `player-${gridChars[i]}-${j}`;
        const computerId = `computer-${gridChars[i]}-${j}`;

        const playerSquare = document.createElement("div");
        playerSquare.id = playerId;

        const computerSquare = document.createElement("div");
        computerSquare.id = computerId;
        playerGrid.appendChild(playerSquare);
        computerGrid.appendChild(computerSquare);    
    }
}

function rotateShips() {
    const ships = document.querySelector(".ships")?.children as HTMLCollection;
    const shipsArray = Array.from(ships);

    shipsArray.forEach((ship) => {
        const shipSpecificClass = ship.className.split(" ")[1];
        ship.classList.toggle(`${shipSpecificClass}-vertical`);
    });
};
    rotateButton.addEventListener("click", rotateShips);

});

