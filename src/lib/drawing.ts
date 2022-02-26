export interface ColorValues {
  red?: number
  green?: number
  blue?: number
  alpha?: number
}

export namespace Colors {
  export function sample(values?: ColorValues): string {
    const components = [
      Math.floor(values?.red ?? Math.random() * 255).toString(16),
      Math.floor(values?.green ?? Math.random() * 255).toString(16),
      Math.floor(values?.blue ?? Math.random() * 255).toString(16),
      Math.floor(values?.alpha ?? Math.random() * 255).toString(16),
    ];
    return '#' + components.join('');
  }
}

export class Pixel {
  private readonly _values: number[]

  constructor(values: number[]) {
    if (values.length != 4) {
      throw new Error('invalid values format');
    }
    this._values = values;
  }

  quantize(factor: number): Pixel {
    return new Pixel([
      Math.round(factor * this.r / 255) * 255 / factor,
      Math.round(factor * this.g / 255) * 255 / factor,
      Math.round(factor * this.b / 255) * 255 / factor,
      this.a,
    ]);
  }

  plus(other: Pixel): Pixel {
    return new Pixel([
      this._values[0] + other._values[0],
      this._values[1] + other._values[1],
      this._values[2] + other._values[2],
      this._values[3] + other._values[3],
    ]);
  }

  minus(other: Pixel): Pixel {
    return new Pixel([
      this._values[0] - other._values[0],
      this._values[1] - other._values[1],
      this._values[2] - other._values[2],
      this._values[3] - other._values[3],
    ]);
  }

  multiply(factor: number): Pixel {
    return new Pixel([
      this._values[0] * factor,
      this._values[1] * factor,
      this._values[2] * factor,
      this._values[3] * factor,
    ]);
  }

  get values(): number[] {
    return [...this._values];
  }

  get r(): number {
    return this._values[0];
  }

  get g(): number {
    return this._values[1];
  }

  get b(): number {
    return this._values[2];
  }

  get a(): number {
    return this._values[3];
  }
}
