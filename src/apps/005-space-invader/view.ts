import p5 from "p5";
import { Context } from '../../lib/process';
import { EnemyModel, GameModel, MissileModel, ShipModel } from './model';

export class ShipWidget {
  public model: ShipModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    Context.scope(this.context, $ => {
      $.fill(model.color);
      $.rectMode($.CENTER);
      $.square(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class EnemyWidget {
  public model: EnemyModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }
    if (!model.active) {
      return;
    }

    Context.scope(this.context, $ => {
      $.fill(model.color);
      $.circle(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class MissileWidget {
  public model: MissileModel | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }
    if (!model.active) {
      return;
    }

    Context.scope(this.context, $ => {
      $.noStroke();
      $.fill(model.color);
      $.circle(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class GameWidget {
  public model: GameModel | undefined;

  private _ship: ShipWidget;
  private _enemy: EnemyWidget;
  private _missile: MissileWidget;

  constructor(
    public readonly context: p5,
  ) {
    this._ship = new ShipWidget(context);
    this._enemy = new EnemyWidget(context);
    this._missile = new MissileWidget(context);
  }

  also(mutate: (widget: GameWidget) => void): GameWidget {
    mutate(this);
    return this;
  }

  draw() {
    const model = this.model;
    if (!model) {
      return;
    }

    this._ship.model = model.ship;
    this._ship.draw();

    model.enemies.forEach(it => {
      this._enemy.model = it;
      this._enemy.draw();
    });

    model.missiles.forEach(it => {
      this._missile.model = it;
      this._missile.draw();
    });
  }
}
