precision mediump float;
varying vec4 vColor;
varying highp vec3 vLighting;
void main(void) {
    gl_FragColor = vec4(vColor.xyz * vLighting, vColor.w);
}