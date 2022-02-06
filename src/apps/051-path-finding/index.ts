// https://www.youtube.com/watch?v=aKYlikFAV4k
import * as p5 from 'p5';
import { Size } from '../../lib/graphics2d';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  SPOT_BASE_COLOR: '#FFFFFF',
  SPOT_WALL_COLOR: '#000000',
  SPOT_OPEN_COLOR: '#FFAAAA',
  SPOT_CLOSED_COLOR: '#AAFFAA',
  SPOT_SHORTEST_COLOR: '#AAAAFF',
  GRID_WIDTH: 50,
  GRID_HEIGHT: 50,
});

class Coordinate {
  constructor(
    public row: number,
    public column: number,
  ) {
    // no-op
  }

  static create({row, column}: {
    row: number,
    column: number,
  }): Coordinate {
    return new Coordinate(row, column);
  }

  static dist(a: Coordinate, b: Coordinate): number {
    return Math.abs(a.row - b.row) + Math.abs(a.column - b.column);
  }
}

class Cost {
  constructor(
    public g: number,
    public h: number,
  ) {
    // no-op
  }

  get f(): number {
    return this.g + this.h;
  }

  static zero(): Cost {
    return new Cost(0, 0);
  }

  static create({g, h}: {
    g: number,
    h: number,
  }): Cost {
    return new Cost(g, h);
  }
}

enum Kind {
  path,
  wall,
}

class Spot {
  public previous?: Spot;

  constructor(
    public kind: Kind,
    public coord: Coordinate,
    public bounds: Size,
    public cost: Cost,
  ) {
    // no-op
  }

  static create({kind, coord, size, cost}: {
    kind: Kind,
    coord: Coordinate,
    size: Size,
    cost: Cost,
  }): Spot {
    return new Spot(kind, coord, size, cost);
  }

  trace(): Spot[] {
    const chain = [] as Spot[];

    let cursor: Spot = this;

    while (cursor.previous) {
      chain.push(cursor);
      cursor = cursor.previous;
    }

    chain.push(cursor);

    return chain;
  }

  draw(p: p5, {color}: { color: string }) {
    p.noStroke();
    p.fill(color);
    p.rect(
      this.coord.column * this.bounds.width,
      this.coord.row * this.bounds.height,
      this.bounds.width - 1,
      this.bounds.height - 1,
    );
  }
}

class Grid {
  constructor(
    public spots: Spot[][],
  ) {
    // no-op
  }

  static generate(p: p5): Grid {
    const w = p.width / Params.GRID_WIDTH;
    const h = p.height / Params.GRID_HEIGHT;

    function kindFactory({row, column}: { row: number, column: number }): Kind {
      if (row == 0 && column == 0) {
        return Kind.path;
      }
      if (row == Params.GRID_HEIGHT - 1 && column == Params.GRID_HEIGHT - 1) {
        return Kind.path;
      }
      return Math.random() > 0.5 ? Kind.path : Kind.wall;
    }

    const spots = [...Array(Params.GRID_HEIGHT)].map(
      (_, row) => [...Array(Params.GRID_WIDTH)].map(
        (_, column) => Spot.create({
          kind: kindFactory({row: row, column: column}),
          coord: Coordinate.create({row: row, column: column}),
          size: Size.of({width: w, height: h}),
          cost: Cost.zero(),
        })
      )
    );

    return new Grid(spots);
  }

  getSpot(coord: Coordinate): Spot {
    return this.spots[coord.row][coord.column];
  }

  getSpotOrNull(coord: Coordinate): Spot | undefined {
    if (coord.row < 0 || this.spots.length - 1 < coord.row) {
      return undefined;
    }

    const row = this.spots[coord.row];
    if (coord.column < 0 || row.length - 1 < coord.column) {
      return undefined;
    }

    return row[coord.column];
  }

  getNeighbors(coord: Coordinate): Spot[] {
    const row = coord.row;
    const column = coord.column;

    const coordinates = [
      Coordinate.create({row: row, column: column - 1}),
      Coordinate.create({row: row, column: column + 1}),
      Coordinate.create({row: row - 1, column: column}),
      Coordinate.create({row: row + 1, column: column}),
      Coordinate.create({row: row - 1, column: column - 1}),
      Coordinate.create({row: row - 1, column: column + 1}),
      Coordinate.create({row: row + 1, column: column - 1}),
      Coordinate.create({row: row + 1, column: column + 1}),
    ];

    return coordinates
      .map(coord => this.getSpotOrNull(coord))
      .filter(spotOrNull => spotOrNull)
      .map(spotOrNull => spotOrNull!)
      .filter(spot => spot.kind == Kind.path);
  }

  first(): Spot {
    return this.spots[0][0];
  }

  last(): Spot {
    const row = this.spots[this.spots.length - 1];
    return row[row.length - 1];
  }
}

function sketch(self: p5) {
  let grid: Grid;
  let openSet: Spot[];
  let closedSet: Spot[];
  let shortestPath: Spot[];

  self.setup = function () {
    const size = Math.min(self.windowWidth, self.windowHeight);
    self.createCanvas(size, size);

    grid = Grid.generate(self);
    openSet = [grid.first()];
    closedSet = [];
  }

  self.draw = function () {
    if (openSet.length <= 0) {
      console.log('noSolution');
      self.noLoop();
      return;
    }

    const terminal = grid.last();
    const current = [...openSet].sort((a, b) => a.cost.f - b.cost.f)[0];

    if (current == terminal) {
      console.log('solved');
      self.noLoop();
    }

    openSet = openSet.filter(it => it != current);
    closedSet = closedSet.concat(current);

    const neighbors = grid
      .getNeighbors(current.coord)
      .filter((spot) => !closedSet.includes(spot));

    neighbors.forEach((neighbor) => {
      const weight = 1;
      const newCost = current.cost.g + weight;

      let newPathFound: boolean;

      if (openSet.includes(neighbor)) {
        newPathFound = newCost < neighbor.cost.g;
        neighbor.cost.g = Math.min(neighbor.cost.g, newCost);
      } else {
        newPathFound = true;
        neighbor.cost.g = newCost;
        openSet = openSet.concat(neighbor);
      }

      if (newPathFound) {
        neighbor.previous = current;
        neighbor.cost.h = heuristic(neighbor, terminal);
      }
    });

    shortestPath = current.trace();

    self.background(Params.CANVAS_COLOR);

    grid.spots.forEach(
      (row) => row.forEach(
        (spot) => spot.draw(self, {color: colorize(spot)})
      )
    );
  }

  function colorize(spot: Spot) {
    if (spot.kind == Kind.wall) {
      return Params.SPOT_WALL_COLOR;
    }
    if (shortestPath.includes(spot)) {
      return Params.SPOT_SHORTEST_COLOR;
    }
    if (closedSet.includes(spot)) {
      return Params.SPOT_CLOSED_COLOR;
    }
    if (openSet.includes(spot)) {
      return Params.SPOT_OPEN_COLOR;
    }
    return Params.SPOT_BASE_COLOR;
  }

  function heuristic(a: Spot, b: Spot): number {
    return Coordinate.dist(a.coord, b.coord);
  }
}

export { sketch };
