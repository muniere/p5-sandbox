// @ts-ignore
import p5 from "p5";

import * as starField from './001-star-field';
import * as mengerSponge from './002-menger-sponge';
import * as dithering from './090-dithering';

new p5(mengerSponge.sketch);
