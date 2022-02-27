type Position = `${string}-${number}`;
type PossibleValue = "" | ShipType | "hit" | "miss";
type GridState = Record<Position, PossibleValue>;

abstract class Grid {
  protected state: GridState = {};
  type: "player" | "computer";
  ships: Ship[] = [];
  element: HTMLElement;
  squares: HTMLElement[] = [];

  constructor(type: "player" | "computer") {
    this.type = type;

    for (let i = 0; i < gridChars.length; i++) {
      for (let j = 1; j <= 10; j++) {
        // add each key to the state object -> e.g. "a-1": ""
        const position: Position = `${gridChars[i]}-${j}`;
        this.state[position] = "";
      }
    }

    // create the element for the grid
    this.element = document.createElement("div");
    // add class and id to the element
    this.element.classList.add("grid");
    this.element.id = this.type === "player" ? "grid-player" : "grid-computer";

    // put the grid into it's container
    const container = document.querySelector(".grid-container") as HTMLElement;
    container.appendChild(this.element);
  }

  createBoard(): void {
    // loop over every entry in the state object and take the key
    for (const key in this.state) {
      // create a square
      const square = document.createElement("div");
      // give it the position and the grid-type as id
      square.id = `${this.type}-${key}`;
      this.element.appendChild(square);
      // hold a reference to each square on the instance
      this.squares.push(square);
    }
  }

  // Get value at given key from our state
  get(position: Position): PossibleValue {
    return this.state[position];
  }

  // Update the state at give key
  set(position: Position, value: PossibleValue): void {
    this.state[position] = value;
  }

  // Check if the object has a truthy value at given key
  has(position: Position): boolean {
    const value = this.get(position);
    return Boolean(value);
  }

  get positionArray(): Position[] {
    return Object.keys(this.state) as Position[];
  }

  drawShip(positions: Position[], shipType: ShipType): void {
    positions.forEach((position) => {
      const square = document.getElementById(`${this.type}-${position}`);
      square?.classList.add(shipType);
    });
  }

  isTaken(positions: Position[]): boolean {
    return positions.some((square) => this.get(square));
  }

  removeShip(ship: Ship): void {
    this.ships = this.ships.filter((s) => s !== ship);
  }

  takeShot(square: HTMLElement): void {
    const currentPlayer = this.type === "computer" ? "player" : "computer";
    const position = makePositionFromId(square.id);
    const squareValue = this.get(position);

    if (shipNames.includes(squareValue as ShipType)) {
      const hitShip = this.ships.find(
        (ship) => ship.type === squareValue
      ) as Ship;
      hitShip.hit();
      square.classList.add("boom");
      console.log(position);
      this.set(position, "hit");

      if (hitShip.isSunken) {
        console.log(`${hitShip.type} is destroyed`);
        this.removeShip(hitShip);

        if (!this.ships.length) {
          alert(`${currentPlayer} won`);
          console.log("Game over");
          return;
        }
      }
    } else {
      square.classList.add("miss");
      this.set(position, "miss");
    }
  }
}

class PlayerGrid extends Grid {
  shipsToBePlaced: PlayerShip[] = [];
  selectedShipPart: number = 0;
  selectedShip: PlayerShip | null = null;

  constructor() {
    super("player");

    shipNames.forEach((shipName) =>
      this.shipsToBePlaced.push(new PlayerShip(shipName))
    );
  }

  addListeners(): void {
    this.shipsToBePlaced.forEach((ship) => {
      ship.element.addEventListener("mousedown", (event) => {
        const target = event.target as HTMLElement;
        // take e.g. destroyer-0 and assign the number after the "-" to selectedShipPart
        this.selectedShipPart = parseInt(
          target.id.substring(target.id.length - 1)
        );
      });
      ship.element.addEventListener("dragstart", () => {
        this.selectedShip = ship;
      });
    });

    this.element.addEventListener("dragstart", (event) =>
      event.preventDefault()
    );
    this.element.addEventListener("dragover", (event) =>
      event.preventDefault()
    );
    this.element.addEventListener("dragenter", (event) =>
      event.preventDefault()
    );
    this.element.addEventListener("dragleave", (event) =>
      event.preventDefault()
    );
    this.element.addEventListener("drop", (event) => {
      const target = event.target as HTMLElement;
      const position = makePositionFromId(target.id);
      if (this.selectedShip) {
        this.placeShip(this.selectedShip, this.selectedShipPart, position);
      }
    });
  }

