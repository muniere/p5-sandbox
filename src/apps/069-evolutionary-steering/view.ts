import p5, { Color } from 'p5';
import { Widget } from '../../lib/process';
import { ItemModel, ItemType } from './model.item';
import { VehicleModel } from './model.vehicle';
import { ApplicationModel } from './model.app';
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

export class ItemWidget extends Widget<ItemModel> {

  protected doDraw(model: ItemModel) {
    this.scope($ => {
      $.fill(this.color(model));
      $.noStroke();

      $.translate(model.center.x, model.center.y);
      $.circle(0, 0, model.radius * 2);
    });
  }

  private color(item: ItemModel): Color {
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

export class VehicleWidget extends Widget<VehicleModel> {

  protected doDraw(model: VehicleModel) {
    this.scope($ => {
      $.translate(model.center.x, model.center.y);
      $.rotate(model.velocity.vector.heading() + Math.PI / 2);

      $.fill(this.color(model));
      $.noStroke();

      $.beginShape();
      $.vertex(0, -model.radius);
      $.vertex(-model.radius / 2, model.radius);
      $.vertex(model.radius / 2, model.radius);
      $.endShape($.CLOSE);

      if (Flags.debug) {
        $.stroke(VehiclePalette.body);
        $.noFill();
        $.circle(0, 0, model.radius * 2);

        $.stroke(ItemPalette.medicine);
        $.noFill();
        $.line(0, 0, 0, -model.balance.reward * 100);
        $.circle(0, 0, model.sensor.rewardSight * 2);

        $.stroke(ItemPalette.poison);
        $.noFill();
        $.line(0, 0, 0, -model.balance.penalty * 100);
        $.circle(0, 0, model.sensor.penaltySight * 2);
      }
    });
  }

  private color(vehicle: VehicleModel): Color {
    const color = this.context.color(VehiclePalette.body);
    color.setAlpha(Math.floor(256 * vehicle.scoreFraction));
    return color;
  }
}

export class ApplicationWidget extends Widget<ApplicationModel> {
  private _item: ItemWidget;
  private _vehicle: VehicleWidget;

  constructor(context: p5) {
    super(context);
    this._item = new ItemWidget(context);
    this._vehicle = new VehicleWidget(context);
  }

  protected doDraw(model: ApplicationModel) {
    model.items.forEach(it => {
      this._item.model = it;
      this._item.draw();
    });

    model.vehicles.forEach(it => {
      this._vehicle.model = it;
      this._vehicle.draw();
    });
  }
}
