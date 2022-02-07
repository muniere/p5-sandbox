export class RandomColorFactory {
  constructor(
    public readonly red?: number,
    public readonly green?: number,
    public readonly blue?: number,
    public readonly alpha?: number,
  ) {
    // no-op
  }

  static create({red, green, blue, alpha}: {
    red?: number,
    green?: number,
    blue?: number,
    alpha?: number,
  }): RandomColorFactory {
    return new RandomColorFactory(red, green, blue, alpha);
  }

  create(): string {
    const components = [
      Math.floor(this.red ?? Math.random() * 255).toString(16),
      Math.floor(this.green ?? Math.random() * 255).toString(16),
      Math.floor(this.blue ?? Math.random() * 255).toString(16),
      Math.floor(this.alpha ?? Math.random() * 255).toString(16),
    ];
    return '#' + components.join('');
  }
}
