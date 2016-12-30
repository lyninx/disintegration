import App from './App'

require('./css/style.scss')

document.addEventListener('DOMContentLoaded', function() {
	console.log("DOM loaded")
	var app = new App()
	app.start()
});

window.toggleControls = function() {
	console.log("yup")
	document.getElementById("controls").classList.add('show');
}