
window.addEventListener("load", function() {
	func01(2);
});

function func01(x) {
	func02(x + x);
}

function func02(y) {
	console.trace();
}