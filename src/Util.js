const triangleCentroid  = require('triangle-centroid')
const randomVec3        = require('gl-vec3').random

module.exports = {
	getAnimationAttributes: function(positions, cells) {
	  const directions = new Float32Array(cells.length * 9)
	  const centroids = new Float32Array(cells.length * 9)
	  for (let i=0, i9=0; i<cells.length; i++, i9+=9) {
	    const [ f0, f1, f2 ] = cells[i]
	    const triangle = [ positions[f0], positions[f1], positions[f2] ]
	    const center = triangleCentroid(triangle)
	    centroids[i9] = center[0]
	    centroids[i9+1] = center[1]
	    centroids[i9+2] = center[2]

	    centroids[i9+3] = center[0]
	    centroids[i9+4] = center[1]
	    centroids[i9+5] = center[2]

	    centroids[i9+6] = center[0]
	    centroids[i9+7] = center[1]
	    centroids[i9+8] = center[2]
	    
	    const random = randomVec3([], Math.random())
	    directions[i9] = random[0]
	    directions[i9+1] = random[1]
	    directions[i9+2] = random[2]

	    directions[i9+3] = random[0]
	    directions[i9+4] = random[1]
	    directions[i9+5] = random[2]

	    directions[i9+6] = random[0]
	    directions[i9+7] = random[1]
	    directions[i9+8] = random[2]
	  }
	  
	  return {
	    direction: new THREE.BufferAttribute( directions, 3 ),
	    centroid: new THREE.BufferAttribute( centroids, 3 )
	  }
	}
}