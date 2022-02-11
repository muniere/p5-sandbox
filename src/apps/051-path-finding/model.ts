import { Dimen, Matrix, Spot } from '../../lib/dmath';
import { Size } from '../../lib/graphics2d';

export class CostState {
  constructor(
    public g: number,
    public h: number,
  ) {
    // no-op
  }

  get f(): number {
    return this.g + this.h;
  }

  static zero(): CostState {
    return new CostState(0, 0);
  }

  static create({g, h}: {
    g: number,
    h: number,
  }): CostState {
    return new CostState(g, h);
  }
}

export enum NodeKind {
  path,
  wall,
}

export class NodeState {
  public previous?: NodeState;

  constructor(
    public kind: NodeKind,
    public spot: Spot,
    public size: Size,
    public cost: CostState,
  ) {
    // no-op
  }

  static create({kind, spot, size, cost}: {
    kind: NodeKind,
    spot: Spot,
    size: Size,
    cost: CostState,
  }): NodeState {
    return new NodeState(kind, spot, size, cost);
  }

  trace(): NodeState[] {
    const chain = [] as NodeState[];

    let cursor: NodeState = this;

    while (cursor.previous) {
      chain.push(cursor);
      cursor = cursor.previous;
    }

    chain.push(cursor);

    return chain;
  }
}

export class GraphState {
  constructor(
    public readonly nodes: Matrix<NodeState>,
  ) {
    // no-op
  }

  static generate({bounds, scale, kind}: {
    bounds: Size,
    scale: number,
    kind: (spot: Spot) => NodeKind,
  }): GraphState {
    const dimen = Dimen.square(scale);
    const itemWidth = bounds.width / scale;
    const itemHeight = bounds.height / scale;

    const nodes = Matrix.generate(dimen, (spot) => {
      return NodeState.create({
        kind: kind(spot),
        spot: spot,
        size: Size.of({width: itemWidth, height: itemHeight}),
        cost: CostState.zero(),
      });
    });

    return new GraphState(nodes);
  }

  getNode(spot: Spot): NodeState {
    return this.nodes.get(spot);
  }

  getNodeOrNull(spot: Spot): NodeState | undefined {
    return this.nodes.getOrNull(spot)
  }

  getNeighbors(spot: Spot): NodeState[] {
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
      .filter(node => node)
      .map(node => node!)
      .filter(node => node.kind == NodeKind.path);
  }

  first(): NodeState {
    return this.nodes.first();
  }

  last(): NodeState {
    return this.nodes.last();
  }

  walk(callback: (node: NodeState) => void) {
    this.nodes.forEach(callback)
  }
}

export interface Heuristic {
  estimate(a: NodeState, b: NodeState): number
}

export class EuclidHeuristic implements Heuristic {

  estimate(a: NodeState, b: NodeState): number {
    return Math.sqrt(
      Math.pow(a.spot.row - b.spot.row, 2.0)
      + Math.pow(a.spot.column - b.spot.column, 2.0)
    )
  }
}

export class ManhattanHeuristic implements Heuristic {

  estimate(a: NodeState, b: NodeState): number {
    return Spot.dist(a.spot, b.spot);
  }
}

export enum SolverState {
  running,
  solved,
  noSolution,
}

export class Solver {
  private _openSet: NodeState[];
  private _closedSet: NodeState[];
  private _answer: NodeState[];

  constructor(
    public readonly graph: GraphState,
    public readonly heuristic: Heuristic,
  ) {
    this._openSet = [graph.first()];
    this._closedSet = [];
    this._answer = [];
  }

  static create({graph, heuristic}: {
    graph: GraphState,
    heuristic: Heuristic,
  }): Solver {
    return new Solver(graph, heuristic);
  }

  get openSet(): NodeState[] {
    return [...this._openSet];
  }

  get closedSet(): NodeState[] {
    return [...this._closedSet];
  }

  get answer(): NodeState[] {
    return [...this._answer];
  }

  get state(): SolverState {
    if (this._openSet.length == 0) {
      return SolverState.noSolution;
    }
    const terminal = this.graph.last();
    const current = [...this._openSet].sort((a, b) => a.cost.f - b.cost.f)[0];
    if (current == terminal) {
      return SolverState.solved;
    } else {
      return SolverState.running;
    }
  }

  next() {
    const terminal = this.graph.last();
    const current = [...this._openSet].sort((a, b) => a.cost.f - b.cost.f)[0];

    if (current == terminal) {
      return;
    }

    this._openSet = this._openSet.filter(it => it != current);
    this._closedSet = this._closedSet.concat(current);

    const neighbors = this.graph
      .getNeighbors(current.spot)
      .filter((node) => !this._closedSet.includes(node));

    neighbors.forEach((neighbor) => {
      const weight = 1;
      const newCost = current.cost.g + weight;

      let newPathFound: boolean;

      if (this._openSet.includes(neighbor)) {
        newPathFound = newCost < neighbor.cost.g;
        neighbor.cost.g = Math.min(neighbor.cost.g, newCost);
      } else {
        newPathFound = true;
        neighbor.cost.g = newCost;
        this._openSet = this._openSet.concat(neighbor);
      }

      if (newPathFound) {
        neighbor.previous = current;
        neighbor.cost.h = this.heuristic.estimate(neighbor, terminal);
      }
    });

    this._answer = current.trace();
  }
}

