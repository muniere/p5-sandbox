// https://www.youtube.com/watch?v=l8SiJ-RmeHU
import * as p5 from 'p5';

class Planet {
  private parent?: Planet;
  public children: Planet[] = [];

  constructor(
    public name: string,
    public radius: number,
    public distance: number,
    public angle: number,
    public angular: number,
  ) {
    // no-op
  }

  static create({name, radius, distance, angle, angular}: {
    name: string,
    radius: number,
    distance?: number,
    angle?: number,
    angular?: number,
  }): Planet {
    return new Planet(name, radius, distance || 0, angle || 0, angular || 0);
  }

  get parents(): Planet[] {
    if (!this.parent) {
      return [];
    }
    return this.parent.parents.concat([this.parent]);
  }

  get vector(): p5.Vector {
    const v = new p5.Vector();
    v.x = 1;
    v.y = 0;
    v.rotate(this.angle);
    v.mult(this.distance);
    return v;
  }

  draw(p: p5) {
    const v = this.vector;
    p.fill('#FFFFFF');
    p.ellipse(v.x, v.y, this.radius * 2, this.radius * 2);
  }

  revolution() {
    this.angle += this.angular;
  }

  spawn({name, radius, distance, angle, angular}: {
    name: string,
    radius: number,
    distance?: number,
    angle?: number,
    angular?: number,
  }): Planet {
    const child = Planet.create({name, radius, distance, angle, angular});
    child.parent = this;
    this.children.push(child);
    return child;
  }
}

const Params = Object.freeze({
  CANVAS_COLOR: '#000000',
});

function sketch(self: p5) {
  let sun: Planet;

  self.setup = function () {
    self.createCanvas(self.windowWidth, self.windowHeight);
    sun = Planet.create({
      name: 'sun',
      radius: 25,
    });

    sun.spawn({
      name: 'mercury',
      radius: sun.radius / 4,
      distance: sun.radius * 3,
      angle: self.random(0, Math.PI * 2),
      angular: Math.PI / 256,
    });

    sun.spawn({
      name: 'venus',
      radius: sun.radius / 3,
      distance: sun.radius * 4,
      angle: self.random(0, Math.PI * 2),
      angular: Math.PI / 512,
    });

    const earth = sun.spawn({
      name: 'earth',
      radius: sun.radius / 2,
      distance: sun.radius * 6,
      angle: self.random(0, Math.PI * 2),
      angular: Math.PI / 768,
    });

    earth.spawn({
      name: 'moon',
      radius: earth.radius / 4,
      distance: 25,
      angle: self.random(0, Math.PI * 2),
      angular: Math.PI / 64,
    });

    const mars = sun.spawn({
      name: 'mars',
      radius: sun.radius / 2,
      distance: sun.radius * 8,
      angle: self.random(0, Math.PI * 2),
      angular: Math.PI / 768,
    });

    mars.spawn({
      name: 'phobos',
      radius: mars.radius / 3,
      distance: 25,
      angle: self.random(0, Math.PI * 2),
      angular: Math.PI / 128,
    });

    mars.spawn({
      name: 'deimos',
      radius: mars.radius / 2,
      distance: 50,
      angle: self.random(0, Math.PI * 2),
      angular: Math.PI / 128,
    });
  };

  self.draw = function () {
    self.background(Params.CANVAS_COLOR);
    self.translate(self.width / 2, self.height / 2);

    const queue = [sun];
    const planets = [];

    while (queue.length > 0) {
      const planet = queue.shift()!;
      self.push();
      planet.parents.forEach(it => {
        self.rotate(it.angle);
        self.translate(it.distance, 0);
      });
      planet.draw(self);
      planets.push(planet);
      self.pop();
      queue.push(...planet.children);
    }

    planets.forEach(it => it.revolution());
  }
}

export { sketch };
