import * as Matrix from './Matrix.mjs';

export class Node {

    constructor() {
        this.translation = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
    }

    get forwardTransform() {
        let mat = Matrix.identity()
        mat = Matrix.multiply(Matrix.scale(...this.scale), mat)
        mat = Matrix.multiply(Matrix.rotationX(this.rotation[0]), mat)
        mat = Matrix.multiply(Matrix.rotationY(this.rotation[1]), mat) 
        mat = Matrix.multiply(Matrix.rotationZ(this.rotation[2]), mat) 
        mat = Matrix.multiply(Matrix.translation(...this.translation), mat) 
        return mat
    }

    get inverseTransform() {        
        let mat = Matrix.identity()
        mat = Matrix.multiply(Matrix.translation(-this.translation[0], -this.translation[1], -this.translation[2]), mat) 
        mat = Matrix.multiply(Matrix.rotationZ(-this.rotation[2]), mat) 
        mat = Matrix.multiply(Matrix.rotationY(-this.rotation[1]), mat) 
        mat = Matrix.multiply(Matrix.rotationX(-this.rotation[0]), mat)
        mat = Matrix.multiply(Matrix.scale(1/this.scale[0], 1/this.scale[1], 1/this.scale[2]), mat)
        return mat
    }

}
