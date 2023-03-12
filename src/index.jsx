
import './style.css'
import {BindVertexBuffer, BindSelectionQuadColor, UseBindQuadSelectionColorBuffer,UseDraw,addNormals} from './object.js'
import {mat4} from 'gl-matrix'
const canvas = ref()


const main = 
<div class="main">
    <canvas ref={canvas}></canvas>
    <div class="info">
        <p>
            Click and drag to rotate
        </p>
        <p>
            Mouse wheel to zoom
        </p>
    </div>
</div>


canvas.width = 500
canvas.height = 500

main.$parent(document.body)


/*============= Creating a canvas ======================*/
var gl = canvas.__element.getContext('webgl');

/*========== Defining and storing the geometry ==========*/




// Create and store data into color buffer


// Create and store data into index buffer


// // Create and store data into index buffer
// var normal_buffer = gl.createBuffer ();
// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, normal_buffer);
// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(normals), gl.STATIC_DRAW);


/*=================== SHADERS =================== */

var vertCode = `
attribute vec3 position;
attribute vec3 aVertexNormal;

uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
uniform mat4 uNormalMatrix;
varying highp vec3 vLighting;

attribute vec3 color;
varying vec3 vColor;
void main(void) { 
    gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
    vColor = color;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
}
`;

var fragCode = `
precision mediump float;
varying vec3 vColor;
varying highp vec3 vLighting;
void main(void) {
    gl_FragColor = vec4(vColor * vLighting, 1.);
}
`;

var vertShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertShader, vertCode);
gl.compileShader(vertShader);

var fragShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragShader, fragCode);
gl.compileShader(fragShader);

var shaderprogram = gl.createProgram();
gl.attachShader(shaderprogram, vertShader);
gl.attachShader(shaderprogram, fragShader);
gl.linkProgram(shaderprogram);

/*======== Associating attributes to vertex shader =====*/
var _Pmatrix = gl.getUniformLocation(shaderprogram, "Pmatrix");
var _Vmatrix = gl.getUniformLocation(shaderprogram, "Vmatrix");
var _Mmatrix = gl.getUniformLocation(shaderprogram, "Mmatrix");
var _normal_matrix = gl.getUniformLocation(shaderprogram, "uNormalMatrix");
var _VertexNormal = gl.getAttribLocation(shaderprogram, "aVertexNormal")



BindVertexBuffer(gl,shaderprogram, "position")

// gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
// var _normal = gl.getAttribLocation(shaderprogram, "normal");
// gl.vertexAttribPointer(_normal, 3, gl.FLOAT, false,0,0);
// gl.enableVertexAttribArray(_normal);


gl.useProgram(shaderprogram);

/*==================== MATRIX ====================== */

function get_projection(angle, a, zMin, zMax) {
var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
return [
    0.5/ang, 0 , 0, 0,
    0, 0.5*a/ang, 0, 0,
    0, 0, -(zMax+zMin)/(zMax-zMin), -1,
    0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
    ];
}

var proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);
var mo_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];
var view_matrix = [ 1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1 ];

const normalMatrix = mat4.create();
mat4.invert(normalMatrix, view_matrix);
mat4.transpose(normalMatrix, normalMatrix);

view_matrix[14] = view_matrix[14]-6;

/*================= Mouse events ======================*/

var AMORTIZATION = 0.95;
var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;

var mouseDown = function(e) {
drag = true;
old_x = e.pageX, old_y = e.pageY;
e.preventDefault();
return false;
};

var mouseUp = function(e){
drag = false;
};
let mouseX , mouseY;
var mouseMove = function(e) {
    const rect = canvas.__element.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
if (!drag) return false;
dX = (e.pageX-old_x)*2*Math.PI/canvas.width,
dY = (e.pageY-old_y)*2*Math.PI/canvas.height;
THETA+= dX;
PHI+=dY;
old_x = e.pageX, old_y = e.pageY;
e.preventDefault();
};

