import * as p5 from 'p5';
import { Widget } from '../../lib/process';
import { NodeKind, NodeModel, SolverModel } from './model';

export class NodeWidget extends Widget<NodeModel> {
  public color: string = '#FFFFFF';

  protected doDraw(model: NodeModel) {
    this.scope($ => {
      $.noStroke();
      $.fill(this.color);

      $.rect(
        model.spot.column * model.size.width,
        model.spot.row * model.size.height,
        model.size.width - 1,
        model.size.height - 1,
      );
    });
  }
}

export class SolverWidget extends Widget<SolverModel> {
  public wallColor: string = '#FFFFFF';
  public baseColor: string = '#FFFFFF';
  public openColor: string = '#FFFFFF';
  public closedColor: string = '#FFFFFF';
  public answerColor: string = '#FFFFFF';

  private _node: NodeWidget;

  constructor(context: p5) {
    super(context);
    this._node = new NodeWidget(context);
  }


  protected doDraw(solver: SolverModel) {
    solver.graph.walk((node) => {
      this._node.model = node;
      this._node.color = this.colorize(node, {solver: solver});
      this._node.draw();
    });
  }

  private colorize(node: NodeModel, {solver}: { solver: SolverModel }): string {
    if (node.kind == NodeKind.wall) {
      return this.wallColor;
    }
    if (solver.answer.includes(node)) {
      return this.answerColor;
    }
    if (solver.closedSet.includes(node)) {
      return this.closedColor;
    }
    if (solver.openSet.includes(node)) {
      return this.openColor;
    }
    return this.baseColor;
  }
}

