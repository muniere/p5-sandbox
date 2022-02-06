// https://www.youtube.com/watch?v=BV9ny785UNc
// see http://www.karlsims.com/rd.html for details
import * as p5 from 'p5';

// This process uses mutable operations with primitive structures,
// to reduce memory allocation costs for too many small objects.

const Params = Object.freeze({
  CANVAS_COLOR: '#333333',
  DIFFUSION_A: 1.0,
  DIFFUSION_B: 0.5,
  FEED_RATE: 0.055,
  KILL_RATE: 0.062,
  SEED_RADIUS: 4,
  GENERATION_INTERVAL: 10,
});

class Grid {

  constructor(
    public readonly width: number,
    public readonly height: number,
    private valuesA: number[],
    private valuesB: number[],
  ) {
    // no-op
  }

  static zero({width, height}: {
    width: number,
    height: number,
  }): Grid {
    const valuesA = [...Array(width * height)].map(_ => 0);
    const valuesB = [...Array(width * height)].map(_ => 0);
    return new Grid(width, height, valuesA, valuesB);
  }

  static fillA({width, height}: {
    width: number,
    height: number,
  }): Grid {
    const valuesA = [...Array(width * height)].map(_ => 1);
    const valuesB = [...Array(width * height)].map(_ => 0);
    return new Grid(width, height, valuesA, valuesB);
  }

  static fillB({width, height}: {
    width: number,
    height: number,
  }): Grid {
    const valuesA = [...Array(width * height)].map(_ => 0);
    const valuesB = [...Array(width * height)].map(_ => 1);
    return new Grid(width, height, valuesA, valuesB);
  }

  getValue(x: number, y: number): { a: number, b: number } {
    const index = y * this.width + x;
    return {
      a: this.valuesA[index],
      b: this.valuesB[index],
    };
  }

  setValue(x: number, y: number, {a, b}: { a: number, b: number }) {
    const index = y * this.width + x;
    this.valuesA[index] = a;
    this.valuesB[index] = b;
  }

  laplace(x: number, y: number): { a: number, b: number } {
    let {a, b} = this.getValue(x, y);
    {
      a *= -1;
      b *= -1;
    }
    {
      const v = this.getValue(x + 1, y);
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const v = this.getValue(x - 1, y);
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const v = this.getValue(x, y - 1);
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const v = this.getValue(x, y + 1);
      a += v.a * 0.2;
      b += v.b * 0.2;
    }
    {
      const v = this.getValue(x - 1, y - 1);
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const v = this.getValue(x - 1, y + 1);
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const v = this.getValue(x + 1, y - 1);
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    {
      const v = this.getValue(x + 1, y + 1);
      a += v.a * 0.05;
      b += v.b * 0.05;
    }
    return {a, b};
  }
}

class Diffusion {

  static next(grid: Grid, result: Grid) {
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const {a, b} = grid.getValue(x, y);

        if (x <= 0 || grid.width - 1 <= x) {
          result.setValue(x, y, {a, b});
          continue;
        }

        if (y <= 0 || grid.height - 1 <= y) {
          result.setValue(x, y, {a, b});
          continue;
        }

        const lap = grid.laplace(x, y);

        const newA = a
          + (Params.DIFFUSION_A * lap.a)
          - (a * b * b)
          + (Params.FEED_RATE * (1.0 - a));

        const newB = b
          + (Params.DIFFUSION_B * lap.b)
          + (a * b * b)
          - (Params.KILL_RATE + Params.FEED_RATE) * b

        result.setValue(x, y, {a: newA, b: newB});
      }
    }
  }
}

function sketch(self: p5) {
  let grid: Grid;
  let buf: Grid;

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight);
    self.pixelDensity(1);

    const dropLeft = Math.floor(self.width / 2) - Params.SEED_RADIUS;
    const dropRight = Math.floor(self.width / 2) + Params.SEED_RADIUS;
    const dropTop = Math.floor(self.height / 2) - Params.SEED_RADIUS;
    const dropBottom = Math.floor(self.height / 2) + Params.SEED_RADIUS;

    grid = Grid.fillA({
      width: self.width,
      height: self.height,
    });

    buf = Grid.zero({
      width: self.width,
      height: self.height,
    });

    for (let x = dropLeft; x < dropRight; x++) {
      for (let y = dropTop; y < dropBottom; y++) {
        grid.setValue(x, y, {a: 0, b: 1});
      }
    }
  };

  self.draw = function () {
    // draw
    self.loadPixels();

    for (let y = 0; y < self.height; y++) {
      for (let x = 0; x < self.width; x++) {
        const index = (x + y * self.width) * 4;
        const {a, b} = grid.getValue(x, y);
        const value = Math.floor((a - b) * 255);
        const color = Math.min(Math.max(value, 0), 255);
        self.pixels[index + 0] = color;
        self.pixels[index + 1] = color;
        self.pixels[index + 2] = color;
        self.pixels[index + 3] = 255;
      }
    }

    self.updatePixels();

    // update
    for (let i = 0; i < Params.GENERATION_INTERVAL; i++) {
      Diffusion.next(grid, buf);

      grid = buf;
    }
  };
}

export { sketch };
