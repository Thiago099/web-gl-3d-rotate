class shaderBuilder
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', {antialias: true});
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
        return [this.gl, new attributeBuilder(this.gl, this.program, this.canvas)];
    }
}
class attributeBuilder
{
    constructor(gl, program, canvas)
    {
        this.gl = gl;
        this.program = program;
        this.canvas = canvas;

        this.attribute_matrix_4_mat_float = varProxy((name, value) => {
            var location = this.gl.getUniformLocation(this.program, name)
            this.gl.uniformMatrix4fv(location, false, value)
        })
        this.uniform_float = varProxy((name, value) => {
            var location = this.gl.getUniformLocation(this.program, name)
            this.gl.uniform1f(location, value)
        })
        this.uniform_4_float = varProxy((name, value) => {
            var location = this.gl.getUniformLocation(this.program, name)
            this.gl.uniform4f(location, value[0], value[1], value[2], value[3])
        })

        this.attribute_matrix_3_float = varProxy((name, value) => {
            var vertex_buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(value), this.gl.STATIC_DRAW);
        
            var attribute = this.gl.getAttribLocation(this.program, name);
            this.gl.vertexAttribPointer(attribute, 3, this.gl.FLOAT, false,0,0);
            this.gl.enableVertexAttribArray(attribute);
        })

        this.attribute_matrix_4_float = varProxy((name, value) => {
            var vertex_buffer = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertex_buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(value), this.gl.STATIC_DRAW);
        
            var attribute = this.gl.getAttribLocation(this.program, name);
            this.gl.vertexAttribPointer(attribute, 4, this.gl.FLOAT, false,0,0);
            this.gl.enableVertexAttribArray(attribute);
        })
    }
    set face(faces)
    {
        this.faces = faces;
    }

    buffer(callback)
    {
        const gl = this.gl;
        const canvas = this.canvas;
        // Create a framebuffer object
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // Create a texture object to attach to the framebuffer
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        callback();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return texture;

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
    drawSolid(faces)
    {
        if(!faces)
        {
            if(this.faces == undefined)
                throw "No faces defined";
            else
                faces = this.faces;
        }

        var index_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), this.gl.STATIC_DRAW);

        this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE)
        this.gl.drawElements(this.gl.TRIANGLES, faces.length, this.gl.UNSIGNED_SHORT, 0);
    }
    drawLines(faces)
    {
        if(!faces)
        {
            if(this.faces == undefined)
                throw "No faces defined";
            else
                faces = this.faces;
        }

        var index_buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(faces), this.gl.STATIC_DRAW);

        this.gl.getParameter(this.gl.ALIASED_LINE_WIDTH_RANGE)
        this.gl.drawElements(this.gl.LINES, faces.length, this.gl.UNSIGNED_SHORT, 0);
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

function webgl(canvas)
{

    return new shaderBuilder(canvas);
}


export {webgl}