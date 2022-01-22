import * as p5 from 'p5';

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  STROKE_COLOR: '#FFFFFF',
  LENGTH_RATE: 2 / 3,
  LENGTH_SEED: 100,
  LENGTH_LIMIT: 4,
  SLIDER_HEIGHT: 50,
});

class Painter {

  constructor(
    private delegate: p5,
    private angle: number = Math.PI / 4,
  ) {
    // no-op
  }

  branch(length: number) {
    this.delegate.line(0, 0, 0, -length);
    this.delegate.translate(0, -length);

    if (length < Params.LENGTH_LIMIT) {
      return;
    }

    this.delegate.push();
    this.delegate.rotate(this.angle);
    this.branch(length * Params.LENGTH_RATE);
    this.delegate.pop();

    this.delegate.push();
    this.delegate.rotate(-this.angle);
    this.branch(length * Params.LENGTH_RATE);
    this.delegate.pop();
  }
}

function sketch(self: p5) {
  let slider: p5.Element;

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight - Params.SLIDER_HEIGHT);
    slider = self.createSlider(0, Math.PI * 2, Math.PI / 4, 0.01);
    slider.size(self.windowWidth);
  }

  self.draw = function () {
    let painter = new Painter(self, Number(slider.value()));

    self.background(Params.CANVAS_COLOR);
    self.stroke(Params.STROKE_COLOR);
    self.translate(self.width / 2, self.height);

    painter.branch(Params.LENGTH_SEED);
  }
}

export { sketch };
