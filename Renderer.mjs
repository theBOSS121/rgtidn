import * as Matrix from './Matrix.mjs';

export class Renderer {

    constructor(context) {
        this.context = context;
    }

    render(camera, model) {
        const { width, height } = this.context.canvas;
        this.context.clearRect(0, 0, width, height);
        this.context.fillStyle = "#000000";
        this.context.fillRect(0, 0, width, height);
        
        let vertices = []
        let zOfVertices = []
        
        let mat = Matrix.multiply(camera.inverseTransform, model.forwardTransform)
        let modelView = [...mat];
        let perspectiveViewport = Matrix.multiply(Matrix.perspective(camera.perspective), Matrix.identity())
        perspectiveViewport = Matrix.multiply(Matrix.viewport(0, 0, width, height), perspectiveViewport)
        
        let lightPositions = [];
        for(let i = 0; i < model.lights.length; i++) {
            let lp = Matrix.transform(camera.inverseTransform, [model.lights[i].position[0], model.lights[i].position[1], model.lights[i].position[2], 1]);
            lp.pop();
            lightPositions.push(lp);
        }
        // console.log(lightPosition)
        let finalColor = [];
        const gamma = 2.2;
        for(let i = 0; i < model.vertices.length / 3; i++) { // loop through every vertex
            // transformation from local to world coordinates, from world to view coordinates
            let vertex = Matrix.transform(modelView, [model.vertices[i * 3], model.vertices[i * 3 + 1], model.vertices[i * 3 + 2], 1])
            let normal = Matrix.transform(modelView, [model.normals[i * 3], model.normals[i * 3 + 1], model.normals[i * 3 + 2], 0])
            normal.pop(); // 4d -> 3d
            // vec3 surfacePosition = vPosition;        
            let N = Matrix.normalizeVec(normal);
            let E = Matrix.normalizeVec(Matrix.subVectors([0,0,0], vertex));
            for(let j = 0; j < lightPositions.length; j++) {
                let L = Matrix.normalizeVec(Matrix.subVectors(lightPositions[j], vertex));
                let R = Matrix.normalizeVec(Matrix.reflect(L, N));
                let lambert = Math.max(0.0, Matrix.dot(L, N)); //* uMaterial.diffuse;
                let phong = Math.pow(Math.max(0.0, Matrix.dot(E, R)), model.material.shininess); //* uMaterial.specular;
                let diffuseLight = Matrix.scalarProduct(lambert, model.lights[j].color);
                let specularLight = Matrix.scalarProduct(phong, model.lights[j].color);
                let albedo = [Math.pow(model.material.color[0], gamma), Math.pow(model.material.color[1], gamma), Math.pow(model.material.color[2], gamma)];
                if(j == 0) {
                    finalColor = Matrix.addVectors([diffuseLight[0] * albedo[0], diffuseLight[1] * albedo[1], diffuseLight[2] * albedo[2]], specularLight);
                }else {
                    finalColor = Matrix.addVectors(finalColor, Matrix.addVectors([diffuseLight[0] * albedo[0], diffuseLight[1] * albedo[1], diffuseLight[2] * albedo[2]], specularLight));
                }
            }
            finalColor = [Math.pow(finalColor[0], 1.0 / gamma), Math.pow(finalColor[1], 1.0 / gamma), Math.pow(finalColor[2], 1.0 / gamma)];
            
            // let finalColor = Matrix.addVectors([diffuseLight[0] * model.material.color[0], diffuseLight[1] * model.material.color[1], diffuseLight[2] * model.material.color[2]], specularLight);
            // console.log(finalColor)
            // console.log(normal)
            
            vertex = Matrix.transform(perspectiveViewport, vertex);// transformation to perspective, viewport transformation
            zOfVertices.push(vertex[2])
            for(let a = 0; a < vertex.length; a++) { 
                vertex[a] = vertex[a] / vertex[3] // homogene coordinate devision
            }
            let cStr = this.getColor(finalColor);
            vertex.push(cStr);
            vertex.push(finalColor);
            vertices.push(vertex)
        }
        // console.log(vertices)

        
        let triangles = []
        for(let i = 0; i < model.indices.length / 3; i++) { // drawing triangles
            let v0 = vertices[model.indices[i * 3]]
            let v1 = vertices[model.indices[i * 3 + 1]]
            let v2 = vertices[model.indices[i * 3 + 2]]
            if(zOfVertices[model.indices[i * 3]] < 1 || zOfVertices[model.indices[i * 3 + 1]] < 1 || zOfVertices[model.indices[i * 3] + 2] < 1) continue // one of the points is behind camera aka. near cliping plane
            let z0 = zOfVertices[model.indices[i * 3]]
            let z1 = zOfVertices[model.indices[i * 3 + 1]]
            let z2 = zOfVertices[model.indices[i * 3 + 2]]
            let colorStr = this.getAvgColor(v0[5], v1[5], v2[5]);
            triangles.push({ v: [[v0[0], v0[1]], [v1[0], v1[1]], [v2[0], v2[1]]], color: colorStr, z: (z0+z1+z2)/3});
            this.drawTriangleGradientLines([v0[0], v0[1], v0[4]], [v1[0], v1[1], v1[4]], [v2[0], v2[1], v2[4]])
        }
        triangles.sort((a,b) => b.z-a.z)
        for(let i = 0; i < triangles.length; i++) {
            this.drawTriangle(...triangles[i].v, triangles[i].color)
        }
    }

