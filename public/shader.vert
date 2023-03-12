attribute vec3 position;
attribute vec3 aVertexNormal;

uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
uniform mat4 uNormalMatrix;
varying highp vec3 vLighting;
uniform float isPickingStep;

attribute vec3 color;
varying vec3 vColor;
void main(void) { 
    gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.);
    vColor = color;

    if(isPickingStep == 0.0)
    {
        vLighting = vec3(1.0, 1.0, 1.0);
    }
    else
    {

        highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
        
        highp vec3 frontColor = vec3(1, 1, 1);
        highp vec3 backColor = vec3(.8, .8, .8);

        highp vec3 frontVector = normalize(vec3(0.85, 0.8, 0.75));
        highp vec3 backVector = normalize(vec3(-0.85, -0.8, -0.75));

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, frontVector), 0.0);
        highp float directional2 = max(dot(transformedNormal.xyz, backVector), 0.0);

        vLighting =  ambientLight + (frontColor * directional) + (backColor * directional2);
    }
}