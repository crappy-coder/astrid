import Dictionary from "./../Dictionary";
import EventDispatcher from "./../EventDispatcher";
import Event from "./../Event";
import FrameEvent from "./../FrameEvent";
import { ValueOrDefault } from "./../Engine";
import { MaxInt } from "./../EngineMath";
import Application from "./../Application";

class LayoutBin {
	constructor() {
		this.items = new Dictionary();
		this.length = 0;
	}
}

class LayoutPriorityQueue {
	constructor() {
		this.priorityBins = [];
		this.minPriority = 0;
		this.maxPriority = -1;
	}

	addObject(obj, priority) {

		// Update our min and max priorities.
		if (this.maxPriority < this.minPriority) {
			this.minPriority = this.maxPriority = priority;
		}
		else {
			if (priority < this.minPriority) {
				this.minPriority = priority;
			}

			if (priority > this.maxPriority) {
				this.maxPriority = priority;
			}
		}

		var bin = this.priorityBins[priority];

		if (bin == null) {
			// If no hash exists for the specified priority, create one.
			bin = new LayoutBin();
			this.priorityBins[priority] = bin;
			bin.items.set(obj, true);
			bin.length++;
		}
		else {
			// If we don't already hold the obj in the specified hash, add it
			// and update our item count.
			if (bin.items.get(obj) == null) {
				bin.items.set(obj, true);
				bin.length++;
			}
		}
	}

	removeLargest() {
		var obj = null;

		if (this.minPriority <= this.maxPriority) {
			var bin = this.priorityBins[this.maxPriority];

			while (bin == null || bin.length == 0) {
				this.maxPriority--;

				if (this.maxPriority < this.minPriority) {
					return null;
				}

				bin = this.priorityBins[this.maxPriority];
			}

			// Remove the item with largest priority from our priority queue.
			// Must use a for loop here since we're removing a specific item
			// from a 'Dictionary' (no means of directly indexing).
			var keys = bin.items.getKeys();

			obj = keys[i];
			this.removeChild(obj, this.maxPriority);

			// Update maxPriority if applicable.
			while (bin == null || bin.length == 0) {
				this.maxPriority--;

				if (this.maxPriority < this.minPriority) break;

				bin = this.priorityBins[this.maxPriority];
			}

		}

		return obj;
	}

	removeLargestChild(client) {
		var max = this.maxPriority;
		var min = client.getDepth();

		while (min <= max) {
			var bin = this.priorityBins[max];

			if (bin != null && bin.length > 0) {
				if (max == client.getDepth()) {
					// If the current level we're searching matches that of our
					// client, no need to search the entire list, just check to see
					// if the client exists in the queue (it would be the only item
					// at that nestLevel).
					if (bin.items.get(client) != null) {
						this.removeChild(client, max);

						return client;
					}
				}
				else {
					var keys = bin.items.getKeys();
					var key = null;

					for (var i = 0; i < keys.length; ++i) {
						key = keys[i];

						if (this.contains(client, key)) {
							this.removeChild(key, max);
							return key;
						}
					}
				}

				max--;
			}
			else {
				if (max == this.maxPriority) {
					this.maxPriority--;
				}

				max--;

				if (max < min) break;
			}
		}
	}

	removeSmallest() {
		var obj;

		if (this.minPriority <= this.maxPriority) {
			var bin = this.priorityBins[this.minPriority];

			while (bin == null || bin.length == 0) {
				this.minPriority++;

				if (this.minPriority > this.maxPriority) return;

				bin = this.priorityBins[this.minPriority];
			}

			// Remove the item with smallest priority from our priority queue.
			// Must use a for loop here since we're removing a specific item
			// from a 'Dictionary' (no means of directly indexing).

			var keys = bin.items.getKeys();

			obj = keys[0];
			this.removeChild(obj, this.minPriority);

			// Update minPriority if applicable.
			while (bin == null || bin.length == 0) {
				this.minPriority++;

				if (this.minPriority > this.maxPriority) break;

				bin = this.priorityBins[this.minPriority];
			}
		}

		return obj;
	}

