
window.addEventListener("load", function() {
	console.exception({one:1});
	console.exception({one:1}, "One");
	
	try
	{
		throw new Error("my error message");
	}
	catch(e)
	{
		console.exception(e);
		console.exception(e, "A", "B", "C", 1, 2, 3);
	}
});