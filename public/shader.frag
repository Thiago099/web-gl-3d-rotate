precision mediump float;
varying vec3 vColor;
varying highp vec3 vLighting;
void main(void) {
    gl_FragColor = vec4(vColor * vLighting, 1.);
}