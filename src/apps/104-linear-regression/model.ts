import * as tf from '@tensorflow/tfjs';
import { Optimizer, Rank, Scalar, Tensor1D, Variable } from '@tensorflow/tfjs';
import { Point } from '../../lib/graphics2d';

export class RegressionModel {
  private readonly _slopeVariable: Variable<Rank.R0>;
  private readonly _offsetVariable: Variable<Rank.R0>;
  private readonly _optimizer: Optimizer;

  // NOTE: here caches the current values of each parameter separated by TensorFlow variables,
  //       to avoid synchronous access through TensorFlow variables for draw loop performance.
  private _slopeValue: number;
  private _offsetValue: number;

  constructor(nargs: {
    slope: number,
    offset: number,
    optimizer: Optimizer,
  }) {
    this._slopeValue = nargs.slope;
    this._slopeVariable = tf.variable(tf.scalar(nargs.slope));
    this._offsetValue = nargs.offset;
    this._offsetVariable = tf.variable(tf.scalar(nargs.offset));
    this._optimizer = nargs.optimizer;
  }

  map(x: number): Point {
    const y = x * this._slopeValue + this._offsetValue;
    return new Point({x, y});
  }

  predict(xs: number[]): Tensor1D {
    return tf.tensor1d(xs).mul(this._slopeVariable).add(this._offsetVariable);
  }

  loss(predicts: Tensor1D, labels: Tensor1D): Scalar {
    return predicts.sub(labels).square().mean();
  }

  optimize(points: Point[]) {
    if (!points.length) {
      return;
    }

    tf.tidy(() => {
      const labels = tf.tensor1d(points.map(it => it.y));

      this._optimizer.minimize(
        () => this.loss(this.predict(points.map(it => it.x)), labels)
      );
    });

    this._slopeVariable.data().then(slope => {
      this._slopeValue = slope[0];
    });
    this._offsetVariable.data().then(offset => {
      this._offsetValue = offset[0];
    });
  }
}

export class ApplicationModel {
  private readonly _regression: RegressionModel;
  private readonly _dataPoints: Point[];

  constructor(nargs: {
    learningRate: number,
  }) {
    this._regression = new RegressionModel({
      slope: 0,
      offset: 0,
      optimizer: tf.train.sgd(nargs.learningRate)
    });
    this._dataPoints = [];
  }

  get points(): Point[] {
    return [...this._dataPoints];
  }

  push(...points: Point[]) {
    this._dataPoints.push(...points);
  }

  map(x: number): Point {
    return this._regression.map(x);
  }

  update() {
    this._regression.optimize(this._dataPoints);
  }
}