    getAvgColor(c0, c1, c2) {
        let avgRed = (c0[0] + c1[0] + c2[0]) / 3
        let avgGreen = (c0[1] + c1[1] + c2[1]) / 3
        let avgBlue = (c0[2] + c1[2] + c2[2]) / 3
        return this.getColor([avgRed, avgGreen, avgBlue]);
    }

    valueToHex(c) {
        var hex = c.toString(16);      
        if(c > 15) return hex
        else return "0" + hex
      }

    getColor(color) {
        let c = 0;
        for(let i = 0; i < 3; i++) {
            color[i] = color[i] / (color[i]+1)
            // if(color[i] < 0) color[i] = 0;
            // if(color[i] > 1) color[i] = 1;
            color[i] = color[i] * 255;
        }
        let r = Math.floor(color[0]);
        let g = Math.floor(color[1]);
        let b = Math.floor(color[2]);
        let rStr = this.valueToHex(r);
        let gStr = this.valueToHex(g);
        let bStr = this.valueToHex(b);        
        return "#"+rStr+gStr+bStr;
    }

    drawLine(v0, v1, gradient) {
        this.context.beginPath();
        this.context.moveTo(...v0);
        this.context.lineTo(...v1);
        this.context.strokeStyle = gradient;
        this.context.stroke();
    }

    drawTriangleGradientLines(v0, v1, v2) {
        var gradient = this.context.createLinearGradient(v0[0], v0[1], v1[0], v1[1]);
        gradient.addColorStop("0.0", v0[2]);
        gradient.addColorStop("1.0", v1[2]);
        this.drawLine(v0, v1, gradient);
        
        gradient = this.context.createLinearGradient(v1[0], v1[1], v2[0], v2[1]);
        gradient.addColorStop("0.0", v1[2]);
        gradient.addColorStop("1.0", v2[2]);
        this.drawLine(v1, v2, gradient);
        
        gradient = this.context.createLinearGradient(v2[0], v2[1], v0[0], v0[1]);
        gradient.addColorStop("0.0", v2[2]);
        gradient.addColorStop("1.0", v0[2]);
        this.drawLine(v2, v0, gradient);
    }
    
    drawTriangle(v0, v1, v2, color) {
        // var gradient = this.context.createLinearGradient(v0[0], v0[1], v1[0], v1[1]);
        // gradient.addColorStop("0" ,"blue");
        // gradient.addColorStop("1.0", "red");
        this.context.beginPath();
        this.context.moveTo(...v0);
        this.context.lineTo(...v1);
        this.context.lineTo(...v2);
        this.context.closePath();
        this.context.strokeStyle = color;
        this.context.stroke();
        this.context.fillStyle = color;
        this.context.fill();
    }
}