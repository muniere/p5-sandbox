import { Dimen, Matrix, Spot, SpotCompat } from '../../lib/dmath';
import { Rect, Size } from '../../lib/graphics2d';

export class CostModel {
  public g: number;
  public h: number;

  constructor(nargs: {
    g: number,
    h: number,
  }) {
    this.g = nargs.g
    this.h = nargs.h;
  }

  get f(): number {
    return this.g + this.h;
  }

  static zero(): CostModel {
    return new CostModel({g: 0, h: 0});
  }
}

export enum NodeKind {
  path,
  wall,
}

export class NodeModel {
  public kind: NodeKind;
  public spot: Spot;
  public size: Size;
  public cost: CostModel;
  public previous?: NodeModel;

  constructor(nargs: {
    kind: NodeKind,
    spot: Spot,
    size: Size,
    cost: CostModel,
  }) {
    this.kind = nargs.kind;
    this.spot = nargs.spot;
    this.size = nargs.size;
    this.cost = nargs.cost;
  }

  trace(): NodeModel[] {
    const chain = [] as NodeModel[];

    let cursor: NodeModel = this;

    while (cursor.previous) {
      chain.push(cursor);
      cursor = cursor.previous;
    }

    chain.push(cursor);

    return chain;
  }
}

export module GraphModels {
  export function generate({rect, scale, kind}: {
    rect: Rect,
    scale: number,
    kind: (spot: Spot) => NodeKind,
  }): GraphModel {
    const dimen = Dimen.square(scale);
    const itemWidth = rect.width / scale;
    const itemHeight = rect.height / scale;

    const nodes = Matrix.generate(dimen, (spot) => {
      return new NodeModel({
        kind: kind(spot),
        spot: spot,
        size: new Size({width: itemWidth, height: itemHeight}),
        cost: CostModel.zero(),
      });
    });

    return new GraphModel({nodes});
  }
}

export class GraphModel {
  public readonly nodes: Matrix<NodeModel>;

  constructor(nargs: {
    nodes: Matrix<NodeModel>,
  }) {
    this.nodes = nargs.nodes;
  }

  getNode(spot: SpotCompat): NodeModel {
    return this.nodes.get(spot);
  }

  getNodeOrNull(spot: SpotCompat): NodeModel | undefined {
    return this.nodes.getOrNull(spot)
  }

  getNeighbors(spot: Spot): NodeModel[] {
    const row = spot.row;
    const column = spot.column;

    const spots: SpotCompat[] = [
      {row: row, column: column - 1},
      {row: row, column: column + 1},
      {row: row - 1, column: column},
      {row: row + 1, column: column},
      {row: row - 1, column: column - 1},
      {row: row - 1, column: column + 1},
      {row: row + 1, column: column - 1},
      {row: row + 1, column: column + 1},
    ];

    return spots
      .compactMap(spot => this.getNodeOrNull(spot))
      .filter(node => node.kind == NodeKind.path);
  }

  first(): NodeModel {
    return this.nodes.first();
  }

  last(): NodeModel {
    return this.nodes.last();
  }

  walk(callback: (node: NodeModel) => void) {
    this.nodes.forEach(callback)
  }
}

export interface HeuristicFunction {
  estimate(a: NodeModel, b: NodeModel): number
}

export class EuclidHeuristicFunction implements HeuristicFunction {

  estimate(a: NodeModel, b: NodeModel): number {
    return Math.sqrt(
      Math.pow(a.spot.row - b.spot.row, 2.0)
      + Math.pow(a.spot.column - b.spot.column, 2.0)
    )
  }
}

export class ManhattanHeuristicFunction implements HeuristicFunction {

  estimate(a: NodeModel, b: NodeModel): number {
    return Spot.dist(a.spot, b.spot);
  }
}

export enum SolverState {
  running,
  solved,
  noSolution,
}

export class SolverModel {
  public readonly graph: GraphModel;
  public readonly heuristic: HeuristicFunction;
  private _openSet: NodeModel[];
  private _closedSet: NodeModel[];
  private _answer: NodeModel[];

  constructor(nargs: {
    graph: GraphModel,
    heuristic: HeuristicFunction,
  }) {
    this.graph = nargs.graph;
    this.heuristic = nargs.heuristic;
    this._openSet = [nargs.graph.first()];
    this._closedSet = [];
    this._answer = [];
  }

  get openSet(): NodeModel[] {
    return [...this._openSet];
  }

  get closedSet(): NodeModel[] {
    return [...this._closedSet];
  }

  get answer(): NodeModel[] {
    return [...this._answer];
  }

  get state(): SolverState {
    if (this._openSet.length == 0) {
      return SolverState.noSolution;
    }
    const terminal = this.graph.last();
    const current = this._openSet.minBy(it => it.cost.f);
    if (current == terminal) {
      return SolverState.solved;
    } else {
      return SolverState.running;
    }
  }

  next() {
    const terminal = this.graph.last();
    const current = this._openSet.minBy(it => it.cost.f);

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

