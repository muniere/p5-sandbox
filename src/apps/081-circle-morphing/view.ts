import { Widget } from '../../lib/process';
import { ApplicationModel } from './model';

export class ApplicationWidget extends Widget<ApplicationModel> {
  public color: string = '#FFFFFF';

  protected doDraw(model: ApplicationModel) {
    const path = model.path();

    this.scope($ => {
      $.noFill();
      $.stroke(this.color);

      this.shape('closed', $$ => {
        path.points.forEach(it => {
          $$.vertex(it.x, it.y);
        });
      });
    });
  }
}