	removeSmallestChild(client) {
		var min = client.getDepth();

		while (min <= this.maxPriority) {
			var bin = this.priorityBins[min];

			if (bin != null && bin.length > 0) {
				if (min == client.getDepth()) {
					// If the current level we're searching matches that of our
					// client, no need to search the entire list, just check to see
					// if the client exists in the queue (it would be the only item
					// at that nestLevel).
					if (bin.items.get(client) != null) {
						this.removeChild(client, min);
						return client;
					}
				}
				else {
					var keys = bin.items.getKeys();
					var key;

					for (var i = 0; i < keys.length; ++i) {
						key = keys[i];

						if (this.contains(client, key)) {
							this.removeChild(key, min);
							return key;
						}
					}
				}

				min++;
			}
			else {
				if (min == this.minPriority) {
					this.minPriority++;
				}

				min++;

				if (min > this.maxPriority) break;
			}
		}
	}

	removeChild(client, level) {
		level = ValueOrDefault(level, -1);

		var priority = (level >= 0) ? level : client.getDepth();
		var bin = this.priorityBins[priority];

		if (bin != null && bin.items.get(client) != null) {
			bin.items.remove(client);
			bin.length--;

			return client;
		}
	}

	removeAll() {
		this.priorityBins = [];
		this.minPriority = 0;
		this.maxPriority = -1;
	}

	isEmpty() {
		return (this.minPriority > this.maxPriority);
	}

	contains(parent, child) {
		return parent.exists(child);
	}
}

class LayoutManager extends EventDispatcher {
	constructor() {
		super();

		/** holds the drawables that have been processed and are
		 pending an update notification **/
		this.pendingUpdateQueue = new LayoutPriorityQueue();

		/** holds the level of the current drawable that is
		 being validated by the validateDrawableNow call, this
		 is used for nested validation calls. during an immediate
		 validation we only want drawables at this level or deeper
		 to be re-queued **/
		this.currentDepth = MaxInt;

		/** holds the drawables that have had their properties
		 invalidated and are awaiting validation **/
		this.propertiesQueue = new LayoutPriorityQueue();

		/** holds the drawables that have had their measurements
		 invalidated and are awaiting validation **/
		this.measureQueue = new LayoutPriorityQueue();

		/** holds the drawables that have had their layout
		 invalidated and are awaiting validation **/
		this.layoutQueue = new LayoutPriorityQueue();

		/** flag that indicates whether there are properties
		 pending validation **/
		this.arePropertiesInvalid = false;

		/** flag that indicates whether any properties have been
		 invalidated while in the validateDrawableNow call, but
		 only for those drawable's at the same or deeper level
		 than the drawable that is currently being validated **/
		this.arePropertiesInvalidNow = false;

		/** flag that indicates whether there are measurements
		 pending validation **/
		this.areMeasurementsInvalid = false;

		/** flag that indicates whether any measurements have been
		 invalidated while in the validateDrawableNow call, but
		 only for those drawable's at the same or deeper level
		 than the drawable that is currently being validated **/
		this.areMeasurementsInvalidNow = false;

		/** flag that indicates whether there are layouts
		 pending validation **/
		this.areLayoutsInvalid = false;

		/** flag that indicates whether the first frame has
		 been skipped, we do this as an initial warm up
		 period **/
		this.frameSkipped = false;

		/** flag that indicates whether the frame and render
		 listeners have been registered **/
		this.areListenersRegistered = false;
	}

	invalidateProperties(drawable) {

		if (!this.arePropertiesInvalid) {
			this.arePropertiesInvalid = true;
			this.registerListeners();
		}

		if (this.currentDepth <= drawable.getDepth()) {
			this.arePropertiesInvalidNow = true;
		}

		this.propertiesQueue.addObject(drawable, drawable.getDepth());
	}

