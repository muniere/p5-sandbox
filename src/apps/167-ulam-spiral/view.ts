import p5 from 'p5';
import { Widget } from '../../lib/process';
import { Point, Size } from '../../lib/graphics2d';
import { ApplicationModel, ConnectionModel, Formula, PieceModel } from './model';

export abstract class PieceStyle {
  // marker class
}

export class PieceTextStyle extends PieceStyle {
  public readonly textSize: number;

  constructor(nargs: {
    textSize: number,
  }) {
    super();
    this.textSize = nargs.textSize;
  }
}

export enum PriceCircleMode {
  any,
  prime,
}

export class PieceCircleStyle extends PieceStyle {
  public readonly radius: number;
  public readonly mode: PriceCircleMode;

  constructor(nargs: {
    radius: number,
    mode: PriceCircleMode,
  }) {
    super();
    this.radius = nargs.radius;
    this.mode = nargs.mode;
  }
}

export class PieceWidget extends Widget<PieceModel> {
  public color: string = '#FFFFFF';
  public boxSize: Size = Size.zero();
  public style: PieceStyle = new PieceTextStyle({textSize: 14});

  protected doDraw(model: PieceModel) {
    if (this.style instanceof PieceTextStyle) {
      this.doDrawText(model, this.style);
      return;
    }
    if (this.style instanceof PieceCircleStyle) {
      this.doDrawCircle(model, this.style);
      return;
    }
  }

  private doDrawText(model: PieceModel, style: PieceTextStyle) {
    const x = model.spot.column * this.boxSize.width;
    const y = model.spot.row * this.boxSize.height;

    this.scope($ => {
      $.fill(this.color);
      $.textSize(style.textSize);
      $.textAlign($.CENTER, $.CENTER);
      $.text(model.stepCounter + 1, x, y, this.boxSize.width, this.boxSize.height);
    });
  }

  private doDrawCircle(model: PieceModel, style: PieceCircleStyle) {
    if (style.mode == PriceCircleMode.prime && !Formula.isPrime(model.stepCounter + 1)) {
      return;
    }

    const x = model.spot.column * this.boxSize.width + this.boxSize.width / 2;
    const y = model.spot.row * this.boxSize.height + this.boxSize.height / 2;

    this.scope($ => {
      $.fill(this.color);
      $.circle(x, y, style.radius * 2);
    });
  }
}

export class ConnectionWidget extends Widget<ConnectionModel> {
  public color: string = '#FFFFFF';
  public boxSize: Size = Size.zero();

  protected doDraw(model: ConnectionModel) {
    const start = new Point({
      x: model.start.column * this.boxSize.width + this.boxSize.width / 2,
      y: model.start.row * this.boxSize.height + this.boxSize.height / 2,
    });

    const stop = new Point({
      x: model.stop.column * this.boxSize.width + this.boxSize.width / 2,
      y: model.stop.row * this.boxSize.height + this.boxSize.height / 2,
    });

    this.scope($ => {
      $.stroke(this.color);
      $.line(start.x, start.y, stop.x, stop.y);
    });
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  public connection: boolean = true;
  private readonly _piece: PieceWidget;
  private readonly _connection: ConnectionWidget;

  constructor(context: p5) {
    super(context);
    this._piece = new PieceWidget(context);
    this._connection = new ConnectionWidget(context);
  }

  set color(value: string) {
    this._piece.color = value;
    this._connection.color = value;
  }

  set boxSize(value: Size) {
    this._piece.boxSize = value;
    this._connection.boxSize = value;
  }

  set style(value: PieceStyle) {
    this._piece.style = value;
  }

  protected doDraw(model: ApplicationModel) {
    this._piece.model = model.piece;
    this._piece.draw();

    if (this.connection) {
      this._connection.model = model.connection;
      this._connection.draw();
    }
  }
}
