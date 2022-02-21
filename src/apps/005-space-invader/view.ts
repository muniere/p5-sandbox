import p5 from "p5";
import { Widget } from '../../lib/process';
import { EnemyModel, GameModel, MissileModel, ShipModel } from './model';

export class ShipWidget extends Widget<ShipModel> {

  protected doDraw(model: ShipModel) {
    this.scope($ => {
      $.fill(model.color);
      $.rectMode($.CENTER);
      $.square(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class EnemyWidget extends Widget<EnemyModel> {

  protected doDraw(model: EnemyModel) {
    if (!model.active) {
      return;
    }

    this.scope($ => {
      $.fill(model.color);
      $.circle(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class MissileWidget extends Widget<MissileModel> {

  protected doDraw(model: MissileModel) {
    if (!model.active) {
      return;
    }

    this.scope($ => {
      $.noStroke();
      $.fill(model.color);
      $.circle(model.center.x, model.center.y, model.radius * 2);
    });
  }
}

export class GameWidget extends Widget<GameModel> {
  private _ship: ShipWidget;
  private _enemy: EnemyWidget;
  private _missile: MissileWidget;

  constructor(context: p5) {
    super(context);
    this._ship = new ShipWidget(context);
    this._enemy = new EnemyWidget(context);
    this._missile = new MissileWidget(context);
  }

  protected doDraw(model: GameModel) {
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
