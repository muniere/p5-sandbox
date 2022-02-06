// https://www.youtube.com/watch?v=N8Fabn1om2k
import * as p5 from 'p5';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  DATA_SOURCE: 'data.json',
  NEIGHBOR_COUNT: 5,
});

// =====
// Model
// =====
class Record {
  constructor(
    public readonly timestamp: string,
    public readonly name: string,
    public readonly IV?: number,
    public readonly V?: number,
    public readonly VI?: number,
    public readonly I?: number,
    public readonly II?: number,
    public readonly III?: number,
    public readonly VII?: number,
    public readonly Rogue1?: number,
    public readonly Holiday?: number,
  ) {
    // no-op
  }

  static create({timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday}: {
    timestamp: string,
    name: string,
    IV?: number,
    V?: number,
    VI?: number,
    I?: number,
    II?: number,
    III?: number,
    VII?: number,
    Rogue1?: number,
    Holiday?: number,
  }): Record {
    return new Record(timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday);
  }

  static decode({timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday}: {
    timestamp: string,
    name: string,
    IV?: number,
    V?: number,
    VI?: number,
    I?: number,
    II?: number,
    III?: number,
    VII?: number,
    Rogue1?: number,
    Holiday?: number,
  }): Record {
    return new Record(timestamp, name, IV, V, VI, I, II, III, VII, Rogue1, Holiday);
  }

  get key(): string {
    return this.name;
  }

  static similarity(obj1: Record, obj2: Record): number {
    return 1 / (this.distance(obj1, obj2) + 1)
  }

  static distance(obj1: Record, obj2: Record): number {
    const diffs = [] as number[];

    if (obj1.IV && obj2.IV) {
      diffs.push(obj1.IV - obj2.IV);
    }
    if (obj1.V && obj2.V) {
      diffs.push(obj1.V - obj2.V);
    }
    if (obj1.VI && obj2.VI) {
      diffs.push(obj1.VI - obj2.VI);
    }
    if (obj1.I && obj2.I) {
      diffs.push(obj1.I - obj2.I);
    }
    if (obj1.II && obj2.II) {
      diffs.push(obj1.II - obj2.II);
    }
    if (obj1.III && obj2.III) {
      diffs.push(obj1.III - obj2.III);
    }
    if (obj1.VII && obj2.VII) {
      diffs.push(obj1.VII - obj2.VII);
    }
    if (obj1.Rogue1 && obj2.Rogue1) {
      diffs.push(obj1.Rogue1 - obj2.Rogue1);
    }
    if (obj1.Holiday && obj2.Holiday) {
      diffs.push(obj1.Holiday - obj2.Holiday);
    }

    return Math.sqrt(
      diffs.map(it => it * it).reduce((acc, it) => acc + it, 0)
    );
  }
}

class Rating {
  constructor(
    public readonly IV?: number,
    public readonly V?: number,
    public readonly VI?: number,
    public readonly I?: number,
    public readonly II?: number,
    public readonly III?: number,
    public readonly VII?: number,
    public readonly Rogue1?: number,
    public readonly Holiday?: number,
  ) {
    // no-op
  }

  static create({IV, V, VI, I, II, III, VII, Rogue1, Holiday}: {
    IV?: number,
    V?: number,
    VI?: number,
    I?: number,
    II?: number,
    III?: number,
    VII?: number,
    Rogue1?: number,
    Holiday?: number,
  }): Rating {
    return new Rating(IV, V, VI, I, II, III, VII, Rogue1, Holiday);
  }
}

class Neighbor {
  constructor(
    public readonly record: Record,
    public readonly similarity: number,
  ) {
    // no-op
  }

  static create({record, similarity}: {
    record: Record,
    similarity: number,
  }): Neighbor {
    return new Neighbor(record, similarity);
  }
}

class Formula {

  static predict(neighbors: Neighbor[]): Rating {
    const plus = (a: number, b: number) => a + b;
    const similarity = this.sum(neighbors.map(it => it.similarity));

    return Rating.create({
      IV: neighbors.filter(it => it.record.IV).map(it => it.record.IV! * it.similarity).reduce(plus) / similarity,
      V: neighbors.filter(it => it.record.V).map(it => it.record.V! * it.similarity).reduce(plus) / similarity,
      VI: neighbors.filter(it => it.record.VI).map(it => it.record.VI! * it.similarity).reduce(plus) / similarity,
      I: neighbors.filter(it => it.record.I).map(it => it.record.I! * it.similarity).reduce(plus) / similarity,
      II: neighbors.filter(it => it.record.II).map(it => it.record.II! * it.similarity).reduce(plus) / similarity,
      III: neighbors.filter(it => it.record.III).map(it => it.record.III! * it.similarity).reduce(plus) / similarity,
      VII: neighbors.filter(it => it.record.VII).map(it => it.record.VII! * it.similarity).reduce(plus) / similarity,
      Rogue1: neighbors.filter(it => it.record.Rogue1).map(it => it.record.Rogue1! * it.similarity).reduce(plus) / similarity,
      Holiday: neighbors.filter(it => it.record.Holiday).map(it => it.record.Holiday! * it.similarity).reduce(plus) / similarity,
    });
  }

  static sum(values: number[]): number {
    return values.reduce((acc, num) => acc + num, 0);
  }
}

class DataSet {
  private _table: Map<string, Record>;

  constructor(
    public readonly records: Record[],
  ) {
    this._table = records.reduce(
      (acc, record) => acc.set(record.name, record), new Map<string, Record>(),
    );
  }

