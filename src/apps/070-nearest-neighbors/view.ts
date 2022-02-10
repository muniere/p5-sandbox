import * as p5 from 'p5';
import { Element } from 'p5';
import { Neighbor, Rating, WorldState } from './model';

export class SelectWidget {
  public label?: string;
  public values: string[] = ['not seen', '1', '2', '3', '4', '5'];
  public onChanged: ((ev: any) => void) | undefined

  constructor(
    private readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: SelectWidget) => void): SelectWidget {
    mutate(this);
    return this;
  }

  render(): Element {
    const span = this.context.createSpan(this.label);
    const select = this.context.createSelect();

    this.values.forEach((score) => {
      select.child(
        this.context.createElement('option')
          .attribute('value', score == null ? '' : score?.toString())
          .html(score == null ? 'Not Seen' : score.toString())
      )
    });

    // @ts-ignore
    select.changed(this.onChanged);

    return this.context.createDiv()
      .child(span)
      .child(select);
  }
}

export class NeighborWidget {
  public title: string | undefined = 'Nearest Neighbors';
  public neighbors: Neighbor[] = [];

  constructor(
    private readonly context: p5,
  ) {
    // no-op
  }

  also(mutate: (widget: NeighborWidget) => void): NeighborWidget {
    mutate(this);
    return this;
  }

  render(): Element {
    const heading = this.context.createElement('h2').html(this.title)
    const list = this.context.createElement('ol');

    this.neighbors.forEach((neighbor) => {
      list.child(
        this.context.createElement('li').html(
          `${neighbor.evaluation.name} (similarity: ${neighbor.similarity})`
        )
      )
    });

    return this.context.createDiv()
      .child(heading)
      .child(list);
  }
}

export class PredictWidget {
  public title: string | undefined = 'Predictions';
  public value: Rating | undefined;

  constructor(
    private readonly context: p5,
  ) {
    // no-op
  }

  render(): Element {
    const value = this.value;

    const heading = this.context.createElement('h2').html(this.title)
    const list = this.context.createElement('ul');

    if (value && value.I != undefined) {
      list.child(this.context.createElement('li').html(`I: ${value.I}`))
    }
    if (value && value.II != undefined) {
      list.child(this.context.createElement('li').html(`II: ${value.II}`))
    }
    if (value && value.III != undefined) {
      list.child(this.context.createElement('li').html(`III: ${value.III}`))
    }
    if (value && value.IV != undefined) {
      list.child(this.context.createElement('li').html(`IV: ${value.IV}`))
    }
    if (value && value.V != undefined) {
      list.child(this.context.createElement('li').html(`V: ${value.V}`))
    }
    if (value && value.VI != undefined) {
      list.child(this.context.createElement('li').html(`VI: ${value.VI}`))
    }
    if (value && value.VII != undefined) {
      list.child(this.context.createElement('li').html(`VI: ${value.VII}`))
    }
    if (value && value.Rogue1 != undefined) {
      list.child(this.context.createElement('li').html(`Rogue1: ${value.Rogue1}`))
    }
    if (value && value.Holiday != undefined) {
      list.child(this.context.createElement('li').html(`Holiday: ${value.Holiday}`))
    }

    return this.context.createDiv()
      .child(heading)
      .child(list);
  }
}

export class WorldWidget {
  private state: WorldState;

  private neighborWidget: NeighborWidget;
  private neighborElement: Element | undefined;

  private predictWidget: PredictWidget;
  private predictSection: Element | undefined;

  constructor(
    context: p5,
    state: WorldState,
  ) {
    this.state = state;
    this.neighborWidget = new NeighborWidget(context);
    this.predictWidget = new PredictWidget(context);
  }

  render() {
    const answer = this.state.solve();

    this.neighborWidget.neighbors = answer.neighbors;
    this.neighborElement?.remove();
    this.neighborElement = this.neighborWidget.render();

    this.predictWidget.value = answer.prediction;
    this.predictSection?.remove();
    this.predictSection = this.predictWidget.render();
  }
}
