import App from './App'

require('./css/style.scss')

let controls = document.getElementById("bottom")

document.addEventListener('DOMContentLoaded', function() {
	console.log("DOM loaded")
	var app = new App()
	app.start()
});

window.toggleControls = function() {
	controls.classList.toggle('active');
}

window.loadSVG