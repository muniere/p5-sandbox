import * as p5 from 'p5';
import { WorldState } from './model';
import { Context } from '../../lib/process';

export class WorldWidget {
  public color: string = '#FFFFFF';

  constructor(
    public readonly context: p5,
    public readonly state: WorldState,
  ) {
    // no-op
  }

  draw() {
    const path = this.state.path();

    Context.scope(this.context, $ => {
      $.noFill();
      $.stroke(this.color);

      Context.shape($, 'closed', $$ => {
        path.points.forEach(it => {
          $$.vertex(it.x, it.y);
        });
      });
    });
  }
}
