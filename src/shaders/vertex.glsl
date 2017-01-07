attribute vec3 direction;
attribute vec3 centroid;
attribute vec3 random;

uniform float animate;
uniform float opacity;
uniform float scale;

varying vec3 color;

#define PI 3.1415

void main() {
  // rotate the triangles
  // each half rotates the opposite direction
  float swirl = 1.0;
  float theta = (1.0 - animate) * (PI * swirl) * sign(centroid.x);
  //float theta = (1.0 - animate) * (PI * 1.5);
  mat3 rotMat = mat3(
    vec3(cos(theta), 0.0, sin(theta)),
    vec3(0.0, 1.0, 0.0),
    vec3(-sin(theta), 0.0, cos(theta))
  );
  mat3 rotMat2 = mat3(
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, cos(-2.0 * direction.y), -sin(-2.0 * direction.y)),
    vec3(0.0, sin(-2.0 * direction.y), cos(-2.0 * direction.y))
  );
  
  vec3 offset = mix(vec3(0.0), direction.xyz * rotMat, 1.0 - animate);
  // scale triangles to their centroids
  vec3 tPos = mix(mix(centroid.xyz, position.xyz, scale), position.xyz * rotMat2, 1.0 - animate) + offset;

  color = vec3(1.0);
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(tPos, 1.0);
  //gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}