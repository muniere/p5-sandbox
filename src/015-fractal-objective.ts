import * as p5 from 'p5';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  STROKE_COLOR: '#FFFFFF',
  LENGTH_RATE: 2 / 3,
  LENGTH_SEED: 500,
  SLIDER_HEIGHT: 50,
});

class Node {
  private _children: Node[];

  constructor(
    public begin: p5.Vector,
    public end: p5.Vector,
  ) {
    this._children = [];
  }

  get length(): number {
    return p5.Vector.dist(this.begin, this.end);
  }

  get children(): Node[] {
    return [...this._children];
  }

  static create({begin, end}: {
    begin: p5.Vector,
    end: p5.Vector,
  }): Node {
    return new Node(begin, end);
  }

  draw(p: p5) {
    p.stroke(Params.STROKE_COLOR);
    p.line(
      this.begin.x, this.begin.y,
      this.end.x, this.end.y,
    );
  }

  branch(angle: number) {
    if (this._children.length > 0) {
      throw new Error('branch can call only once')
    }

    const dir = this.end.copy().sub(this.begin).mult(Params.LENGTH_RATE);

    const dir1 = dir.copy().rotate(-Math.abs(angle));
    const child1 = Node.create({
      begin: this.end.copy(),
      end: this.end.copy().add(dir1),
    });

    const dir2 = dir.copy().rotate(Math.abs(angle));
    const child2 = Node.create({
      begin: this.end.copy(),
      end: this.end.copy().add(dir2),
    });

    this._children = [child1, child2];
  }

  edges(): Node[] {
    if (this._children.length == 0) {
      return [this];
    }
    return this.children.reduce(
      (acc, child) => acc.concat(child.edges()), [] as Node[]
    );
  }
}

function sketch(self: p5) {
  let slider: p5.Element;
  let root: Node;

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight - Params.SLIDER_HEIGHT);

    root = Node.create({
      begin: self.createVector(self.width / 2, self.height),
      end: self.createVector(self.width / 2, self.height - Params.LENGTH_SEED),
    });

    slider = self.createSlider(0, Math.PI * 2, Math.PI / 4, 0.01);
    slider.size(self.windowWidth);
  }

  self.draw = function () {
    let branches: Node[] = [root];

    self.background(Params.CANVAS_COLOR);

    while (branches.length > 0) {
      const node = branches.pop()!;

      node.draw(self);

      branches.push(...node.children);
    }
  }

  self.mouseClicked = function() {
    const angle = Number(slider.value());
    root.edges().forEach(it => it.branch(angle));
  }
}

export { sketch };
