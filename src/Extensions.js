//--------------------------------------------------------------------------
//  Array Extensions
//--------------------------------------------------------------------------

Array.prototype.contains = function(item) {
	return (this.indexOf(item) != -1);
};

Array.prototype.remove = function(item) {
	for (var i = this.length-1; i >= 0; i--) {
		if (this[i] == item) {
			this.removeAt(i);
		}
	}
};

Array.prototype.removeAt = function(index) {
	this.splice(index, 1);
};


//--------------------------------------------------------------------------
//  Function Extensions
//--------------------------------------------------------------------------

Function.prototype.findEventHandler$ = function(context) {

	// if there is no event handler table for this function instance
	// create one, this is done at the instance level so we do not
	// generate huge tables instead of using Function.prototype.eventHandlerTable
	// which would be a single instance for all functions
	if (this.eventHandlerTable == null) {
		this.eventHandlerTable = [];
		return null;
	}

	// iterate through the table and see if we can find the handler
	// for the specified context, this way we can have multiple handlers
	// for each unique object context
	var len = this.eventHandlerTable.length;

	for (var i = 0; i < len; ++i) {
		if (this.eventHandlerTable[i].context == context) {
			return this.eventHandlerTable[i].handler;
		}
	}
};

Function.prototype.createEventHandler$ = function(context, handler) {
	this.eventHandlerTable.push({context:context, handler:handler});

	return handler;
};

Function.prototype.executeHandler = function() {

};

Function.prototype.asDelegate = function(context) {

	if (arguments.length != 1) {
		throw new Error("Invalid number of arguments. expected: 1, actual: " + arguments.length.toString());
	}

	// if the context is null then just return this function
	if (context == null) {
		return this;
	}

	// see if we can find an existing handler, otherwise
	// create one
	var funcImpl = this;
	var funcHandler = this.findEventHandler$(context);

	if (funcHandler == null) {
		return this.createEventHandler$(context, function handlerFunc() {
			return funcImpl.apply(context, arguments);
		});
	}

	return funcHandler;
};

// short hand for asDelegate
Function.prototype.d = function(context) {
	return this.asDelegate(context);
};

//--------------------------------------------------------------------------
//  String Extensions
//--------------------------------------------------------------------------

/**
 *  Formats a given string in a similar way as printf or the C#
 *  String.Format, except without type/precision specifiers (i.e. {0:C2}, {0:X}, etc...)
 */
String.format = function(formatString) {

	if (arguments.length > 1) {
		var template = new Template(formatString);
		var dict = {};

		for (var i = 1; i < arguments.length; i++) {
			dict[(i-1).toString()] = arguments[i];
		}

		return template.evaluate(dict);
	}

	return formatString;
};

String.formatWithObjects = function(formatString, objects) {
	return String.format.apply(formatString, objects);
};


performance = performance || {
	now: function () {
		return Date.now() - this.offset;
	},
	offset: Date.now()
};
