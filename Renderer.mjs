import * as Matrix from './Matrix.mjs';

export class Renderer {

    constructor(context) {
        this.context = context;
    }

    render(camera, model) {
        const { width, height } = this.context.canvas;
        this.context.clearRect(0, 0, width, height);
        
        let vertices = []
        let zOfVertices = []
        
        let mat = Matrix.multiply(camera.inverseTransform, model.forwardTransform)
        mat = Matrix.multiply(Matrix.perspective(camera.perspective), mat)
        mat = Matrix.multiply(Matrix.viewport(0, 0, width, height), mat)
        
        for(let i = 0; i < model.vertices.length / 3; i++) { // loop through every vertex
            // transformation from local to world coordinates, from world to view coordinates, perspective, viewport transformation
            let vertex = Matrix.transform(mat, [model.vertices[i * 3], model.vertices[i * 3 + 1], model.vertices[i * 3 + 2], 1]) 
            zOfVertices.push(vertex[2])
            for(let a = 0; a < vertex.length; a++) { 
                vertex[a] = vertex[a] / vertex[3] // homogene coordinate devision
            }
            vertices.push(vertex)
        }
        
        for(let i = 0; i < model.indices.length / 3; i++) { // drawing triangles
            let v0 = vertices[model.indices[i * 3]]
            let v1 = vertices[model.indices[i * 3 + 1]]
            let v2 = vertices[model.indices[i * 3 + 2]]
            if(zOfVertices[model.indices[i * 3]] < 1 || zOfVertices[model.indices[i * 3 + 1]] < 1 || zOfVertices[model.indices[i * 3] + 2] < 1) continue // one of the points is behind camera aka. near cliping plane
            this.drawTriangle([v0[0], v0[1]], [v1[0], v1[1]], [v2[0], v2[1]])
        }
    }

    drawTriangle(v0, v1, v2) {
        this.context.beginPath();
        this.context.moveTo(...v0);
        this.context.lineTo(...v1);
        this.context.lineTo(...v2);
        this.context.closePath();
        this.context.stroke();
    }
}