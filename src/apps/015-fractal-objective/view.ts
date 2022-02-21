import { Widget } from '../../lib/process';
import { TreeModel } from './model';

export class TreeWidget extends Widget<TreeModel> {
  public color: string = '#FFFFFF';

  protected doDraw(model: TreeModel) {
    this.scope($ => {
      $.stroke(this.color);

      model.walk((branch) => {
        $.line(
          branch.begin.x, branch.begin.y,
          branch.end.x, branch.end.y,
        );
      })
    });
  }
}
