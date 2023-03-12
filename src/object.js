var indices = [
    0,1,2, 0,2,3, 4,5,6, 4,6,7,
    8,9,10, 8,10,11, 12,13,14, 12,14,15,
    16,17,18, 16,18,19, 20,21,22, 20,22,23 
];
var normals = [
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
    0,0,1, 0,0,1, 0,0,1, 0,0,1,
    -1,0,0, -1,0,0, -1,0,0, -1,0,0,
    1,0,0, 1,0,0, 1,0,0, 1,0,0,
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
    0,1,0, 0,1,0, 0,1,0, 0,1,0,
];

function BindVertexBuffer(gl,shaderprogram, variable)
{
    var vertices = [
        -1,-1,-1, 1,-1,-1, 1, 1,-1, -1, 1,-1,
        -1,-1, 1, 1,-1, 1, 1, 1, 1, -1, 1, 1,
        -1,-1,-1, -1, 1,-1, -1, 1, 1, -1,-1, 1,
        1,-1,-1, 1, 1,-1, 1, 1, 1, 1,-1, 1,
        -1,-1,-1, -1,-1, 1, 1,-1, 1, 1,-1,-1,
        -1, 1,-1, -1, 1, 1, 1, 1, 1, 1, 1,-1, 
    ];
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var _position = gl.getAttribLocation(shaderprogram, variable);
    gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(_position);
}


function UseDraw(gl)
{
    var index_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return () =>
    {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
}


function UseBindQuadSelectionColorBuffer(gl,shaderprogram)
{
    var colors = [];
    const faces = 6
    
    for(var i = 0; i < faces; i++)
    {
        var id = id_2_color(i+1);
        for(var j = 0; j < 4; j++)
        {
            colors.push(...id);
        }
    }

    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    return () => {
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        var _color = gl.getAttribLocation(shaderprogram, "color");

        gl.vertexAttribPointer(_color, 3, gl.FLOAT, false,0,0) ;
        gl.enableVertexAttribArray(_color);
    }
}

function BindSelectionQuadColor(gl,shaderprogram,data)
{
    var displayColors = new Float32Array(6*12); // assuming 24 faces
    displayColors.fill(1); // set all faces to white

    const faceIndex = color_2_id(data)

    if (faceIndex >= 0) {
        // set selected face to red
        displayColors.set([
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0
        ], faceIndex*12);
    }

    var display_color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, display_color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(displayColors), gl.STATIC_DRAW);


    gl.bindBuffer(gl.ARRAY_BUFFER, display_color_buffer);
    var _color = gl.getAttribLocation(shaderprogram, "color");
    gl.vertexAttribPointer(_color, 3, gl.FLOAT, false,0,0) ;
    gl.enableVertexAttribArray(_color);

    gl.clearColor(0.5, 0.5, 0.5, 0.9);
}

function id_2_color(id)
{
    return [
        ((id >>  0) & 0xFF) / 0xFF,
        ((id >>  8) & 0xFF) / 0xFF,
        ((id >> 16) & 0xFF) / 0xFF,
    ]
}
function color_2_id(color)
{
    return (
        color[0] +
        (color[1] <<  8 )+
        (color[2] << 16)
    ) - 1
}



export {BindVertexBuffer, BindSelectionQuadColor, UseBindQuadSelectionColorBuffer, UseDraw}
