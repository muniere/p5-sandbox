import * as p5 from 'p5';
import { Context } from '../../lib/process';
import { Spot } from '../../lib/dmath';
import { Size } from '../../lib/graphics2d';
import { NodeKind, NodeState, Solver } from './model';

export class NodeWidget {
  public color: string = '#FFFFFF';

  constructor(
    public readonly context: p5,
    public readonly state: NodeState
  ) {
    // no-op
  }

  private get spot(): Spot {
    return this.state.spot;
  }

  private get size(): Size {
    return this.state.size;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.noStroke();
      $.fill(this.color);

      $.rect(
        this.spot.column * this.size.width,
        this.spot.row * this.size.height,
        this.size.width - 1,
        this.size.height - 1,
      );
    });
  }
}

export class SolverWidget {
  public wallColor: string = '#FFFFFF';
  public baseColor: string = '#FFFFFF';
  public openColor: string = '#FFFFFF';
  public closedColor: string = '#FFFFFF';
  public answerColor: string = '#FFFFFF';

  constructor(
    public readonly context: p5,
    public readonly solver: Solver,
  ) {
    // no-op
  }

  draw() {
    this.solver.graph.walk((node) => {
      const widget = new NodeWidget(this.context, node)
      widget.color = this.colorize(node);
      widget.draw();
    });
  }

  private colorize(node: NodeState): string {
    if (node.kind == NodeKind.wall) {
      return this.wallColor;
    }
    if (this.solver.answer.includes(node)) {
      return this.answerColor;
    }
    if (this.solver.closedSet.includes(node)) {
      return this.closedColor;
    }
    if (this.solver.openSet.includes(node)) {
      return this.openColor;
    }
    return this.baseColor;
  }
}

