const Tweenr 	= require('tweenr')
const tweenr = Tweenr({ defaultEase: 'expoOut' })

let animate = {}

animate.run = () => {

}

animate.explode = (material, delay = 0) => {
	tweenr.to(material.uniforms.scale, {
    	delay: delay, value: 0, duration: 0.75, ease: 'expoIn'
  	})
}
module.exports = animate