export type ComplexCompat = {
  re: number,
  im: number,
}

export type ComplexMaybe = {
  re?: number,
  im?: number,
}

export class Complex {
  constructor(
    private _re: number,
    private _im: number,
  ) {
    // no-op
  }

  public static zero(): Complex {
    return new Complex(0, 0);
  }

  public static of(re: number, im: number): Complex {
    return new Complex(re, im);
  }

  public static re(re: number): Complex {
    return new Complex(re, 0);
  }

  public static im(im: number): Complex {
    return new Complex(0, im);
  }

  public static unit(t: number): Complex {
    return new Complex(
      Math.cos(t),
      Math.sin(t),
    );
  }

  public get re(): number {
    return this._re;
  }

  public get im(): number {
    return this._im;
  }

  public get norm(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  public plus({re, im}: ComplexMaybe): Complex {
    return new Complex(
      this.re + (re ?? 0),
      this.im + (im ?? 0),
    );
  }

  public plusAssign({re, im}: ComplexMaybe): void {
    this._re += (re ?? 0);
    this._im += (im ?? 0);
  }

  public minus({re, im}: ComplexMaybe): Complex {
    return new Complex(
      this.re - (re ?? 0),
      this.im - (im ?? 0),
    );
  }

  public minusAssign({re, im}: ComplexMaybe): void {
    this._re -= (re ?? 0);
    this._im -= (im ?? 0);
  }

  public times({re, im}: ComplexMaybe): Complex {
    return new Complex(
      this.re * (re ?? 1) - this.im * (im ?? 1),
      this.re * (im ?? 1) + this.im * (re ?? 1),
    );
  }

  public timesAssign({re, im}: ComplexMaybe): void {
    this._re = this.re * (re ?? 1) - this.im * (im ?? 1);
    this._im = this.re * (im ?? 1) + this.im * (re ?? 1);
  }

  public div({re, im}: ComplexMaybe): Complex {
    const base = (re ?? 0) * (re ?? 0) + (im ?? 0) * (im ?? 0);

    return new Complex(
      (this.re * (re ?? 1) + this.im * (im ?? 1)) / base,
      (this.im * (re ?? 1) - this.re * (im ?? 1)) / base,
    );
  }

  public divAssign({re, im}: ComplexMaybe): void {
    const base = (re ?? 0) * (re ?? 0) + (im ?? 0) * (im ?? 0);
    this._re = (this.re * (re ?? 1) + this.im * (im ?? 1)) / base;
    this._im = (this.im * (re ?? 1) - this.re * (im ?? 1)) / base;
  }

  public copy(): Complex {
    return new Complex(this._re, this._im);
  }
}
