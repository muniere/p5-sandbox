import * as p5 from 'p5';
import { Color } from 'p5';
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

    this.context.push();

    this.context.fill(this.color(state));
    this.context.noStroke();

    this.context.translate(state.center.x, state.center.y);
    this.context.circle(0, 0, state.radius * 2);

    this.context.pop();
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

    this.context.push();

    this.context.translate(state.center.x, state.center.y);
    this.context.rotate(state.velocity.vector.heading() + Math.PI / 2);

    this.context.fill(this.color(state));
    this.context.noStroke();

    this.context.beginShape();
    this.context.vertex(0, -state.radius);
    this.context.vertex(-state.radius / 2, state.radius);
    this.context.vertex(state.radius / 2, state.radius);
    this.context.endShape(this.context.CLOSE);

    if (Flags.debug) {
      this.context.stroke(VehiclePalette.body);
      this.context.noFill();
      this.context.circle(0, 0, state.radius * 2);

      this.context.stroke(ItemPalette.medicine);
      this.context.noFill();
      this.context.line(0, 0, 0, -state.scoreGenome.reward * 100);
      this.context.circle(0, 0, state.senseGenome.reward * 2);

      this.context.stroke(ItemPalette.poison);
      this.context.noFill();
      this.context.line(0, 0, 0, -state.scoreGenome.penalty * 100);
      this.context.circle(0, 0, state.senseGenome.penalty * 2);
    }

    this.context.pop();
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
