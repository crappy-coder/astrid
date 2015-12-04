
window.addEventListener("load", function() {
	console.time("One");
	console.time("Two");
	
	setTimeout(function() {
		console.timeEnd("Tw");
		console.timeEnd("One");
		console.timeEnd("Two");
	}, 1000);
});