
import './style.css'
import {vertexPosition, GetCubeSelectionColor, GetCubeIdMap,vertexIndexes,vertexNormals} from './object.js'
import { mat4 } from 'gl-matrix'
import { webgl } from './bin/gl-builder'

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
        <p>
            Hover the mouse over the cube to highlight its faces
        </p>
    </div>
</div>

canvas.width = 500
canvas.height = 500

main.$parent(document.body)


async function process(){
var vertCode = await fetch("./shader.vert").then(res=>res.text())
var fragCode = await fetch("./shader.frag").then(res=>res.text())





var shader_builder = webgl(canvas.__element)

var [gl, builder] = 
    shader_builder
    .vertexShader(vertCode)
    .fragmentShader(fragCode)
    .build()


builder.attribute_3_float.normal = vertexNormals
builder.attribute_3_float.position = vertexPosition;
builder.face = vertexIndexes

const  cube_id_map = GetCubeIdMap()

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


gl.viewport(0.0, 0.0, canvas.width, canvas.height);

builder.uniform_4_float.uNormalMatrix = normalMatrix


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



function draw()
{
    gl.enable(gl.DEPTH_TEST);

    gl.clearDepth(1.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    builder.drawSolid()
}

var animate = function(time) {

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


    builder.uniform_4_float.projection_matrix = proj_matrix
    builder.uniform_4_float.view_matrix = view_matrix
    builder.uniform_4_float.model_matrix = mo_matrix


    gl.clearColor(0, 0, 0, 0);

    builder.attribute_4_float.color = cube_id_map;

    builder.uniform_1_float.is_picking_step = 1


    draw()
    
    const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
    const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;

    builder.attribute_4_float.color = GetCubeSelectionColor(builder.getPixel(pixelX, pixelY));
    builder.uniform_1_float.is_picking_step = 0
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    draw()
    window.requestAnimationFrame(animate);
}
animate(0);


}

process()
