var TextureCachePolicy = {
	"NoCache" 			: 0,   // never cache and always load from the server
	"InMemory"			: 1,   // only cache in memory and bypass the browser cache on the first load
	"UseBrowserCache"	: 2,   // only cache in the browser
	"Cache"				: 3    // default, cache in memory and in the browser
};

export default TextureCachePolicy;
