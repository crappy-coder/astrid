
window.addEventListener("load", function() {
	console.timeStamp();
	console.timeStamp(2);
	console.timeStamp({one:1});
	console.timeStamp("One");
	
	setTimeout(function() {
		console.timeStamp("Two");
	}, 1000);
});