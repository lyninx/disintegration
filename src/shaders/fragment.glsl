uniform float animate;
uniform float opacity;
varying vec3 color;

void main() {
  gl_FragColor = vec4(color, opacity);
}