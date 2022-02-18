import * as p5 from 'p5';
import { Context } from '../../lib/process';
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
    Context.scope(this.context, $ => {
      $.stroke(this.color);

      this.state.walk((branch) => {
        $.line(
          branch.begin.x, branch.begin.y,
          branch.end.x, branch.end.y,
        );
      })
    });
  }
}
