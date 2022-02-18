import * as p5 from "p5";
import { Context } from '../../lib/process';
import { Point } from '../../lib/graphics2d';
import { EnemyState, GameState, MissileState, ShipState } from './model';

export class ShipWidget {
  constructor(
    public readonly context: p5,
    public readonly state: ShipState,
  ) {
    // no-op
  }

  private get center(): Point {
    return this.state.center;
  }

  private get radius(): number {
    return this.state.radius;
  }

  draw() {
    Context.scope(this.context, $ => {
      $.fill(this.state.color);
      $.rectMode($.CENTER);
      $.square(this.center.x, this.center.y, this.radius);
    });
  }
}

export class EnemyWidget {
  constructor(
    public readonly context: p5,
    public readonly state: EnemyState,
  ) {
    // no-op
  }

  private get center(): Point {
    return this.state.center;
  }

  private get radius(): number {
    return this.state.radius;
  }

  draw() {
    if (!this.state.active) {
      return;
    }

    Context.scope(this.context, $ => {
      $.fill(this.state.color);
      $.ellipse(this.center.x, this.center.y, this.radius);
    });
  }
}

export class MissileWidget {
  constructor(
    public readonly context: p5,
    public readonly state: MissileState,
  ) {
    // no-op
  }

  private get center(): Point {
    return this.state.center;
  }

  private get radius(): number {
    return this.state.radius;
  }

  draw() {
    if (!this.state.active) {
      return;
    }

    Context.scope(this.context, $ => {
      $.noStroke();
      $.fill(this.state.color);
      $.ellipse(this.center.x, this.center.y, this.radius);
    });
  }
}

export class GameWidget {
  constructor(
    public readonly context: p5,
    public readonly state: GameState,
  ) {
    // no-op
  }

  draw() {
    new ShipWidget(this.context, this.state.ship).draw();
    this.state.enemies.forEach(it => new EnemyWidget(this.context, it).draw());
    this.state.missiles.forEach(it => new MissileWidget(this.context, it).draw());
  }
}
