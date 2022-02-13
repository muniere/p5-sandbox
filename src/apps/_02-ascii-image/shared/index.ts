import { NumberRange, NumberRangeMap } from '../../../lib/stdlib';

export class Density {
  private readonly _characters: string;
  private readonly _rangeMap: NumberRangeMap;

  constructor(
    blanks: number = 1,
  ) {
    this._characters = 'Ñ@#W$98766543210?!abc;:+=-,._' + ' '.repeat(blanks);
    this._rangeMap = NumberRangeMap.of({
      domain: new NumberRange(0, 255),
      target: new NumberRange(this._characters.length, 0),
    });
  }

  static create(option?: { blanks?: number }): Density {
    return new Density(option?.blanks ?? 1);
  }

  get(index: number): string {
    return this._characters[index];
  }

  map(gray: number): string {
    const index = Math.floor(this._rangeMap.apply(gray)) - 1;
    return this._characters[index];
  }
}
