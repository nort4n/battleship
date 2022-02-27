// Wait for DOMContent to be loaded
document.addEventListener("DOMContentLoaded", () => {
  // Grab the rotate button
  const rotateButton = document.getElementById("rotate") as HTMLElement;
  const startButton = document.getElementById("start") as HTMLElement;
  let playerTurn: number = 1;
  let computerTurn: number = 1;

  // Instanciate out grids
  const playerGrid = new PlayerGrid();
  const computerGrid = new ComputerGrid();

  // create the grid cells
  playerGrid.createBoard();
  computerGrid.createBoard();

  // when rotate button is clicked rotate every ship
  rotateButton.addEventListener("click", () =>
    playerGrid.shipsToBePlaced.forEach((ship) => ship.rotate())
  );

  playerGrid.addListeners();

  computerGrid.ships.forEach((ship) =>
    computerGrid.generateShipPlacement(ship)
  );

  startButton.addEventListener("click", () => {
    if (playerGrid.shipsToBePlaced.length > 0) {
      alert("You need to place all your ships to begin");
      return;
    }

    computerGrid.element.addEventListener("click", fire);
  });

  function fire(event: Event): void {
    const target = event.target as HTMLElement;
    const square = target;
    const position = makePositionFromId(target.id);
    const squareValue = computerGrid.get(position);

    if (playerTurn !== computerTurn) {
      return;
    }

    console.log(squareValue);

    if (squareValue === "hit" || squareValue === "miss") {
      alert("You already fired at that square pick another one");
      return;
    }

    if (!playerGrid.ships.length || !computerGrid.ships.length) {
      return;
    }

    computerGrid.takeShot(square);
    playerTurn += 1;

    setTimeout(() => {
      const randomFire = playerGrid.randomFire();
      playerGrid.takeShot(randomFire);
      computerTurn += 1;
    }, 500);
  }
});
