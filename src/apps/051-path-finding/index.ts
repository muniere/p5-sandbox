// https://www.youtube.com/watch?v=aKYlikFAV4k
import * as p5 from 'p5';
import { Spot } from '../../lib/dmath';
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

class Node {
  public previous?: Node;

  constructor(
    public kind: Kind,
    public spot: Spot,
    public size: Size,
    public cost: Cost,
  ) {
    // no-op
  }

  static create({kind, spot, size, cost}: {
    kind: Kind,
    spot: Spot,
    size: Size,
    cost: Cost,
  }): Node {
    return new Node(kind, spot, size, cost);
  }

  trace(): Node[] {
    const chain = [] as Node[];

    let cursor: Node = this;

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
      this.spot.column * this.size.width,
      this.spot.row * this.size.height,
      this.size.width - 1,
      this.size.height - 1,
    );
  }
}

class Grid {
  constructor(
    public nodes: Node[][],
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
        (_, column) => Node.create({
          kind: kindFactory({row: row, column: column}),
          spot: Spot.of({row: row, column: column}),
          size: Size.of({width: w, height: h}),
          cost: Cost.zero(),
        })
      )
    );

    return new Grid(spots);
  }

  getNode(spot: Spot): Node {
    return this.nodes[spot.row][spot.column];
  }

  getNodeOrNull(spot: Spot): Node | undefined {
    if (spot.row < 0 || this.nodes.length - 1 < spot.row) {
      return undefined;
    }

    const row = this.nodes[spot.row];
    if (spot.column < 0 || row.length - 1 < spot.column) {
      return undefined;
    }

    return row[spot.column];
  }

  getNeighbors(spot: Spot): Node[] {
    const row = spot.row;
    const column = spot.column;

    const spots = [
      Spot.of({row: row, column: column - 1}),
      Spot.of({row: row, column: column + 1}),
      Spot.of({row: row - 1, column: column}),
      Spot.of({row: row + 1, column: column}),
      Spot.of({row: row - 1, column: column - 1}),
      Spot.of({row: row - 1, column: column + 1}),
      Spot.of({row: row + 1, column: column - 1}),
      Spot.of({row: row + 1, column: column + 1}),
    ];

    return spots
      .map(spot => this.getNodeOrNull(spot))
      .filter(spot => spot)
      .map(spot => spot!)
      .filter(spot => spot.kind == Kind.path);
  }

  first(): Node {
    return this.nodes[0][0];
  }

  last(): Node {
    const row = this.nodes[this.nodes.length - 1];
    return row[row.length - 1];
  }
}

function sketch(self: p5) {
  let grid: Grid;
  let openSet: Node[];
  let closedSet: Node[];
  let shortestPath: Node[];

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
      .getNeighbors(current.spot)
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

    grid.nodes.forEach(
      (row) => row.forEach(
        (spot) => spot.draw(self, {color: colorize(spot)})
      )
    );
  }

  function colorize(spot: Node) {
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

  function heuristic(a: Node, b: Node): number {
    return Spot.dist(a.spot, b.spot);
  }
}

export { sketch };
