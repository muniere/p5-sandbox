import * as p5 from 'p5';
import { Color } from 'p5';
import { Context } from '../../lib/process';
import { ItemState, ItemType, VehicleState, WorldState } from './model';
import { Flags } from './debug';

export const VehiclePalette = {
  body: '#CEBA00',
  sensor: '#f5e77a',
}

export const ItemPalette = {
  medicine: '#4F9301',
  poison: '#C50046',
  nothing: '#FFFFFF',
}

export class ItemWidget {
  public state: ItemState | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: ItemWidget) => void): ItemWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    Context.scope(this.context, $ => {
      $.fill(this.color(state));
      $.noStroke();

      $.translate(state.center.x, state.center.y);
      $.circle(0, 0, state.radius * 2);
    });
  }

  private color(item: ItemState): Color {
    switch (item.type) {
      case ItemType.medicine:
        return this.context.color(ItemPalette.medicine);
      case ItemType.poison:
        return this.context.color(ItemPalette.poison);
      case ItemType.nothing:
        return this.context.color(ItemPalette.nothing);
    }
  }
}

export class VehicleWidget {
  public state: VehicleState | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: VehicleWidget) => void): VehicleWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    Context.scope(this.context, $ => {
      $.translate(state.center.x, state.center.y);
      $.rotate(state.velocity.vector.heading() + Math.PI / 2);

      $.fill(this.color(state));
      $.noStroke();

      $.beginShape();
      $.vertex(0, -state.radius);
      $.vertex(-state.radius / 2, state.radius);
      $.vertex(state.radius / 2, state.radius);
      $.endShape($.CLOSE);

      if (Flags.debug) {
        $.stroke(VehiclePalette.body);
        $.noFill();
        $.circle(0, 0, state.radius * 2);

        $.stroke(ItemPalette.medicine);
        $.noFill();
        $.line(0, 0, 0, -state.scoreGenome.reward * 100);
        $.circle(0, 0, state.senseGenome.reward * 2);

        $.stroke(ItemPalette.poison);
        $.noFill();
        $.line(0, 0, 0, -state.scoreGenome.penalty * 100);
        $.circle(0, 0, state.senseGenome.penalty * 2);
      }
    });
  }

  private color(vehicle: VehicleState): Color {
    const color = this.context.color(VehiclePalette.body);
    color.setAlpha(Math.floor(256 * vehicle.scoreFraction));
    return color;
  }
}

export class WorldWidget {
  public state: WorldState | undefined;

  constructor(
    public readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: WorldWidget) => void): WorldWidget {
    mutate(this);
    return this;
  }

  draw() {
    const state = this.state;
    if (!state) {
      return;
    }

    state.items.forEach(it => {
      const widget = new ItemWidget(this.context);
      widget.state = it;
      widget.draw();
    });

    state.vehicles.forEach(it => {
      const widget = new VehicleWidget(this.context);
      widget.state = it;
      widget.draw();
    });
  }
}
