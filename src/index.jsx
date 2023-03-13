
import './style.css'
import {vertexPosition, GetCubeSelectionColor, GetCubeIdMap,vertexIndexes,vertexNormals} from './object.js'

import { webgl } from './bin/gl-builder'
import { useCamera } from './bin/camera'

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


builder.attribute_matrix_3_float.normal = vertexNormals
builder.attribute_matrix_3_float.position = vertexPosition;
builder.face = vertexIndexes

const  cube_id_map = GetCubeIdMap()

const {update, mouse} = useCamera(canvas, builder, gl)

function draw()
{
    update()
    gl.enable(gl.DEPTH_TEST);

    gl.clearDepth(1.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    builder.drawSolid()
}

var animate = function() {

    gl.clearColor(0, 0, 0, 0);

    builder.attribute_matrix_4_float.color = cube_id_map;

    builder.uniform_float.is_picking_step = 1

    draw()
    
    builder.attribute_matrix_4_float.color = GetCubeSelectionColor(builder.getPixel(mouse.x, mouse.y));
    builder.uniform_float.is_picking_step = 0
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    draw()
    window.requestAnimationFrame(animate);
}
animate(0);


}

process()
