const Tweenr 	= require('tweenr')
const tweenr = Tweenr({ defaultEase: 'expoOut' })

export default class Animate {
	constructor(material, animation) {
		this.duration = 2.0
		this.animation = animation
		this.material = material
		this._bind('run', 'explode')

	}
	run() {
		switch(this.animation) {
			case 0: this.explode(this.duration); break;
			default: console.log("invalid animation set")
		}
	}
	_bind(...methods) {
		methods.forEach((method) => this[method] = this[method].bind(this));
	}

	explode(dur, delay = 0){
		tweenr.to(this.material.uniforms.animate, {
			duration: dur, 
			value: 0, 
			delay: delay, 
			ease: 'circOut'
		})
		tweenr.to(this.material.uniforms.scale, {
			duration: dur, 
			value: 0, 
			delay: delay
		})
	}

	implode(material, delay = 0) {
		tweenr.to(material.uniforms.animate, {
			duration: 2.0, 
			value: 1, 
			delay: delay, 
			ease: 'quadInOut'
		})
		tweenr.to(material.uniforms.scale, {
			duration: 2.0, 
			value: 1, 
			delay: delay
		})
	}
}