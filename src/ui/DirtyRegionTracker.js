class DirtyRegionTracker {
	constructor() {
		this.regionCache = [];
	}

	clear() {
		this.regionCache = [];
	}

	isEmpty() {
		return (this.regionCache.length == 0);
	}

	getRects() {
		return this.regionCache;
	}

	add(dirtyRegion) {
		if (dirtyRegion == null || dirtyRegion.isEmpty()) {
			return;
		}

		var regions = [];
		var rect = dirtyRegion.getRect().round().inflate(4, 4);

		for (var i = this.regionCache.length - 1; i >= 0; --i) {
			var region = this.regionCache[i];

			if (rect.intersects(region)) {
				this.regionCache[i] = rect.unionWithRect(region);
			} else {
				regions.push(region);
			}
		}

		regions.push(rect);

		this.regionCache = regions;
	}

	static current() {
		if (DirtyRegionTracker.Instance == null) {
			DirtyRegionTracker.Instance = new DirtyRegionTracker();
		}

		return DirtyRegionTracker.Instance;
	}
}

export default DirtyRegionTracker;
