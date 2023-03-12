var indices = [
    0,
    1,
    2,
    0,
    2,
    3, // front
    4,
    5,
    6,
    4,
    6,
    7, // back
    8,
    9,
    10,
    8,
    10,
    11, // top
    12,
    13,
    14,
    12,
    14,
    15, // bottom
    16,
    17,
    18,
    16,
    18,
    19, // right
    20,
    21,
    22,
    20,
    22,
    23, // left
];


function BindVertexBuffer(gl,shaderprogram, variable)
{
    var vertices = [
        // Front face
        -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
    ];
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var _position = gl.getAttribLocation(shaderprogram, variable);
    gl.vertexAttribPointer(_position, 3, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(_position);
}


function BindNormalBuffer(gl,shaderprogram, variable)
{

    const normals = [
        // Front
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,

        // Back
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,

        // Top
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,

        // Bottom
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,

        // Right
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,

        // Left
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
      ];
    var normal_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

    var _normal = gl.getAttribLocation(shaderprogram, variable);
    gl.vertexAttribPointer(_normal, 3, gl.FLOAT, false,0,0);
    gl.enableVertexAttribArray(_normal);
}

function UseDraw(gl)
{
    var index_buffer = gl.createBuffer ();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE)

    return () =>
    {
        // line width
        gl.lineWidth(2.0);
        // gl.drawElements(gl.LINE_LOOP, indices.length, gl.UNSIGNED_SHORT, 0);
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
            1.0, 0.8, 0.8,
            1.0, 0.8, 0.8,
            1.0, 0.8, 0.8,
            1.0, 0.8, 0.8
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
function addNormals(gl,_VertexNormal) {
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  
    const vertexNormals = [
      // Front
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
  
      // Back
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
  
      // Top
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
  
      // Bottom
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
  
      // Right
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
  
      // Left
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,
    ];
  
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexNormals),
      gl.STATIC_DRAW
    );

    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(
      _VertexNormal,
      numComponents,
      type,
      normalize,
      stride,
      offset
    );
    gl.enableVertexAttribArray(_VertexNormal);
  
  }


export {BindVertexBuffer, BindSelectionQuadColor, UseBindQuadSelectionColorBuffer, UseDraw, BindNormalBuffer, addNormals}