  placeShip(ship: PlayerShip, shipPart: number, position: Position) {
    // Create a binding that holds all of the positions the ship takes
    const shipSquares: Position[] = [];
    // "a-1" -> "a"
    const positionChar = position.split("-")[0];
    // "a-1" -> 1
    const positionNumber = parseInt(position.split("-")[1]);

    if (ship.isHorizontal) {
      // Determine how far the ship extends horizontally (number)
      for (let i = 0; i < ship.length; i++) {
        // calculate the position that each part of the ship would take
        const number = positionNumber + i - shipPart;
        // if ship occupies a cell with a number greater than 10 or less than 1 -> invalid
        if (number > 10 || number < 1) {
          // Return ship if position is invalid
          return;
        }
        shipSquares.push(`${positionChar}-${number}`);
      }
    } else {
      for (let i = 0; i < ship.length; i++) {
        const charIndex = gridChars.indexOf(positionChar);
        // calculate the position that each part of the ship would take
        const char = gridChars[charIndex + i - shipPart];
        if (!char) {
          return;
        }
        shipSquares.push(`${char}-${positionNumber}`);
      }
    }

    const isTaken = this.isTaken(shipSquares);

    if (!isTaken) {
      shipSquares.forEach((square) => this.set(square, ship.type));
      this.drawShip(shipSquares, ship.type);
      this.ships.push(ship);
      this.shipsToBePlaced = this.shipsToBePlaced.filter((s) => s !== ship);
      ship.element.remove();
    }
  }

  randomFire(): HTMLElement {
    let sqaureValue: PossibleValue;
    let randomPosition = getRadomElementFromArray(this.positionArray);
    sqaureValue = this.get(randomPosition);

    while (sqaureValue === "hit" || sqaureValue === "miss") {
      randomPosition = getRadomElementFromArray(this.positionArray);
      sqaureValue = this.get(randomPosition);
    }

    return document.getElementById(
      `${this.type}-${randomPosition}`
    ) as HTMLElement;
  }
}

class ComputerGrid extends Grid {
  constructor() {
    super("computer");

    shipNames.forEach((shipName) => this.ships.push(new Ship(shipName)));
  }

  calculateOffset<T>(shipLength: number, array: T[], element: T): number {
    let offset = 0;
    const index = array.indexOf(element);
    const endingPostion = index + shipLength;

    if (endingPostion > array.length) {
      offset = endingPostion - array.length;
    }
    return offset;
  }

  makeRandomShipPosition(ship: Ship): Position[] {
    const shipSquares: Position[] = [];
    const randomStartingPosition = getRadomElementFromArray(this.positionArray);
    const positionChar = randomStartingPosition[0];
    const positionNumber = parseInt(randomStartingPosition[2]);

    const randomIsHorizontal = Boolean(Math.round(Math.random()));
    ship.isHorizontal = randomIsHorizontal;

    if (ship.isHorizontal) {
      for (let i = 0; i < ship.length; i++) {
        const horizontalOffset = this.calculateOffset(
          ship.length,
          gridNumbers,
          positionNumber
        );
        const number = positionNumber + i - horizontalOffset;
        shipSquares.push(`${positionChar}-${number}`);
      }
    } else {
      for (let i = 0; i < ship.length; i++) {
        const verticalOffset = this.calculateOffset(
          ship.length,
          gridChars,
          positionChar
        );
        const charIndex = gridChars.indexOf(positionChar);
        const char = gridChars[charIndex + i - verticalOffset];
        shipSquares.push(`${char}-${positionNumber}`);
      }
    }
    return shipSquares;
  }

  generateShipPlacement(ship: Ship): void {
    let shipSquares: Position[] = this.makeRandomShipPosition(ship);
    let isTaken: boolean = this.isTaken(shipSquares);

    while (isTaken) {
      shipSquares = this.makeRandomShipPosition(ship);
      isTaken = this.isTaken(shipSquares);
    }

    shipSquares.forEach((square) => this.set(square, ship.type));

    // this.drawShip(shipSquares, ship.type);
  }
}
