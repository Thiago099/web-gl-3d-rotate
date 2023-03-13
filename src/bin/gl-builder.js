class shaderBuilder
{
    constructor(canvas)
    {
        this.gl = canvas.getContext('webgl');
        this.program = this.gl.createProgram();
    }
    vertexShader(vertCode)
    {
        const vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(vertShader, vertCode);
        this.gl.compileShader(vertShader);
        this.gl.attachShader(this.program, vertShader);
        return this;
    }
    fragmentShader(fragCode)
    {
        const fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(fragShader, fragCode);
        this.gl.compileShader(fragShader);
        this.gl.attachShader(this.program, fragShader);
        return this;
    }
    build()
    {
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
        return [this.gl, new attributeBuilder(this.gl, this.program)];
    }
}
class attributeBuilder
{
    constructor(gl, program)
    {
        this.gl = gl;
        this.program = program;

        this.uniform_4_float = varProxy((name, value) => {
            var location = this.gl.getUniformLocation(this.program, name)
            this.gl.uniformMatrix4fv(location, false, value)
        })
        this.uniform_1_float = varProxy((name, value) => {
            var location = this.gl.getUniformLocation(this.program, name)
            this.gl.uniform1f(location, value)
        })

        this.attribute = varProxy((name, value) => {
            var vertex_buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(value), this.gl.STATIC_DRAW);
        
            var attribute = this.gl.getAttribLocation(this.program, name);
            this.gl.vertexAttribPointer(attribute, 3, this.gl.FLOAT, false,0,0);
            this.gl.enableVertexAttribArray(attribute);
        })
    }
    element(indices)
    {
        var index_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);
    }
    getPixel(x,y)
    {
        const data = new Uint8Array(4);
        this.gl.readPixels(
            x,            // x
            y,            // y
            1,                  // width
            1,                  // height
            this.gl.RGBA,             // format
            this.gl.UNSIGNED_BYTE,   // type
            data);              // typed array to hold result
        return data;
    }
    drawSolid(indices)
    {
        
        this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE)
        this.gl.drawElements(this.gl.TRIANGLES, indices.length, this.gl.UNSIGNED_SHORT, 0);
    }
}

function varProxy(callback)
{
    return new Proxy({}, {
        set: function(target, name, value) {
            callback(name,value)
            return true;
        }
    });
}

function glBuilder(canvas)
{

    return new shaderBuilder(canvas);
}


export {glBuilder}