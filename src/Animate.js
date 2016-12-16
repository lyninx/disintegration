const Tweenr 	= require('tweenr')
const tweenr = Tweenr({ defaultEase: 'expoOut' })

let animate = {}

animate.run = (material) => {
	animate.implode(material)
}

animate.explode = (material, delay = 0) => {
	tweenr.to(material.uniforms.animate, {
		duration: 2.0, 
		value: 0, 
		delay: delay, 
		ease: 'circOut'
	}).on('complete', () => {
		animate.run(material)
  	})
}
animate.implode = (material, delay = 0) => {
	tweenr.to(material.uniforms.animate, {
		duration: 2.0, 
		value: 1, 
		delay: delay, 
		ease: 'quadInOut'
	}).on('complete', () => {
		animate.explode(material, 2.0)
  	})
}
module.exports = animate