	requestMeasure(drawable) {
		if (!this.areMeasurementsInvalid) {
			this.areMeasurementsInvalid = true;
			this.registerListeners();
		}

		if (this.currentDepth <= drawable.getDepth()) {
			this.areMeasurementsInvalidNow = true;
		}

		this.measureQueue.addObject(drawable, drawable.getDepth());
	}

	requestLayout(drawable) {
		if (!this.areLayoutsInvalid) {
			this.areLayoutsInvalid = true;
			this.registerListeners();
		}

		this.layoutQueue.addObject(drawable, drawable.getDepth());
	}


	validateProperties() {
		if (!this.arePropertiesInvalid) return;

		var drawable = this.propertiesQueue.removeSmallest();

		while (drawable != null) {

			if (drawable.canValidate()) {
				drawable.validateProperties();

				this.queuePendingUpdate(drawable);
			}

			drawable = this.propertiesQueue.removeSmallest();
		}

		if (this.propertiesQueue.isEmpty()) {
			this.arePropertiesInvalid = false;
		}
	}

	validateMeasure() {
		if (!this.areMeasurementsInvalid) return;

		var drawable = this.measureQueue.removeLargest();

		while (drawable != null) {

			if (drawable.canValidate()) {
				drawable.validateMeasure();

				this.queuePendingUpdate(drawable);
			}

			drawable = this.measureQueue.removeLargest();
		}

		if (this.measureQueue.isEmpty()) {
			this.areMeasurementsInvalid = false;
		}
	}

	validateLayout() {
		if (!this.areLayoutsInvalid) return;

		var drawable = this.layoutQueue.removeSmallest();

		while (drawable != null) {

			if (drawable.canValidate()) {
				drawable.validateLayout();

				this.queuePendingUpdate(drawable);
			}

			drawable = this.layoutQueue.removeSmallest();
		}

		if (this.layoutQueue.isEmpty()) {
			this.areLayoutsInvalid = false;
		}
	}

	process() {

		// validate properties, measurements, and layouts
		this.validateAll();

		// reset listener registration, we will either re-register or our visuals
		// are initialized and updated
		this.areListenersRegistered = false;

		// still invalid, wait for the next frame/render to try another pass
		// at validating
		if (this.isInvalid()) {
			this.registerListeners();
			return;
		}

		var drawable = this.pendingUpdateQueue.removeLargest();

		while (drawable != null) {

			// mark this drawable as initialized
			if (!drawable.getIsInitialized()) {
				drawable.setIsInitialized(true);
			}

			// notify and mark that this drawable is updated
			drawable.dispatchEvent(new Event(Event.UPDATED));
			drawable.isPendingUpdate = false;

			// remove from the update queue
			drawable = this.pendingUpdateQueue.removeLargest();
		}

		// notify any listeners that this layout manager
		// has been completely updated
		this.dispatchEvent(new Event(Event.LAYOUT_UPDATED));
	}

	validateAll() {
		this.validateProperties();
		this.validateMeasure();
		this.validateLayout();
	}

	validateNow() {
		var infiniteLoopGuard = 0;

		while (this.areListenersRegistered && infiniteLoopGuard++ < 100) {
			this.process();
		}
	}

