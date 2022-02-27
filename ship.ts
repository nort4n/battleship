// Define Types
type ShipType =
  | "destroyer"
  | "submarine"
  | "cruiser"
  | "battleship"
  | "carrier";

class Ship {
  // Define Attributes
  type: ShipType;
  isHorizontal: boolean = true;
  length: number;
  hits: number = 0;

  constructor(type: ShipType) {
    this.type = type;
    // Assign Length based on the type
    switch (this.type) {
      case "destroyer":
        this.length = 2;
        break;
      case "cruiser":
      case "submarine":
        this.length = 3;
        break;
      case "battleship":
        this.length = 4;
        break;
      case "carrier":
        this.length = 5;
        break;
    }
  }

  hit(): void {
    if (this.hits < this.length) {
      this.hits += 1;
    }
  }

  get isSunken(): boolean {
    return this.hits === this.length;
  }
}

class PlayerShip extends Ship {
  // Define Attribute
  element: HTMLElement;
  constructor(type: ShipType) {
    super(type);
    // Grab the element from the DOM based on the type
    this.element = document.querySelector(
      `.${this.type}-container`
    ) as HTMLElement;
  }

  rotate() {
    // Flip isHorizontal boolean
    this.isHorizontal = this.isHorizontal ? false : true;

    // e.g. this.element.className -> "ship destroyer-container"
    // e.g. shipSpecificClass -> "destroyer-container"
    const shipSpecificClass = this.element.className.split(" ")[1];
    this.element.classList.toggle(`${shipSpecificClass}-vertical`);
  }
}