  findNearestNeighbors(record: Record, {count}: { count: number }): Neighbor[] {
    return this.records
      .map((it) => it.key == record.key
        ? Neighbor.create({record: it, similarity: -1})
        : Neighbor.create({record: it, similarity: Record.similarity(record, it)}),
      )
      .filter(it => it.similarity >= 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, count);
  }
}

// =====
// Database
// =====
type RecordSchema = {
  timestamp: string
  name: string
  IV: number
  V: number
  VI: number
  I: number
  II: number
  III: number
  VII: number
  Rogue1: number
  Holiday?: number
}

type DataSetSchema = {
  users: RecordSchema[]
}

// =====
// View
// =====
class ViewHelper {
  constructor(
    private delegate: p5,
  ) {
    // no-op
  }

  scoreSection(label: string, onChanged: (ev: any) => void): p5.Element {
    const span = this.delegate.createSpan(label);
    const select = this.delegate.createSelect();

    [null, 1, 2, 3, 4, 5].forEach((score) => {
      select.child(
        this.delegate.createElement('option')
          .attribute('value', score == null ? '' : score?.toString())
          .html(score == null ? 'Not Seen' : score.toString())
      )
    });

    if (onChanged) {
      // @ts-ignore
      select.changed(onChanged);
    }

    return this.delegate.createDiv()
      .child(span)
      .child(select);
  }

  neighborSection(neighbors: Neighbor[]): p5.Element {
    const heading = this.delegate.createElement('h2').html('Nearest Neighbors')
    const list = this.delegate.createElement('ol');

    neighbors.forEach((neighbor) => {
      list.child(
        this.delegate.createElement('li').html(
          `${neighbor.record.name} (similarity: ${neighbor.similarity})`
        )
      )
    });

    return this.delegate.createDiv()
      .child(heading)
      .child(list);
  }

  predictionSection(record: Record, rating: Rating): p5.Element {
    const heading = this.delegate.createElement('h2').html('Predictions')
    const list = this.delegate.createElement('ul');

    if (!record.I) {
      list.child(this.delegate.createElement('li').html(`I: ${rating.I}`))
    }
    if (!record.II) {
      list.child(this.delegate.createElement('li').html(`II: ${rating.II}`))
    }
    if (!record.III) {
      list.child(this.delegate.createElement('li').html(`III: ${rating.III}`))
    }
    if (!record.IV) {
      list.child(this.delegate.createElement('li').html(`IV: ${rating.IV}`))
    }
    if (!record.V) {
      list.child(this.delegate.createElement('li').html(`V: ${rating.V}`))
    }
    if (!record.VI) {
      list.child(this.delegate.createElement('li').html(`VI: ${rating.VI}`))
    }
    if (!record.VII) {
      list.child(this.delegate.createElement('li').html(`VI: ${rating.VII}`))
    }
    if (!record.Rogue1) {
      list.child(this.delegate.createElement('li').html(`Rogue1: ${rating.VII}`))
    }
    if (!record.Holiday) {
      list.child(this.delegate.createElement('li').html(`Holiday: ${rating.VII}`))
    }

    return this.delegate.createDiv()
      .child(heading)
      .child(list);
  }
}

class ViewState {
  constructor(
    public IV?: number,
    public V?: number,
    public VI?: number,
    public I?: number,
    public II?: number,
    public III?: number,
    public VII?: number,
    public Rogue1?: number,
    public Holiday?: number,
  ) {
    // no-op
  }

  createRecord(): Record {
    return Record.create({
      timestamp: new Date().toISOString(),
      name: 'anonymous',
      IV: this.IV,
      V: this.V,
      VI: this.VI,
      I: this.I,
      II: this.II,
      III: this.III,
      VII: this.VII,
      Rogue1: this.Rogue1,
      Holiday: this.Holiday,
    });
  }
}

// =====
// Main
// =====
function sketch(self: p5) {
  let dataSet: DataSet;

  self.preload = function () {
    self.loadJSON(Params.DATA_SOURCE, (rawValue: DataSetSchema) => {
      dataSet = new DataSet(rawValue.users.map(it => Record.decode(it)));
    })
  }

  self.setup = function () {
    self.noCanvas();

    let neighborSection: p5.Element | undefined;
    let predictSection: p5.Element | undefined;

    const viewState = new ViewState();
    const viewHelper = new ViewHelper(self);

    viewHelper.scoreSection('I', (ev) => {
      viewState.I = parseInt(ev.target.value);
    });
    viewHelper.scoreSection('II', (ev) => {
      viewState.II = parseInt(ev.target.value);
    });
    viewHelper.scoreSection('III', (ev) => {
      viewState.III = parseInt(ev.target.value);
    });
    viewHelper.scoreSection('IV', (ev) => {
      viewState.IV = parseInt(ev.target.value);
    });
    viewHelper.scoreSection('V', (ev) => {
      viewState.V = parseInt(ev.target.value);
    });
    viewHelper.scoreSection('VI', (ev) => {
      viewState.VI = parseInt(ev.target.value);
    });
    viewHelper.scoreSection('VII', (ev) => {
      viewState.VII = parseInt(ev.target.value);
    });
    viewHelper.scoreSection('Rogue1', (ev) => {
      viewState.Rogue1 = parseInt(ev.target.value);
    });
    viewHelper.scoreSection('Holiday', (ev) => {
      viewState.Holiday = parseInt(ev.target.value);
    });

    self.createButton('submit').mousePressed(() => {
      const record = viewState.createRecord();
      const neighbors = dataSet.findNearestNeighbors(record, {count: Params.NEIGHBOR_COUNT});
      const prediction = Formula.predict(neighbors);

      neighborSection?.remove();
      neighborSection = viewHelper.neighborSection(neighbors);

      predictSection?.remove();
      predictSection = viewHelper.predictionSection(record, prediction);
    });
  }
}

export { sketch };