	validateDrawableNow(targetDrawable, dontValidateVisualStack) {
		dontValidateVisualStack = ValueOrDefault(dontValidateVisualStack, false);

		var isRunning = false;
		var previousDepth = this.currentDepth;
		var drawable = null;

		if (this.currentDepth == MaxInt) {
			this.currentDepth = targetDrawable.getDepth();
		}

		while (!isRunning) {
			// exit as soon as all the properties and sizes have been
			// validated or if the visual stack is going to be validated
			// then we'll exit if no changes in properties or sizes occurred
			// while the visual stack was being validated
			isRunning = true;


			/*********************************************************/
			/**                VALIDATE PROPERTIES                  **/
			/*********************************************************/
			drawable = this.propertiesQueue.removeSmallestChild(targetDrawable);

			while (drawable != null) {

				if (drawable.canValidate()) {
					drawable.validateProperties();

					this.queuePendingUpdate(drawable);
				}

				drawable = this.propertiesQueue.removeSmallestChild(targetDrawable);
			}

			if (this.propertiesQueue.isEmpty()) {
				this.arePropertiesInvalid = false;
				this.arePropertiesInvalidNow = false;
			}


			/*********************************************************/
			/**                  VALIDATE MEASURE                   **/
			/*********************************************************/
			drawable = this.measureQueue.removeLargestChild(targetDrawable);

			while (drawable != null) {
				if (drawable.canValidate()) {
					drawable.validateMeasure();

					this.queuePendingUpdate(drawable);
				}

				drawable = this.measureQueue.removeLargestChild(targetDrawable);
			}

			if (this.measureQueue.isEmpty()) {
				this.areMeasurementsInvalid = false;
				this.areMeasurementsInvalidNow = false;
			}


			/*********************************************************/
			/**                   VALIDATE LAYOUT                   **/
			/*********************************************************/
			if (!dontValidateVisualStack) {
				drawable = this.layoutQueue.removeSmallestChild(targetDrawable);

				while (drawable != null) {
					if (drawable.canValidate()) {
						drawable.validateLayout();

						this.queuePendingUpdate(drawable);
					}

					if (this.arePropertiesInvalidNow) {
						drawable = this.propertiesQueue.removeSmallestChild(targetDrawable);

						if (drawable != null) {
							this.propertiesQueue.addObject(drawable, drawable.getDepth());

							isRunning = false;
							break;
						}
					}

					if (this.areMeasurementsInvalidNow) {
						drawable = this.measureQueue.removeLargestChild(targetDrawable);

						if (drawable != null) {
							this.measureQueue.addObject(drawable, drawable.getDepth());

							isRunning = false;
							break;
						}
					}

					drawable = this.layoutQueue.removeSmallestChild(targetDrawable);
				}

				if (this.layoutQueue.isEmpty()) {
					this.areLayoutsInvalid = false;
				}
			}
		}

		if (previousDepth == MaxInt) {
			this.currentDepth = MaxInt;

			if (!dontValidateVisualStack) {
				drawable = this.pendingUpdateQueue.removeLargestChild(targetDrawable);

				while (drawable != null) {
					if (!drawable.getIsInitialized()) {
						drawable.setIsInitialized(true);
					}

					drawable.dispatchEvent(new Event(Event.UPDATED));
					drawable.isPendingUpdate = false;

					drawable = this.pendingUpdateQueue.removeLargestChild(targetDrawable);
				}
			}
		}
	}

	isInvalid() {
		return (this.arePropertiesInvalid || this.areMeasurementsInvalid || this.areLayoutsInvalid);
	}

	queuePendingUpdate(drawable) {
		if (drawable == null || drawable.isPendingUpdate) return;

		this.pendingUpdateQueue.addObject(drawable, drawable.getDepth());
		drawable.isPendingUpdate = true;
	}

	registerListeners() {
		if (this.areListenersRegistered) return;

		var app = Application.getInstance();

		// listen for the next frame event to occur which will
		// process any validation/initialization that is pending
		app.addEventHandler(FrameEvent.ENTER, this.handleFrameTickEvent.asDelegate(this));

		// wait to invalidate until the first frame has finished, this way we
		// can use the entire frame for initial startup
		if (this.frameSkipped) {
			app.invalidate();
		}

		this.areListenersRegistered = true;
	}

	handleFrameTickEvent(event) {
		var app = Application.getInstance();

		// we only wanted to skip a single frame
		if (!this.frameSkipped) {
			this.frameSkipped = true;
		}
		else {
			// remove event callbacks until our validation/initialization
			// phase completes to avoid any redundant calls
			app.removeEventHandler(FrameEvent.ENTER, this.handleFrameTickEvent.asDelegate(this));

			this.process();
		}
	}

	static getInstance() {
		if (LayoutManager.Instance == null) {
			LayoutManager.Instance = new LayoutManager();
		}

		return LayoutManager.Instance;
	}
}

export default LayoutManager;
