import p5 from 'p5';
import { Widget } from '../../../lib/process';
import { AnchorModel, ApplicationModel, ChainModel, LinkModel } from './model';

export class AnchorWidget extends Widget<AnchorModel> {

  protected doDraw(model: AnchorModel) {
    const point = model.point;

    this.scope($ => {
      $.fill(model.color);
      $.circle(point.x, point.y, model.radius);
    });
  }
}

export class LinkWidget extends Widget<LinkModel> {

  protected doDraw(model: LinkModel) {
    const lead = model.lead;

    this.scope($ => {
      $.stroke(model.color);
      $.strokeWeight(model.weight);
      $.line(lead.start.x, lead.start.y, lead.stop.x, lead.stop.y);
    })
  }
}

export class ChainWidget extends Widget<ChainModel> {
  private readonly _anchor: AnchorWidget;
  private readonly _link: LinkWidget;

  constructor(context: p5) {
    super(context);
    this._anchor = new AnchorWidget(context);
    this._link = new LinkWidget(context);
  }

  protected doDraw(model: ChainModel) {
    this._anchor.model = model.anchor;
    this._anchor.draw();

    model.walkWidely(link => {
      this._link.model = link;
      this._link.draw();
    })
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private readonly _chain: ChainWidget;

  constructor(context: p5) {
    super(context);
    this._chain = new ChainWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    this._chain.model = model.chain;
    this._chain.draw();
  }
}
