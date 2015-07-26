MoEventDispatcher = Class.create(MoEquatable, 
/**
 * @CLASS
 *
 * SUMMARY:
 *  Represents the base class for any object that wants to participate in event handling.
 */
{
	initialize : function() {
		this.handlerCount = 0;
	},
	
	getHandlerCount : function() {
		return this.handlerCount;
	},

	clearEventHandlers : function() {
		for(var q in this)
		{
			if(this.hasOwnProperty(q) && q.startsWith("__evt_queue_"))
			{
				this[q] = null;
				delete this[q];
			}
		}
	},

	addEventHandler : function(eventType, handler, useCapture) {	
		useCapture = MoValueOrDefault(useCapture, false);

		var queueName = this.getQueueName$internal(eventType);
		
		if(this[queueName] == null)
			this[queueName] = new Array();

		MoEventDispatcher.__removeEventListener(this[queueName], handler, useCapture);
		this[queueName].push({handler:handler, useCapture:useCapture});
		this.handlerCount++;
	},

	removeEventHandler : function(eventType, handler, useCapture) {
		useCapture = MoValueOrDefault(useCapture, false);
		
		var queueName = this.getQueueName$internal(eventType);
		
		MoEventDispatcher.__removeEventListener(this[queueName], handler, useCapture);
		this.handlerCount--;
	},

	hasEventHandler : function(eventType) {
		var queueName = this.getQueueName$internal(eventType);

		return (this[queueName] != null && this[queueName].length > 0);
	},

	dispatchEvent : function(event) {
		if(event.isDispatching)
			throw new Error("Event '" + event.type + "' is already being dispatched.");

		event.isDispatching = true;
		event.target = this;

		// the target is not in any parent-child hierarchy, so just execute any
		// event handlers
		if(this.getParent == null)
		{
			this.executeEventHandlers(event);
		}
		else
		{
			var eventPath = this.determinePropagationPathForTarget(event.target);
			var len = eventPath.length;
			var obj = null;

			// begin capturing phase
			event.phase = MoEventPhase.CAPTURING;
			
			// execute each objects handlers in the event path to the end
			// or until propagation has been stopped
			for(var i = 0; i < len; ++i)
			{
				obj = eventPath[i];
				
				if(event.isPropagationStopped)
					break;
				
				obj.executeEventHandlers(event);
			}
			
			// begin target phase
			event.phase = MoEventPhase.TARGET;
			
			// now execute the original target's handlers as long as
			// the event hasn't stopped it's propagation
			if(!event.isPropagationStopped)
				event.target.executeEventHandlers(event);
			
			// try to bubble the event upward
			if(event.canBubble)
			{
				// begin bubbling phase
				event.phase = MoEventPhase.BUBBLING;
				
				// execute each objects handlers in the event path but this
				// time we need to do it in reverse as long as propagation
				// hasn't been stopped
				for(var i = len-1; i >= 0; --i)
				{
					obj = eventPath[i];
					
					if(event.isPropagationStopped)
						break;
					
					obj.executeEventHandlers(event);
				}
			}
		}
		
		// finish up the dispatch and return whether or not the event 
		// ended up being canceled
		event.isDispatching = false;
		event.phase = MoEventPhase.TARGET;
		event.currentTarget = null;
		
		return !event.isCanceled;
	},
	
	isEqualTo : function(obj) {
		return (this == obj);
	},
	
	determinePropagationPathForTarget : function(target) {
		// @PRIVATE 
		
		var objList = [];
		var obj = target;
		
		if(obj != null)
		{
			obj = obj.getParent();
		
			while(obj != null)
			{
				objList.unshift(obj);
				obj = obj.getParent();
			}
		}
		
		return objList;
	},
	
	executeEventHandlers : function(event) {
		// @PRIVATE 
		
		var eventType = event.getType();
		var queueName = this.getQueueName$internal(eventType);
		var queue = this[queueName];
		var queueItem = null;
		
		if(queue != null)
		{
			// update our current target to be this, which may differ
			// from the original target if this event's target is participating
			// in a tree
			event.currentTarget = this;
		
			// we need to make a copy incase a handler is removed while executing
			// which would invalidate the indices
			queue = queue.concat();
		
			var i;
			var len = queue.length;
			var handler = null;
			var useCapture = false;
			
			for(i = 0; i < len; ++i)
			{
				queueItem = queue[i];
			
				// propagation has immediately been stopped so there
				// is no reason to continue anymore
				if(event.isPropagationStoppedNow)
					return;
			
				handler = queueItem.handler;
				useCapture = queueItem.useCapture;
				
				// ensure that the handler is indeed a function
				if(typeof(handler) != "function")
					continue;

				// move on to the next one if the handler does not participate
				// in the capture phase
				if(!useCapture && event.getPhase() == MoEventPhase.CAPTURING)
					continue;
				
				// or move on to the next one if we are currently bubbling and
				// the handler should only be used during the capture phase
				if(useCapture && event.getPhase() == MoEventPhase.BUBBLING)
					continue;
			
				// finally execute the handler
				handler(event);
			}
		}
	},
	
	getQueueName$internal : function(eventType) {
		// @PRIVATE 
		
		return "__evt_queue_" + eventType;
	}
});

Object.extend(MoEventDispatcher, {

	__removeEventListener : function(queue, handler, useCapture) {
		// @PRIVATE 

		if(queue != null)
		{
			var len = queue.length;
			var i = 0;
			
			for(var i = len-1; i >= 0; --i)
			{
				var o = queue[i];

				if(o.handler == handler && o.useCapture == useCapture)
				{
					queue.splice(i, 1);				
					return;
				}
			}
		}
	}
});
