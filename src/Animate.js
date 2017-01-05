const Tweenr 	= require('tweenr')
const tweenr = Tweenr({ defaultEase: 'expoOut' })

let animate = {}

animate.run = (material, frame) => {
	let state = frame / 8192
	material.uniforms.animate = { type: "f", value: state }
}

animate.explode = (material, delay = 0) => {
	tweenr.to(material.uniforms.animate, {
		duration: 2.0, 
		value: 0, 
		delay: delay, 
		ease: 'circOut'
	})
	tweenr.to(material.uniforms.opacity, {
		duration: 2.0, 
		value: 0, 
		delay: delay, 
		ease: 'circOut'
	})
	tweenr.to(material.uniforms.scale, {
		duration: 2.0, 
		value: 0, 
		delay: delay
	})
}
animate.implode = (material, delay = 0) => {
	tweenr.to(material.uniforms.animate, {
		duration: 2.0, 
		value: 1, 
		delay: delay, 
		ease: 'quadInOut'
	})
	tweenr.to(material.uniforms.opacity, {
		duration: 2.0, 
		value: 1, 
		delay: delay, 
		ease: 'quadIn'
	})
	tweenr.to(material.uniforms.scale, {
		duration: 2.0, 
		value: 1, 
		delay: delay
	})
}
module.exports = animate