canvas.$on("mousedown", mouseDown);
canvas.$on("mouseup", mouseUp);
canvas.$on("mouseout", mouseUp);
canvas.$on("mousemove", mouseMove);

//scroll
var mouseWheel = function(e) {
    e.preventDefault();
    var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
    if (delta) zoom(delta * 0.1);
    return e.preventDefault() && false;
};
function zoom(z) {
    view_matrix[14] += z;
}
canvas.$on("wheel", mouseWheel);

/*=========================rotation================*/

function rotateX(m, angle) {
var c = Math.cos(angle);
var s = Math.sin(angle);
var mv1 = m[1], mv5 = m[5], mv9 = m[9];

m[1] = m[1]*c-m[2]*s;
m[5] = m[5]*c-m[6]*s;
m[9] = m[9]*c-m[10]*s;

m[2] = m[2]*c+mv1*s;
m[6] = m[6]*c+mv5*s;
m[10] = m[10]*c+mv9*s;
}

function rotateY(m, angle) {
var c = Math.cos(angle);
var s = Math.sin(angle);
var mv0 = m[0], mv4 = m[4], mv8 = m[8];

m[0] = c*m[0]+s*m[2];
m[4] = c*m[4]+s*m[6];
m[8] = c*m[8]+s*m[10];

m[2] = c*m[2]-s*mv0;
m[6] = c*m[6]-s*mv4;
m[10] = c*m[10]-s*mv8;
// check is the orientation is greater than 90 degrees

}

/*=================== Drawing =================== */

var THETA = 0,
PHI = 0;
var time_old = 0;


const  BindQuadSelectionColorBuffer = UseBindQuadSelectionColorBuffer(gl,shaderprogram)
const GlDraw = UseDraw(gl)
function draw()
{
    gl.enable(gl.DEPTH_TEST);

    // gl.depthFunc(gl.LEQUAL);

    gl.clearDepth(1.0);
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(_Pmatrix, false, proj_matrix);
    gl.uniformMatrix4fv(_Vmatrix, false, view_matrix);
    gl.uniformMatrix4fv(_Mmatrix, false, mo_matrix);
    gl.uniformMatrix4fv(
        _normal_matrix,
        false,
        normalMatrix
      );

    addNormals(gl,_VertexNormal) 

    GlDraw(gl)



}
var animate = function(time) {
    var dt = time-time_old;

    if (!drag) {
        dX *= AMORTIZATION, dY*=AMORTIZATION;
        THETA+=dX, PHI+=dY;
    }


    //set model matrix to I4

    mo_matrix[0] = 1, mo_matrix[1] = 0, mo_matrix[2] = 0,
    mo_matrix[3] = 0,

    mo_matrix[4] = 0, mo_matrix[5] = 1, mo_matrix[6] = 0,
    mo_matrix[7] = 0,

    mo_matrix[8] = 0, mo_matrix[9] = 0, mo_matrix[10] = 1,
    mo_matrix[11] = 0,

    mo_matrix[12] = 0, mo_matrix[13] = 0, mo_matrix[14] = 0,
    mo_matrix[15] = 1;

    PHI = Math.max(-Math.PI/2, Math.min(Math.PI/2, PHI));
    rotateY(mo_matrix, THETA);
    rotateX(mo_matrix, PHI);

    time_old = time; 
    

    gl.clearColor(0, 0, 0, 1);
    BindQuadSelectionColorBuffer()
    draw()
    
    const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
    const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
    const data = new Uint8Array(4);
    gl.readPixels(
        pixelX,            // x
        pixelY,            // y
        1,                 // width
        1,                 // height
        gl.RGBA,           // format
        gl.UNSIGNED_BYTE,  // type
        data);             // typed array to hold result

    BindSelectionQuadColor(gl,shaderprogram,data)

    draw(data)

    window.requestAnimationFrame(animate);
}
animate(0);

