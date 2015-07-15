

window.addEventListener("load", function() {
	var errorThrown = false;

	try 
	{
		document.importNode(document);
	} 
	catch(e)
	{
		if(e.code != DOMException.NOT_SUPPORTED_ERR)
			console.log("Expected exception of type NOT_SUPPORTED_ERR, got: " + e.message);

		errorThrown = true;
	}
	finally
	{
		if(!errorThrown)
			console.log("Expected an exception (NOT_SUPPORTED_ERR) to be thrown.");
	}
});