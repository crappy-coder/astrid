
window.addEventListener("load", function() {
	console.assert(true, "THIS SHOULD NOT SHOW.");
	console.assert(false, "THIS SHOULD SHOW.");

	console.assert(1 == 1, "NO");
	console.assert(1 != 1, "YES");
});