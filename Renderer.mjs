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
        

        const perspectiveMat = Matrix.perspective(camera.perspective)
        const viewPortMat = Matrix.viewport(0, 0, width, height)
        // loop through every vertex
        for(let i = 0; i < model.vertices.length / 3; i++) {
            let x = model.vertices[i * 3]
            let y = model.vertices[i * 3 + 1]
            let z = model.vertices[i * 3 + 2]
            // transformation from local to world coordinates
            let vertex = Matrix.transform(model.forwardTransform, [x, y, z, 1])
            // transformation from world to view coordinates
            vertex = Matrix.transform(camera.inverseTransform, vertex)
            zOfVertices.push(vertex[2])
            // perspective
            vertex = Matrix.transform(perspectiveMat, vertex)
            // homogene coordinate devision
            for(let a = 0; a < vertex.length; a++) { 
                vertex[a] = vertex[a] / vertex[3]
            }
            // viewport transformation
            vertex = Matrix.transform(viewPortMat, vertex)
            vertices.push(vertex)
        }
        // drawing triangles
        for(let i = 0; i < model.indices.length / 3; i++) {
            let v0 = vertices[model.indices[i * 3]]
            let v1 = vertices[model.indices[i * 3 + 1]]
            let v2 = vertices[model.indices[i * 3 + 2]]
            // first example is looking from behind
            // if(zOfVertices[model.indices[i * 3]] > -2 || zOfVertices[model.indices[i * 3 + 1]] > -2 || zOfVertices[model.indices[i * 3] + 2] > -2) continue // one of the points is behind camera aka. near cliping plane
            if(zOfVertices[model.indices[i * 3]] < 2 || zOfVertices[model.indices[i * 3 + 1]] < 2 || zOfVertices[model.indices[i * 3] + 2] < 2) continue // one of the points is behind camera aka. near cliping plane
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