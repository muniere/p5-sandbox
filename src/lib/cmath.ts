class Complex {
  constructor(
    public re: number,
    public im: number,
  ) {
    // no-op
  }

  static zero(): Complex {
    return new Complex(0, 0);
  }

  static of(re: number, im: number): Complex {
    return new Complex(re, im);
  }

  static re(re: number): Complex {
    return new Complex(re, 0);
  }

  static im(im: number): Complex {
    return new Complex(0, im);
  }

  static unit(t: number): Complex {
    return new Complex(
      Math.cos(t),
      Math.sin(t),
    );
  }

  get norm(): number {
    return Math.sqrt(this.re * this.re + this.im * this.im);
  }

  plus({re, im}: { re: number, im: number }): Complex {
    return new Complex(
      this.re + re,
      this.im + im,
    );
  }

  minus({re, im}: { re: number, im: number }): Complex {
    return new Complex(
      this.re - re,
      this.im - im,
    );
  }

  times({re, im}: { re: number, im: number }): Complex {
    return new Complex(
      this.re * re - this.im * im,
      this.re * im + this.im * re,
    );
  }

  div({re, im}: { re: number, im: number }): Complex {
    const base = re * re + im * im;
    return new Complex(
      (this.re * re + this.im * im) / base,
      (this.im * re - this.re * im) / base,
    );
  }
}

export { Complex };
