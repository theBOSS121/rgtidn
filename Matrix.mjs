export function subVectors(a, b) {
    let c = [];
    for(let i = 0; i < a.length; i++) {
        c.push(a[i] - b[i]);
    }
    return c;
}
export function addVectors(a, b) {
    let c = [];
    for(let i = 0; i < a.length; i++) {
        c.push(a[i] + b[i]);
    }
    return c;
}
export function scalarProduct(a, b) {
    let c = [];
    for(let i = 0; i < b.length; i++) {
        c.push(a * b[i]);
    }
    return c;
}

export function normalizeVec(a) {
    let len = 0;
    let v = [];
    for(let i = 0; i < 3; i++) {
        len += a[i] * a[i];
    }
    len = Math.sqrt(len);

    for(let i = 0; i < 3; i++) {
        v.push(a[i]/len);
    }
    return v;
}

export function reflect(a, n) {
    let adotn = dot(a, n);
    let changedN = [];
    for(let i = 0; i < n.length; i++) {
        changedN.push(n[i] * adotn);
    }
    let diff = subVectors(changedN, a)
    let reflected = addVectors(a, addVectors(diff, diff));
    return reflected;
}

export function dot(a, b) {
    let dot = 0;
    for(let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
    }
    return dot;
}

export function multiply(a, b) {
    let mat = []
    let number
    for(let y = 0; y < 4; y++) {
        for(let x = 0; x < 4; x++) {
            number = 0
            for(let i = 0; i < 4; i++) {
                number += a[i + y * 4] * b[x + i * 4]
            }
            mat.push(number)
        }
    }
    return mat
}

export function transform(a, v) {
    let vector = []
    let number;
    for(let y = 0; y < v.length; y++) {
        number = 0;
        for(let x = 0; x < v.length; x++) {
            number += v[x] * a[x + y * v.length]
        }
        vector.push(number)
    }
    return vector
}

export function identity() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}

export function translation(dx, dy, dz) {
    return [
        1, 0, 0, dx,
        0, 1, 0, dy,
        0, 0, 1, dz,
        0, 0, 0, 1,
    ]
}

export function scale(sx, sy, sz) {
    return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0,  1,
    ]
}

export function rotationX(angle) {
    return [
        1,  0,                  0,                  0,
        0,  Math.cos(angle),    -Math.sin(angle),   0,
        0,  Math.sin(angle),    Math.cos(angle),    0,
        0,  0,                  0,                  1,
    ]
}

export function rotationY(angle) {
    return [
        Math.cos(angle),    0, Math.sin(angle), 0,
        0,                  1, 0,               0,
        -Math.sin(angle),   0, Math.cos(angle), 0,
        0,                  0, 0,               1,
    ]
}

export function rotationZ(angle) {
    return [
        Math.cos(angle),    -Math.sin(angle),   0, 0,
        Math.sin(angle),    Math.cos(angle),    0, 0,
        0,                  0,                  1, 0,
        0,                  0,                  0, 1,
    ]
}

export function perspective(d) {
    return [
        1, 0, 0,   0,
        0, 1, 0,   0,
        0, 0, 1,   0,
        0, 0, 1/d, 0,
    ]
}

export function viewport(x, y, w, h) {
    return [
        w/2, 0, 0, x + w/2,
        0, -h/2, 0, y + h/2,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]
}
