import * as p5 from 'p5';
import { TreeState } from './model';

export class TreeWidget {
  public color: string = '#FFFFFF';

  constructor(
    public readonly context: p5,
    public readonly state: TreeState,
  ) {
    // no-op
  }

  draw() {
    this.context.stroke(this.color);

    this.state.walk((branch) => {
      this.context.line(
        branch.begin.x, branch.begin.y,
        branch.end.x, branch.end.y,
      );
    })
  }
}
