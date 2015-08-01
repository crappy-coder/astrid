//=====================================================================
//= MoEngine.js
//=====================================================================

/*
*  MoEnjin
*
*  Graphics development engine for building cross platform games and/or
*  rich interactive applications.
*
*  Copyright 2010-2014 Justin Thomas. All rights reserved.
*
*  Dependencies:
*    - Prototype JavaScript Framework v1.7 (prototype.js)
*
*/

/*  Prototype JavaScript framework, version 1.7
*  (c) 2005-2010 Sam Stephenson
*
*  Prototype is freely distributable under the terms of an MIT-style license.
*  For details, see the Prototype web site: http://www.prototypejs.org/
*
*  This file has been stripped from it's original version to support the
*  Mochica SDK, the only features left are basically just class inheritance
*  support. For the full original prototype.js version, see the link above.
*  
*  Modified by: Justin Thomas (justin@sweaky.com)
*
*--------------------------------------------------------------------------*/

var Prototype = {

	Version: '1.7',
	
	emptyFunction: function () { },

	K: function (x) { return x }
};

var Abstract = {};

var Try = {
	these: function () {
		var returnValue;

		for (var i = 0, length = arguments.length; i < length; i++) {
			var lambda = arguments[i];
			try {
				returnValue = lambda();
				break;
			} catch (e) { }
		}

		return returnValue;
	}
};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function () {
	
	var IS_DONTENUM_BUGGY = (function () {
		for (var p in { toString: 1 }) {
			if (p === 'toString') return false;
		}
		return true;
	})();

	function subclass() { };
	function create() {
		var parent = null, properties = $A(arguments);
		if (Object.isFunction(properties[0]))
			parent = properties.shift();
			
		function klass() {
			this.initialize.apply(this, arguments);
		}
		
		Object.extend(klass, Class.Methods);
		klass.superclass = parent;
		klass.subclasses = [];

		if (parent) {
			subclass.prototype = parent.prototype;
			klass.prototype = new subclass;
			parent.subclasses.push(klass);
		}

		for (var i = 0, length = properties.length; i < length; i++)
		{
			klass.addMethods(properties[i]);
		}

		if (!klass.prototype.initialize)
			klass.prototype.initialize = Prototype.emptyFunction;

		klass.prototype.constructor = klass;
		return klass;
	}

	function addMethods(source) {
	
		var ancestor = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

		if (IS_DONTENUM_BUGGY) {
			if (source.toString != Object.prototype.toString)
				properties.push("toString");
			if (source.valueOf != Object.prototype.valueOf)
				properties.push("valueOf");
		}

		for (var i = 0, length = properties.length; i < length; i++) {
			var property = properties[i], value = source[property];
			if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
				var method = value;
				value = (function (m) {
					return function () { return ancestor[m].apply(this, arguments); };
				})(property).wrap(method);

				value.valueOf = method.valueOf.bind(method);
				//value.toString = method.toString.bind(method);
			}
			this.prototype[property] = value;
		}

		return this;
	}

	return {
		create: create,
		Methods: {
			addMethods: addMethods
		}
	};
})();
(function () {

	var _toString = Object.prototype.toString,
      NULL_TYPE = 'Null',
      UNDEFINED_TYPE = 'Undefined',
      BOOLEAN_TYPE = 'Boolean',
      NUMBER_TYPE = 'Number',
      STRING_TYPE = 'String',
      OBJECT_TYPE = 'Object',
      FUNCTION_CLASS = '[object Function]',
      BOOLEAN_CLASS = '[object Boolean]',
      NUMBER_CLASS = '[object Number]',
      STRING_CLASS = '[object String]',
      ARRAY_CLASS = '[object Array]',
      DATE_CLASS = '[object Date]',
      NATIVE_JSON_STRINGIFY_SUPPORT = typeof JSON.stringify === 'function' &&
        JSON.stringify(0) === '0' &&
        typeof JSON.stringify(Prototype.K) === 'undefined';

	function Type(o) {
		switch (o) {
			case null: return NULL_TYPE;
			case (void 0): return UNDEFINED_TYPE;
		}
		var type = typeof o;
		switch (type) {
			case 'boolean': return BOOLEAN_TYPE;
			case 'number': return NUMBER_TYPE;
			case 'string': return STRING_TYPE;
		}
		return OBJECT_TYPE;
	}

	function extend(destination, source) {
		for (var property in source)
			destination[property] = source[property];
		return destination;
	}

	function inspect(object) {
		try {
			if (isUndefined(object)) return 'undefined';
			if (object === null) return 'null';
			return object.inspect ? object.inspect() : String(object);
		} catch (e) {
			if (e instanceof RangeError) return '...';
			throw e;
		}
	}

	function toJSON(value) {
		return Str('', { '': value }, []);
	}

	function Str(key, holder, stack) {
		var value = holder[key],
        type = typeof value;

		if (Type(value) === OBJECT_TYPE && typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}

		var _class = _toString.call(value);

		switch (_class) {
			case NUMBER_CLASS:
			case BOOLEAN_CLASS:
			case STRING_CLASS:
				value = value.valueOf();
		}

		switch (value) {
			case null: return 'null';
			case true: return 'true';
			case false: return 'false';
		}

		type = typeof value;
		switch (type) {
			case 'string':
				return value.inspect(true);
			case 'number':
				return isFinite(value) ? String(value) : 'null';
			case 'object':

				for (var i = 0, length = stack.length; i < length; i++) {
					if (stack[i] === value) { throw new TypeError(); }
				}
				stack.push(value);

				var partial = [];
				if (_class === ARRAY_CLASS) {
					for (var i = 0, length = value.length; i < length; i++) {
						var str = Str(i, value, stack);
						partial.push(typeof str === 'undefined' ? 'null' : str);
					}
					partial = '[' + partial.join(',') + ']';
				} else {
					var keys = Object.keys(value);
					for (var i = 0, length = keys.length; i < length; i++) {
						var key = keys[i], str = Str(key, value, stack);
						if (typeof str !== "undefined") {
							partial.push(key.inspect(true) + ':' + str);
						}
					}
					partial = '{' + partial.join(',') + '}';
				}
				stack.pop();
				return partial;
		}
	}

	function stringify(object) {
		return JSON.stringify(object);
	}

	function toQueryString(object) {
		return $H(object).toQueryString();
	}

	function toHTML(object) {
		return object && object.toHTML ? object.toHTML() : String.interpret(object);
	}

	function keys(object) {
		if (Type(object) !== OBJECT_TYPE) { throw new TypeError(); }
		var results = [];
		for (var property in object) {
			if (object.hasOwnProperty(property)) {
				results.push(property);
			}
		}
		return results;
	}

	function values(object) {
		var results = [];
		for (var property in object)
			results.push(object[property]);
		return results;
	}

	function clone(object) {
		return extend({}, object);
	}

	function isElement(object) {
		return !!(object && object.nodeType == 1);
	}

	function isArray(object) {
		return _toString.call(object) === ARRAY_CLASS;
	}

	var hasNativeIsArray = (typeof Array.isArray == 'function')
    && Array.isArray([]) && !Array.isArray({});

	if (hasNativeIsArray) {
		isArray = Array.isArray;
	}

	function isHash(object) {
		return object instanceof Hash;
	}

	function isFunction(object) {
		return _toString.call(object) === FUNCTION_CLASS;
	}

	function isString(object) {
		return _toString.call(object) === STRING_CLASS;
	}

	function isNumber(object) {
		return _toString.call(object) === NUMBER_CLASS;
	}

	function isDate(object) {
		return _toString.call(object) === DATE_CLASS;
	}

	function isUndefined(object) {
		return typeof object === "undefined";
	}

	extend(Object, {
		extend: extend,
		inspect: inspect,
		toJSON: NATIVE_JSON_STRINGIFY_SUPPORT ? stringify : toJSON,
		toQueryString: toQueryString,
		toHTML: toHTML,
		keys: Object.keys || keys,
		values: values,
		clone: clone,
		isElement: isElement,
		isArray: isArray,
		isHash: isHash,
		isFunction: isFunction,
		isString: isString,
		isNumber: isNumber,
		isDate: isDate,
		isUndefined: isUndefined
	});
})();
Object.extend(Function.prototype, (function () {
	var slice = Array.prototype.slice;

	function update(array, args) {
		var arrayLength = array.length, length = args.length;
		while (length--) array[arrayLength + length] = args[length];
		return array;
	}

	function merge(array, args) {
		array = slice.call(array, 0);
		return update(array, args);
	}

	function argumentNames() {
		var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
		return names.length == 1 && !names[0] ? [] : names;
	}

	function bind(context) {
		if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
		var __method = this, args = slice.call(arguments, 1);
		return function () {
			var a =  merge(args, arguments);
			return __method.apply(context, a);
		}
	}

	function bindAsEventListener(context) {
		var __method = this, args = slice.call(arguments, 1);
		return function (event) {
			var a = update([event || window.event], args);
			return __method.apply(context, a);
		}
	}

	function curry() {
		if (!arguments.length) return this;
		var __method = this, args = slice.call(arguments, 0);
		return function () {
			var a = merge(args, arguments);
			return __method.apply(this, a);
		}
	}

	function delay(timeout) {
		var __method = this, args = slice.call(arguments, 1);
		timeout = timeout * 1000;
		return window.setTimeout(function () {
			return __method.apply(__method, args);
		}, timeout);
	}

	function defer() {
		var args = update([0.01], arguments);
		return this.delay.apply(this, args);
	}

	function wrap(wrapper) {
		var __method = this;
		return function () {
			var a = update([__method.bind(this)], arguments);
			return wrapper.apply(this, a);
		}
	}

	function methodize() {
		if (this._methodized) return this._methodized;
		var __method = this;
		return this._methodized = function () {
			var a = update([this], arguments);
			return __method.apply(null, a);
		};
	}

	return {
		argumentNames: argumentNames,
		bind: bind,
		bindAsEventListener: bindAsEventListener,
		curry: curry,
		delay: delay,
		defer: defer,
		wrap: wrap,
		methodize: methodize
	}
})());



(function (proto) {


	function toISOString() {
		return this.getUTCFullYear() + '-' +
      (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
      this.getUTCDate().toPaddedString(2) + 'T' +
      this.getUTCHours().toPaddedString(2) + ':' +
      this.getUTCMinutes().toPaddedString(2) + ':' +
      this.getUTCSeconds().toPaddedString(2) + 'Z';
	}


	function toJSON() {
		return this.toISOString();
	}

	if (!proto.toISOString) proto.toISOString = toISOString;
	if (!proto.toJSON) proto.toJSON = toJSON;

})(Date.prototype);


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function (str) {
	return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
	initialize: function (callback, frequency) {
		this.callback = callback;
		this.frequency = frequency;
		this.currentlyExecuting = false;

		this.registerCallback();
	},

	registerCallback: function () {
		this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
	},

	execute: function () {
		this.callback(this);
	},

	stop: function () {
		if (!this.timer) return;
		clearInterval(this.timer);
		this.timer = null;
	},

	onTimerEvent: function () {
		if (!this.currentlyExecuting) {
			try {
				this.currentlyExecuting = true;
				this.execute();
				this.currentlyExecuting = false;
			} catch (e) {
				this.currentlyExecuting = false;
				throw e;
			}
		}
	}
});
Object.extend(String, {
	interpret: function (value) {
		return value == null ? '' : String(value);
	},
	specialChar: {
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'\\': '\\\\'
	}
});

Object.extend(String.prototype, (function () {
	var NATIVE_JSON_PARSE_SUPPORT = typeof JSON.parse === 'function' &&
    JSON.parse('{"test": true}').test;

	function prepareReplacement(replacement) {
		if (Object.isFunction(replacement)) return replacement;
		var template = new Template(replacement);
		return function (match) { return template.evaluate(match) };
	}

	function gsub(pattern, replacement) {
		var result = '', source = this, match;
		replacement = prepareReplacement(replacement);

		if (Object.isString(pattern))
			pattern = RegExp.escape(pattern);

		if (!(pattern.length || pattern.source)) {
			replacement = replacement('');
			return replacement + source.split('').join(replacement) + replacement;
		}

		while (source.length > 0) {
			if (match = source.match(pattern)) {
				result += source.slice(0, match.index);
				result += String.interpret(replacement(match));
				source = source.slice(match.index + match[0].length);
			} else {
				result += source, source = '';
			}
		}
		return result;
	}

	function sub(pattern, replacement, count) {
		replacement = prepareReplacement(replacement);
		count = Object.isUndefined(count) ? 1 : count;

		return this.gsub(pattern, function (match) {
			if (--count < 0) return match[0];
			return replacement(match);
		});
	}

	function scan(pattern, iterator) {
		this.gsub(pattern, iterator);
		return String(this);
	}

	function truncate(length, truncation) {
		length = length || 30;
		truncation = Object.isUndefined(truncation) ? '...' : truncation;
		return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
	}

	function strip() {
		return this.replace(/^\s+/, '').replace(/\s+$/, '');
	}

	function stripTags() {
		return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
	}

	function stripScripts() {
		return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
	}

	function extractScripts() {
		var matchAll = new RegExp(Prototype.ScriptFragment, 'img'),
        matchOne = new RegExp(Prototype.ScriptFragment, 'im');
		return (this.match(matchAll) || []).map(function (scriptTag) {
			return (scriptTag.match(matchOne) || ['', ''])[1];
		});
	}

	function evalScripts() {
		return this.extractScripts().map(function (script) { return eval(script) });
	}

	function escapeHTML() {
		return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	function unescapeHTML() {
		return this.stripTags().replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
	}


	function toQueryParams(separator) {
		var match = this.strip().match(/([^?#]*)(#.*)?$/);
		if (!match) return {};

		return match[1].split(separator || '&').inject({}, function (hash, pair) {
			if ((pair = pair.split('='))[0]) {
				var key = decodeURIComponent(pair.shift()),
            value = pair.length > 1 ? pair.join('=') : pair[0];

				if (value != undefined) value = decodeURIComponent(value);

				if (key in hash) {
					if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
					hash[key].push(value);
				}
				else hash[key] = value;
			}
			return hash;
		});
	}

	function toArray() {
		return this.split('');
	}

	function succ() {
		return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
	}

	function times(count) {
		return count < 1 ? '' : new Array(count + 1).join(this);
	}

	function camelize() {
		return this.replace(/-+(.)?/g, function (match, chr) {
			return chr ? chr.toUpperCase() : '';
		});
	}

	function capitalize() {
		return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
	}

	function underscore() {
		return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
	}

	function dasherize() {
		return this.replace(/_/g, '-');
	}

	function inspect(useDoubleQuotes) {
		var escapedString = this.replace(/[\x00-\x1f\\]/g, function (character) {
			if (character in String.specialChar) {
				return String.specialChar[character];
			}
			return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
		});
		if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
		return "'" + escapedString.replace(/'/g, '\\\'') + "'";
	}

	function unfilterJSON(filter) {
		return this.replace(filter || Prototype.JSONFilter, '$1');
	}

	function isJSON() {
		var str = this;
		if (str.blank()) return false;
		str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
		str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
		str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
		return (/^[\],:{}\s]*$/).test(str);
	}

	function evalJSON(sanitize) {
		var json = this.unfilterJSON(),
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
		if (cx.test(json)) {
			json = json.replace(cx, function (a) {
				return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			});
		}
		try {
			if (!sanitize || json.isJSON()) return eval('(' + json + ')');
		} catch (e) { }
		throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
	}

	function parseJSON() {
		var json = this.unfilterJSON();
		return JSON.parse(json);
	}

	function include(pattern) {
		return this.indexOf(pattern) > -1;
	}

	function startsWith(pattern) {
		return this.lastIndexOf(pattern, 0) === 0;
	}

	function endsWith(pattern) {
		var d = this.length - pattern.length;
		return d >= 0 && this.indexOf(pattern, d) === d;
	}

	function empty() {
		return this == '';
	}

	function blank() {
		return /^\s*$/.test(this);
	}

	function interpolate(object, pattern) {
		return new Template(this, pattern).evaluate(object);
	}

	return {
		gsub: gsub,
		sub: sub,
		scan: scan,
		truncate: truncate,
		strip: String.prototype.trim || strip,
		stripTags: stripTags,
		stripScripts: stripScripts,
		extractScripts: extractScripts,
		evalScripts: evalScripts,
		escapeHTML: escapeHTML,
		unescapeHTML: unescapeHTML,
		toQueryParams: toQueryParams,
		parseQuery: toQueryParams,
		toArray: toArray,
		succ: succ,
		times: times,
		camelize: camelize,
		capitalize: capitalize,
		underscore: underscore,
		dasherize: dasherize,
		inspect: inspect,
		unfilterJSON: unfilterJSON,
		isJSON: isJSON,
		evalJSON: NATIVE_JSON_PARSE_SUPPORT ? parseJSON : evalJSON,
		include: include,
		startsWith: startsWith,
		endsWith: endsWith,
		empty: empty,
		blank: blank,
		interpolate: interpolate
	};
})());

var Template = Class.create({
	initialize: function (template, pattern) {
		this.template = template.toString();
		this.pattern = pattern || Template.Pattern;
	},

	evaluate: function (object) {
		if (object && Object.isFunction(object.toTemplateReplacements))
			object = object.toTemplateReplacements();

		return this.template.gsub(this.pattern, function (match) {
			if (object == null) return (match[1] + '');

			var before = match[1] || '';
			if (before == '\\') return match[2];

			var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

			match = pattern.exec(expr);
			if (match == null) return before;

			while (match != null) {
				var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
				ctx = ctx[comp];
				if (null == ctx || '' == match[3]) break;
				expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
				match = pattern.exec(expr);
			}

			return before + String.interpret(ctx);
		});
	}
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = {};

var Enumerable = (function () {
	function each(iterator, context) {
		var index = 0;
		try {
			this._each(function (value) {
				iterator.call(context, value, index++);
			});
		} catch (e) {
			if (e != $break) throw e;
		}
		return this;
	}

	function eachSlice(number, iterator, context) {
		var index = -number, slices = [], array = this.toArray();
		if (number < 1) return array;
		while ((index += number) < array.length)
			slices.push(array.slice(index, index + number));
		return slices.collect(iterator, context);
	}

	function all(iterator, context) {
		iterator = iterator || Prototype.K;
		var result = true;
		this.each(function (value, index) {
			result = result && !!iterator.call(context, value, index);
			if (!result) throw $break;
		});
		return result;
	}

	function any(iterator, context) {
		iterator = iterator || Prototype.K;
		var result = false;
		this.each(function (value, index) {
			if (result = !!iterator.call(context, value, index))
				throw $break;
		});
		return result;
	}

	function collect(iterator, context) {
		iterator = iterator || Prototype.K;
		var results = [];
		this.each(function (value, index) {
			results.push(iterator.call(context, value, index));
		});
		return results;
	}

	function detect(iterator, context) {
		var result;
		this.each(function (value, index) {
			if (iterator.call(context, value, index)) {
				result = value;
				throw $break;
			}
		});
		return result;
	}

	function findAll(iterator, context) {
		var results = [];
		this.each(function (value, index) {
			if (iterator.call(context, value, index))
				results.push(value);
		});
		return results;
	}

	function grep(filter, iterator, context) {
		iterator = iterator || Prototype.K;
		var results = [];

		if (Object.isString(filter))
			filter = new RegExp(RegExp.escape(filter));

		this.each(function (value, index) {
			if (filter.match(value))
				results.push(iterator.call(context, value, index));
		});
		return results;
	}

	function include(object) {
		if (Object.isFunction(this.indexOf))
			if (this.indexOf(object) != -1) return true;

		var found = false;
		this.each(function (value) {
			if (value == object) {
				found = true;
				throw $break;
			}
		});
		return found;
	}

	function inGroupsOf(number, fillWith) {
		fillWith = Object.isUndefined(fillWith) ? null : fillWith;
		return this.eachSlice(number, function (slice) {
			while (slice.length < number) slice.push(fillWith);
			return slice;
		});
	}

	function inject(memo, iterator, context) {
		this.each(function (value, index) {
			memo = iterator.call(context, memo, value, index);
		});
		return memo;
	}

	function invoke(method) {
		var args = $A(arguments).slice(1);
		return this.map(function (value) {
			return value[method].apply(value, args);
		});
	}

	function max(iterator, context) {
		iterator = iterator || Prototype.K;
		var result;
		this.each(function (value, index) {
			value = iterator.call(context, value, index);
			if (result == null || value >= result)
				result = value;
		});
		return result;
	}

	function min(iterator, context) {
		iterator = iterator || Prototype.K;
		var result;
		this.each(function (value, index) {
			value = iterator.call(context, value, index);
			if (result == null || value < result)
				result = value;
		});
		return result;
	}

	function partition(iterator, context) {
		iterator = iterator || Prototype.K;
		var trues = [], falses = [];
		this.each(function (value, index) {
			(iterator.call(context, value, index) ?
        trues : falses).push(value);
		});
		return [trues, falses];
	}

	function pluck(property) {
		var results = [];
		this.each(function (value) {
			results.push(value[property]);
		});
		return results;
	}

	function reject(iterator, context) {
		var results = [];
		this.each(function (value, index) {
			if (!iterator.call(context, value, index))
				results.push(value);
		});
		return results;
	}

	function sortBy(iterator, context) {
		return this.map(function (value, index) {
			return {
				value: value,
				criteria: iterator.call(context, value, index)
			};
		}).sort(function (left, right) {
			var a = left.criteria, b = right.criteria;
			return a < b ? -1 : a > b ? 1 : 0;
		}).pluck('value');
	}

	function toArray() {
		return this.map();
	}

	function zip() {
		var iterator = Prototype.K, args = $A(arguments);
		if (Object.isFunction(args.last()))
			iterator = args.pop();

		var collections = [this].concat(args).map($A);
		return this.map(function (value, index) {
			return iterator(collections.pluck(index));
		});
	}

	function size() {
		return this.toArray().length;
	}

	function inspect() {
		return '#<Enumerable:' + this.toArray().inspect() + '>';
	}









	return {
		each: each,
		eachSlice: eachSlice,
		all: all,
		every: all,
		any: any,
		some: any,
		collect: collect,
		map: collect,
		detect: detect,
		findAll: findAll,
		select: findAll,
		filter: findAll,
		grep: grep,
		include: include,
		member: include,
		inGroupsOf: inGroupsOf,
		inject: inject,
		invoke: invoke,
		max: max,
		min: min,
		partition: partition,
		pluck: pluck,
		reject: reject,
		sortBy: sortBy,
		toArray: toArray,
		entries: toArray,
		zip: zip,
		size: size,
		inspect: inspect,
		find: detect
	};
})();

function $A(iterable) {
	if (!iterable) return [];
	if ('toArray' in Object(iterable)) return iterable.toArray();
	var length = iterable.length || 0, results = new Array(length);
	while (length--) results[length] = iterable[length];
	return results;
}


function $w(string) {
	if (!Object.isString(string)) return [];
	string = string.strip();
	return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function () {
	var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

	function each(iterator, context) {
		for (var i = 0, length = this.length >>> 0; i < length; i++) {
			if (i in this) iterator.call(context, this[i], i, this);
		}
	}
	if (!_each) _each = each;

	function clear() {
		this.length = 0;
		return this;
	}

	function first() {
		return this[0];
	}

	function last() {
		return this[this.length - 1];
	}

	function compact() {
		return this.select(function (value) {
			return value != null;
		});
	}

	function flatten() {
		return this.inject([], function (array, value) {
			if (Object.isArray(value))
				return array.concat(value.flatten());
			array.push(value);
			return array;
		});
	}

	function without() {
		var values = slice.call(arguments, 0);
		return this.select(function (value) {
			return !values.include(value);
		});
	}

	function reverse(inline) {
		return (inline === false ? this.toArray() : this)._reverse();
	}

	function uniq(sorted) {
		return this.inject([], function (array, value, index) {
			if (0 == index || (sorted ? array.last() != value : !array.include(value)))
				array.push(value);
			return array;
		});
	}

	function intersect(array) {
		return this.uniq().findAll(function (item) {
			return array.detect(function (value) { return item === value });
		});
	}


	function clone() {
		return slice.call(this, 0);
	}

	function size() {
		return this.length;
	}

	function inspect() {
		return '[' + this.map(Object.inspect).join(', ') + ']';
	}

	function indexOf(item, i) {
		i || (i = 0);
		var length = this.length;
		if (i < 0) i = length + i;
		for (; i < length; i++)
			if (this[i] === item) return i;
		return -1;
	}

	function lastIndexOf(item, i) {
		i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
		var n = this.slice(0, i).reverse().indexOf(item);
		return (n < 0) ? n : i - n - 1;
	}

	function concat() {
		var array = slice.call(this, 0), item;
		for (var i = 0, length = arguments.length; i < length; i++) {
			item = arguments[i];
			if (Object.isArray(item) && !('callee' in item)) {
				for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
					array.push(item[j]);
			} else {
				array.push(item);
			}
		}
		return array;
	}

	Object.extend(arrayProto, Enumerable);

	if (!arrayProto._reverse)
		arrayProto._reverse = arrayProto.reverse;

	Object.extend(arrayProto, {
		_each: _each,
		clear: clear,
		first: first,
		last: last,
		compact: compact,
		flatten: flatten,
		without: without,
		reverse: reverse,
		uniq: uniq,
		intersect: intersect,
		clone: clone,
		toArray: clone,
		size: size,
		inspect: inspect
	});

	var CONCAT_ARGUMENTS_BUGGY = (function () {
		return [].concat(arguments)[0][0] !== 1;
	})(1, 2)

	if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

	if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
	if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
	return new Hash(object);
};

var Hash = Class.create(Enumerable, (function () {
	function initialize(object) {
		this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
	}


	function _each(iterator) {
		for (var key in this._object) {
			var value = this._object[key], pair = [key, value];
			pair.key = key;
			pair.value = value;
			iterator(pair);
		}
	}

	function set(key, value) {
		return this._object[key] = value;
	}

	function get(key) {
		if (this._object[key] !== Object.prototype[key])
			return this._object[key];
	}

	function unset(key) {
		var value = this._object[key];
		delete this._object[key];
		return value;
	}

	function toObject() {
		return Object.clone(this._object);
	}



	function keys() {
		return this.pluck('key');
	}

	function values() {
		return this.pluck('value');
	}

	function index(value) {
		var match = this.detect(function (pair) {
			return pair.value === value;
		});
		return match && match.key;
	}

	function merge(object) {
		return this.clone().update(object);
	}

	function update(object) {
		return new Hash(object).inject(this, function (result, pair) {
			result.set(pair.key, pair.value);
			return result;
		});
	}

	function toQueryPair(key, value) {
		if (Object.isUndefined(value)) return key;
		return key + '=' + encodeURIComponent(String.interpret(value));
	}

	function toQueryString() {
		return this.inject([], function (results, pair) {
			var key = encodeURIComponent(pair.key), values = pair.value;

			if (values && typeof values == 'object') {
				if (Object.isArray(values)) {
					var queryValues = [];
					for (var i = 0, len = values.length, value; i < len; i++) {
						value = values[i];
						queryValues.push(toQueryPair(key, value));
					}
					return results.concat(queryValues);
				}
			} else results.push(toQueryPair(key, values));
			return results;
		}).join('&');
	}

	function inspect() {
		return '#<Hash:{' + this.map(function (pair) {
			return pair.map(Object.inspect).join(': ');
		}).join(', ') + '}>';
	}

	function clone() {
		return new Hash(this);
	}

	return {
		initialize: initialize,
		_each: _each,
		set: set,
		get: get,
		unset: unset,
		toObject: toObject,
		toTemplateReplacements: toObject,
		keys: keys,
		values: values,
		index: index,
		merge: merge,
		update: update,
		toQueryString: toQueryString,
		inspect: inspect,
		toJSON: toObject,
		clone: clone
	};
})());

Hash.from = $H;
Object.extend(Number.prototype, (function () {
	function toColorPart() {
		return this.toPaddedString(2, 16);
	}

	function succ() {
		return this + 1;
	}

	function times(iterator, context) {
		$R(0, this, true).each(iterator, context);
		return this;
	}

	function toPaddedString(length, radix) {
		var string = this.toString(radix || 10);
		return '0'.times(length - string.length) + string;
	}

	function abs() {
		return Math.abs(this);
	}

	function round() {
		return Math.round(this);
	}

	function ceil() {
		return Math.ceil(this);
	}

	function floor() {
		return Math.floor(this);
	}

	return {
		toColorPart: toColorPart,
		succ: succ,
		times: times,
		toPaddedString: toPaddedString,
		abs: abs,
		round: round,
		ceil: ceil,
		floor: floor
	};
})());

function $R(start, end, exclusive) {
	return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function () {
	function initialize(start, end, exclusive) {
		this.start = start;
		this.end = end;
		this.exclusive = exclusive;
	}

	function _each(iterator) {
		var value = this.start;
		while (this.include(value)) {
			iterator(value);
			value = value.succ();
		}
	}

	function include(value) {
		if (value < this.start)
			return false;
		if (this.exclusive)
			return value < this.end;
		return value <= this.end;
	}

	return {
		initialize: initialize,
		_each: _each,
		include: include
	};
})());

//--------------------------------------------------------------------------
//  Array Extensions
//--------------------------------------------------------------------------

Array.prototype.contains = function(item) {
	return (this.indexOf(item) != -1);
};

Array.prototype.remove = function(item) {	
	for(var i = this.length-1; i >= 0; i--)
	{
		if(this[i] == item)
			this.removeAt(i);
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
	if(this.eventHandlerTable == null)
	{
		this.eventHandlerTable = [];
		return null;
	}

	// iterate through the table and see if we can find the handler
	// for the specified context, this way we can have multiple handlers
	// for each unique object context
	var len = this.eventHandlerTable.length;

	for(var i = 0; i < len; ++i)
	{
		if(this.eventHandlerTable[i].context == context)
			return this.eventHandlerTable[i].handler;
	}

	return null;
};

Function.prototype.createEventHandler$ = function(context, handler) {
	this.eventHandlerTable.push({context:context, handler:handler});
	
	return handler;
};

Function.prototype.executeHandler = function() {

};

Function.prototype.asDelegate = function(context) {

	if(arguments.length != 1)
		throw new Error("Invalid number of arguments. expected: 1, actual: " + arguments.length.toString());
		
	// if the context is null then just return this function
	if (Object.isUndefined(context))
		return this;

	// see if we can find an existing handler, otherwise
	// create one
	var funcImpl = this;
	var funcHandler = this.findEventHandler$(context);
	
	if(funcHandler == null)
	{
		return this.createEventHandler$(context, function handlerFunc() {
            var ctx = context;
            var args = arguments;
            
			return funcImpl.apply(ctx, args);
		});
	}

	return funcHandler;
};

// short hand for asDelegate
Function.prototype.d = function(context) {
	return this.asDelegate(context);
}

//--------------------------------------------------------------------------
//  String Extensions
//--------------------------------------------------------------------------

/**
 *  Formats a given string in a similar way as printf or the C# 
 *  String.Format, except without type/precision specifiers (i.e. {0:C2}, {0:X}, etc...)
 */
String.format = function(formatString) {

	if(arguments.length > 1)
	{
		var template = new Template(formatString);
		var dict = {};

		for(var i = 1; i < arguments.length; i++)
			dict[(i-1).toString()] = arguments[i];
			
		return template.evaluate(dict);
	}

	return formatString;
};

String.formatWithObjects = function(formatString, objects) {
	return String.format.apply(formatString, objects);
};


//--------------------------------------------------------------------------
//  Sweaky2D Root Class/Namespace
//--------------------------------------------------------------------------

MoDebugLevel = {
	"Normal"	: 1,
	"Info"		: 2,
	"Warning"	: 3,
	"Error"		: 4
};

MoVersion = "1.0";
MoPrintMeasureOrder = false;
MoPrintLayoutOrder = false;
MoCachedTextures = null;
MoDegreeToRadian = Math.PI / 180;
MoRadianToDegree = 180 /  Math.PI;
MoMaxInt =  0x7fffffff;
MoMinInt = -2147483648;
MoMaxFloat = Number.MAX_VALUE;
MoMinFloat = Number.MIN_VALUE;
MoMaxShort =  0x7fff;
MoMinShort = -32768;
MoMaxByte = 255;
MoMinByte = 0;
MoNegativeInfinity = Number.NEGATIVE_INFINITY;
MoPositiveInfinity = Number.POSITIVE_INFINITY;
MoEpsilon = Math.pow(2, -52);
MoTraceElement = null;
MoNullGamepads = [null,null,null,null];
MoPerformanceMarks = null;

MoPerfMark = function(name) {
	if(MoIsNull(MoPerformanceMarks))
		MoPerformanceMarks = new MoStack();
		
	MoPerformanceMarks.push({
		t : new Date(),
		id : name
	});
};

MoPerfUnmark = function() {
	if(MoIsNull(MoPerformanceMarks))
		MoPerformanceMarks = new MoStack();

	if(MoPerformanceMarks.isEmpty())
		return;
	
	var d = new Date();
	var mark = MoPerformanceMarks.pop();
	var t = (d - mark.t);

	console.log("@@ " + mark.id + ": " + t);
};

MoEnsureTextureCache = function() {
	if(MoCachedTextures == null)
		MoCachedTextures = new MoDictionary();
};

MoTextureCacheAdd = function(path, data) {
	MoEnsureTextureCache();
	MoCachedTextures.set(path, data);
};

MoTextureCacheRemove = function(path) {
	MoEnsureTextureCache();
	MoCachedTextures.remove(path);
};

MoTextureCacheGet = function(path) {
	MoEnsureTextureCache();
	return MoCachedTextures.get(path);
};

MoTextureCacheClear = function() {
	MoEnsureTextureCache();
	MoCachedTextures.clear();
};

// TODO: refactor all this ugly debug/trace

MoDebugWrite = function(msg, level) {
	if(console)
	{
		console.log("MoDebugWrite");
		console.log(msg);
		return;
		
		var arr = [];
		arr.push(msg);

		for(var i = 2; i < arguments.length; ++i)
			arr.push(arguments[i]);

		var fmsg = String.formatWithObjects(msg, arr);

		
		// TODO : need to add better console support to the
		// 		  native host, for now, only log is supported
		if(MoIsNativeHost())
			console.log(fmsg);
		else
		{
			switch(level)
			{
				case MoDebugLevel.Info:
					console.info(fmsg);
					break;
				case MoDebugLevel.Warning:
					console.warn(fmsg);
					break;
				case MoDebugLevel.Error:
					console.error(fmsg);
					break;
				default:
					console.log(fmsg);
					break;
			}
		}
	}
};

MoDebugClear = function() {
	if(console)
		console.clear();
};

MoTraceWrite = function(msg) {
	if(MoTraceElement == null)
	{
		MoTraceElement = document.createElement("div");
		MoTraceElement.style.border = "solid 2px #CCCCCC";
		MoTraceElement.style.padding = "5px";
		MoTraceElement.style.backgroundColor = "#FBFBEF";
		MoTraceElement.style.overflow = "auto";
		MoTraceElement.style.height = "200px";
		MoTraceElement.style.fontFamily = "Arial";
		MoTraceElement.style.fontSize = "12px";
		
		document.body.appendChild(MoTraceElement);
	}

	var span = document.createElement("span");
	span.innerHTML = String.formatWithObjects(msg, arguments);
	
	//MoTraceElement.appendChild(document.createTextNode(String.formatWithObjects(msg, arguments)));
	MoTraceElement.appendChild(span);
	MoTraceElement.scrollTop = MoTraceElement.scrollHeight;
};

MoTraceWriteLine = function(msg) {
	MoTraceWrite(String.formatWithObjects(msg, arguments));
	MoTraceElement.appendChild(document.createElement("br"));
};

MoTraceClear = function() {
	if(MoTraceElement != null)
	{
		document.body.removeChild(MoTraceElement);
		MoTraceElement = null;
	}
};

MoLogEvents = function(domElement /** ... **/) {
	var len = arguments.length;
	var extraData = null;
	var arg = null;
	var obj = null;
	
	if(len > 0 && arguments[len-1] instanceof Array)
	{
		extraData = arguments[len-1];
		len -= 1;
	}
	
	obj = { 
			callback: function(e) {
				var str = "";
				
				if(this.extraData != null)
				{
					for(var i = 0; i < this.extraData.length; ++i)
					{
						str += this.extraData[i] + "=" + e.target[this.extraData[i]];
						
						if(i < this.extraData.length-1)
							str += ", ";
					}
				}
				
				console.log("%c[EVENT] - %s (%s)", "color:blue;font-weight:bold", e.type, str);
			},
			extraData: extraData };

	for(var i = 1; i < len; ++i)
	{
		arg = arguments[i];
		domElement.addEventListener(arg, obj.callback.bind(obj), false);
	}
};

MoIsNativeHost = function() {
	return !MoIsNull(window.isNativeHost);
};

MoIsWindows = function() {
	return (MoSystem.getPlatformName() == "Windows");
};

MoIsMac = function() {
	return (MoSystem.getPlatformName() == "Macintosh");
};

MoIsLinux = function() {
	return (MoSystem.getPlatformName() == "Linux");
};

MoIsChrome = function() {
	return (MoSystem.getSystemModel() == "Chrome");
};

MoIsFirefox = function() {
	return (MoSystem.getSystemModel() == "Firefox");
};

MoIsIE = function() {
	return (MoSystem.getSystemModel() == "Internet Explorer");
};

MoIsSafari = function() {
	return (MoSystem.getSystemModel() == "Safari");
};

MoGetPlatformType = function() {
	if(MoIsNativeHost())
		return window.nativePlatformName;

	// check for mobile browser
	var ua = (navigator.userAgent || navigator.vendor || window.opera);

	if(/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4)))
		return "mobile-web";

	return "web";
};

MoGetTimer = function() {
	return MoApplication.getInstance().getRunningTime();
};

MoCreateHttpRequestObject = function() {
	if(window.XMLHttpRequest)
		return new XMLHttpRequest();
	else
		return new ActiveXObject("Microsoft.XMLHTTP");

	return null;
};

MoRequestAnimationFrame = function(callback, element) {
	
	// TODO : need to fix for native platform
	//return window.requestAnimationFrame(callback);
	
	var nativeFunc = 
			window.requestAnimationFrame 		||
			window.webkitRequestAnimationFrame 	||
			window.mozRequestAnimationFrame 	||
			window.oRequestAnimationFrame 		||
			window.msRequestAnimationFrame 		||
			
			function(callback) {
				return window.setTimeout(function() {
					callback(Date.now()); }, 0);
			};
			
	return nativeFunc(callback);
};

MoGamepads = function() {
	return (navigator.getGamepads ? navigator.getGamepads() : (navigator.gamepads || navigator.webkitGamepads || navigator.mozGamepads || MoNullGamepads));
};

MoValueOrDefault = function(value, defaultValue) {
	return ((value == undefined || value == null) ? defaultValue : value);
};

MoIsNull = function(value) {
	return (value == undefined || value == null);
};

MoStringContains = function(str, value) {
	return (str.indexOf(value) != -1);
};

MoStringIsNullOrEmpty = function(value) {
	if(MoIsNull(value))
		return true;

	return (value.length == 0);
};

MoAreEqual = function(a, b) {
	if(a != null && b != null)
	{
		if((a instanceof MoEquatable) && (b instanceof MoEquatable))
		{
			if(a.constructor === b.constructor)
				return a.isEqualTo(b);
		}
		else if((a instanceof Array) && (b instanceof Array))
		{
			if(a.length != b.length)
				return false;
			
			var arrLen = a.length;
			var arrItemA = null;
			var arrItemB = null;

			for(var i = 0; i < arrLen; ++i)
			{
				arrItemA = a[i];
				arrItemB = b[i];

				if(MoAreNotEqual(arrItemA, arrItemB))
					return false;
			}

			return true;
		}
	}

	return (a == b);
};

MoAreNotEqual = function(a, b) {
	return !MoAreEqual(a, b);
};

MoEnableLocalReadPermission = function() {
	try {
		if (netscape.security.PrivilegeManager.enablePrivilege)
			netscape.security.PrivilegeManager.enablePrivilege("UniversalFileRead");
	}
	catch (e) { 
		MoDebugWrite("Unable to give local read access.", MoDebugLevel.Error);
	}
};


//--------------------------------------------------------------------------
//  Physics Object Mapping
//  
//  TODO : need to allow for multiple engines
//--------------------------------------------------------------------------

if(!MoIsNull(this["Box2D"]))
{
	var PXMatrix2D 					= Box2D.Common.Math.b2Mat22;
	var PXMatrix3D 					= Box2D.Common.Math.b2Mat33;
	var PXMath						= Box2D.Common.Math.b2Math;
	var PXSweep						= Box2D.Common.Math.b2Sweep;
	var PXTransform					= Box2D.Common.Math.b2Transform;
	var PXVector2D 					= Box2D.Common.Math.b2Vec2;
	var PXVector3D 					= Box2D.Common.Math.b2Vec3;
	var PXColor 					= Box2D.Common.b2Color;
	var PXSettings					= Box2D.Common.b2Settings;
	var PXIBroadPhase 				= Box2D.Collision.IBroadPhase;
	var PXAABB 						= Box2D.Collision.b2AABB;
	var PXCollision 				= Box2D.Collision.b2Collision;
	var PXContactID 				= Box2D.Collision.b2ContactID;
	var PXContactPoint 				= Box2D.Collision.b2ContactPoint;
	var PXDistance 					= Box2D.Collision.b2Distance;
	var PXDistanceInput 			= Box2D.Collision.b2DistanceInput;
	var PXDistanceOutput 			= Box2D.Collision.b2DistanceOutput;
	var PXDistanceProxy 			= Box2D.Collision.b2DistanceProxy;
	var PXDynamicTree 				= Box2D.Collision.b2DynamicTree;
	var PXDynamicTreeBroadPhase 	= Box2D.Collision.b2DynamicTreeBroadPhase;
	var PXDynamicTreeNode 			= Box2D.Collision.b2DynamicTreeNode;
	var PXDynamicTreePair 			= Box2D.Collision.b2DynamicTreePair;
	var PXManifold 					= Box2D.Collision.b2Manifold;
	var PXManifoldPoint 			= Box2D.Collision.b2ManifoldPoint;
	var PXPoint 					= Box2D.Collision.b2Point;
	var PXRayCastInput 				= Box2D.Collision.b2RayCastInput;
	var PXRayCastOutput 			= Box2D.Collision.b2RayCastOutput;
	var PXSeparationFunction 		= Box2D.Collision.b2SeparationFunction;
	var PXSimplex 					= Box2D.Collision.b2Simplex;
	var PXSimplexCache 				= Box2D.Collision.b2SimplexCache;
	var PXSimplexVertex 			= Box2D.Collision.b2SimplexVertex;
	var PXTimeOfImpact 				= Box2D.Collision.b2TimeOfImpact;
	var PXTOIInput 					= Box2D.Collision.b2TOIInput;
	var PXWorldManifold 			= Box2D.Collision.b2WorldManifold;
	var PXShape 					= Box2D.Collision.Shapes.b2Shape;
	var PXCircleShape 				= Box2D.Collision.Shapes.b2CircleShape;
	var PXEdgeShape 				= Box2D.Collision.Shapes.b2EdgeShape;
	var PXEdgeChainDef 				= Box2D.Collision.Shapes.b2EdgeChainDef;
	var PXPolygonShape 				= Box2D.Collision.Shapes.b2PolygonShape;
	var PXMassData 					= Box2D.Collision.Shapes.b2MassData;
	var PXContactListener 			= Box2D.Dynamics.b2ContactListener;
	var PXDestructionListener 		= Box2D.Dynamics.b2DestructionListener;
	var PXBody 						= Box2D.Dynamics.b2Body;
	var PXBodyDef 					= Box2D.Dynamics.b2BodyDef;
	var PXContactFilter 			= Box2D.Dynamics.b2ContactFilter;
	var PXContactImpulse 			= Box2D.Dynamics.b2ContactImpulse;
	var PXContactManager 			= Box2D.Dynamics.b2ContactManager;
	var PXDebugDraw 				= Box2D.Dynamics.b2DebugDraw;
	var PXFilterData 				= Box2D.Dynamics.b2FilterData;
	var PXFixture 					= Box2D.Dynamics.b2Fixture;
	var PXFixtureDef 				= Box2D.Dynamics.b2FixtureDef;
	var PXIsland 					= Box2D.Dynamics.b2Island;
	var PXTimeStep 					= Box2D.Dynamics.b2TimeStep;
	var PXWorld	 					= Box2D.Dynamics.b2World;
	var PXContact 					= Box2D.Dynamics.Contacts.b2Contact;
	var PXCircleContact 			= Box2D.Dynamics.Contacts.b2CircleContact;
	var PXContactConstraint 		= Box2D.Dynamics.Contacts.b2ContactConstraint;
	var PXContactConstraintPoint 	= Box2D.Dynamics.Contacts.b2ContactConstraintPoint;
	var PXContactEdge				= Box2D.Dynamics.Contacts.b2ContactEdge;
	var PXContactFactory 			= Box2D.Dynamics.Contacts.b2ContactFactory;
	var PXContactRegister 			= Box2D.Dynamics.Contacts.b2ContactRegister;
	var PXContactResult 			= Box2D.Dynamics.Contacts.b2ContactResult;
	var PXContactSolver 			= Box2D.Dynamics.Contacts.b2ContactSolver;
	var PXNullContact 				= Box2D.Dynamics.Contacts.b2NullContact;
	var PXEdgeAndCircleContact 		= Box2D.Dynamics.Contacts.b2EdgeAndCircleContact;
	var PXPolyAndCircleContact 		= Box2D.Dynamics.Contacts.b2PolyAndCircleContact;
	var PXPolyAndEdgeContact 		= Box2D.Dynamics.Contacts.b2PolyAndEdgeContact;
	var PXPolygonContact 			= Box2D.Dynamics.Contacts.b2PolygonContact;
	var PXPositionSolverManifold 	= Box2D.Dynamics.Contacts.b2PositionSolverManifold;
	var PXBuoyancyController 		= Box2D.Dynamics.Controllers.b2BuoyancyController;
	var PXConstantAccelController 	= Box2D.Dynamics.Controllers.b2ConstantAccelController;
	var PXConstantForceController 	= Box2D.Dynamics.Controllers.b2ConstantForceController;
	var PXController 				= Box2D.Dynamics.Controllers.b2Controller;
	var PXControllerEdge 			= Box2D.Dynamics.Controllers.b2ControllerEdge;
	var PXGravityController 		= Box2D.Dynamics.Controllers.b2GravityController;
	var PXTensorDampingController 	= Box2D.Dynamics.Controllers.b2TensorDampingController;
	var PXDistanceJoint 			= Box2D.Dynamics.Joints.b2DistanceJoint;
	var PXDistanceJointDef 			= Box2D.Dynamics.Joints.b2DistanceJointDef;
	var PXFrictionJoint 			= Box2D.Dynamics.Joints.b2FrictionJoint;
	var PXFrictionJointDef 			= Box2D.Dynamics.Joints.b2FrictionJointDef;
	var PXGearJoint 				= Box2D.Dynamics.Joints.b2GearJoint;
	var PXGearJointDef 				= Box2D.Dynamics.Joints.b2GearJointDef;
	var PXJacobian 					= Box2D.Dynamics.Joints.b2Jacobian;
	var PXJoint 					= Box2D.Dynamics.Joints.b2Joint;
	var PXJointDef 					= Box2D.Dynamics.Joints.b2JointDef;
	var PXJointEdge 				= Box2D.Dynamics.Joints.b2JointEdge;
	var PXLineJoint 				= Box2D.Dynamics.Joints.b2LineJoint;
	var PXLineJointDef 				= Box2D.Dynamics.Joints.b2LineJointDef;
	var PXMouseJoint 				= Box2D.Dynamics.Joints.b2MouseJoint;
	var PXMouseJointDef 			= Box2D.Dynamics.Joints.b2MouseJointDef;
	var PXPrismaticJoint 			= Box2D.Dynamics.Joints.b2PrismaticJoint;
	var PXPrismaticJointDef 		= Box2D.Dynamics.Joints.b2PrismaticJointDef;
	var PXPulleyJoint 				= Box2D.Dynamics.Joints.b2PulleyJoint;
	var PXPulleyJointDef 			= Box2D.Dynamics.Joints.b2PulleyJointDef;
	var PXRevoluteJoint 			= Box2D.Dynamics.Joints.b2RevoluteJoint;
	var PXRevoluteJointDef 			= Box2D.Dynamics.Joints.b2RevoluteJointDef;
	var PXWeldJoint 				= Box2D.Dynamics.Joints.b2WeldJoint;
	var PXWeldJointDef 				= Box2D.Dynamics.Joints.b2WeldJointDef;
}


//=====================================================================
//= MoSystem.js
//=====================================================================

MoSystemInfo = {
	"Name" 				: 1,
	"Model" 			: 2,
	"Environment"		: 3,
	"Version"			: 4,
	"Architecture"		: 5,
	"PlatformName"		: 6,
	"PlatformVersion"	: 7,
	"DeviceID"			: 8,
	"DeviceIP"			: 9,
	"MaxTextureSize"	: 10,
	"NPOTTextures"		: 11
};

MoSystem = {
	getInfo : function(infoId) {
	
		switch(infoId)
		{
			case MoSystemInfo.Name:
				return MoSystem.getSystemName();
			case MoSystemInfo.Model:
				return MoSystem.getSystemModel();
			case MoSystemInfo.Environment:
				return MoSystem.getSystemEnvironment();
			case MoSystemInfo.Version:
				return MoSystem.getMochicaVersion();
			case MoSystemInfo.Architecture:
				return MoSystem.getSystemArchitecture();
			case MoSystemInfo.PlatformName:
				return MoSystem.getPlatformName();
			case MoSystemInfo.PlatformVersion:
				return MoSystem.getPlatformVersion();
			case MoSystemInfo.DeviceID:
				return MoSystem.getDeviceID();
			case MoSystemInfo.DeviceIP:
				return MoSystem.getDeviceIP();
			case MoSystemInfo.MaxTextureSize:
				return MoSystem.getMaxTextureSize();
			case MoSystemInfo.NPOTTextures:
				return MoSystem.getAllowsNPOTTextures();
		}

		return null;
	},
	
	getSystemName : function() {
		return window.navigator.appName || "";
	},
	
	getSystemModel : function() {	
		var ua = window.navigator.userAgent || window.navigator.vendor || "";
		
		if(MoStringContains(ua, "Chrome/"))
			return "Chrome";
		
		if(MoStringContains(ua, "Firefox/"))
			return "Firefox";
			
		if(MoStringContains(ua, "MSIE"))
			return "Internet Explorer";
			
		if(MoStringContains(ua, "Safari/"))
			return "Safari";
		
		return window.navigator.product || "";
	},
	
	getSystemEnvironment : function() {
		return window.navigator.moEnvironment || "web";
	},
	
	getSystemArchitecture : function() {
		return window.navigator.cpuClass || "";
	},

	getPlatformName : function() {
		var platform = window.navigator.platform || "";
		var ua = window.navigator.userAgent || window.navigator.vendor || "";
		
		if( MoStringContains(platform, "Win32") || 
			MoStringContains(platform, "Win64") || 
			MoStringContains(ua, "Windows NT"))
			return "Windows";
		
		if( MoStringContains(ua, "Linux"))
			return "Linux";
		
		if( MoStringContains(ua, "Macintosh"))
			return "Macintosh";

		return platform;
	},
	
	getPlatformVersion : function() {
		return window.navigator.platformVersion || "";
	},
	
	getMochicaVersion : function() {
		return MoVersion;
	},
	
	getDeviceID : function() {
		return window.navigator.buildID || "";
	},
	
	getDeviceIP : function() {
		return window.navigator.moDeviceIP || "127.0.0.1";
	},
	
	getMaxTextureSize : function() {
		return window.navigator.moMaxTextureSize || 16384;
	},

	getAllowsNPOTTextures : function() {
		return window.navigator.moNPOTTextures || true;
	}
};


//=====================================================================
//= MoHorizontalAlignment.js
//=====================================================================

MoHorizontalAlignment = {
	"Left" 		: 0,
	"Center" 	: 0.5,
	"Right" 	: 1
};


//=====================================================================
//= MoStretch.js
//=====================================================================

MoStretch = {
	"None" 			: 0,
	"Uniform" 		: 1,
	"UniformToFill"	: 2,
	"Fill"			: 3
};

MoStretchDirection = {
	"Up" 			: 0,
	"Down"			: 1,
	"Both"			: 2
};


//=====================================================================
//= MoVerticalAlignment.js
//=====================================================================

MoVerticalAlignment = {
	"Top" 		: 0,
	"Center" 	: 0.5,
	"Bottom" 	: 1
};


//=====================================================================
//= MoUnicodeCategory.js
//=====================================================================

MoUnicodeCategory = {
	"UppercaseLetter"			:  0,
	"LowercaseLetter"			:  1,
	"TitlecaseLetter"			:  2,
	"ModifierLetter"			:  3,
	"OtherLetter"				:  4,
	"NonSpacingMark"			:  5,
	"SpacingCombiningMark"		:  6,
	"EnclosingMark"				:  7,
	"DecimalDigitNumber"		:  8,
	"LetterNumber"				:  9,
	"OtherNumber"				: 10,
	"SpaceSeparator"			: 11,
	"LineSeparator"				: 12,
	"ParagraphSeparator"		: 13,
	"Control"					: 14,
	"Format"					: 15,
	"Surrogate"					: 16,
	"PrivateUse"				: 17,
	"ConnectorPunctuation"		: 18,
	"DashPunctuation"			: 19,
	"OpenPunctuation"			: 20,
	"ClosePunctuation"			: 21,
	"InitialQuotePunctuation"	: 22,
	"FinalQuotePunctuation" 	: 23,
	"OtherPunctuation"			: 24,
	"MathSymbol"				: 25,
	"CurrencySymbol"			: 26,
	"ModifierSymbol"			: 27,
	"OtherSymbol"				: 28,
	"OtherNotAssigned"			: 29
};


//=====================================================================
//= MoUnicodeCategoryData.js
//=====================================================================

MoUnicodeCategoryData = {

	CategoryData : [
        14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,11,24,24,24,26,24,24,24,20,21,24,25,24,19,24,24,8,8,
        8,8,8,8,8,8,8,8,24,24,25,25,25,24,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,20,24,21,27,18,27,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,20,25,21,25,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,
        14,14,14,14,14,14,14,14,14,14,11,24,26,26,26,26,28,28,27,28,1,22,25,19,28,27,28,25,10,10,27,1,28,24,27,10,1,23,10,10,10,24,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,25,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,25,1,1,
        1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,1,1,0,0,1,0,1,0,0,1,0,0,0,1,1,0,0,
        0,0,1,0,0,1,0,0,0,1,1,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,0,0,1,0,1,0,0,1,1,4,0,1,1,1,4,4,
        4,4,0,2,1,0,2,1,0,2,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,0,2,1,
        0,1,0,0,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,29,29,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,29,29,3,3,3,3,3,3,3,3,3,27,27,3,
        3,3,3,3,3,3,27,27,27,27,27,27,27,27,27,27,27,27,27,27,3,3,27,27,27,27,27,27,27,27,27,27,27,27,27,27,3,3,3,3,3,27,27,27,27,27,27,27,27,27,
        3,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,
        5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,5,5,5,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,27,27,29,29,29,29,3,29,29,29,24,29,29,29,29,29,
        27,27,0,24,0,0,0,29,0,29,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,29,1,1,0,0,0,1,1,1,29,29,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,1,1,1,1,29,29,29,29,29,29,29,29,29,29,29,29,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,28,5,5,5,5,29,7,7,29,29,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1,29,29,0,1,29,29,0,1,29,29,29,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,29,29,0,1,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,29,3,24,24,24,24,24,24,29,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,29,24,19,29,29,29,29,29,29,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,29,5,5,5,5,5,5,5,
        5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,29,5,5,5,24,5,24,5,5,24,5,29,29,29,29,29,29,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,29,29,4,4,4,24,24,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,24,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,24,29,29,29,24,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,29,29,
        3,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,29,29,29,29,29,29,29,29,29,29,8,8,8,8,8,8,8,8,8,8,24,24,24,24,29,29,5,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,24,4,
        5,5,5,5,5,5,5,7,7,5,5,5,5,5,5,3,3,5,5,28,5,5,5,5,29,29,8,8,8,8,8,8,8,8,8,8,4,4,4,28,28,29,24,24,24,24,24,24,24,24,
        24,24,24,24,24,24,29,15,4,5,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,5,5,5,5,5,5,5,5,5,5,
        5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,5,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,5,5,6,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,29,29,5,4,6,6,6,5,5,5,5,5,5,5,5,6,6,6,6,5,29,29,4,5,5,5,5,29,29,29,4,4,4,4,4,4,4,4,
        4,4,5,5,24,24,8,8,8,8,8,8,8,8,8,8,24,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,5,6,6,29,4,4,4,4,4,4,4,4,29,29,4,4,29,
        29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,29,4,29,29,29,4,4,4,4,29,29,5,29,6,6,6,5,5,5,
        5,29,29,6,6,29,29,6,6,5,29,29,29,29,29,29,29,29,29,6,29,29,29,29,4,4,29,4,4,4,5,5,29,29,8,8,8,8,8,8,8,8,8,8,4,4,26,26,10,10,
        10,10,10,10,28,29,29,29,29,29,29,29,5,29,29,4,4,4,4,4,4,29,29,29,29,4,4,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,29,4,4,4,4,4,4,4,29,4,4,29,4,4,29,4,4,29,29,5,29,6,6,6,5,5,29,29,29,29,5,5,29,29,5,5,5,29,29,29,29,29,29,29,29,29,29,29,4,
        4,4,4,29,4,29,29,29,29,29,29,29,8,8,8,8,8,8,8,8,8,8,5,5,4,4,4,29,29,29,29,29,29,29,29,29,29,29,29,5,5,6,29,4,4,4,4,4,4,4,
        29,4,29,4,4,4,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,29,4,4,29,4,4,4,4,4,29,29,5,4,
        6,6,6,5,5,5,5,5,29,5,5,6,29,6,6,5,29,29,4,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,4,29,29,29,29,29,8,8,8,8,8,8,8,8,8,8,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,5,6,6,29,4,4,4,4,4,4,4,4,29,29,4,4,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,29,4,4,29,29,4,4,4,4,29,29,5,4,6,5,6,5,5,5,29,29,29,6,6,29,29,6,6,5,29,29,29,29,29,29,
        29,29,5,6,29,29,29,29,4,4,29,4,4,4,29,29,29,29,8,8,8,8,8,8,8,8,8,8,28,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,5,6,29,4,
        4,4,4,4,4,29,29,29,4,4,4,29,4,4,4,4,29,29,29,4,4,29,4,29,4,4,29,29,29,4,4,29,29,29,4,4,4,29,29,29,4,4,4,4,4,4,4,4,29,4,
        4,4,29,29,29,29,6,6,5,6,6,29,29,29,6,6,6,29,6,6,6,5,29,29,29,29,29,29,29,29,29,6,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,8,8,8,
        8,8,8,8,8,8,10,10,10,29,29,29,29,29,29,29,29,29,29,29,29,29,29,6,6,6,29,4,4,4,4,4,4,4,4,29,4,4,4,29,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,4,4,4,29,4,4,4,4,4,29,29,29,29,5,5,5,6,6,6,6,29,5,5,5,29,5,5,5,5,
        29,29,29,29,29,29,29,5,5,29,29,29,29,29,29,29,29,29,4,4,29,29,29,29,8,8,8,8,8,8,8,8,8,8,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,6,6,29,4,4,4,4,4,4,4,4,29,4,4,4,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,4,
        4,4,29,4,4,4,4,4,29,29,29,29,6,5,6,6,6,6,6,29,5,6,6,29,6,6,5,5,29,29,29,29,29,29,29,6,6,29,29,29,29,29,29,29,4,29,4,4,29,29,
        29,29,8,8,8,8,8,8,8,8,8,8,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,6,6,29,4,4,4,4,4,4,4,4,29,4,4,4,29,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,29,6,6,6,5,5,5,29,29,6,6,
        6,29,6,6,6,5,29,29,29,29,29,29,29,29,29,6,29,29,29,29,29,29,29,29,4,4,29,29,29,29,8,8,8,8,8,8,8,8,8,8,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,6,6,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,29,4,4,4,4,4,4,4,4,4,29,4,29,29,4,4,4,4,4,4,4,29,29,29,5,29,29,29,29,6,6,6,5,5,5,29,5,29,6,6,6,6,6,6,
        6,6,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,6,6,24,29,29,29,29,29,29,29,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,4,4,5,5,5,5,5,5,5,29,29,29,29,26,4,4,
        4,4,4,4,3,5,5,5,5,5,5,5,5,24,8,8,8,8,8,8,8,8,8,8,24,24,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,4,4,29,4,29,29,4,4,29,4,29,29,4,29,29,29,29,29,29,4,4,4,4,29,4,4,4,4,4,4,4,29,4,4,4,29,4,
        29,4,29,29,4,4,29,4,4,4,4,5,4,4,5,5,5,5,5,5,29,5,5,4,29,29,4,4,4,4,4,29,3,29,5,5,5,5,5,5,29,29,8,8,8,8,8,8,8,8,
        8,8,29,29,4,4,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,4,28,28,28,24,24,24,24,24,24,
        24,24,24,24,24,24,24,24,24,28,28,28,28,28,5,5,28,28,28,28,28,28,8,8,8,8,8,8,8,8,8,8,10,10,10,10,10,10,10,10,10,10,28,5,28,5,28,5,20,21,
        20,21,6,6,4,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,
        29,29,29,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6,5,5,5,5,5,24,5,5,4,4,4,4,29,29,29,29,5,5,5,5,5,5,5,5,29,5,5,5,5,5,5,5,
        5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,29,28,28,28,28,28,28,28,28,5,28,28,28,28,28,28,29,29,28,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,4,4,4,4,29,4,4,29,6,5,5,5,5,6,5,29,29,29,
        5,5,6,5,29,29,29,29,29,29,8,8,8,8,8,8,8,8,8,8,24,24,24,24,24,24,4,4,4,4,4,4,6,6,5,5,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,29,29,29,29,29,29,
        29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,29,24,29,29,
        29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,29,29,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,29,29,29,29,29,29,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,29,4,4,4,4,29,29,4,4,4,4,4,4,4,29,4,29,4,4,
        4,4,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,29,4,4,4,4,
        29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,29,4,4,4,4,29,29,4,4,4,4,4,4,4,29,
        4,29,4,4,4,4,29,29,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,29,4,4,4,4,29,29,4,4,4,4,4,4,4,29,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,29,29,29,29,29,29,24,24,24,24,24,24,24,24,8,8,8,8,8,8,8,8,8,10,10,10,10,10,10,10,10,10,10,10,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,29,29,29,29,29,29,29,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,24,24,4,4,4,4,4,4,4,
        4,29,29,29,29,29,29,29,29,29,11,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,20,21,29,29,29,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,24,24,24,10,10,10,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,6,6,6,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,5,6,6,5,5,5,5,5,5,5,5,5,5,5,
        24,24,24,24,24,24,24,26,24,29,29,29,8,8,8,8,8,8,8,8,8,8,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,24,24,24,24,24,24,
        19,24,24,24,24,15,15,15,15,29,8,8,8,8,8,8,8,8,8,8,29,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,4,29,29,29,29,29,29,29,29,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,
        4,4,4,4,4,4,4,4,4,4,4,4,4,5,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1,29,29,29,29,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,
        0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,29,29,29,29,29,29,1,1,1,1,1,1,1,1,0,0,0,0,0,0,
        0,0,1,1,1,1,1,1,29,29,0,0,0,0,0,0,29,29,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,
        1,1,1,1,1,1,29,29,0,0,0,0,0,0,29,29,1,1,1,1,1,1,1,1,29,0,29,0,29,0,29,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,
        1,1,1,1,1,1,1,1,1,1,1,1,29,29,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1,
        1,1,1,1,2,2,2,2,2,2,2,2,1,1,1,1,1,29,1,1,0,0,0,0,2,27,1,27,27,27,1,1,1,29,1,1,0,0,0,0,2,27,27,27,1,1,1,1,29,29,
        1,1,0,0,0,0,29,27,27,27,1,1,1,1,1,1,1,1,0,0,0,0,0,27,27,27,29,29,1,1,1,29,1,1,0,0,0,0,2,27,27,29,11,11,11,11,11,11,11,11,
        11,11,11,11,15,15,15,15,19,19,19,19,19,19,24,24,22,23,20,22,22,23,20,22,24,24,24,24,24,24,24,24,12,13,15,15,15,15,15,11,24,24,24,24,24,24,24,24,24,22,
        23,24,24,24,24,18,18,24,24,24,25,20,21,29,24,24,24,24,24,24,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,15,15,
        15,15,15,15,10,29,29,29,10,10,10,10,10,10,25,25,25,20,21,1,10,10,10,10,10,10,10,10,10,10,25,25,25,20,21,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,26,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        5,5,5,5,5,5,5,5,5,5,5,5,5,7,7,7,7,5,7,7,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,28,28,
        0,28,28,28,28,0,28,28,1,0,0,0,1,1,0,0,0,1,28,0,28,28,28,0,0,0,0,0,28,28,28,28,28,28,0,28,0,28,0,28,0,0,0,0,28,1,0,0,28,0,
        1,4,4,4,4,1,28,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,10,10,10,10,10,10,10,10,10,10,10,10,10,9,9,9,9,9,9,
        9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,29,29,29,29,29,29,29,29,29,29,29,29,25,25,25,25,25,28,28,28,
        28,28,25,25,28,28,28,28,25,28,28,25,28,28,25,28,28,28,28,28,28,28,25,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,25,25,28,28,25,28,25,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,
        29,29,29,29,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,
        25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,
        25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,
        25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,
        25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,28,28,28,28,28,28,28,28,25,25,25,25,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,25,25,28,28,28,28,28,28,
        28,20,21,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,
        10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        10,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,25,28,28,28,28,28,28,28,28,28,25,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,
        29,29,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,25,28,28,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,28,28,28,28,29,28,28,28,28,29,29,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,29,28,29,28,28,28,28,29,29,29,28,29,28,28,28,28,28,28,28,29,29,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,28,29,29,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,29,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
        28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,
        29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,29,2957,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,0,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,1,2,3,4,5,6,7,8,9,57,57,57,57,57,57,57,57,57,57,57,57,57,57,10,20,21,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,1,2,3,4,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,1,2,3,4,5,6,7,8,9,10,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,
        57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,57,1,2,3,4,5,6,7,8,9,10],

	NumericDataValues : [
        0,  1,	 2,  3,	 4,  5,	 6,  7,	 8,  9,
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 30, 40, 50, 60, 70, 80, 90,100,500,
        1000, 5000, 10000, 1/2, 3/2, 5/2, 7/2, 9/2, 11/2, 13/2,
        15/2, 17/2, 1/3, 2/3, 1/4, 3/4, 1/5, 2/5, 3/5, 4/5,
        1/6, 5/6, 1/8, 3/8, 5/8, 7/8, -1/2, -1]
};


//=====================================================================
//= MoOrientation.js
//=====================================================================

MoOrientation = {
	"Horizontal"	: 1,
	"Vertical"		: 2
};


//=====================================================================
//= MoTextureCachePolicy.js
//=====================================================================

MoTextureCachePolicy = {
	"NoCache" 			: 0,   // never cache and always load from the server
	"InMemory"			: 1,   // only cache in memory and bypass the browser cache on the first load
	"UseBrowserCache"	: 2,   // only cache in the browser
	"Cache"				: 3    // default, cache in memory and in the browser
};


//=====================================================================
//= MoMath.js
//=====================================================================

MoMath = {};

Object.extend(MoMath, {

	isNaN : function(num) {
		return isNaN(num);
	},

	isInfinity : function(num) {
		return (MoMath.isPositiveInfinity(num) || 
				MoMath.isNegativeInfinity(num));
	},

	isPositiveInfinity : function(num) {
		return (num == MoPositiveInfinity);
	},

	isNegativeInfinity : function(num) {
		return (num == MoNegativeInfinity);
	},

	isZero : function(num) {
		return (Math.abs(num) <= MoEpsilon);
	},
	
	signum : function(num) {		
		if(num > 0)
			return 1.0;
		
		if(num < 0)
			return -1.0;
			
		return 0.0;
	},
	
	signEpsilon : function(num) {
		if(num > MoEpsilon)
			return 1.0;
		
		if(num < -MoEpsilon)
			return -1.0;
			
		return 0.0;
	},
	
	clamp : function(value, min, max) {
		return Math.max(Math.min(value, max), min);
	},
	
	normalize : function(value, start, end) {
		if(start == end)
			throw new Error("start must not be equal to end");
			
		var delta = end - start;
		var offset = value - start;
		
		return (offset - (Math.floor(offset / delta) * delta) + start);
	},
	
	normalizeAngle : function(angle) {
		return (angle % 360);
	},
	
	normalizeZero : function(num) {
		if(num <= 0 || MoMath.isZero(num))
			return 0;

		return num;
	},
	
	pointOfAngle : function(radians) {
		return new MoVector2D(
			Math.cos(radians),
			Math.sin(radians));
	},

	hypot : function(x, y) {
		return Math.sqrt(x * x + y * y) || 0;
	},
	
	degreesToRadians : function(degrees) {
		return ((degrees * Math.PI) / 180);
	},
	
	radiansToDegrees : function(radians) {
		return ((radians * 180) / Math.PI);
	},
	
	randomTo : function(max) {
		return (Math.random() * max);
	},
	
	randomIntTo : function(max) {
		return Math.round(MoMath.randomTo(max));
	},

	randomInRange : function(min, max) {
		return (Math.random() * (max - min)) + min;
	},

	randomIntInRange : function(min, max) {
		return Math.round(MoMath.randomInRange(min, max));
	},

	round : function(value) {
		// a fast rounding technique via bitwise truncation
		// TODO : fix negative values, for the most part they work fine, however if
		//		  the value is directly on the .5 boundary it rounds in the wrong direction,
		//		  should be a simple fix, but i need sleep, revisit this later. -JT
		
		return ((value + (value >= 0 ? 0.5 : -0.5)) | 0);
	},

	evenRoundDown : function(value) {
		return (value & ~1);
	},
	
	evenRoundUp : function(value) {
		return ((value + 1) & ~1);
	},
	
	toInt : function(value) {
		return this.toPrecision(value, 0);
	},

	toPrecision : function(value, n) {
		return Number(value.toFixed(n));
	}
});


//=====================================================================
//= MoPair.js
//=====================================================================

MoPair = Class.create({
	initialize : function(first, second) {
		this.first = first;
		this.second = second;
	},
	
	getFirst : function() {
		return this.first;
	},
	
	setFirst : function(value) {
		this.first = value;
	},
	
	getSecond : function() {
		return this.second;
	},
	
	setSecond : function(value) {
		this.second = value;
	},
	
	toString : function() {
		return "Pair[ first: " + this.first + ", second: " + this.second + " ]";
	}
});


//=====================================================================
//= MoTuple.js
//=====================================================================

MoTuple = Class.create({
	initialize : function(first, second, third) {
		this.first = first;
		this.second = second;
		this.third = third;
	},
	
	getFirst : function() {
		return this.first;
	},
	
	setFirst : function(value) {
		this.first = value;
	},
	
	getSecond : function() {
		return this.second;
	},
	
	setSecond : function(value) {
		this.second = value;
	},
	
	getThird : function() {
		return this.third;
	},
	
	setThird : function(value) {
		this.third = value;
	},
	
	toString : function() {
		return "Tuple[ first: " + this.first + ", second: " + this.second + ", third: " + this.third + " ]";
	}
});


//=====================================================================
//= MoEquatable.js
//=====================================================================


MoEquatable = Class.create(

/**
 * @CLASS
 *
 * SUMMARY:
 *	Base class for all objects that require themselves to be compared against one another
 * 
 * EXAMPLE:
 *	<code>
 *		MyClass = Class.create(MoEquatable, { ... });
 *	</code>
 *
 */

{	
	isEqualTo : function(other) {
		/**
		 * SUMMARY:
		 * 	Compares whether or not this instance is 
		 *  equal to another.
		 *
		 * REMARKS:
		 *	When not implemented in a subclass the default value is true.
		 *
		 * PARAMS:
		 *	Object other = null:
		 *  	The other object that you wish to compare this
		 *  	instance to
		 *
		 * RETURNS (Boolean):
		 *	true if the objects are equal; otherwise false.
		 *
		 */

		return true;
	},

	isNotEqualTo : function(other) {
		/**
		 * SUMMARY:
		 * 	Compares whether or not this instance is not equal to another.
		 *
		 * REMARKS:
		 *	When not implemented in a subclass the default value is false.
		 *
		 * PARAMS:
		 *	Object other:
		 *  	The other object that you wish to compare this
		 *  	instance to
		 *
		 * RETURNS:
		 *	true if the objects are not equal; otherwise false.
		 */
	
		return !this.isEqualTo(other);
	},

	copy : function() {
		return Object.clone(this);
	},

	/*
	* helper method to copy the properties of 'other' object
	* into this object, i.e. by-value
	*/
	copyFrom : function(other) {
		for(var p in other)
		{
			if(typeof(other[p]) != "function")
				this[p] = other[p];
		}
	}
});


//=====================================================================
//= MoPropertyOptions.js
//=====================================================================

MoPropertyOptions = {
	None					: (1 << 0)-1,
	AffectsMeasure			: (1 << 0),
	AffectsLayout			: (1 << 1),
	AffectsParentMeasure	: (1 << 2),
	AffectsParentLayout		: (1 << 3),
	AffectsRender			: (1 << 4)
};



//=====================================================================
//= MoDirection.js
//=====================================================================

MoDirection = {
	None		: (1 << 0)-1,
	North		: (1 << 0),
	South		: (1 << 1),
	East		: (1 << 2),
	West		: (1 << 3),
	NorthSouth	: 3,
	EastWest	: 12,
	All			: 15,
	Variable	: 99
};


//=====================================================================
//= MoNavigationDirection.js
//=====================================================================

MoNavigationDirection = {
	Left	: (1 << 0),
	Right	: (1 << 1),
	Up		: (1 << 2),
	Down	: (1 << 3)
};


//=====================================================================
//= MoNavigationMode.js
//=====================================================================

MoNavigationMode = {
	Normal		: 0,
	Constrain	: 1,
	Wrap		: 2
};


//=====================================================================
//= MoEvent.js
//=====================================================================


MoEventPhase = {
	"CAPTURING"	: 1,
	"BUBBLING"	: 2,
	"TARGET"	: 3
};

MoEvent = Class.create(MoEquatable, {
	initialize : function($super, type, bubbles, cancelable) {
		this.type = type;
		this.phase = MoEventPhase.TARGET;
		this.canBubble = MoValueOrDefault(bubbles, false);
		this.canCancel = MoValueOrDefault(cancelable, false);
		this.target = null;
		this.currentTarget = null;
		this.isPropagationStopped = false;
		this.isPropagationStoppedNow = false;
		this.isCanceled = false;
		this.isDispatching = false;
	},
	
	getType : function() {
		return this.type;
	},
	
	getPhase : function() {
		return this.phase;
	},
	
	getCanBubble : function() {
		return this.canBubble;
	},
	
	getCanCancel : function() {
		return this.canCancel;
	},
	
	getTarget : function() {
		return this.target;
	},
	
	getCurrentTarget : function() {
		return this.currentTarget;
	},
	
	getIsDefaultPrevented : function() {
		return this.isCanceled;
	},
	
	preventDefault : function() {
		if(this.canCancel)
			this.isCanceled = true;
	},
	
	stopPropagation : function() {
		this.isPropagationStopped = true;
	},
	
	stopImmediatePropagation : function() {
		this.isPropagationStopped = true;
		this.isPropagationStoppedNow = true;
	},
	
	reuse : function() {
		this.phase = MoEventPhase.TARGET;
		this.target = null;
		this.currentTarget = null;
		this.isPropagationStopped = false;
		this.isPropagationStoppedNow = false;
		this.isCanceled = false;
		this.isDispatching = false;

		return this;
	},
	
	toString : function() {
		return this.getType();
	}
});

Object.extend(MoEvent, {
	APPLICATION_START : "applicationStart",
	APPLICATION_EXIT : "applicationExit",
	RENDER : "render",
	RENDER_COMPLETE : "renderComplete",
	PRE_INIT : "preInit",
	INIT_COMPLETE : "initComplete",
	CHILDREN_CREATED : "childrenCreated",
	SHOW : "show",
	HIDE : "hide",
	CREATED : "created",
	UPDATED : "updated",
	LAYOUT_UPDATED : "layoutUpdated",
	PARENT_CHANGED : "parentChanged",
	POSITION_CHANGED : "positionChanged",
	RESIZED : "resized",
	FOCUS_IN : "focusIn",
	FOCUS_OUT : "focusOut",
	ADDED_TO_SCENE : "addedToScene",
	REMOVED_FROM_SCENE : "removedFromScene",
	CHANGE : "change",
	UI_ORIENTATION_CHANGE : "uiOrientationChange"
});



//=====================================================================
//= MoNavigationEvent.js
//=====================================================================

MoNavigationEvent = Class.create(MoEvent, {
	initialize : function($super, type, direction, targetFrom, targetTo, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
		
		this.direction = direction;
		this.targetFrom = MoValueOrDefault(targetFrom, null);
		this.targetTo = MoValueOrDefault(targetTo, null);
	},

	getDirection : function() {
		return this.direction;
	},

	getTargetFrom : function() {
		return this.targetFrom;
	},
	
	getTargetTo : function() {
		return this.targetTo;
	}
});

Object.extend(MoNavigationEvent, {
	ENTER	: "navigationEnter",
	LEAVE	: "navigationLeave"
});


//=====================================================================
//= MoFrameEvent.js
//=====================================================================

MoFrameEvent = Class.create(MoEvent, {
	initialize : function($super, type, deltaTime, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		this.deltaTime = deltaTime;
	},

	getDeltaTime : function() {
		return this.deltaTime;
	}
});

Object.extend(MoFrameEvent, {
	ENTER : "enter"
});


//=====================================================================
//= MoAnimationEvent.js
//=====================================================================

MoAnimationEvent = Class.create(MoEvent, 
/**
 * @CLASS
 *
 * SUMMARY:
 *  The MoAnimation class dispatches MoAnimationEvent objects when the state of 
 *  an animation changes.
 *
 */
{
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoAnimationEvent, {

	/**
	 * SUMMARY:
	 *  Defines the value of the type property of a MoAnimationEvent object when
	 *  a MoAnimation begins playback.
	 */
	BEGIN : "animationBegin",
	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of a MoAnimationEvent object when
	 *  a MoAnimation finishes playback.
	 */
	COMPLETE : "animationComplete",
	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of a MoAnimationEvent object when
	 *  a MoAnimation is repeated.
	 */
	REPEAT : "animationRepeat",
	
	/**
	 * SUMMARY:
	 *  Defines the value of the type property of a MoAnimationEvent object when
	 *  a MoAnimation stops playback.
	 */
	STOP : "animationStop"
});


//=====================================================================
//= MoCollectionEvent.js
//=====================================================================

MoCollectionEvent = Class.create(MoEvent, {
	initialize : function($super, type, oldIndex, newIndex, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		this.oldIndex = oldIndex;
		this.newIndex = newIndex;
	},

	getOldIndex : function() {
		return this.oldIndex;
	},

	getNewIndex : function() {
		return this.newIndex;
	}
});

Object.extend(MoCollectionEvent, {
	ITEM_ADDED : "collectionItemAdded",
	ITEM_REMOVED : "collectionItemRemoved",
	ITEM_INDEX_CHANGED : "collectionItemIndexChanged"
});


//=====================================================================
//= MoErrorEvent.js
//=====================================================================

MoErrorEvent = Class.create(MoEvent, {
	initialize : function($super, type, code, message, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		/** Number **/
		this.errorCode = MoValueOrDefault(code, 0);

		/** String **/
		this.errorMessage = MoValueOrDefault(message, null);
	},

	getErrorCode : function() {
		return this.errorCode;
	},

	getErrorMessage : function() {
		return this.errorMessage;
	},

	toString : function() {
		return "ErrorEvent[ code=" + this.getErrorCode() + ", message=" + this.getErrorMessage() + " ]";
	}
});

Object.extend(MoErrorEvent, {
	ERROR : "error"
});



//=====================================================================
//= MoLoadEvent.js
//=====================================================================

MoLoadEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoLoadEvent, {
	SUCCESS : "loadSuccess",
	FAILURE : "loadFailure"
});


//=====================================================================
//= MoMediaEvent.js
//=====================================================================

MoMediaEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoMediaEvent, {
	OPENED : "mediaOpened",
	ENDED : "mediaEnded"
});


//=====================================================================
//= MoSourceEvent.js
//=====================================================================

MoSourceEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoSourceEvent, {
	READY : "sourceReady",
	CHANGE : "sourceChange"
});


//=====================================================================
//= MoTimerEvent.js
//=====================================================================

MoTimerEvent = Class.create(MoEvent, {
	initialize : function($super, type, currentTickTime, lastTickTime, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		this.currentTickTime = MoValueOrDefault(currentTickTime, 0);
		this.lastTickTime = MoValueOrDefault(lastTickTime, 0);
	},
	
	getTickTime : function() {
		return this.currentTickTime;
	},
	
	getLastTickTime : function() {
		return this.lastTickTime;
	},

	getTickDelta : function() {
		return (this.getTickTime() - this.getLastTickTime());
	}
});

Object.extend(MoTimerEvent, {
	TICK : "timerTick",
	COMPLETE : "timerComplete"
});


//=====================================================================
//= MoVideoEvent.js
//=====================================================================

MoVideoEvent = Class.create(MoEvent, {
	initialize : function($super, type, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
	}
});

Object.extend(MoVideoEvent, {
	FRAME_CHANGE : "videoFrameChange"
});


//=====================================================================
//= MoDeviceOrientationEvent.js
//=====================================================================

MoDeviceOrientationEvent = Class.create(MoEvent, {
	initialize : function($super, type, alpha, beta, gamma, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, false), MoValueOrDefault(cancelable, false));
		
		this.alpha = alpha;
		this.beta = beta;
		this.gamma = gamma;
	},
	
	getAlpha : function() {
		return this.alpha;
	},
	
	getBeta : function() {
		return this.beta;
	},
	
	getGamma : function() {
		return this.gamma;
	}
});

Object.extend(MoDeviceOrientationEvent, {
	CHANGE : "deviceOrientationChange"
});


//=====================================================================
//= MoDeviceMotionEvent.js
//=====================================================================

MoDeviceMotionEvent = Class.create(MoEvent, {
	initialize : function($super, type, acceleration, interval, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, false), MoValueOrDefault(cancelable, false));
		
		this.x = acceleration.x;
		this.y = acceleration.y;
		this.z = acceleration.z;
		this.interval = interval;
	},
	
	getX : function() {
		return this.x;
	},
	
	getY : function() {
		return this.y;
	},
	
	getZ : function() {
		return this.z;
	},
	
	getInterval : function() {
		return this.interval;
	}
});

Object.extend(MoDeviceMotionEvent, {
	CHANGE : "deviceMotionChange"
});


//=====================================================================
//= MoGestureEvent.js
//=====================================================================

MoGestureEvent = Class.create(MoEvent, {
	initialize : function($super, type, rotation, scale, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, true));
		
		this.rotation = rotation;
		this.scale = scale;
	},
	
	getRotation : function() {
		return this.rotation;
	},
	
	getScale : function() {
		return this.scale;
	}
});

Object.extend(MoGestureEvent, {
	GESTURE_START : "gestureStart",
	GESTURE_CHANGE : "gestureChange",
	GESTURE_END : "gestureEnd"
});


//=====================================================================
//= MoPropertyChangedEvent.js
//=====================================================================

MoPropertyChangedEvent = Class.create(MoEvent, {
	initialize : function($super, type, propName, oldValue, newValue, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
		
		this.propName = propName;
		this.oldValue = oldValue;
		this.newValue = newValue;
	},

	getPropertyName : function() {
		return this.propName;
	},
	
	getOldValue : function() {
		return this.oldValue;
	},
	
	getNewValue : function() {
		return this.newValue;
	}
});

Object.extend(MoPropertyChangedEvent, {
	PROPERTY_CHANGED : "propertyChanged"
});


//=====================================================================
//= MoProgressEvent.js
//=====================================================================

MoProgressEvent = Class.create(MoEvent, {
	initialize : function($super, type, current, total, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		/** Number **/
		this.current = MoValueOrDefault(current, 0);

		/** Number **/
		this.total = MoValueOrDefault(total, 0);
	},
	
	getPercentage : function() {
		if(this.getTotal() == 0)
			return 0;

		return (this.getCurrent() / this.getTotal());
	},

	getCurrent : function() {
		return this.current;
	},

	getTotal : function() {
		return this.total;
	},

	toString : function() {
		return "ProgressEvent[ current=" + this.getCurrent() + ", total=" + this.getTotal() + " ]";
	}
});

Object.extend(MoProgressEvent, {
	PROGRESS : "progress"
});



//=====================================================================
//= MoEventDispatcher.js
//=====================================================================

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
			throw new Error("Event is already being dispatched.");
		
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



//=====================================================================
//= MoNamedObject.js
//=====================================================================

MoNamedObject = Class.create(MoEventDispatcher, {
	initialize : function($super, name) {
		$super();
		
		this.name = name;
		this.index = 0;
	},

	getName : function() {
		return this.name;
	},

	setName : function(value) {
		this.name = value;
	},

	isEqualTo : function(obj) {
		return (this == obj);
	},

	toString : function() {
		return this.name;
	}
});



//=====================================================================
//= MoNamedObjectCollection.js
//=====================================================================

MoNamedObjectCollection = Class.create(MoNamedObject, {
	initialize : function($super, name_) {
		$super(name_);
		
		this.children = [];
	},

	add : function(obj) {
		this.addAt(obj, this.children.length);
	},

	addAt : function(obj, idx) {
		if(!this.exists(obj))
		{
			var newIndex = idx;

			if(newIndex >= this.children.length)
			{
				newIndex = this.children.length;
				this.children.push(obj);
			}
			else
			{
				this.children.splice(newIndex, 0, obj);
			}
			
			this.onChildAdded(obj, newIndex);
		}
	},

	remove : function(obj) {
		
		var item = null;

		if(!this.isEmpty())
		{
			var idx = this.children.indexOf(obj);

			if(idx != -1)
			{
				var removed = this.children.splice(idx, 1);

				if(removed != null && removed.length > 0)
				{
					item = removed[0];

					this.onChildRemoved(item, idx);
				}
			}
		}

		return item;
	},

	removeAt : function(idx) {
		return this.remove(this.getAt(idx));
	},

	removeByName : function(name) {
		return this.remove(this.getByName(name));
	},

	getAt : function(idx) {
		if(idx < this.children.length)
			return this.children[idx];

		return null;
	},

	getByName : function(name) {

		for(var i = 0, len = this.children.length; i < len; ++i)
		{
			var item = this.children[i];

			if(item.name == name)
				return item;
		}

		return null;
	},

	indexOf : function(obj) {
		return this.children.indexOf(obj);
	},

	clear : function() {
		this.children.clear();
	},

	isEmpty : function() {
		return (this.children.length == 0);
	},

	exists : function(obj) {
		if(obj == null)
			return false;

		if(!this.isEmpty())
			return (this.children.indexOf(obj) != -1);

		return false;
	},

	getCount : function() {
		return this.children.length;
	},

	sort : function(sortFunc) {
		this.children.sort(sortFunc);
	},

	toString : function() {
		var str = "collection size: " + this.getCount();
		str += "\n";

		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			var child = this.children[i];
			str += "\t[" + child.index + "] ";
			str += child.name;
			str += "\n";
		}

		return str;
	},

	onChildAdded : function(obj, idx) {
		this.dispatchEvent(new MoCollectionEvent(MoCollectionEvent.ITEM_ADDED, -1, idx));
	},

	onChildRemoved : function(obj, idx) {
		this.dispatchEvent(new MoCollectionEvent(MoCollectionEvent.ITEM_REMOVED, idx, -1));
	},

	onChildIndexChanged : function(oldIndex, newIndex) {
		this.dispatchEvent(new MoCollectionEvent(MoCollectionEvent.ITEM_INDEX_CHANGED, oldIndex, newIndex));
	}
});


//=====================================================================
//= MoDictionary.js
//=====================================================================

MoDictionary = Class.create({
	initialize : function() {
		this.keys = new Array();
		this.values = new Array();
	},
	
	getKeys : function() {
		return this.keys;
	},
	
	getValues : function() {
		return this.values;
	},
	
	getCount : function() {
		return this.keys.length;
	},
	
	get : function(key) {
		var idx = this.keys.indexOf(key);
		
		if(idx == -1)
			return null;

		return this.values[idx];
	},
	
	set : function(key, value) {
		var idx = this.keys.indexOf(key);

		if(idx == -1)
		{
			this.keys.push(key);
			this.values.push(value);
		}
		else
		{
			this.values[idx] = value;
		}
	},
	
	remove : function(key) {
		var idx = this.keys.indexOf(key);
		
		if(idx != -1)
		{
			this.keys.removeAt(idx);
			this.values.removeAt(idx);
		}
	},

	clear : function() {
		this.keys = new Array();
		this.values = new Array();
	},
	
	containsKey : function(key) {
		return (this.keys.indexOf(key) != -1);
	},
	
	containsValue : function(value) {
		return (this.values.indexOf(value) != -1);
	},
	
	toString : function() {
		var str = "Dictionary (count=" + this.getCount() + ") :\n";
		var len = this.getCount();
		var key = null;
		var value = null;
		
		for(var i = 0; i < len; i++)
		{
			key = this.keys[i];
			value = this.values[i];
			
			str += "[key=" + key + ", value=" + value + "]\n";
		}
		
		return str;
	}
});


//=====================================================================
//= MoTimer.js
//=====================================================================

MoTimer = Class.create(MoEventDispatcher, {
	initialize : function($super, interval, repeatCount) {
		$super();

		/** Integer **/
		this.repeatCount = MoValueOrDefault(repeatCount, 0);
		
		/** Number **/
		this.interval = MoValueOrDefault(interval, 100);
		
		/** Integer **/
		this.iterations = 0;

		/** Boolean **/
		this.isRunning = false;
		
		/** Date **/
		this.lastTickTimestamp = 0;
        
		this.req = null;
		this.evt = new MoTimerEvent(MoTimerEvent.TICK, 0, 0);
        this.cb = this.onTimerCallback.asDelegate(this);
	},
	
	getRepeatCount : function() {
		return this.repeatCount;
	},
	
	setRepeatCount : function(value) {
		if(this.repeatCount != value)
		{
			this.repeatCount = value;
			
			if(this.isRunning && this.repeatCount <= this.iterations)
				this.stop();
		}
	},
	
	getInterval : function() {
		return this.interval;
	},
	
	setInterval : function(value) {
		if(this.interval != value)
		{
			this.interval = value;

			if(this.isRunning)
			{
				this.reset();
				this.start();
			}
		}
	},
	
	getIterations : function() {
		return this.iterations;
	},
	
	getIsRunning : function() {
		return this.isRunning;
	},

	reset : function() {
		if(this.isRunning)
			this.stop();

		this.iterations = 0;
		this.lastTickTimestamp = 0;
	},

	start : function() {
		this.lastTickTimestamp = 0;
		this.isRunning = true;
		this.requestNextSample();
	},
	
	stop : function() {
		if(!this.isRunning)
			return;

		this.isRunning = false;

		if(this.repeatCount == 0 || this.iterations == this.repeatCount)
			this.dispatchEvent(new MoTimerEvent(MoTimerEvent.COMPLETE, Date.now(), this.lastTickTimestamp));
	},

	onTimerCallback : function(t) {		
		if(!this.isRunning)
			return;

		if((t - this.lastTickTimestamp) >= this.interval)
		{
			this.iterations++;
			
			this.evt.currentTickTime = t;
			this.evt.lastTickTime = this.lastTickTimestamp;
			this.dispatchEvent(this.evt);
			
			this.lastTickTimestamp = t;
		}

		if(this.isRunning && (this.repeatCount == 0 || this.iterations < this.repeatCount))
			this.requestNextSample();
		else
			this.stop();
	},
	
	requestNextSample : function() {
		this.req = MoRequestAnimationFrame(this.cb, null);
	}
});



//=====================================================================
//= MoStringBuffer.js
//=====================================================================

MoStringBuffer = Class.create({
	initialize : function() {
		this.str = "";
	},
	
	getLength : function() {
		return this.str.length;
	},
	
	prepend : function(str) {
		this.str = str + this.str;
	},
	
	prependFormat : function(format) {
		this.str = String.formatWithObjects(format, arguments) + this.str;
	},

	append : function(str) {
		this.str += str;
	},
	
	appendLine : function(str) {
		if(str != null)
			this.append(str);

		this.append("\n");
	},
	
	appendFormat : function(format) {
		this.str += String.formatWithObjects(format, arguments);
	},
	
	clear : function() {
		this.str = "";
	},
	
	insert : function(index, str) {
		if(index > this.getLength())
			return;

		if(index == 0)
			this.str = str + this.str;
		else if(index == this.getLength())
			this.str += str;
		else
		{
			var start = this.str.substr(0, index);
			var end = this.str.substr(index, this.getLength() - index);

			this.str = start + str + end;
		}
	},
	
	remove : function(index, len) {
		if((index + len) > this.getLength())
			return;
		
		var endIndex = index + len;
		
		if(index == 0)
			this.str = this.str.substr(endIndex, this.getLength() - endIndex);
		else
		{
			var start = this.str.substr(0, index);
			var end = this.str.substr(endIndex, this.getLength() - endIndex);
			
			this.str = start + end;
		}
	},
	
	replace : function(oldStr, newStr) {
		this.str = this.str.replace(oldStr, newStr);
	},
	
	charAt : function(index) {
		return this.str.charAt(index);
	},
	
	toString : function() {
		return this.str;
	}
});


//=====================================================================
//= MoStringTokenizer.js
//=====================================================================

MoStringTokenizer = Class.create({
	initialize : function(str, quote, separator) {
		this.chQuote = MoValueOrDefault(quote, "'");
		this.chSeparator = MoValueOrDefault(separator, ",");
		this.chIndex = 0;
		this.str = str;
		this.strLen = (MoIsNull(str) ? 0 : str.length);
		this.tokenIndex = -1;
		this.tokenLength = 0;
		this.hasSeparator = false;

		while(this.chIndex < this.strLen && MoChar.isWhiteSpace(this.str.charAt(this.chIndex))) { ++this.chIndex }
	},
	
	isComplete : function() {
		return (this.chIndex == this.strLen);
	},
	
	getCurrent : function() {
		if(this.tokenIndex < 0)
			return null;

		return this.str.substr(this.tokenIndex, this.tokenLength);
	},

	next : function(isQuotedTokenAllowed) {
		this.moveNext(MoValueOrDefault(isQuotedTokenAllowed, false));

		return this.getCurrent();
	},
	
	moveNext : function(isQuotedTokenAllowed) {
		this.resetToken();
		
		if(!this.canMoveForward())
			return false;
			
		var ch = this.str.charAt(this.chIndex);
		var noMatchingQuote = false;
		
		if(isQuotedTokenAllowed && ch == this.chQuote)
		{
			noMatchingQuote = true;
			++this.chIndex;
		}
		
		var idx = this.chIndex;
		var len = 0;
		
		while(this.canMoveForward())
		{
			ch = this.str.charAt(this.chIndex);
			
			if(noMatchingQuote)
			{
				if(ch == this.chQuote)
				{
					noMatchingQuote = false;
					++this.chIndex;
					break;
				}
			}
			else if(MoChar.isWhiteSpace(ch) || ch == this.chSeparator)
			{
				if(ch == this.chSeparator)
				{
					this.hasSeparator = true;
					break;
				}
				
				break;
			}
			
			++this.chIndex;
			++len;
		}
		
		if(noMatchingQuote)
			throw new Error("Unable to move to next token, missing ending quote.");
		
		this.skipToNext();
		this.tokenIndex = idx;
		this.tokenLength = len;
		
		if(this.tokenLength > 0)
			return true;

		throw new Error("Unable to move to next token, token is empty.");
	},
	
	skipToNext : function() {
	
		if(!this.canMoveForward())
			return;
			
		var ch = this.str.charAt(this.chIndex);
		
		if(ch != this.chSeparator && !MoChar.isWhiteSpace(ch))
			throw new Error("Unable to move to next token, invalid data found.");
			
		var tokCount = 0;
		
		while(this.canMoveForward())
		{
			ch = this.str.charAt(this.chIndex);
			
			if(ch == this.chSeparator)
			{
				this.hasSeparator = true;
				++tokCount;
				++this.chIndex;
				
				if(tokCount > 1)
					break;

				continue;
			}
			else if(MoChar.isWhiteSpace(ch))
			{
				++this.chIndex;
				continue;
			}

			break;
		}
		
		if(tokCount <= 0 || this.canMoveForward())
			return;
		
		throw new Error("Unable to move to next token, token is empty");
	},
	
	canMoveForward : function() {
		return (this.chIndex < this.strLen);
	},

	resetToken : function() {
		this.hasSeparator = false;
		this.tokenIndex = -1;
	}
});


//=====================================================================
//= MoThread.js
//=====================================================================

MoThread = Class.create({
	initialize : function(callback) {
		this.threadCallback = callback;
		this.threadTarget = null;
		this.threadArgs = null;
	},
	
	getCallback : function() {
		return this.threadCallback;
	},

	setCallback : function(value) {
		this.threadCallback = value;
	},

	start : function(target) {
		this.threadTarget = target;

		// remove the target from the arguments
		if(arguments.length > 1)
			this.threadArgs = $A(arguments).slice(1);

		return window.setTimeout((function() {
			return this.threadCallback.apply(this.threadTarget, this.threadArgs);
		}).bind(this), 0);
	}
});


//=====================================================================
//= MoChar.js
//=====================================================================

MoChar = {
	getUnicodeCategory : function(ch) {
		return MoUnicodeCategoryData.CategoryData[ch.charCodeAt(0)];
	},
	
	getNumericValue : function(ch) {
		if(ch > 0x3289)
		{
			if(ch >= 0xff10 && ch <= 0xff19)
				return (ch - 0xff10);

			return -1;
		}

		return MoUnicodeCategoryData.NumericDataValues[
			MoUnicodeCategoryData.NumericData[ch.charCodeAt(0)]];
	},
	
	isLetter : function(ch) {
		return (MoChar.getUnicodeCategory(ch) <= MoUnicodeCategory.OtherLetter);
	},
	
	isLetterOrDigit : function(ch) {
		return (MoChar.isLetter(ch) || MoChar.isDigit(ch));
	},
	
	isDigit : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.DecimalDigitNumber);
	},
	
	isNumber : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		return (category >= MoUnicodeCategory.DecimalDigitNumber && 
				category <= MoUnicodeCategory.OtherNumber);
	},
	
	isControl : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.Control);
	},
	
	isWhiteSpace : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		if(category <= MoUnicodeCategory.OtherNumber)
			return false;
		
		if(category <= MoUnicodeCategory.ParagraphSeparator)
			return true;
		
		return (ch >= 0x09 && ch <= 0x0d || ch == 0x85 || ch == 0x205f);
	},
	
	isPunctuation : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		return (category >= MoUnicodeCategory.ConnectorPunctuation && 
				category <= MoUnicodeCategory.OtherPunctuation);
	},
	
	isSymbol : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		return (category >= MoUnicodeCategory.MathSymbol && 
				category <= MoUnicodeCategory.OtherSymbol);
	},
	
	isSeparator : function(ch) {
		var category = MoChar.getUnicodeCategory(ch);
		
		return (category >= MoUnicodeCategory.SpaceSeparator && 
				category <= MoUnicodeCategory.ParagraphSeparator);
	},
	
	isLower : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.LowercaseLetter);
	},
	
	isUpper : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.UppercaseLetter);
	},
	
	isSurrogate : function(ch) {
		return (MoChar.getUnicodeCategory(ch) == MoUnicodeCategory.Surrogate);
	},

	isSurrogatePair : function(lowSurrogate, highSurrogate) {
		return  '\uD800' <= highSurrogate && highSurrogate <= '\uDBFF' &&
				'\uDC00' <= lowSurrogate && lowSurrogate <= '\uDFFF';
	},

	isLowSurrogate : function(ch) {
		return ch >= '\uDC00' && ch <= '\uDFFF';
	},
	
	isHighSurrogate : function(ch) {
		return ch >= '\uD800' && ch <= '\uDBFF';
	}
};


//=====================================================================
//= MoCornerRadius.js
//=====================================================================

MoCornerRadius = Class.create(MoEquatable, {
	initialize : function(tl, tr, bl, br) {
		this.topLeft = tl;
		this.topRight = tr;
		this.bottomLeft = bl;
		this.bottomRight = br;
	},
	
	getTopLeft : function() {
		return this.topLeft;
	},
	
	setTopLeft : function(value) {
		this.topLeft = value;
	},
	
	getTopRight : function() {
		return this.topRight;
	},
	
	setTopRight : function(value) {
		this.topRight = value;
	},
	
	getBottomLeft : function() {
		return this.bottomLeft;
	},
	
	setBottomLeft : function(value) {
		this.bottomLeft = value;
	},
	
	getBottomRight : function() {
		return this.bottomRight;
	},
	
	setBottomRight : function(value) {
		this.bottomRight = value;
	},
	
	isUniform : function() {
		return (this.topLeft == this.topRight && 
				this.topLeft == this.bottomLeft && 
				this.topLeft == this.bottomRight);
	},

	isSquare : function() {
		return (this.isUniform() && this.topLeft == 0);
	},

	isEqualTo : function(obj) {
		return (this.topLeft == obj.topLeft &&
				this.topRight == obj.topRight &&
				this.bottomLeft == obj.bottomLeft &&
				this.bottomRight == obj.bottomRight);
	},

	toString : function() {
		return "CornerRadius[ tl=" + this.getTopLeft() + ", tr=" + this.getTopRight() + ", bl=" + this.getBottomLeft() + ", br=" + this.getBottomRight() + " ]";
	}
});


Object.extend(MoCornerRadius, {
	
	fromUniform : function(value) {
		return new MoCornerRadius(value, value, value, value);
	}
	
});


//=====================================================================
//= MoCompositeOperator.js
//=====================================================================

MoCompositeOperator = {
	Clear 			:  0,
	SourceOver		:  1,
	SourceIn		:  2,
	SourceOut		:  3,
	SourceAtop		:  4,
	DestinationOver	:  5,
	DestinationIn	:  6,
	DestinationOut	:  7,
	DestinationAtop	:  8,
	Xor				:  9,
	Copy			: 10
};


//=====================================================================
//= MoSweepDirection.js
//=====================================================================

MoSweepDirection = {
	"Clockwise"			: -1,
	"CounterClockwise"	:  1
};


//=====================================================================
//= MoBorderMetrics.js
//=====================================================================

MoBorderMetrics = Class.create(MoEquatable, {
	initialize : function (left, top, right, bottom) {
		this.left = MoValueOrDefault(left, 0);
		this.top = MoValueOrDefault(top, 0);
		this.right = MoValueOrDefault(right, 0);
		this.bottom = MoValueOrDefault(bottom, 0);
	},
	
	getLeft : function() {
		return this.left;
	},
	
	setLeft : function(value) {
		this.left = value;
	},
	
	getTop : function() {
		return this.top;
	},
	
	setTop : function(value) {
		this.top = value;
	},
	
	getRight : function() {
		return this.right;
	},
	
	setRight : function(value) {
		this.right = value;
	},
	
	getBottom : function() {
		return this.bottom;
	},
	
	setBottom : function(value) {
		this.bottom = value;
	},
	
	getSizeX : function() {
		return this.left + this.right;
	},
	
	getSizeY : function() {
		return this.top + this.bottom;
	},

	isZero : function() {
		return (this.left == 0 &&
				this.top == 0 &&
				this.right == 0 &&
				this.bottom == 0);
	},

	isEqualTo : function(obj) {
		return (this.left == obj.left && this.top == obj.top && this.right == obj.right && this.bottom == obj.bottom);
	},

	toString : function() {
		return ("left:" + this.left + ", top:" + this.top + ", right:" + this.right + ", bottom:" + this.bottom);
	}
});

Object.extend(MoBorderMetrics, {
	Zero : function() {
		return new MoBorderMetrics(0, 0, 0, 0);
	},

	fromUniform : function(value) {
		return new MoBorderMetrics(value, value, value, value);
	}
});


//=====================================================================
//= MoMatrix2D.js
//=====================================================================

MoMatrixType = {
	"IsIdentity" : 0,
	"IsTranslation" : 1,
	"IsScaling" : 2,
	"IsUnknown" : 4
};

MoMatrixDecompositionType = {
	"Translation" : 0,
	"Rotation" : 1,
	"Scale" : 2,
	"Skew" : 4
};

MoMatrix2D = Class.create(MoEquatable, {
	initialize : function () {
		this.type = MoMatrixType.IsIdentity;
		this.m11 = 1;
		this.m12 = 0;
		this.m21 = 0;
		this.m22 = 1;
		this.offsetX = 0;
		this.offsetY = 0;
	},

	isEqualTo : function(obj) {
		if(this.type == MoMatrixType.IsIdentity || obj.type == MoMatrixType.IsIdentity)
			return (this.isIdentity() == obj.isIdentity());

		return (this.m11 == obj.m11 &&
				this.m12 == obj.m12 &&
				this.m21 == obj.m21 &&
				this.m22 == obj.m22 &&
				this.offsetX == obj.offsetX &&
				this.offsetY == obj.offsetY);
	},

	setMatrix : function(m11, m12, m21, m22, tx, ty) {
		this.m11 = m11;
		this.m12 = m12;
		this.m21 = m21;
		this.m22 = m22;
		this.offsetX = tx;
		this.offsetY = ty;
		this.determineMatrixType();
	},

	setIdentity : function() {
		this.setMatrix(1, 0, 0, 1, 0, 0);
	},

	isIdentity : function() {
		return (this.type == MoMatrixType.IsIdentity || (
			this.m11 == 1 &&
			this.m12 == 0 &&
			this.m21 == 0 &&
			this.m22 == 1 &&
			this.offsetX == 0 &&
			this.offsetY == 0
		));
	},

	determineMatrixType : function() {
		this.type = MoMatrixType.IsIdentity;
		
		if((this.m21 != 0) || (this.m12 != 0))
		{
			this.type = MoMatrixType.IsUnknown;
		}
		else
		{
			if((this.m11 != 1) || (this.m22 != 1))
				this.type = MoMatrixType.IsScaling;
			
			if((this.offsetX != 0) || (this.offsetY != 0))
				this.type |= MoMatrixType.IsTranslation;
			
			if((this.type & (MoMatrixType.IsScaling | MoMatrixType.IsTranslation)) == MoMatrixType.IsIdentity)
				this.type = MoMatrixType.IsIdentity;
		}
	},
	
	decompose : function(decompositionType) {
		switch(decompositionType)
		{
			case MoMatrixDecompositionType.Translation:
				return new MoVector2D(this.offsetX, this.offsetY);
			case MoMatrixDecompositionType.Scale:
				return new MoVector2D(
					Math.sqrt(this.m11 * this.m11 + this.m12 * this.m12),
					Math.sqrt(this.m21 * this.m21 + this.m22 * this.m22));
			case MoMatrixDecompositionType.Skew:
			case MoMatrixDecompositionType.Rotation:
			
				var skewX = Math.atan2(-this.m21, this.m22);
				var skewY = Math.atan2(this.m12, this.m11);
				
				if(skewX == skewY)
				{
					if(decompositionType == MoMatrixDecompositionType.Skew)
						return MoVector2D.Zero();
					else
					{
						var rotation = skewY / MoDegreeToRadian;
						
						if(this.m11 < 0 && this.m22 >= 0)
							rotation += (rotation <= 0) ? 180 : -180;
						
						return rotation;
					}
				}
				
				return new MoVector2D(
					skewX / MoDegreeToRadian,
					skewY / MoDegreeToRadian);
		}

		return null;
	},
	
	determinate : function() {
		switch(this.type)
		{
			case MoMatrixType.IsIdentity:
			case MoMatrixType.IsTranslation:
				return 1.0;
			case MoMatrixType.IsScaling:
			case (MoMatrixType.IsScaling | MoMatrixType.IsTranslation):
				return (this.m11 * this.m22);
		}
		
		return ((this.m11 * this.m22) - (this.m12 * this.m21));
	},

	invert : function() {
		var det = this.determinate();
		var mx = MoMatrix2D.createIdentity();
		
		// cannot invert
		if(det == 0)
			return;
		
		switch(this.type)
		{
			case MoMatrixType.IsIdentity:
				break;
			case MoMatrixType.IsTranslation:
				mx.offsetX = -this.offsetX;
				mx.offsetY = -this.offsetY;
				break;
			case MoMatrixType.IsScaling:
				mx.m11 = 1.0 / this.m11;
				mx.m22 = 1.0 / this.m22;
				break;
			case (MoMatrixType.IsScaling | MoMatrixType.IsTranslation):
				mx.m11 = 1.0 / this.m11;
				mx.m22 = 1.0 / this.m22;
				mx.offsetX = -this.offsetX * mx.m11;
				mx.offsetY = -this.offsetY * mx.m22;
				break;
		}
		
		var inv = 1.0 / det;
		mx.setMatrix(
				 this.m22 * inv,
				-this.m12 * inv,
				-this.m21 * inv,
				 this.m11 * inv,
				((this.m21 * this.offsetY) - (this.offsetX * this.m22)) * inv,
				((this.offsetX * this.m12) - (this.m11 * this.offsetY)) * inv);
				
		mx.type = MoMatrixType.IsUnknown;
		
		return mx;
	},
	
	validate : function() {
		this.m11 =		(isNaN(this.m11) ? 0 : this.m11);
		this.m12 =		(isNaN(this.m12) ? 0 : this.m12);
		this.m21 =		(isNaN(this.m21) ? 0 : this.m21);
		this.m22 =		(isNaN(this.m22) ? 0 : this.m22);
		this.offsetX =	(isNaN(this.offsetX) ? 0 : this.offsetX);
		this.offsetY =	(isNaN(this.offsetY) ? 0 : this.offsetY);
	},
	
	truncateToPrecision : function(precision) {
		this.m11 = MoMath.toPrecision(this.m11, precision);
		this.m12 = MoMath.toPrecision(this.m12, precision);
		this.m21 = MoMath.toPrecision(this.m21, precision);
		this.m22 = MoMath.toPrecision(this.m22, precision);
		this.offsetX = MoMath.toPrecision(this.offsetX, precision);
		this.offsetY = MoMath.toPrecision(this.offsetY, precision);
	},

	copyFrom : function(m) {
		this.type = m.type;
		this.m11 = m.m11;
		this.m12 = m.m12;
		this.m21 = m.m21;
		this.m22 = m.m22;
		this.offsetX = m.offsetX;
		this.offsetY = m.offsetY;
	},
	
	copy : function() {
		var m = new MoMatrix2D();
		m.copyFrom(this);

		return m;
	},

	rotate : function(angle, prepend) {
		this.rotateAt(angle, 0, 0, prepend);
	},

	rotateAt : function(angle, cx, cy, prepend) {
		var m = MoMatrix2D.createRotation((angle % 360) * MoDegreeToRadian, cx, cy);

		if(prepend)
			this.prepend(m);
		else
			this.append(m);
	},

	scale : function(sx, sy, prepend) {
		this.scaleAt(sx, sy, 0, 0, prepend);
	},

	scaleAt : function(sx, sy, cx, cy, prepend) {
		var m = MoMatrix2D.createScale(sx, sy, cx, cy);

		if(prepend)
			this.prepend(m);
		else
			this.append(m);
	},
	
	skew : function(sx, sy, prepend) {
		var m = MoMatrix2D.createSkew((sx % 360) * MoDegreeToRadian, (sy % 360) * MoDegreeToRadian);
		
		if(prepend)
			this.prepend(m);
		else
			this.append(m);
	},

	translate : function(tx, ty, prepend) {
		
		if(prepend)
		{
			var m = MoMatrix2D.createTranslation(tx, ty);
			this.prepend(m);
		}
		else
		{
			if(this.type == MoMatrixType.IsIdentity)
			{
				this.setMatrix(1, 0, 0, 1, tx, ty);
				this.type = MoMatrixType.IsTranslation;
			}
			else if(this.type == MoMatrixType.IsUnknown)
			{
				this.offsetX += tx;
				this.offsetY += ty;
			}
			else
			{
				this.offsetX += tx;
				this.offsetY += ty;
				this.type |= MoMatrixType.IsTranslation;
			}
		}
	},

	append : function(m) {
		var mx = this.multiply(this, m);
		this.copyFrom(mx);
	},

	prepend : function(m) {
		var mx = this.multiply(m, this);
		this.copyFrom(mx);
	},

	add : function(m1, m2) {
		var m = new MoMatrix2D();
		m.setMatrix(
			m1.m11 + m2.m11,
			m1.m12 + m2.m12,
			m1.m21 + m2.m21,
			m1.m22 + m2.m22,
			m1.offsetX + m2.offsetX,
			m1.offsetY + m2.offsetY
		);
		return m;
	},

	transformVector : function(v) {
		return this.transform(v, false);
	},

	transformPoint : function(pt) {
		return this.transform(pt, true);
	},
	
	transformPoints : function(points) {
		for(var i = 0; i < points.length; i++)
			points[i] = this.transformPoint(points[i]);
	},

	transform : function(xy, isPoint) {
		if(isPoint)
		{
			return this.multiplyPoint(xy.x, xy.y);
		}
		else
		{
			var nx = xy.x;
			var ny = xy.y;

			switch(this.type)
			{
				case MoMatrixType.IsIdentity:
				case MoMatrixType.IsTranslation:
					return new MoVector2D(nx, ny);
				case MoMatrixType.IsScaling:
				case (MoMatrixType.IsScaling | MoMatrixType.IsTranslation):
					nx *= this.m11;
					ny *= this.m22;

					return new MoVector2D(nx, ny);
			}

			var tx = (nx * this.m21);
			var ty = (ny * this.m12);

			nx *= this.m11;
			nx += tx;
			ny *= this.m22;
			ny += ty;

			return new MoVector2D(nx, ny);
		}
	},
	
	transformRect : function(rect) {
		var newRect = rect.copy();
		
		if(!newRect.isEmpty())
		{
			if(this.type != MoMatrixType.IsIdentity)
			{
				if((this.type & MoMatrixType.IsScaling) != MoMatrixType.IsIdentity)
				{
					newRect.x *= this.m11;
					newRect.y *= this.m22;
					newRect.width *= this.m11;
					newRect.height *= this.m22;
					
					if(newRect.width < 0)
					{
						newRect.x += newRect.width;
						newRect.width = -newRect.width;
					}
					
					if(newRect.height < 0)
					{
						newRect.y += newRect.height;
						newRect.height = -newRect.height;
					}
				}
				
				if((this.type & MoMatrixType.IsTranslation) != MoMatrixType.IsIdentity)
				{
					newRect.x += this.offsetX;
					newRect.y += this.offsetY;
				}
				
				if(this.type == MoMatrixType.IsUnknown)
				{
					var p1 = this.transformPoint(newRect.topLeft());
					var p2 = this.transformPoint(newRect.topRight());
					var p3 = this.transformPoint(newRect.bottomRight());
					var p4 = this.transformPoint(newRect.bottomLeft());
					
					newRect.x = Math.min(Math.min(p1.x, p2.x), Math.min(p3.x, p4.x));
					newRect.y = Math.min(Math.min(p1.y, p2.y), Math.min(p3.y, p4.y));
					
					newRect.width = Math.max(Math.max(p1.x, p2.x), Math.max(p3.x, p4.x)) - newRect.x;
					newRect.height = Math.max(Math.max(p1.y, p2.y), Math.max(p3.y, p4.y)) - newRect.y;
				}
			}
		}

		return newRect;
	},

	multiply : function(m1, m2) {
		var typeA = m1.type;
		var typeB = m2.type;

		if(typeB != MoMatrixType.IsIdentity)
		{
			if(typeA == MoMatrixType.IsIdentity)
			{
				var m = new MoMatrix2D();
				m.setMatrix(m2.m11, m2.m12, m2.m21, m2.m22, m2.offsetX, m2.offsetY);
				return m;
			}

			if(typeB == MoMatrixType.IsTranslation)
			{
				var m = new MoMatrix2D();
				m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);

				m.offsetX += m2.offsetX;
				m.offsetY += m2.offsetY;
				
				if(typeA != MoMatrixType.IsUnknown)
					m.type |= MoMatrixType.IsTranslation;

				return m;
			}
			
			if(typeA == MoMatrixType.IsTranslation)
			{
				var m = new MoMatrix2D();
				m.setMatrix(m2.m11, m2.m12, m2.m21, m2.m22, m2.offsetX, m2.offsetY);
						
				m.offsetX = ((m1.offsetX * m2.m11) + (m1.offsetY * m2.m21)) + m2.offsetX;
				m.offsetY = ((m1.offsetX * m2.m12) + (m1.offsetY * m2.m22)) + m2.offsetY;
				
				if(typeB == MoMatrixType.IsUnknown)
					m.type = MoMatrixType.IsUnknown;
				else
					m.type = MoMatrixType.IsScaling | MoMatrixType.IsTranslation;
				
				return m;
			}
			
			var m = new MoMatrix2D();
			m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);

			switch((typeA << 4) | typeB)
			{
				case 34:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					return m;
				case 35:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX = m2.offsetX;
					m.offsetY = m2.offsetY;
					m.type = MoMatrixType.IsScaling | MoMatrixType.IsTranslation;
					return m;
				case 36:
				case 52:
				case 66:
				case 67:
				case 68:
					m.setMatrix(
						(m1.m11 * m2.m11) + // M11
						(m1.m12 * m2.m21),  //
						
						(m1.m11 * m2.m12) + // M12
						(m1.m12 * m2.m22),  //
						
						(m1.m21 * m2.m11) + // M21
						(m1.m22 * m2.m21),  //
						
						(m1.m21 * m2.m12) + // M22
						(m1.m22 * m2.m22),  //
						
						((m1.offsetX * m2.m11) +				// OffsetX
						(m1.offsetY * m2.m21)) + m2.offsetX,	//
						
						((m1.offsetX * m2.m12) +				// OffsetY
						(m1.offsetY * m2.m22)) + m2.offsetY); //
					return m;
				case 50:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX *= m2.m11;
					m.offsetY *= m2.m22;
					return m;
				case 51:
					m.m11 *= m2.m11;
					m.m22 *= m2.m22;
					m.offsetX = (m2.m11 * m.offsetX) + m2.offsetX;
					m.offsetY = (m2.m22 * m.offsetY) + m2.offsetY;
					return m;
			}
		}
		
		var m = new MoMatrix2D();
		m.setMatrix(m1.m11, m1.m12, m1.m21, m1.m22, m1.offsetX, m1.offsetY);
		return m;
	},

	multiplyPoint : function(x, y) {
		var nx = x;
		var ny = y;

		switch(this.type)
		{
			case MoMatrixType.IsIdentity:
				return new MoVector2D(nx, ny);
			case MoMatrixType.IsTranslation:
				nx += this.offsetX;
				ny += this.offsetY;

				return new MoVector2D(nx, ny);
			case MoMatrixType.IsScaling:
				nx *= this.m11;
				ny *= this.m22;

				return new MoVector2D(nx, ny);
			case (MoMatrixType.IsScaling | MoMatrixType.IsTranslation):
				nx *= this.m11;
				nx += this.offsetX;
				ny *= this.m22;
				ny += this.offsetY;

				return new MoVector2D(nx, ny);
		}

		var tx = (ny * this.m21) + this.offsetX;
		var ty = (nx * this.m12) + this.offsetY;

		nx *= this.m11;
		nx += tx;
		ny *= this.m22;
		ny += ty;

		return new MoVector2D(nx, ny);
	},

	toString : function() {
		return  "m11=" + this.m11 + ", " +
				"m12=" + this.m12 + ", " +
				"m21=" + this.m21 + ", " +
				"m22=" + this.m22 + ", " +
				"tx=" + this.offsetX + ", " +
				"ty=" + this.offsetY + ", ";
	}
});

Object.extend(MoMatrix2D, {

	createIdentity : function() {
		return new MoMatrix2D();
	},

	createTranslation : function(tx, ty) {
		var m = new MoMatrix2D();
		m.offsetX = tx;
		m.offsetY = ty;
		m.type = MoMatrixType.IsTranslation;

		return m;
	},

	createRotation : function(angle, cx, cy) {
		
		cx = MoValueOrDefault(cx, 0);
		cy = MoValueOrDefault(cy, 0);

		var m = new MoMatrix2D();
		var cr = Math.cos(angle);
		var sr = Math.sin(angle);
		var tx = (cx * (1.0 - cr)) + (cy * sr);
		var ty = (cy * (1.0 - cr)) - (cx * sr);

		m.m11 = cr;
		m.m12 = sr;
		m.m21 = -sr;
		m.m22 = cr;
		m.offsetX = tx;
		m.offsetY = ty;
		m.type = MoMatrixType.IsUnknown;

		return m;
	},

	createScale : function(sx, sy, cx, cy) {
		var m = new MoMatrix2D();
		
		m.type = MoMatrixType.IsScaling;
		m.m11 = sx;
		m.m12 = 0;
		m.m21 = 0;
		m.m22 = sy;
		m.offsetX = 0;
		m.offsetY = 0;
		
		cx = MoValueOrDefault(cx, 0);
		cy = MoValueOrDefault(cy, 0);

		m.type |= MoMatrixType.IsTranslation;
		m.offsetX = (cx - (sx * cx));
		m.offsetY = (cy - (sy * cy));

		return m;
	},
	
	createSkew : function(sx, sy) {
		var m = new MoMatrix2D();
		
		m.type = MoMatrixType.IsUnknown;
		m.m11 = 1;
		m.m12 = Math.tan(sy);
		m.m21 = Math.tan(sx);
		m.m22 = 1;
		m.offsetX = 0;
		m.offsetY = 0;

		return m;
	}
});



//=====================================================================
//= MoLine.js
//=====================================================================

MoLine = Class.create(MoEquatable, {
	initialize : function(x1, y1, x2, y2) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	},
	
	pointAt : function(t) {
		var vx = this.x2 - this.x1;
		var vy = this.y2 - this.y1;

		return new MoVector2D(this.x1 + vx * t, this.y1 + vy * t);
	},
	
	length : function() {
		var x = this.x2 - this.x1;
		var y = this.y2 - this.y1;

		return Math.sqrt(x * x + y * y);
	},
	
	getPixelsOutside : function(xcoords, ycoords, end) {
		var count = 0;
		var x = 0;
		var y = 0;
		var yNeeded = 0;
		
		for(var i = 0; i < end; ++i)
		{
			x = xcoords[i];
			y = ycoords[i];
			yNeeded = this.getYForX(x);
			
			if(Math.abs(yNeeded - y) >= 2)
				count++;
		}
		
		return count;
	},
	
	getYForX : function(x) {
		var dx = this.x2 - this.x1;
		var dy = this.y2 - this.y1;
		
		return (dy / dx) * (x - this.x1) + this.y1;
	},
	
	isEqualTo : function(other) {
		return (this.x1 == other.x1 &&
				this.y1 == other.y1 &&
				this.x2 == other.x2 &&
				this.y2 == other.y2);
	},

	toString : function() {
		return ("x1:" + this.x1 + ", y1:" + this.y1 + ", x2:" + this.x2 + ", y2:" + this.y2);
	}
});


//=====================================================================
//= MoRectangle.js
//=====================================================================

MoRectangle = Class.create(MoEquatable, {
	initialize : function (x, y, width, height) {
		this.x = MoValueOrDefault(x, 0);
		this.y = MoValueOrDefault(y, 0);
		this.width = MoValueOrDefault(width, 0);
		this.height = MoValueOrDefault(height, 0);
	},

	top : function() {
		return this.y;
	},

	bottom : function() {
		return (this.y + this.height);
	},

	left : function() {
		return this.x;
	},

	right : function() {
		return (this.x + this.width);
	},

	topLeft : function() {
		return new MoVector2D(this.left(), this.top());
	},

	topRight : function() {
		return new MoVector2D(this.right(), this.top());
	},

	bottomLeft : function() {
		return new MoVector2D(this.left(), this.bottom());
	},

	bottomRight : function() {
		return new MoVector2D(this.right(), this.bottom());
	},

	position : function() {
		return new MoVector2D(this.x, this.y);
	},

	size : function() { 
		return new MoSize(this.width, this.height);
	},

	center : function(local) {
		if(local)
			return new MoVector2D(this.width * 0.5, this.height * 0.5);

		return new MoVector2D(this.x + (this.width * 0.5), this.y + (this.height * 0.5));
	},
	
	area : function() {
		return (this.width * this.height);
	},

	scale : function(scaleX, scaleY) {
		if(!this.isEmpty())
		{
			this.x *= scaleX;
			this.y *= scaleY;
			this.width *= scaleX;
			this.height *= scaleY;
			
			if(scaleX < 0)
			{
				this.x += this.width;
				this.width *= -1;
			}
			
			if(scaleY < 0)
			{
				this.y += this.height;
				this.height *= -1;
			}
		}
		
		return this;
	},
	
	inflate : function(byX, byY) {
		if(this.isEmpty())
			return this;
		
		this.x -= byX;
		this.y -= byY;
		this.width += byX;
		this.width += byX;
		this.height += byY;
		this.height += byY;
		
		if(this.width < 0 || this.height < 0)
		{
			this.x = MoPositiveInfinity;
			this.y = MoPositiveInfinity;
			this.width = MoNegativeInfinity;
			this.height = MoNegativeInfinity;
		}
		
		return this;
	},

	offset : function(x, y) {
		this.x += x;
		this.y += y;
		
		return this;
	},
	
	clamp : function(x, y, width, height) {
		this.x = Math.max(this.x, x);
		this.y = Math.max(this.y, y);
		this.width = Math.min(this.width, width);
		this.height = Math.min(this.height, height);
		
		return this;
	},
	
	union : function(left, top, right, bottom) {
		if(this.isZero())
		{
			this.initialize(left, top, right - left, bottom - top);
			return this;
		}
		
		var minX = Math.min(this.x, left);
		var minY = Math.min(this.y, top);
		var maxX = Math.max(this.right(), right);
		var maxY = Math.max(this.bottom(), bottom);
		
		this.x = minX;
		this.y = minY;
		this.width = maxX - minX;
		this.height = maxY - minY;
		
		return this;
	},

	unionWithPoint : function(pt) {
		return this.unionWithRect(new MoRectangle(pt.x, pt.y, pt.x, pt.y));
	},

	unionWithRect : function(rect) {
		if(this.isZero())
		{
			this.initialize(rect.x, rect.y, rect.width, rect.height);
			return this;
		}

		return this.union(rect.left(), rect.top(), rect.right(), rect.bottom());
	},

	contains : function(x, y) {
		if(this.isZero())
			return false;

		return ((x >= this.x) && ((x - this.width) <= this.x) && (y >= this.y) && ((y - this.height) <= this.y));
	},

	containsPoint : function(pt) {
		return this.contains(pt.x, pt.y);
	},

	containsRect : function(rect) {
		if(this.isZero() || rect.isZero())
			return false;

		return ((this.x <= rect.x) && (this.y <= rect.y) && (this.right() >= rect.right()) && (this.bottom() >= rect.bottom()));
	},
	
	intersect : function(rect) {		
		var left = Math.max(this.x, rect.x);
		var top = Math.max(this.y, rect.y);
		var right = Math.min(this.right(), rect.right());
		var bottom = Math.min(this.bottom(), rect.bottom());
		
		if(right <= left || bottom <= top)
			return MoRectangle.Zero();

		return new MoRectangle(left, top, right - left, bottom - top);
	},
	
	intersects : function(rect) {
		if(this.isEmpty() || this.isZero() || rect.isZero())
			return false;
		
		return (rect.right() > this.x &&
				rect.bottom() > this.y &&
				rect.x < this.right() &&
				rect.y < this.bottom());
	},
	
	round : function() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		this.width = Math.ceil(this.width);
		this.height = Math.ceil(this.height);
		
		return this;
	},

	isZero : function() {
		return (this.x == 0 && this.y == 0 && this.width == 0 && this.height == 0);
	},
	
	isEmpty : function() {
		return (this.width < 0.0);
	},

	isEqualTo : function(obj) {
		return (this.x == obj.x && this.y == obj.y && this.width == obj.width && this.height == obj.height);
	},

	toString : function() {
		if(this.isEmpty())
			return "empty";

		return (this.x + "," + this.y + "," + this.width + "," + this.height);
	},
	
	toIntRect : function() {
		var rect = new MoRectangle(this.x, this.y, this.width, this.height);

		return rect.round();
	}
});

Object.extend(MoRectangle, {
	Empty : function() {
		return new MoRectangle(MoPositiveInfinity, MoPositiveInfinity, MoNegativeInfinity, MoNegativeInfinity);
	},

	Zero : function() {
		return new MoRectangle(0, 0, 0, 0);
	},

	fromPoints : function(p1, p2) {
		var x = Math.min(p1.x, p2.x);
		var y = Math.min(p1.y, p2.y);
		var width = Math.max(Math.max(p1.x, p2.x) - x, 0);
		var height = Math.max(Math.max(p1.y, p2.y) - y, 0);

		return new MoRectangle(x, y, width, height);
	},
	
	parse : function(str) {
		if(str == "empty")
			return MoRectangle.Empty();
	
		var tokenizer = new MoStringTokenizer(str);
		var x = parseFloat(tokenizer.next());
		var y = parseFloat(tokenizer.next());
		var width = parseFloat(tokenizer.next());
		var height = parseFloat(tokenizer.next());

		return new MoRectangle(x, y, width, height);
	}
});



//=====================================================================
//= MoSize.js
//=====================================================================

MoSize = Class.create(MoEquatable, {
	initialize : function (width, height) {
		this.width = MoValueOrDefault(width, 0);
		this.height = MoValueOrDefault(height, 0);

		if(this.width < 0 || this.height < 0)
			throw new Error("width and height must be a non-negative value.");
	},

	isEmpty : function() {
		return (this.width < 0);
	},

	isEqualTo : function(obj) {
		return (this.width == obj.width && this.height == obj.height);
	},

	toString : function() {
		return ("width:" + this.width + ", height:" + this.height);
	}
});

Object.extend(MoSize, {
	Empty : function() {
		var s = MoSize.Zero();
		s.width = MoNegativeInfinity;
		s.height = MoNegativeInfinity;

		return s;
	},

	Zero : function() {
		return new MoSize(0, 0);
	}
});


//=====================================================================
//= MoStack.js
//=====================================================================

MoStack = Class.create({
	initialize : function() {
		this.stackImpl = new Array();
		this.size = 0;
	},
	
	getCount : function() {
		return this.size;
	},
	
	isEmpty : function() {
		return (this.getCount() == 0);
	},
	
	peek : function() {
		if(this.size == 0)
			throw new Error("Unable to peek at stack, stack is empty.");
		
		return this.stackImpl[this.size-1];
	},
	
	pop : function() {
		if(this.size == 0)
			throw new Error("Unable to peek at stack, stack is empty.");
		
		var obj = this.stackImpl[--this.size];
		this.stackImpl[this.size] = null;
		this.stackImpl.length = this.size;
		
		return obj;
	},
	
	push : function(obj) {
		this.stackImpl.push(obj);
		this.size++;
	},
	
	contains : function(obj) {
		return this.stackImpl.contains(obj);
	},
	
	clear : function() {
		this.stackImpl.clear();
		this.size = 0;
	},
	
	clone : function() {
		var stack = new MoStack();
		stack.size = this.size;
		stack.stackImpl = this.stackImpl.concat();
		
		return stack;
	},

	copyTo : function(array, atIndex) {
		if(array != null)
		{
			for(var i = 0; i < this.size; i++)
				array[atIndex + i] = this.stackImpl[i];
		}
	},
	
	toArray : function() {
		return this.stackImpl.concat();
	},
	
	toString : function() {
		return "Stack[ size=" + this.size + " ]";
	}
});


//=====================================================================
//= MoVector2D.js
//=====================================================================

MoVector2D = Class.create(MoEquatable, {
	initialize : function(x, y) {
		this.x = MoValueOrDefault(x, 0);
		this.y = MoValueOrDefault(y, 0);
	},

	add : function(vector) {
		return new MoVector2D(
			this.x + vector.x, 
			this.y + vector.y);
	},

	subtract : function(vector) {
		return new MoVector2D(
			this.x - vector.x,
			this.y - vector.y);
	},

	multiply : function(vector) {
		return new MoVector2D(
			this.x * vector.x,
			this.y * vector.y);
	},

	divide : function(vector) {
		return new MoVector2D(
			this.x / vector.x,
			this.y / vector.y);
	},
	
	interpolate : function(vector, level) {
		return new MoVector2D(
			this.x + vector.x * level,
			this.y + vector.y * level);
	},

	negate : function()
	{
		return new MoVector2D(-this.x, -this.y);
	},

	length : function() {
		return Math.sqrt(this.lengthSquared());
	},

	lengthSquared : function() {
		return (this.x * this.x + this.y * this.y);
	},

	distance : function(vector) {
		return this.subtract(vector).length();
	},

	distanceSquared : function(vector) {
		return this.subtract(vector).lengthSquared();
	},

	dotProduct : function(vector) {
		return (this.x * vector.x + this.y * vector.y);
	},

	crossProduct : function(vector) {
		return (this.x * vector.y - this.y * vector.x);
	},

	normalize : function(thickness) {
		thickness = MoValueOrDefault(thickness, 1);
	
		var len = this.length();
		
		if(len == 0)
		{
			this.x = this.y = 0;
		}
		else
		{
			len = thickness / len;

			this.x = this.x * len;
			this.y = this.y * len;
		}
	},
	
	normalizeZero : function() {
		this.x = MoMath.normalizeZero(this.x);
		this.y = MoMath.normalizeZero(this.y);

		return this;
	},
	
	angle : function(point) {
		var delta = point.subtract(this);

		return MoMath.radiansToDegrees(Math.atan2(delta.y, delta.x));
	},
	
	pointTo : function(distance, angle) {
		var rads = MoMath.degreesToRadians(angle);

		return new MoVector2D(
			this.x + distance * Math.cos(rads),
			this.y + distance * Math.sin(rads)
		);
	},

	midPoint : function(vector) {
		return new MoVector2D(
			(this.x + vector.x) * 0.5,
			(this.y + vector.y) * 0.5);
	},
	
	rotate : function(angle) {
		var r = MoMath.degreesToRadians(angle);
		var x =  this.x * Math.cos(-r) + this.y * Math.sin(-r);
		var y = -this.x * Math.sin(-r) + this.y * Math.cos(-r);

		return new MoVector2D(x, y);
	},

	isLessThan : function(vector) {
		return (this.x < vector.x && this.y < vector.y);
	},

	isGreaterThan : function(vector) {
		return (this.x > vector.x && this.y > vector.y);
	},

	isEqualTo : function(obj) {
		return (this.x == obj.x && this.y == obj.y);
	},

	isZero : function() {
		return (this.x == 0 && this.y == 0);
	},

	toString : function() {
		return ("x:" + this.x + ", y:" + this.y);
	}
});

Object.extend(MoVector2D, {

	NotSet : function() { 
		return new MoVector2D(Infinity, Infinity);
	},

	Zero : function() { 
		return new MoVector2D(0, 0);
	},

	UnitX : function() { 
		return new MoVector2D(1, 0);
	},

	UnitY : function() { 
		return new MoVector2D(0, 1);
	},

	NegativeUnitX : function() { 
		return new MoVector2D(-1, 0);
	},

	NegativeUnitY : function() { 
		return new MoVector2D(0, -1);
	},

	UnitScale : function() { 
		return new MoVector2D(1, 1);
	}
});



//=====================================================================
//= MoVector3D.js
//=====================================================================

MoVector3D = Class.create(MoEquatable, {
	initialize : function(x, y, z) {
		this.x = MoValueOrDefault(x, 0);
		this.y = MoValueOrDefault(y, 0);
		this.z = MoValueOrDefault(z, 0);
	},

	add : function(vector) {
		return MoVector3D.add(this, vector);
	},

	subtract : function(vector) {
		return MoVector3D.subtract(this, vector);
	},

	multiply : function(vector) {
		return MoVector3D.multiply(this, vector);
	},

	divide : function(vector) {
		return MoVector3D.divide(this, vector);
	},

	negate : function()
	{
		return MoVector3D.negate(this);
	},

	length : function() {
		return Math.sqrt(this.lengthSquared());
	},

	lengthSquared : function() {
		return (this.x * this.x + this.y * this.y + this.z * this.z);
	},

	distance : function(vector) {
		return this.subtract(vector).length();
	},

	distanceSquared : function(vector) {
		return this.subtract(vector).lengthSquared();
	},

	dot : function(vector) {
		return MoVector3D.dot(this, vector);
	},

	cross : function(vector) {
		return MoVector3D.cross(this, vector);
	},

	normalize : function() {
		return MoVector3D.normalize(this);
	},
	
	normalizeZero : function() {
		this.x = MoMath.normalizeZero(this.x);
		this.y = MoMath.normalizeZero(this.y);
		this.z = MoMath.normalizeZero(this.z);
		
		return this;
	},

	isEqualTo : function(obj) {
		return (this.x == obj.x && this.y == obj.y && this.z == obj.z);
	},

	toString : function() {
		return "Vector3D[ x:" + this.x + ", y:" + this.y + ", z:" + this.z + " ]";
	}
});

Object.extend(MoVector3D, {

	add : function(v1, v2) {
		return new MoVector3D(
			v1.x + v2.x,
			v1.y + v2.y,
			v1.z + v2.z);
	},
	
	subtract : function(v1, v2) {
		return new MoVector3D(
			v1.x - v2.x,
			v1.y - v2.y,
			v1.z - v2.z);
	},
	
	multiply : function(v1, v2) {
		return new MoVector3D(
			v1.x * v2.x,
			v1.y * v2.y,
			v1.z * v2.z);
	},

	divide : function(v1, v2) {
		return new MoVector3D(
			v1.x / v2.x,
			v1.y / v2.y,
			v1.z / v2.z);
	},
	
	cross : function(v1, v2) {
		return new MoVector3D(
			(v1.y * v2.z) - (v1.z * v2.y),
			(v1.z * v2.x) - (v1.x * v2.z),
			(v1.x * v2.y) - (v1.y * v2.x));
	},
	
	dot : function(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
	},

	negate : function(v) {
		return new MoVector3D(-v.x, -v.y, -v.z);
	},
	
	normalize : function(v) {
		var len = 1 / v.length();
		
		return new MoVector3D(
			v.x * len,
			v.y * len,
			v.z * len);
	},
	
	lerp : function(v1, v2, value) {
		return new MoVector3D(
			v1.x + ((v2.x - v1.x) * value),
			v1.y + ((v2.y - v1.y) * value),
			v1.z + ((v2.z - v1.z) * value));
	},
	
	reflect : function(v, n) {
		var len = v.lengthSquared();
		
		return new MoVector3D(
			v.x - ((len * 2) * n.x),
			v.y - ((len * 2) * n.y),
			v.z - ((len * 2) * n.z));
	},

	min : function(v1, v2) {
		return new MoVector3D(
			Math.min(v1.x, v2.x),
			Math.min(v1.y, v2.y),
			Math.min(v1.z, v2.z));
	},
	
	max : function(v1, v2) {
		return new MoVector3D(
			Math.max(v1.x, v2.x),
			Math.max(v1.y, v2.y),
			Math.max(v1.z, v2.z));	
	},

	NotSet : function() { 
		return new MoVector3D(Infinity, Infinity, Infinity);
	},

	Zero : function() { 
		return new MoVector3D(0, 0, 0);
	},
	
	One : function() { 
		return new MoVector3D(1, 1, 1);
	},

	UnitX : function() { 
		return new MoVector3D(1, 0, 0);
	},

	UnitY : function() { 
		return new MoVector3D(0, 1, 0);
	},

	UnitZ : function() { 
		return new MoVector3D(0, 0, 1);
	},
	
	NegativeUnitX : function() { 
		return new MoVector3D(-1, 0, 0);
	},

	NegativeUnitY : function() { 
		return new MoVector3D(0, -1, 0);
	},
	
	NegativeUnitZ : function() { 
		return new MoVector3D(0, 0, -1);
	},

	Up : function() { 
		return new MoVector3D(0, 1, 0);
	},
	
	Down : function() { 
		return new MoVector3D(0, -1, 0);
	},
	
	Left : function() { 
		return new MoVector3D(-1, 0, 0);
	},
	
	Right : function() { 
		return new MoVector3D(1, 0, 0);
	},
	
	Forward : function() { 
		return new MoVector3D(0, 0, -1);
	},
	
	Backward : function() { 
		return new MoVector3D(0, 0, 1);
	}
});



//=====================================================================
//= MoNoise.js
//=====================================================================

MoNoise = Class.create({
	initialize : function() {
		this.d = [];
		
		for(var i = 0; i < MoNoise.Size + 1; i++)
			this.d[i] = Math.random();
		
		this.cosT = MoNoise.CosLut;
		this.twoPi = this.pi = MoNoise.Length;
		this.pi >>= 1;
	},
	
	generate : function(x, y, z) {
		if(MoIsNull(z))
			z = 0;
			
		if (x < 0) 
			x = -x;
			
		if (y < 0) 
			y = -y;
			
		if (z < 0) 
			z = -z;
			
		var xi = x;
		var yi = y;
		var zi = z;
		var xf = x - xi;
		var yf = y - yi;
		var zf = z - zi;
		var rxf;
		var ryf;
		var r = 0;
		var ampl = 0.5;
		var n1;
		var n2;
		var n3;
		
		for (var i = 0; i < MoNoise.Octaves; i++) 
		{
			var of = xi + (yi << MoNoise.YWrapB) + (zi << MoNoise.ZWrapB);
			
			rxf = this.fsc(xf);
			ryf = this.fsc(yf);
			
			n1 = this.d[of & MoNoise.Size];
			n1 += rxf * (this.d[(of + 1) & MoNoise.Size] - n1);
			
			n2 = this.d[(of + MoNoise.YWrap) & MoNoise.Size];
			n2 += rxf * (this.d[(of + MoNoise.YWrap + 1) & MoNoise.Size] - n2);
			
			n1 += ryf * (n2 - n1);
			
			of += MoNoise.ZWrap;
			
			n2 = this.d[of & MoNoise.Size];
			n2 += rxf * (this.d[(of + 1) & MoNoise.Size] - n2);
			
			n3 = this.d[(of + MoNoise.YWrap) & MoNoise.Size];
			n3 += rxf * (this.d[(of + MoNoise.YWrap + 1) & MoNoise.Size] - n3);
			
			n2 += ryf * (n3 - n2);
			
			n1 += this.fsc(zf) * (n2 - n1);
			
			r += n1 * ampl;
			ampl *= MoNoise.Falloff;

			xi <<= 1;
			xf *= 2;

			yi <<= 1;
			yf *= 2;

			zi <<= 1;
			zf *= 2;

			if (xf >= 1.0) 
			{
				xi++;
				xf--;
			}

			if (yf >= 1.0) 
			{
				yi++;
				yf--;
			}
			
			if (zf >= 1.0) 
			{
				zi++;
				zf--;
			}
		}
		
		return r;
	},
	
	fsc : function(i) {
		return 0.5 * (1.0 - this.cosT[Math.round(i * this.pi) % this.twoPi]);
	}
});

Object.extend(MoNoise, {
	Instance : null,
	SinLut : [],
	CosLut : [],
	Precision : 0.5,
	Length : 0,
	YWrapB : 4,
	YWrap : 1 << MoNoise.YWrapB,
	ZWrapB : 8,
	ZWrap : 1 << MoNoise.ZWrapB,
	Size : 4095,
	Octaves : 4,
	Falloff : 0.5,
	
	perlin : function(x, y, z) {
		
		// initialize
		if(MoNoise.Instance == null)
		{
			MoNoise.Length = Math.round(360 / MoNoise.Precision);
			
			for(var i = 0; i < MoNoise.Length; i++)
			{
				MoNoise.SinLut[i] = Math.sin(i * (Math.PI / 180.0) * MoNoise.Precision);
				MoNoise.CosLut[i] = Math.cos(i * (Math.PI / 180.0) * MoNoise.Precision);
			}
			
			MoNoise.Instance = new MoNoise();
		}
		
		return MoNoise.Instance.generate(x, y, z);
	}
});



//=====================================================================
//= MoDirtyRegionTracker.js
//=====================================================================

MoDirtyRegion = Class.create(MoEquatable, {
	initialize : function() {
		this.x1 = MoMaxInt;
		this.y1 = MoMaxInt;
		this.x2 = MoMinInt;
		this.y2 = MoMinInt;
	},
	
	clear : function() {
		this.x1 = MoMaxInt;
		this.y1 = MoMaxInt;
		this.x2 = MoMinInt;
		this.y2 = MoMinInt;
	},
	
	isEmpty : function() {
		return (this.x1 == MoMaxInt); // only need to check one
	},
	
	getRect : function() {
		return new MoRectangle(this.x1, this.y1, this.getWidth(), this.getHeight());
	},
	
	getWidth : function() {
		return (this.x2 - this.x1);
	},
	
	getHeight : function() {
		return (this.y2 - this.y1);
	},
	
	grow : function(x1, y1, x2, y2) {
		this.x1 = Math.min(x1, this.x1);
		this.y1 = Math.min(y1, this.y1);
		this.x2 = Math.max(x2, this.x2);
		this.y2 = Math.max(y2, this.y2);
		
		MoDirtyRegionTracker.current().add(this);
	},

	inflate : function(amount) {
		this.x1 -= amount;
		this.y1 -= amount;
		this.x2 += amount;
		this.y2 += amount;
	},

	combine : function(other) {
		this.grow(other.x1, other.y1, other.x2, other.y2);
	},

	combineRect : function(rect) {
		this.grow(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
	},

	translate : function(x, y) {
		if(this.x1 != MoMaxInt) 
		{
			this.x1 += x;
			this.x2 += x;
			
			this.y1 += y;
			this.y2 += y;
		}
	},
	
	toString : function() {
		return "DirtyRegion(x1: " + this.x1 + ", y1: " + this.y1 + ", x2: " + this.x2 + ", y2: " + this.y2 + ")";
	}
});

MoDirtyRegionTracker = Class.create(
// @PRIVATE
{
	initialize : function() {
		this.regionCache = [];
	},
	
	clear : function() {
		this.regionCache = [];
	},
	
	isEmpty : function() {
		return (this.regionCache.length == 0);
	},
	
	getRects : function() {
		return this.regionCache;
	},
	
	add : function(dirtyRegion) {
		if(MoIsNull(dirtyRegion) || dirtyRegion.isEmpty())
			return;

		var regions = [];
		var rect = dirtyRegion.getRect().round().inflate(4, 4);
		var isLoner = true;
		
		for(var i = this.regionCache.length-1; i >= 0; --i)
		{
			var region = this.regionCache[i];

			if(rect.intersects(region))
				this.regionCache[i] = rect.unionWithRect(region);
			else
				regions.push(region);
		}
		
		regions.push(rect);
		
		this.regionCache = regions;
	}
});

Object.extend(MoDirtyRegionTracker, 
// @PRIVATE
{
	Instance : null,
	
	current : function() {
		if(MoDirtyRegionTracker.Instance == null)
			MoDirtyRegionTracker.Instance = new MoDirtyRegionTracker();

		return MoDirtyRegionTracker.Instance;
	}
});


//=====================================================================
//= MoFontStretch.js
//=====================================================================

MoFontStretch = {
	"Normal" 			: 1,
	"SemiCondensed" 	: 2,
	"Condensed" 		: 3,
	"ExtraCondensed" 	: 4,
	"UltraCondensed"	: 5,
	"SemiExpanded"		: 6,
	"Expanded"			: 7,
	"ExtraExpanded"		: 8,
	"UltraExpanded"		: 9
};


//=====================================================================
//= MoFontStyle.js
//=====================================================================

MoFontStyle = {
	"Normal" 	: 1,
	"Oblique"	: 2,
	"Italic" 	: 3
};


//=====================================================================
//= MoFontWeight.js
//=====================================================================

MoFontWeight = {
	"Thin" 			: 100,
	"ExtraLight"	: 200,
	"Light" 		: 300,
	"Normal" 		: 400,
	"Medium"		: 500,
	"SemiBold"		: 600,
	"Bold"			: 700,
	"ExtraBold"		: 800,
	"Black"			: 900
};


//=====================================================================
//= MoFont.js
//=====================================================================

MoFont = Class.create(MoEquatable, {
	initialize : function() {

		/** String **/
		this.fontName = "sans-serif";
		
		/** Number **/
		this.fontSize = 10;
		
		/** MoFontStretch **/
		this.fontStretch = MoFontStretch.Normal;
		
		/** MoFontStyle **/
		this.fontStyle = MoFontStyle.Normal;

		/** MoFontWeight **/
		this.fontWeight = MoFontWeight.Normal;
	},
	
	getFontName : function() {
		return this.fontName;
	},
	
	setFontName : function(value) {
		this.fontName = value;
	},
	
	getFontSize : function() {
		return this.fontSize;
	},

	setFontSize : function(value) {
		this.fontSize = value;
	},
	
	getFontStretch : function() {
		return this.fontStretch;
	},
	
	setFontStretch : function(value) {
		this.fontStretch = value;
	},
	
	getFontStyle : function() {
		return this.fontStyle;
	},
	
	setFontStyle : function(value) {
		this.fontStyle = value;
	},
	
	getFontWeight : function() {
		return this.fontWeight;
	},
	
	setFontWeight : function(value) {
		this.fontWeight = value;
	},
	
	getStretchCSSValue : function() {
		switch(this.fontStretch)
		{
			case MoFontStretch.SemiCondensed:
				return "semi-condensed";
			case MoFontStretch.Condensed:
				return "condensed";
			case MoFontStretch.ExtraCondensed:
				return "extra-condensed";
			case MoFontStretch.UltraCondensed:
				return "ultra-condensed";
			case MoFontStretch.SemiExpanded:
				return "semi-expanded";
			case MoFontStretch.Expanded:
				return "expanded";
			case MoFontStretch.ExtraExpanded:
				return "extra-expanded";
			case MoFontStretch.UltraExpanded:
				return "ultra-expanded";
		}
		
		return "normal";
	},
	
	getStyleCSSValue : function() {
		switch(this.fontStyle)
		{
			case MoFontStyle.Oblique:
				return "oblique";
			case MoFontStyle.Italic:
				return "italic";
		}
		
		return "normal";
	},

	getStringWidth : function(canvas, str) {
		var ctx = canvas.getContext("2d");
		var prevFont = ctx.font;
		var width = 0;
		
		ctx.font = this.toString();
		width = ctx.measureText(str).width;
		ctx.font = prevFont;

		return width;
	},
	
	measureString : function(str, maxWidth) {		
		var canvas = document.createElement("canvas");
		var ctx = canvas.getContext("2d");
		var metrics = null;
		var actualWidth = 0;
		
		canvas.font = this.toString();
		metrics = ctx.measureText(str);
		actualWidth = metrics.width;
		
		if(!MoIsNull(maxWidth) && maxWidth < actualWidth)
			actualWidth = maxWidth;

		// make sure these references are removed
		// just in case
		ctx = null;
		canvas = null;

		////////////////////////////////////////////////////////
		//                             can only approximate here
		return new MoSize(actualWidth, this.fontSize * 1.2);
		
		// var elLastChild = document.lastChild;
		
		// // create a temp span element, assign the text and font css style
		// var elSpan = document.createElement("span");
		// elSpan.textContent = str;
		// elSpan.style.font = this.toString();

		// if(maxWidth != null)
		// {
			// elSpan.style.display = "inline-block";
			// elSpan.style.width = maxWidth + "px";
		// }

		// // add the span to the end of the document, just so we
		// // can get the measurements
		// elLastChild.appendChild(elSpan);
		
		// // now get the measurements
		// var bounds = elSpan.getBoundingClientRect();
		
		// // finally, remove the span, this should be good enough to
		// // avoid any flicker or wierdness with the current page
		// elLastChild.removeChild(elSpan);
		
		// return new MoSize(bounds.width, bounds.height);
	},
	
	toString : function() {
		var sizeString = this.fontSize.toString() + "px";
		var weightString = this.fontWeight.toString();
		var styleString = this.getStyleCSSValue();

		return styleString + " normal " + weightString + " " + sizeString + " " + this.fontName
	},
	
	toCSSFontRule : function(srcOrDataUri) {
		var rule = "@font-face { font-family: '" + this.fontName + "'; ";
		
		if(this.fontStyle != MoFontStyle.Normal)
			rule += "font-style: " + this.getStyleCSSValue() + "; ";
			
		if(this.fontWeight != MoFontWeight.Normal)
			rule += "font-weight: " + this.fontWeight.toString() + "; ";
		
		if(this.fontStretch != MoFontStretch.Normal)
			rule += "font-stretch: " + this.getStretchCSSValue() + "; ";

		rule += "src: url('" + srcOrDataUri + "'); }";

		return rule;
	}
});

Object.extend(MoFont, {
	create : function(name, style, weight, stretch, size) {
		var f = new MoFont();
		
		f.setFontName(name);
		f.setFontStyle(MoValueOrDefault(style, MoFontStyle.Normal));
		f.setFontWeight(MoValueOrDefault(weight, MoFontWeight.Normal));
		f.setFontStretch(MoValueOrDefault(stretch, MoFontStretch.Normal));
		f.setFontSize(MoValueOrDefault(size, 10));

		return f;
	}
});



//=====================================================================
//= MoScreenOrientation.js
//=====================================================================

MoScreenOrientation = {
	"Portrait"				: 0,
	"LandscapeRight"		: 1,
	"LandscapeLeft"			: 2,
	"PortraitUpsideDown"	: 3
};


//=====================================================================
//= MoScreen.js
//=====================================================================

MoScreen = Class.create({
	initialize : function(screen) {
		this.pixelScale = (MoIsNull(window.devicePixelRatio) ? 1 : window.devicePixelRatio);
		this.colorDepth = screen.colorDepth;
		this.bounds = new MoRectangle(screen.left, screen.top, screen.width, screen.height);
		this.visibleBounds = new MoRectangle(screen.availLeft, screen.availTop, screen.availWidth, screen.availHeight);
	},
	
	getColorDepth : function() {
		return this.colorDepth;
	},
	
	getPixelScale : function() {
		return this.pixelScale;
	},
	
	getBounds : function() {
		return this.bounds;
	},
	
	getVisibleBounds : function() {
		return this.visibleBounds;
	}
});

Object.extend(MoScreen, {
	Instance : null,
	
	getCurrent : function() {
		if(MoScreen.Instance == null)
			MoScreen.Instance = new MoScreen(window.screen);
		
		return MoScreen.Instance;
	}
});


//=====================================================================
//= MoGamepadType.js
//=====================================================================

MoGamepadType = {
	Unknown	: 0,
	GamePad : 1
};


//=====================================================================
//= MoGamepadDeadZoneSize.js
//=====================================================================

MoGamepadDeadZoneSize = {
	None			: 0,
	LeftStick		: 7849 / MoMaxShort,
	RightStick		: 8689 / MoMaxShort,
	Trigger			: 30 / 255.0
};


//=====================================================================
//= MoGamepadDeadZoneMode.js
//=====================================================================

MoGamepadDeadZoneMode = {
	None 			: 0,
	Normal			: 1,
	Circular		: 2
};


//=====================================================================
//= MoGamepadButtons.js
//=====================================================================

MoGamepadButtons = {
	None			:  0,
	A				: (1 <<  0),
	B				: (1 <<  1),
	X				: (1 <<  2),
	Y				: (1 <<  3),
	Start			: (1 <<  4),
	Back			: (1 <<  5),
	Big				: (1 <<  6),
	DPadUp			: (1 <<  7),
	DPadDown		: (1 <<  8),
	DPadLeft		: (1 <<  9),
	DPadRight		: (1 << 10),
	LeftShoulder	: (1 << 11),
	LeftTrigger		: (1 << 12),
	LeftStick		: (1 << 13),
	LeftStickUp		: (1 << 14),
	LeftStickDown	: (1 << 15),
	LeftStickLeft	: (1 << 16),
	LeftStickRight	: (1 << 17),
	RightShoulder	: (1 << 18),
	RightTrigger	: (1 << 19),
	RightStick		: (1 << 20),
	RightStickUp	: (1 << 21),
	RightStickDown	: (1 << 22),
	RightStickLeft	: (1 << 23),
	RightStickRight	: (1 << 24)
};


//=====================================================================
//= MoGamepadButtonMap.js
//=====================================================================

MoGamepadButtonMap = Class.create({
	initialize : function(map) {
		this.map = MoValueOrDefault(map, []);

		// just default to 32 available slots
		if(MoIsNull(map))
		{
			for(var i = 0; i < 32; ++i)
				this.map.push(MoGamepadButtons.None);
		}
	},
	
	indexOf : function(button) {
		if(button == MoGamepadButtons.None)
			return -1;

		for(var i = 0, len = this.map.length; i < len; ++i)
		{
			if(this.map[i] === button)
				return i;
		}

		return -1;
	},
	
	get : function(index) {
		if(this.isValidIndex(index))
			return this.map[index];
		
		return MoGamepadButtons.None;
	},
	
	add : function(button, index) {
		button = MoValueOrDefault(button, MoGamepadButtons.None);

		if(this.isValidIndex(index))
			this.map[index] = button;
	},

	remove : function(index) {
		if(this.isValidIndex(index))
			this.map[index] = MoGamepadButtons.None;
	},

	isValidIndex : function(index) {
		return (index >= 0 && index < this.map.length);
	}
});

Object.extend(MoGamepadButtonMap, {
	XBOX360 : new MoGamepadButtonMap([
		MoGamepadButtons.A, MoGamepadButtons.B, 
		MoGamepadButtons.X, MoGamepadButtons.Y,
		MoGamepadButtons.LeftShoulder, MoGamepadButtons.RightShoulder,
		MoGamepadButtons.None, MoGamepadButtons.None, // triggers are processed independantly
		MoGamepadButtons.Back, MoGamepadButtons.Start,
		MoGamepadButtons.LeftStick, MoGamepadButtons.RightStick,
		MoGamepadButtons.DPadUp, MoGamepadButtons.DPadDown,
		MoGamepadButtons.DPadLeft, MoGamepadButtons.DPadRight
	])
});


//=====================================================================
//= MoGamepadState.js
//=====================================================================

MoGamepadState = Class.create(MoEquatable, {
	initialize : function() {
		// just initialize our class members here and let the update method 
		// actually set their values so we can avoid duplicating the code and
		// making state swaps more efficient
		this.name = null;
		this.index = null;
		this.timestamp = null;
		this.isConnected = null;
		this.buttons = null;
		this.leftTrigger = null;
		this.leftTriggerRaw = null;
		this.rightTrigger = null;
		this.rightTriggerRaw = null;
		this.leftStickValue = null;
		this.leftStickValueRaw = null;
		this.rightStickValue = null;
		this.rightStickValueRaw = null;
	},
	
	getName : function() {
		return this.name;
	},
	
	getIndex : function() {
		return this.index;
	},
	
	getIsConnected : function() {
		return this.isConnected;
	},
	
	getTimestamp : function() {
		return this.timestamp;
	},
	
	getA : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.A);
	},
	
	getB : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.B);
	},
	
	getX : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.X);
	},
	
	getY : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.Y);
	},
	
	getBack : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.Back);
	},
	
	getStart : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.Start);
	},
	
	getBig : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.Big);
	},
	
	getLeftShoulder : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.LeftShoulder);
	},
	
	getRightShoulder : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.RightShoulder);
	},
	
	getLeftTrigger : function() {
		return (this.getLeftTriggerValue() > 0);
	},
	
	getLeftTriggerValue : function(raw) {
		if(raw)
			return this.leftTriggerRaw;
		
		return this.leftTrigger;
	},
	
	getRightTrigger : function() {
		return (this.getRightTriggerValue() > 0);
	},
	
	getRightTriggerValue : function(raw) {
		if(raw)
			return this.rightTriggerRaw;

		return this.rightTrigger;
	},
	
	getLeftStick : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.LeftStick);
	},
	
	getLeftStickValue : function(raw) {
		if(raw)
			return this.leftStickValueRaw;

		return this.leftStickValue;
	},
	
	getRightStick : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.RightStick);
	},
	
	getRightStickValue : function(raw) {
		if(raw)
			return this.rightStickValueRaw;
		
		return this.rightStickValue;
	},
	
	getDPadUp : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.DPadUp);
	},
	
	getDPadDown : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.DPadDown);
	},
	
	getDPadLeft : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.DPadLeft);
	},
	
	getDPadRight : function() {
		return this.hasFlag(this.buttons, MoGamepadButtons.DPadRight);
	},
	
	getLeftStickUp : function() {
		return (this.leftStickValue.y < 0);
	},
	
	getLeftStickDown : function() {
		return (this.leftStickValue.y > 0);
	},
	
	getLeftStickLeft : function() {
		return (this.leftStickValue.x < 0);
	},

	getLeftStickRight : function() {
		return (this.leftStickValue.x > 0);
	},
	
	getRightStickUp : function() {
		return (this.rightStickValue.y < 0);
	},
	
	getRightStickDown : function() {
		return (this.rightStickValue.y > 0);
	},
	
	getRightStickLeft : function() {
		return (this.rightStickValue.x < 0);
	},
	
	getRightStickRight : function() {
		return (this.rightStickValue.x > 0);
	},
	
	isDown : function(button) {
		var state = this.buttons;
		
		if(this.getLeftStickUp())
			state |= MoGamepadButtons.LeftStickUp;
		if(this.getLeftStickDown())
			state |= MoGamepadButtons.LeftStickDown;
		if(this.getLeftStickLeft())
			state |= MoGamepadButtons.LeftStickLeft;
		if(this.getLeftStickRight())
			state |= MoGamepadButtons.LeftStickRight;
			
		if(this.getRightStickUp())
			state |= MoGamepadButtons.RightStickUp;
		if(this.getRightStickDown())
			state |= MoGamepadButtons.RightStickDown;
		if(this.getRightStickLeft())
			state |= MoGamepadButtons.RightStickLeft;
		if(this.getRightStickRight())
			state |= MoGamepadButtons.RightStickRight;
			
		if(this.getLeftTrigger())
			state |= MoGamepadButtons.LeftTrigger;
		if(this.getRightTrigger())
			state |= MoGamepadButtons.RightTrigger;

		return this.hasFlag(state, button);
	},
	
	isUp : function(button) {
		return !this.isDown(button);
	},

	hasFlag : function(flags, flag) {
		return ((flags & flag) == flag);
	},
	
	filterLeftStickValue : function(x, y) {
		return this.filterStickValue(x, y, MoGamepad.getLeftStickDeadZoneMode(), MoGamepad.getLeftStickDeadZoneSize());
	},
	
	filterRightStickValue : function(x, y) {
		return this.filterStickValue(x, y, MoGamepad.getRightStickDeadZoneMode(), MoGamepad.getRightStickDeadZoneSize());
	},

	filterStickValue : function(x, y, deadZoneMode, deadZoneSize) {
		if(deadZoneMode == MoGamepadDeadZoneMode.Circular)
		{
			var magnitude = Math.sqrt(x * x + y * y);
			var value = this.filterValue(magnitude, deadZoneSize);
			var normalized = (value > 0 ? value / magnitude : 0);
			
			return new MoVector2D(
				MoMath.clamp(x * normalized, -1.0, 1.0),
				MoMath.clamp(y * normalized, -1.0, 1.0));
		}

		if(deadZoneMode == MoGamepadDeadZoneMode.None)
			deadZoneSize = 0;

		return new MoVector2D(
			this.filterValue(x, deadZoneSize), 
			this.filterValue(y, deadZoneSize));
	},
	
	filterTriggerValue : function(value) {
		if(MoGamepad.getTriggerDeadZoneMode() != MoGamepadDeadZoneMode.None)
			return this.filterValue(value, MoGamepad.getTriggerDeadZoneSize());

		return this.filterValue(value, 0);
	},
	
	filterValue : function(value, size) {
		if(value < -size)
			value += size;
		else
		{
			if(value <= size)
				return 0;
			
			value -= size;
		}

		return MoMath.clamp(value / (1.0 - size), -1.0, 1.0);
	},
	
	update : function(name, index, timestamp, isConnected, buttons, leftStickValue, rightStickValue, leftTrigger, rightTrigger) {
		this.name = MoValueOrDefault(name, "");
		this.index = index;
		this.timestamp = timestamp;
		this.isConnected = isConnected;
		this.buttons = buttons;		

		this.leftTrigger = MoMath.clamp(this.filterTriggerValue(leftTrigger), 0, 1);
		this.leftTriggerRaw = MoMath.clamp(leftTrigger, 0, 1);
		this.rightTrigger = MoMath.clamp(this.filterTriggerValue(rightTrigger), 0, 1);
		this.rightTriggerRaw = MoMath.clamp(rightTrigger, 0, 1);
		
		this.leftStickValue = this.filterLeftStickValue(leftStickValue.x, leftStickValue.y);
		this.leftStickValueRaw = MoVector2D.Zero();
		this.leftStickValueRaw.x = MoMath.clamp(leftStickValue.x, -1, 1);
		this.leftStickValueRaw.y = MoMath.clamp(leftStickValue.y, -1, 1);

		this.rightStickValue = this.filterRightStickValue(rightStickValue.x, rightStickValue.y);
		this.rightStickValueRaw = MoVector2D.Zero();
		this.rightStickValueRaw.x = MoMath.clamp(rightStickValue.x, -1, 1);
		this.rightStickValueRaw.y = MoMath.clamp(rightStickValue.y, -1, 1);
	},

	copy : function() {
		var c = new MoGamepadState();
		c.update(this.name, this.index, this.timestamp, this.isConnected, this.buttons, this.leftStickValue, this.rightStickValue, this.leftTrigger, this.rightTrigger);
		return c;
	},

	copyFrom : function(other) {
		this.name = other.name;
		this.index = other.index;
		this.timestamp = other.timestamp;
		this.isConnected = other.isConnected;
		this.buttons = other.buttons;
		this.leftTrigger = other.leftTrigger;
		this.leftTriggerRaw = other.leftTriggerRaw;
		this.rightTrigger = other.rightTrigger;
		this.rightTriggerRaw = other.rightTriggerRaw;
		this.leftStickValue.x = other.leftStickValue.x;
		this.leftStickValue.y = other.leftStickValue.y;
		this.leftStickValueRaw.x = other.leftStickValueRaw.x;
		this.leftStickValueRaw.y = other.leftStickValueRaw.y;
		this.rightStickValue.x = other.rightStickValue.x;
		this.rightStickValue.y = other.rightStickValue.y;
		this.rightStickValueRaw.x = other.rightStickValueRaw.x;
		this.rightStickValueRaw.y = other.rightStickValueRaw.y;
	}
});


//=====================================================================
//= MoGamepadEvent.js
//=====================================================================

MoGamepadEvent = Class.create(MoEvent, {
	initialize : function($super, type, index, bubbles, cancelable) {
		$super(type, bubbles, cancelable);
		
		this.index = index;
	},

	getIndex : function() {
		return this.index;
	}
});

Object.extend(MoGamepadEvent, {
	CONNECTED 		: "connected",
	DISCONNECTED	: "disconnected"
});


//=====================================================================
//= MoGamepadButtonEvent.js
//=====================================================================

MoGamepadButtonEvent = Class.create(MoGamepadEvent, {
	initialize : function($super, type, index, button, isDown, timestamp, bubbles, cancelable) {
		$super(type, index, bubbles, cancelable);
		
		this.button = button;
		this.timestamp = timestamp;
		this.isDown = MoValueOrDefault(isDown, false);
	},

	getIsDown : function() {
		return this.isDown;
	},

	getTimestamp : function() {
		return this.timestamp;
	},
	
	getButton : function() {
		return this.button;
	}
});

Object.extend(MoGamepadButtonEvent, {
	DOWN	: "gamepadButtonDown",
	UP		: "gamepadButtonUp"
});


//=====================================================================
//= MoGamepad.js
//=====================================================================

MoGamepad = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.connected = [false,false,false,false];
		this.timestamps = [0,0,0,0];
		this.states = [null, null, null, null];
		this.prevStates = [null, null, null, null];
		this.deadZoneSizes = [MoGamepadDeadZoneSize.Trigger, MoGamepadDeadZoneSize.LeftStick, MoGamepadDeadZoneSize.RightStick];
		this.deadZoneModes = [MoGamepadDeadZoneMode.Normal,  MoGamepadDeadZoneMode.Normal,    MoGamepadDeadZoneMode.Normal];
		this.mapping = MoGamepadButtonMap.XBOX360;
		this.eventTimer = null;
		this.eventTicks = [0,0,0,0];
		this.buttonEventCache = null;
		this.inputIndex = 0;
		
		if(MoIsFirefox())
		{
			navigator.mozGamepads = [];
			
			window.addEventListener("MozGamepadConnected", this.onMozGamepadConnected);
			window.addEventListener("MozGamepadDisconnected", this.onMozGamepadDisconnected);
		}
		
		// setup a timer to check the connection status
		// for each controller, this will allow us to 
		// dispatch connected/disconnected events properly
		var me = this;
		
		setInterval(function() {
			me.validateConnectionStatus();
		}, 500);
	},
	
	onMozGamepadConnected : function(e) {
		navigator.mozGamepads[e.gamepad.index] = e.gamepad;
	},
	
	onMozGamepadDisconnected : function(e) {
		navigator.mozGamepads[e.gamepad.index] = undefined;
	},

	getIsConnected : function(index) {
		if(index < 1 || index > 4)
			throw new Error("Index must be between 1 and 4.");

		return this.connected[index-1];
	},
	
	getLastState : function(index) {
		if(index < 1 || index > 4)
			throw new Error("Index must be between 1 and 4.");	
			
		if(!this.connected[index-1])
			return null;

		return this.prevStates[index-1];
	},

	getState : function(index) {	
		if(index < 1 || index > 4)
			throw new Error("Index must be between 1 and 4.");

		if(!this.connected[index-1])
			return null;

		var idx = index-1;
		var gp = MoGamepads()[idx];
		var ts = this.timestamps[idx];
		var lastState = this.prevStates[idx];
		var state = null;

		// no new input has been read since the last time
		if(ts != 0 && (gp.timestamp - ts) == 0)
		{
			// make sure to update the last state, otherwise if a button
			// was pressed then released it will always seem that way when
			// in actual, it's a no change
			if(!MoIsNull(lastState))
				lastState.copyFrom(this.states[idx]);

			return this.states[idx];
		}

		// update the timestamp
		this.timestamps[idx] = gp.timestamp;

		// state has never been read for this gamepad, so
		// create a new state to hold our values
		if(MoIsNull(this.states[idx]))
			this.states[idx] = new MoGamepadState();
		
		// get the current state and the previous state
		state = this.states[idx];

		// since the previous state is not null, we can simply
		// copy the values over from the current state and
		// avoid a new allocation
		if(lastState != null)
			lastState.copyFrom(state);

		// again, instead of allocating a new state object
		// we just update the one we already have
		var buttonValues = this.getButtonValues(gp);
		var stickValues = this.getStickValues(gp);
		var triggerValues = this.getTriggerValues(gp);

		state.update(gp.id, gp.index, gp.timestamp, true, buttonValues, stickValues[0], stickValues[1], triggerValues[0], triggerValues[1]);
		
		// finally, if the previous state was indeed null,
		// then just clone the current state object even if
		// this is the first time through, this will make
		// any delta comparisons zero
		if(lastState == null)
			this.prevStates[idx] = state.copy();
			
		return state;
	},
	
	getButtonValues : function(gp) {
		var buttons = MoGamepadButtons.None;
		
		for(var i = 0, len = gp.buttons.length; i < len; ++i)
			buttons |= this.getFlagForButton(gp, i, this.mapping.get(i));

		return buttons;
	},

	getStickValues : function(gp) {
		return [new MoVector2D(gp.axes[0], gp.axes[1]),
				new MoVector2D(gp.axes[2], gp.axes[3])];
	},

	getTriggerValues : function(gp) {
		return [gp.buttons[6], gp.buttons[7]];
	},

	getFlagForButton : function(gp, idx, button) {
		return (gp.buttons[idx] == 0 ? 0 : button);
	},
	
	enableEvents : function() {
		if(!MoIsNull(this.eventTimer))
			return;
		
		this.eventTimer = new MoTimer(1000 / MoApplication.getInstance().getFrameRate());
		this.eventTimer.addEventHandler(MoTimerEvent.TICK, this.onEventTimerTick.d(this));
		this.eventTimer.start();
	},

	disableEvents : function() {
		if(MoIsNull(this.eventTimer))
			return;

		this.eventTimer.stop();
		this.eventTimer = null;
		this.eventTicks = [0,0,0,0];
	},

	onEventTimerTick : function(e) {
		var lastFrameTick = 0;
		var lastState = null;
		var state = null;
		var tickNow = MoGetTimer();
		var includeDownEvents = false;

		for(var i = 1; i <= 4; ++i)
		{
			lastState = this.getLastState(i);
			state = this.getState(i);

			// gamepad disconnected
			if(state == null)
				continue;

			// determine whether a sufficient amount of time has passed to dispatch repeated down events
			// or to skip them and allow some catch up, otherwise, if a user presses a button then a down
			// event could be sent numerous times before an up event, however, we want to try and simulate
			// a true button press/release, then if the user holds it can be considered a repeating down
			// event.
			//
			// FIXME : should probably rethink this after a bit more testing, because the event API is
			//         meant for general navigation and not for high-frequency input processing as games
			//         usually need, we can probably just lock the event timer down to a fixed rate
			//         instead of clocking off the main frame rate.
			//
			lastFrameTick = this.eventTicks[i-1];
			includeDownEvents = (lastFrameTick == 0 || (tickNow - lastFrameTick) >= 150);

			// process any events
			if(this.processStateEvents(i, lastState, state, includeDownEvents))
				this.eventTicks[i-1] = tickNow;
		}
	},

	processStateEvents : function(index, lastState, state, includeDownEvents) {
		var downEventProcessed = false;
		
		for(var b in MoGamepadButtons)
		{
			// skip any built in properties or the None value
			if(!MoGamepadButtons.hasOwnProperty(b) || b == "None")
				continue;

			var buttonFlag = MoGamepadButtons[b];

			// dispatch down event
			if(includeDownEvents && state.isDown(buttonFlag))
			{
				downEventProcessed = true;
				this.dispatchEvent(this.createButtonEvent(MoGamepadButtonEvent.DOWN, index, buttonFlag, true, MoGetTimer()));
			}

			// unable to check for up events without a 
			// previous state
			if(lastState == null)
				continue;

			// dispatch up event
			if(lastState.isDown(buttonFlag) && !state.isDown(buttonFlag))
				this.dispatchEvent(this.createButtonEvent(MoGamepadButtonEvent.UP, index, buttonFlag, true, MoGetTimer()));
		}
		
		return downEventProcessed;
	},
	
	createButtonEvent : function(type, index, button, isDown, timestamp) {
		if(this.buttonEventCache == null)
			this.buttonEventCache = new MoGamepadButtonEvent(type, index, button, isDown, timestamp);
		else
		{
			this.buttonEventCache.reuse();
			this.buttonEventCache.type = type;
			this.buttonEventCache.index = index;
			this.buttonEventCache.button = button;
			this.buttonEventCache.isDown = isDown;
			this.buttonEventCache.timestamp = timestamp;
		}

		return this.buttonEventCache;
	},

	validateConnectionStatus : function() {
		for(var i = 0; i < 4; ++i)
		{
			var oldValue = this.connected[i];
			var newValue = !MoIsNull(MoGamepads()[i]);
			
			if(oldValue != newValue)
			{
				this.connected[i] = newValue;
				this.dispatchEvent(new MoGamepadEvent((newValue ? MoGamepadEvent.CONNECTED : MoGamepadEvent.DISCONNECTED), (i+1)));
			}
		}
	}
});

Object.extend(MoGamepad, {
	Instance : null,

	getInstance : function() {
		if(MoGamepad.Instance == null)
			MoGamepad.Instance = new MoGamepad();
			
		return MoGamepad.Instance;
	},
	
	getState : function(index) {
		return MoGamepad.getInstance().getState(index);
	},
	
	getIsAvailable : function() {
		return !MoIsNull(MoGamepads());
	},
	
	getInputIndex : function() {
		return MoGamepad.getInstance().inputIndex;
	},

	setInputIndex : function(value) {
		MoGamepad.getInstance().inputIndex = value;
	},
	
	setEnableEvents : function(value) {
		MoGamepad.getInstance()[value ? "enableEvents" : "disableEvents"]();
	},
	
	getTriggerDeadZoneMode : function() {
		return MoGamepad.getInstance().deadZoneModes[0];
	},
	
	setTriggerDeadZoneMode : function(value) {
		MoGamepad.getInstance().deadZoneModes[0] = value;
	},
	
	getTriggerDeadZoneSize : function() {
		return MoGamepad.getInstance().deadZoneSizes[0];
	},
	
	setTriggerDeadZoneSize : function(value) {
		MoGamepad.getInstance().deadZoneSizes[0] = value;
	},
	
	getLeftStickDeadZoneMode : function() {
		return MoGamepad.getInstance().deadZoneModes[1];
	},
	
	setLeftStickDeadZoneMode : function(value) {
		MoGamepad.getInstance().deadZoneModes[1] = value;
	},
	
	getLeftStickDeadZoneSize : function() {
		return MoGamepad.getInstance().deadZoneSizes[1];
	},
	
	setLeftStickDeadZoneSize : function(value) {
		MoGamepad.getInstance().deadZoneSizes[1] = value;
	},
	
	getRightStickDeadZoneMode : function() {
		return MoGamepad.getInstance().deadZoneModes[2];
	},
	
	setRightStickDeadZoneMode : function(value) {
		MoGamepad.getInstance().deadZoneModes[2] = value;
	},
	
	getRightStickDeadZoneSize : function() {
		return MoGamepad.getInstance().deadZoneSizes[2];
	},
	
	setRightStickDeadZoneSize : function(value) {
		MoGamepad.getInstance().deadZoneSizes[2] = value;
	}
});


//=====================================================================
//= MoTextAlignment.js
//=====================================================================

MoTextAlignment = {
	"Left"		: 1,
	"Center"	: 2,
	"Right"		: 3
};


//=====================================================================
//= MoTextTrimming.js
//=====================================================================

MoTextTrimming = {
	"None"		: 0,
	"Character"	: 1,
	"Word"		: 2
};


//=====================================================================
//= MoMediaSource.js
//=====================================================================

MoMediaSource = Class.create({
	initialize : function(url, type, audioCodec, videoCodec) {
		/** String **/
		this.url = MoValueOrDefault(url, null);
		
		/** String **/
		this.type = MoValueOrDefault(type, null);
		
		/** String **/
		this.audioCodec = MoValueOrDefault(audioCodec, null);
		
		/** String **/
		this.videoCodec = MoValueOrDefault(videoCodec, null);
	},
	
	getUrl : function() {
		return this.url;
	},
	
	setUrl : function(value) {
		this.url = value;
	},
	
	getType : function() {
		return this.type;
	},
	
	setType : function(value) {
		this.type = value;
	},
	
	getAudioCodec : function() {
		return this.audioCodec;
	},
	
	setAudioCodec : function(value) {
		this.audioCodec = value;
	},
	
	getVideoCodec : function() {
		return this.videoCodec;
	},
	
	setVideoCodec : function(value) {
			this.videoCodec = value;
	},
	
	toString : function() {
		var str = this.type;
		
		if(this.audioCodec != null)
		{
			str += "; codecs=\"" + this.audioCodec;
			
			if(this.videoCodec == null)
				str += "\"";
		}
		
		if(this.videoCodec != null)
		{
			if(this.audioCodec != null)
				str += ", " + this.videoCodec + "\"";
			else
				str += "; codecs=\"" + this.videoCodec + "\"";
		}
			
		return str;
	}
});


//=====================================================================
//= MoMediaState.js
//=====================================================================

MoMediaState = {
	"Opening"	: 1,
	"Buffering"	: 2,
	"Closed"	: 3,
	"Playing"	: 4,
	"Paused"	: 5,
	"Stopped"	: 6
};


//=====================================================================
//= MoPathSegment.js
//=====================================================================

MoPathSegment = Class.create(MoEquatable, {
	initialize : function(x, y) {
		this.x = MoValueOrDefault(x, 0);
		this.y = MoValueOrDefault(y, 0);
		this.flatSegments = null;
		this.isStartSegment = false;
	},
	
	getXAt : function(t, prevSegment) {
		return this.x;
	},
	
	getYAt : function(t, prevSegment) {
		return this.y;
	},
	
	hasValidTangent : function(prevSegment) {
		var ts = this.getTangent(prevSegment, true);

		return (ts[0] != 0 || ts[1] != 0);
	},
	
	getTangent : function(prevSegment, fromStart) {
		return [0,0];
	},

	mergeBounds : function(prevSegment, withRect) {
		/** override **/
	},
	
	isEqualTo : function(other) {
		return (this.x == other.x && this.y == other.y);
	},
	
	flatten : function(steps, prevSegment) {
		if(this.flatSegments != null)
			return this.flatSegments;
	
		this.flatSegments = [];
	
		var step = 1.0 / steps;
		var l = 0;
		var sx = this.getXAt(0, prevSegment);
		var sy = this.getYAt(0, prevSegment);
		var line = new MoPathLineSegment(sx, sy);
		
		this.flatSegments.push(line);
		
		for(var t = step; t < 1.0; t += step)
		{
			var nx = this.getXAt(t, prevSegment);
			var ny = this.getYAt(t, prevSegment);
			
			line = new MoPathLineSegment(nx, ny);
			this.flatSegments.push(line);
		}
		
		line = new MoPathLineSegment(this.getXAt(1, prevSegment), this.getYAt(1, prevSegment));
		this.flatSegments.push(line);

		return this.flatSegments;
	},
	
	flattenForThreshold : function(threshold, prevSegment) {
		if(this.flatSegments != null)
			return this.flatSegments;
		
		this.flatSegments = [];
		
		var x1 = this.getXAt(0, prevSegment);
		var y1 = this.getYAt(0, prevSegment);
		var x2 = x1;
		var y2 = y1;
		var lastLine = new MoLine(x1, y1, x2, y2);
		var testLine = null;
		var pixelCount = 0;
		var steps = 200;
		var xcoords = new Array(steps);
		var ycoords = new Array(steps);
		var pos = 0;
		var step = 1.0 / steps;
		
		xcoords[pos] = x1;
		ycoords[pos++] = y1;
		
		for(var t = step; t < 1.0; t += step)
		{
			x2 = this.getXAt(t, prevSegment);
			y2 = this.getYAt(t, prevSegment);
			
			xcoords[pos] = x2;
			ycoords[pos++] = x2;
			
			testLine = new MoLine(x1, y1, x2, y2);
			pixelCount = testLine.getPixelsOutside(xcoords, ycoords, pos);
			
			if(pixelCount > threshold)
			{
				this.flatSegments.push(new MoPathLineSegment(lastLine.x1, lastLine.y1, lastLine.x2, lastLine.y2));
				
				x1 = lastLine.x2;
				y1 = lastLine.y2;
				
				lastLine.x1 = x1;
				lastLine.y1 = y1;
				lastLine.x2 = x2;
				lastLine.y2 = y2;

				xcoords = new Array(steps);
				ycoords = new Array(steps);
				pos = 0;
				
				xcoords[pos] = x1;
				ycoords[pos++] = y1;
			}
			else
			{
				lastLine = testLine;
			}
		}
		
		this.flatSegments.push(new MoPathLineSegment(x1, y1, this.getXAt(1, prevSegment), this.getYAt(1, prevSegment)));
		
		return this.flatSegments;
	},
	
	getCurveTangent : function(pt0, pt1, pt2, fromStart) {
		var x = 0;
		var y = 0;
		
		if(fromStart)
		{
			if(pt0.x == pt1.x && pt0.y == pt1.y)
			{
				x = pt2.x - pt0.x;
				y = pt2.y - pt0.y;
			}
			else
			{
				x = pt1.x - pt0.x;
				y = pt1.y - pt0.y;
			}
		}
		else
		{
			if(pt2.x == pt1.x && pt2.y == pt1.y)
			{
				x = pt2.x - pt0.x;
				y = pt2.y - pt0.y;
			}
			else
			{
				x = pt2.x - pt1.x;
				y = pt2.y - pt1.y;
			}
		}

		return [x,y];
	}
});


//=====================================================================
//= MoPathMoveSegment.js
//=====================================================================

MoPathMoveSegment = Class.create(MoPathSegment, {
	initialize : function($super, x, y) {
		$super(x, y);
	}
});


//=====================================================================
//= MoPathLineSegment.js
//=====================================================================

MoPathLineSegment = Class.create(MoPathSegment, {
	initialize : function($super, x, y) {
		$super(x, y);
	},

	mergeBounds : function(prevSegment, withRect) {	
		if(prevSegment != null && !(prevSegment instanceof MoPathMoveSegment))
		{
			withRect.union(this.x, this.y, this.x, this.y);
			return;
		}

		var px = prevSegment != null ? prevSegment.x : 0;
		var py = prevSegment != null ? prevSegment.y : 0;

		withRect.union(
			Math.min(this.x, px),
			Math.min(this.y, py),
			Math.max(this.x, px),
			Math.max(this.y, py));
	},
	
	flatten : function(steps, prevSegment) {
		return [this];
	},
	
	getTangent : function(prevSegment, fromStart) {
		var x1 = prevSegment != null ? prevSegment.x : 0;
		var y1 = prevSegment != null ? prevSegment.y : 0;
		var x2 = this.x;
		var y2 = this.y;

		return [x2 - x1, y2 - y1];
	}
});


//=====================================================================
//= MoPathCubicBezierSegment.js
//=====================================================================

MoCurvePoints = Class.create(MoEquatable, 
// @PRIVATE 
{
	initialize : function() {
		this.c1 = null;
		this.c2 = null;
		this.c3 = null;
		this.c4 = null;
		this.a1 = null;
		this.a2 = null;
		this.a3 = null;
		this.a4 = null;
	},

	isEqualTo : function(other) {
		return (MoAreEqual(this.c1, other.c1) &&
				MoAreEqual(this.c2, other.c2) &&
				MoAreEqual(this.c3, other.c3) &&
				MoAreEqual(this.c4, other.c4) &&
				MoAreEqual(this.a1, other.a1) &&
				MoAreEqual(this.a2, other.a2) &&
				MoAreEqual(this.a3, other.a3) &&
				MoAreEqual(this.a4, other.a4));
	}
});

MoPathCubicBezierSegment = Class.create(MoPathSegment, {
	initialize : function($super, x, y, cx1, cy1, cx2, cy2) {
		$super(x, y);
		
		this.cx1 = cx1;
		this.cy1 = cy1;
		this.cx2 = cx2;
		this.cy2 = cy2;
		this.curvePoints = null;
	},
	
	mergeBounds : function(prevSegment, withRect) {				
		// starting point
		var x1 = prevSegment != null ? prevSegment.x : 0;
		var y1 = prevSegment != null ? prevSegment.y : 0;			
		
		// min/max bounds
		var minX = Math.min(x1, this.x);
		var minY = Math.min(y1, this.y);
		var maxX = Math.max(x1, this.x);
		var maxY = Math.max(y1, this.y);
		
		var xts = this.computeFirstDerivativeRoots(x1, this.cx1, this.cx2, this.x);
		var yts = this.computeFirstDerivativeRoots(y1, this.cy1, this.cy2, this.y);

		for(var i = 0; i < 2; i++)
		{
			var tx = xts[i];
			var ty = yts[i];
			
			if(tx >= 0 && tx <= 1)
			{
				var x = this.computeBaseValue(tx, x1, this.cx1, this.cx2, this.x);
				
				minX = Math.min(x, minX);
				maxX = Math.max(x, maxX);
			}
			
			if(ty >= 0 && ty <= 1)
			{
				var y = this.computeBaseValue(ty, y1, this.cy1, this.cy2, this.y);
				
				minY = Math.min(y, minY);
				maxY = Math.max(y, maxY);
			}
		}
		
		withRect.union(minX, minY, maxX, maxY);
	},

	getCurvePoints : function(prevSegment) {
		if(this.curvePoints != null)
			return this.curvePoints;
		
		this.curvePoints = new MoCurvePoints();
		
		var p1 = new MoVector2D(prevSegment != null ? prevSegment.x : 0, prevSegment != null ? prevSegment.y : 0);
		var p2 = new MoVector2D(this.x, this.y);
		var c1 = new MoVector2D(this.cx1, this.cy1);
		var c2 = new MoVector2D(this.cx2, this.cy2);
		
		var pA = c1.interpolate(p1, 0.75);
		var pB = c2.interpolate(p2, 0.75);
		
		var dx = (p2.x - p1.x) * 0.0625;
		var dy = (p2.y - p1.y) * 0.0625;
		
		this.curvePoints.c1 = c1.interpolate(p1, 0.375);
		
		this.curvePoints.c2 = pB.interpolate(pA, 0.375);
		this.curvePoints.c2.x -= dx;
		this.curvePoints.c2.y -= dy;
		
		this.curvePoints.c3 = pA.interpolate(pB, 0.375);
		this.curvePoints.c3.x += dx;
		this.curvePoints.c3.y += dy;
		
		this.curvePoints.c4 = c2.interpolate(p2, 0.375);
		
		this.curvePoints.a1 = this.curvePoints.c1.interpolate(this.curvePoints.c2, 0.5);
		this.curvePoints.a2 = pA.interpolate(pB, 0.5);
		this.curvePoints.a3 = this.curvePoints.c3.interpolate(this.curvePoints.c4, 0.5);
		this.curvePoints.a4 = p2;

		return this.curvePoints;
	},
	
	getTangent : function(prevSegment, fromStart) {
		var curvePoints = this.getCurvePoints(prevSegment);
		var pt0 = new MoVector2D(prevSegment != null ? prevSegment.x : 0, prevSegment != null ? prevSegment.y : 0);
		var pt1 = new MoVector2D(this.curvePoints.c1.x, this.curvePoints.c1.y);
		var pt2 = new MoVector2D(this.curvePoints.a1.x, this.curvePoints.a1.y);
		var pt3 = new MoVector2D(this.curvePoints.c2.x, this.curvePoints.c2.y);
		var pt4 = new MoVector2D(this.curvePoints.a2.x, this.curvePoints.a2.y);
		var pt5 = new MoVector2D(this.curvePoints.c3.x, this.curvePoints.c3.y);
		var pt6 = new MoVector2D(this.curvePoints.a3.x, this.curvePoints.a3.y);
		var pt7 = new MoVector2D(this.curvePoints.c4.x, this.curvePoints.c4.y);
		var pt8 = new MoVector2D(this.curvePoints.a4.x, this.curvePoints.a4.y);
		var ts = [0,0];
		
		if(fromStart)
		{
			// 1, 2
			ts = this.getCurveTangent(pt0, pt1, pt2, fromStart);
			
			if(this.isZero(ts))
			{
				// 3,4
				ts = this.getCurveTangent(pt0, pt3, pt4, fromStart);
				
				if(this.isZero(ts))
				{
					// 5,6
					ts = this.getCurveTangent(pt0, pt5, pt6, fromStart);
					
					if(this.isZero(ts))
					{
						// 7,8
						ts = this.getCurveTangent(pt0, pt7, pt8, fromStart);
					}
				}
			}
		}
		else
		{
			// 6,7
			ts = this.getCurveTangent(pt6, pt7, pt8, fromStart);
			
			if(this.isZero(ts))
			{
				// 4,5
				ts = this.getCurveTangent(pt4, pt5, pt8, fromStart);
				
				if(this.isZero(ts))
				{
					// 2,3
					ts = this.getCurveTangent(pt2, pt3, pt8, fromStart);
					
					if(this.isZero(ts))
					{
						// 0,1
						ts = this.getCurveTangent(pt0, pt1, pt8, fromStart);
					}
				}
			}
		}

		return ts;
	},
	
	isZero : function(ts) {
		return (ts[0] == 0 && ts[1] == 0);
	},
	
	computeBaseValue : function(t, a, b, c, d) {
		var mt = 1-t;

		return mt*mt*mt*a + 3*mt*mt*t*b + 3*mt*t*t*c + t*t*t*d;
	},
	
	computeFirstDerivativeRoots : function(a, b, c, d) {
		var ret = [-1,-1];
		var tl = -a+2*b-c;
		var tr = -Math.sqrt(-a*(c-d) + b*b - b*(c+d) + c*c);
		var dn = -a+3*b-3*c+d;
		
		if(dn != 0)
		{
			ret[0] = (tl+tr)/dn;
			ret[1] = (tl-tr)/dn;
		}
		
		return ret;
	},
	
	computeSecondDerivativeRoot : function(a, b, c, d) {
		var ret = -1;
		var tt = a-2*b+c;
		var dn = a-3*b+3*c-d;
		
		if(dn != 0)
			ret = tt/dn;
			
		return ret;
	},
	
	getXAt : function(t, prevSegment) { 
		var x1 = prevSegment != null ? prevSegment.x : 0;
		
		return this.computeBaseValue(t, x1, this.cx1, this.cx2, this.x);
	},
	
	getYAt : function(t, prevSegment) {
		var y1 = prevSegment != null ? prevSegment.y : 0;
		
		return this.computeBaseValue(t, y1, this.cy1, this.cy2, this.y);
	},

	subdivide : function(t, prevSegment) {
		var x1 = prevSegment != null ? prevSegment.x : 0;
		var y1 = prevSegment != null ? prevSegment.y : 0;
		var x2 = (1-t)*x1 + t*this.cx1; 		// p5
		var y2 = (1-t)*y1 + t*this.cy1;
		var x3 = (1-t)*this.cx1 + t*this.cx2; 	// p6
		var y3 = (1-t)*this.cy1 + t*this.cy2;
		var x4 = (1-t)*this.cx2 + t*this.x; 	// p7
		var y4 = (1-t)*this.cy2 + t*this.y;
		var x5 = (1-t)*x2 + t*x3;				// p8
		var y5 = (1-t)*y2 + t*y3;
		var x6 = (1-t)*x3 + t*x4;				// p9
		var y6 = (1-t)*y3 + t*y4;
		var x7 = (1-t)*x5 + t*x6;				// p10
		var y7 = (1-t)*y5 + t*y6;
		var curveA = new MoPathCubicBezierSegment(x7, y7, x2, y2, x5, y5);
		var curveB = new MoPathCubicBezierSegment(this.x, this.y, x6, y6, x4, y4);

		return [curveA, curveB];
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) && this.cx1 == other.cx1 && this.cy1 == other.cy1 && this.cx2 == other.cx2 && this.cy2 == other.cy2);
	}
});


//=====================================================================
//= MoPathQuadraticBezierSegment.js
//=====================================================================

MoPathQuadraticBezierSegment = Class.create(MoPathSegment, {
	initialize : function($super, x, y, cx, cy) {
		$super(x, y);
		
		this.cx = cx;
		this.cy = cy;
	},
	
	mergeBounds : function(prevSegment, withRect) {
		// start point 
		var x1 = prevSegment != null ? prevSegment.x : 0;
		var y1 = prevSegment != null ? prevSegment.y : 0;
		
		// min/max bounds 
		var minX = Math.min(this.x, x1);
		var minY = Math.min(this.y, y1);
		var maxX = Math.max(this.x, x1);
		var maxY = Math.max(this.y, y1);
		
		var tx = this.computeFirstDerivativeRoot(x1, this.cx, this.x);
		var ty = this.computeFirstDerivativeRoot(y1, this.cy, this.y);
		
		if(tx >= 0 && tx <= 1)
		{
			var x = this.computeBaseValue(tx, x1, this.cx, this.x);
			
			minX = Math.min(x, minX);
			maxX = Math.max(x, maxX);
		}
		
		if(ty >= 0 && ty <= 1)
		{
			var y = this.computeBaseValue(ty, y1, this.cy, this.y);
			
			minY = Math.min(y, minY);
			maxY = Math.max(y, maxY);
		}

		withRect.union(minX, minY, maxX, maxY);
	},
	
	getXAt : function(t, prevSegment) { 
		var x1 = prevSegment != null ? prevSegment.x : 0;
		
		return this.computeBaseValue(t, x1, this.cx, this.x);
	},
	
	getYAt : function(t, prevSegment) {
		var y1 = prevSegment != null ? prevSegment.y : 0;

		return this.computeBaseValue(t, y1, this.cy, this.y);
	},
	
	computeBaseValue : function(t, a, b, c) {
		var mt = 1-t;
		
		return mt*mt*a + 2*mt*t*b + t*t*c;
	},
	
	computeFirstDerivativeRoot : function(a, b, c) {
		var t = -1;
		var dn = a -2*b + c;
		
		if(dn != 0)
			t = (a-b) / dn;

		return t;
	},
	
	getTangent : function(prevSegment, fromStart) {
		var pt0 = new MoVector2D(prevSegment != null ? prevSegment.x : 0, prevSegment != null ? prevSegment.y : 0);
		var pt1 = new MoVector2D(this.cx, this.cy);
		var pt2 = new MoVector2D(this.x, this.y);
		
		return this.getCurveTangent(pt0, pt1, pt2, fromStart);
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) && this.cx == other.cx && this.cy == other.cy);
	}
});


//=====================================================================
//= MoPathSegmentCollection.js
//=====================================================================

MoPathSegmentCollection = Class.create(MoEquatable, {
	initialize : function(data) {
		this.segments = [];
		this.boundsRect = null;
		this.charPos = 0;
		this.dataLength = 0;
		
		if(data != null)
			this.parse(data);
	},
	
	clear : function() {
		this.segments = [];
	},

	getBounds : function() {
		if(this.boundsRect != null)
			return this.boundsRect;
		
		this.boundsRect = new MoRectangle(0, 0, 0, 0);
		
		var currentSegment = null;
		var prevSegment = null;
		var len = this.segments.length;
		
		for(var i = 0; i < len; ++i)
		{
			currentSegment = this.segments[i];
			currentSegment.mergeBounds(prevSegment, this.boundsRect);
			
			prevSegment = currentSegment;
		}

		return this.boundsRect;
	},
	
	isEqualTo : function(other) {
		// TODO
		return (this == other);
	},
	
	parse : function(data) {
		var charCount = data.length;
		var ch = null;
		var relative = false;
		var prevId = 0;
		var prevX = 0;
		var prevY = 0;
		var lastMoveX = 0;
		var lastMoveY = 0;
		var lastMoveSegmentIndex = -1;
		var segmentIndex = -1;
		var x = 0;
		var y = 0;
		var cx1 = 0;
		var cy1 = 0;
		var cx2 = 0;
		var cy2 = 0;
		
		this.dataLength = charCount;
		this.charPos = 0;
		
		while(true)
		{
			this.skipWhitespace(data);
			
			if(this.charPos >= this.dataLength)
				break;
			
			ch = data.charCodeAt(this.charPos++);
			
			if ((ch >= 0x30 && ch < 0x3A) ||   // A digit
				(ch == 0x2B || ch == 0x2D) ||  // '+' & '-'
				(ch == 0x2E))                  // '.'
			{
				ch = prevId;
				this.charPos--;
			}
			else if (ch >= 0x41 && ch <= 0x56) // Between 'C' and 'V' 
				relative = false;
			else if (ch >= 0x61 && ch <= 0x7A) // Between 'c' and 'v'
				relative = true;
			
			switch(ch)
			{
				case 0x6D:  // m
				case 0x4D:  // M
					x = this.parseNumber(prevX, data, relative);
					y = this.parseNumber(prevY, data, relative);
					
					this.segments.push(new MoPathMoveSegment(x, y));
					
					prevX = x;
					prevY = y;
					prevId = (ch == 0x6D) ? 0x6C : 0x4C; // c == 'm' ? 'l' : 'L'
					
					segmentIndex = this.segments.length - 1;
					
					if (lastMoveSegmentIndex + 2 == segmentIndex && 
					   (this.segments[lastMoveSegmentIndex + 1] instanceof MoPathQuadraticBezierSegment))
					{
						// Insert a dummy LineSegment
						this.segments.splice(lastMoveSegmentIndex + 1, 0, new MoPathLineSegment(lastMoveX, lastMoveY));
						segmentIndex++;
					}
					
					lastMoveSegmentIndex = segmentIndex;
					lastMoveX = x;
					lastMoveY = y;
					break;
			
				case 0x63:  // c
				case 0x43:  // C
					cx1 = this.parseNumber(prevX, data, relative);
					cy1 = this.parseNumber(prevY, data, relative);
					cx2 = this.parseNumber(prevX, data, relative);
					cy2 = this.parseNumber(prevY, data, relative);
					x = this.parseNumber(prevX, data, relative);
					y = this.parseNumber(prevY, data, relative);
					
					this.segments.push(new MoPathCubicBezierSegment(x, y, cx1, cy1,  cx2, cy2));
					
					prevX = x;
					prevY = y;
					prevId = 0x63;
					break;
					
				case 0x71:  // q
				case 0x51:  // Q
					cx1 = this.parseNumber(prevX, data, relative);
					cy1 = this.parseNumber(prevY, data, relative);
					x = this.parseNumber(prevX, data, relative);
					y = this.parseNumber(prevY, data, relative);
					
					this.segments.push(new MoPathQuadraticBezierSegment(x, y, cx1, cy1));
					
					prevX = x;
					prevY = y;
					prevId = 0x71;
					break;
					
				case 0x6C:  // l
				case 0x4C:  // L
					x = this.parseNumber(prevX, data, relative);
					y = this.parseNumber(prevY, data, relative);
					
					this.segments.push(new MoPathLineSegment(x, y));
					
					prevX = x;
					prevY = y;
					prevId = 0x6C;
					break;
					
				case 0x68:  // h
				case 0x48:  // H
					x = this.parseNumber(prevX, data, relative);
					y = prevY;
					
					this.segments.push(new MoPathLineSegment(x, y));
					
					prevX = x;
					prevY = y;
					prevId = 0x68;
					break;
				
				case 0x76:  // v
				case 0x56:  // V
					x = prevX;
					y = this.parseNumber(prevY, data, relative);
					
					this.segments.push(new MoPathLineSegment(x, y));
					
					prevX = x;
					prevY = y;
					prevId = 0x76;
					break;
					
				case 0x74:  // t
				case 0x54:  // T
					// control is a reflection of the previous control point
					if (prevId == 0x74 || prevId == 0x71) // 't' or 'q'
					{
						cx1 = prevX + (prevX - cx1);
						cy1 = prevY + (prevY - cy1);
					}
					else
					{
						cx1 = prevX;
						cy1 = prevY;
					}
					
					x = this.parseNumber(prevX, data, relative);
					y = this.parseNumber(prevY, data, relative);

					this.segments.push(new MoPathQuadraticBezierSegment(x, y, cx1, cy1));
					
					prevX = x;
					prevY = y;
					prevId = 0x74;
					break;
					
				case 0x73:  // s
				case 0x53:  // S
					if (prevId == 0x73 || prevId == 0x63) // s or c
					{
						cx1 = prevX + (prevX - cx2);
						cy1 = prevY + (prevY - cy2);
					}
					else
					{
						cx1 = prevX;
						cy1 = prevY;
					}
					
					cx2 = this.parseNumber(prevX, data, relative);
					cy2 = this.parseNumber(prevY, data, relative);
					x = this.parseNumber(prevX, data, relative);
					y = this.parseNumber(prevY, data, relative);
					
					this.segments.push(new MoPathCubicBezierSegment(x, y, cx1, cy1, cx2, cy2));
					
					prevX = x;
					prevY = y;
					prevId = 0x73;
					break;
					
				case 0x7A:  // z
				case 0x5A:  // Z
					x = lastMoveX;
					y = lastMoveY;
					
					this.segments.push(new MoPathLineSegment(x, y));
					
					prevX = x;
					prevY = y;
					prevId = 0x7A;
					break;
				
				default:
					throw new Error("Unknown path command found: '" + ch + "'");
			}
		}
		
		segmentIndex = this.segments.length;
		
		if ((lastMoveSegmentIndex + 2) == segmentIndex &&
			(this.segments[lastMoveSegmentIndex+1] instanceof MoPathQuadraticBezierSegment))
		{
			this.segments.splice(lastMoveSegmentIndex + 1, 0, new MoPathLineSegment(lastMoveX, lastMoveY));
		}
	},
	
	skipWhitespace : function(data) {
	
		while (this.charPos < this.dataLength)
		{
			var c = data.charCodeAt(this.charPos);

			if (c != 0x20 && // Space
				c != 0x2C && // Comma
				c != 0xD  && // Carriage return
				c != 0x9  && // Tab
				c != 0xA)    // New line
			{
				break;
			}
			
			this.charPos++;
		}
	},
	
	parseNumber : function(offset, value, relative) {
		// Parse the string and find the first occurrance of the following RexExp
		// numberRegExp:RegExp = /[+-]?\d*\.?\d+([Ee][+-]?\d+)?/g;
		
		this.skipWhitespace(value); // updates _charPos
		
		if (this.charPos >= this.dataLength)
			return NaN;
		
		// Remember the start of the number
		var numberStart = this.charPos;
		var hasSignCharacter = false;
		var hasDigits = false;
		
		// The number could start with '+' or '-' (the "[+-]?" part of the RegExp)
		var c = value.charCodeAt(this.charPos);
		if (c == 0x2B || c == 0x2D) // '+' or '-'
		{
			hasSignCharacter = true;
			this.charPos++;
		}
		
		// The index of the '.' if any
		var dotIndex = -1;
		
		// First sequence of digits and optional dot in between (the "\d*\.?\d+" part of the RegExp)
		while (this.charPos < this.dataLength)
		{
			c = value.charCodeAt(this.charPos);
			
			if (c >= 0x30 && c < 0x3A) // A digit
			{
				hasDigits = true;
			}
			else if (c == 0x2E && dotIndex == -1) // '.'
			{
				dotIndex = this.charPos;
			}
			else
				break;
			
			this.charPos++;
		}
		
		// Now check whether we had at least one digit.
		if (!hasDigits)
		{
			// Go to the end of the data
			this.charPos = this.dataLength;
			return NaN;
		}
		
		// 1. Was the last character a '.'? If so, rewind one character back.
		if (c == 0x2E)
			this.charPos--;
		
		// So far we have a valid number, remember its end character index
		var numberEnd = this.charPos;
		
		// Check to see if we have scientific notation (the "([Ee][+-]?\d+)?" part of the RegExp)
		if (c == 0x45 || c == 0x65)
		{
			this.charPos++;
			
			// Check for '+' or '-'
			if (this.charPos < this.dataLength)
			{            
				c = value.charCodeAt(this.charPos);
				if (c == 0x2B || c == 0x2D)
					this.charPos++;
			}
			
			// Find all the digits
			var digitStart = this.charPos;
			while (this.charPos < this.dataLength)
			{
				c = value.charCodeAt(this.charPos);
				
				// Not a digit?
				if (!(c >= 0x30 && c < 0x3A))
				{
					break;
				}
				
				this.charPos++;
			}
			
			// Do we have at least one digit?
			if (digitStart < this.charPos)
				numberEnd = this.charPos; // Scientific notation, update the end index of the number.
			else
				this.charPos = numberEnd; // No scientific notation, rewind back to the end index of the number.
		}
		
		// Use parseFloat to get the actual number.
		// TODO (egeorgie): we could build the number while matching the RegExp which will save the substr and parseFloat
		var subString = value.substr(numberStart, numberEnd - numberStart);
		var result = parseFloat(subString);
		
		if (isNaN(result))
		{
			// Go to the end of the data
			this.charPos = this.dataLength;
			return NaN;
		}
		
		this.charPos = numberEnd;
		
		return relative ? result + offset : result;
	}
});


//=====================================================================
//= MoRepeatBehavior.js
//=====================================================================

MoRepeatBehavior = {
	"Loop"		: 1,
	"Reverse"	: 2
};


//=====================================================================
//= MoAnimatable.js
//=====================================================================

MoAnimatable = {
/**
 * @MIXIN
 *
 * SUMMARY:
 *  Provides the features required to make an object animate, when applied to a class, any properties
 *  that you want animated must be enabled in the initializeAnimatablePropertiesCore method, those 
 *	properties must also use the getPropertyValue/setPropertyValue instead of using a class variable 
 *	for the property value.
 *
 *	Any object defined with this mixin is allowed to participate in animations.
 *
 * REMARKS:
 *  Your class must also be a subclass of MoEventDispatcher, whether directly or indirectly.
 * 
 * <code>
 *		Ball = Class.create(MoEventDispatcher, MoAnimatable {
 *			initialize : function($super) {
 *				$super();
 *
 *				// must call this to initialize your properties
 *				this.initializeAnimatableProperties();
 *			},
 *
 *			initializeAnimatablePropertiesCore : function() {
 *				// enable the 'size' property
 *				this.enableAnimatableProperty(
 *					"size", getSize, setSize, MoPropertyOptions.None);
 *			},
 *
 *			getSize : function() {
 *				return this.getPropertyValue("size");
 *			},
 *
 *			setSize : function(value) {
 *				this.setPropertyValue("size", value);
 *			}
 *		});
 *	</code>
 *
 * @EVENT MoPropertyChangedEvent.PROPERTY_CHANGED
 *
 * SUMMARY:
 *	Dispatched when a property value has changed.
 *
 */
 
	initializeAnimatableProperties : function() {
		/**
		 * SUMMARY:
		 * 	Begins the initialization of properties that need to be animated. This MUST be called
		 *  in your classes initialize method, but after the $super call. This method in turn also
		 *  calls your initializeAnimatablePropertiesCore method.
		 *
		 * REMARKS:
		 *	Throws an error if your class is not a subclass of MoEventDispatcher.
		 *
		 * RETURNS (void):
		 *
		 */
	
		if(!(this instanceof MoEventDispatcher))
			throw new Error("Animatable must be added to classes that derive from MoEventDispatcher");

		// because Animatable is not really a class, we can use isAnimatable to check if the object
		// is in fact an Animatable object
		this.isAnimatable = true;
		
		// do the actual animatable property initialization
		this.initializeAnimatablePropertiesCore();
	},

	initializeAnimatablePropertiesCore : function() {
		/**
		 * SUMMARY:
		 * 	Override to initialize any properties that you wish to be animated. See 
		 *  example above on how this method should be implemented.
		 *
		 * RETURNS (void):
		 *
		 */
	},

	getPropertyValue : function(propertyName) {
		/**
		 * SUMMARY:
		 *  Gets the value of a property previously set using setPropertyValue.
		 *
		 * PARAMS:
		 *  String propertyName:
		 *		The name of the property you wish to get.
		 *
		 * RETURNS (any):
		 *  The value of your property, or null if the property was never set.
		 */
	
		return this[propertyName + "$"];
	},
	
	setPropertyValue : function(propertyName, value) {
		/**
		 * SUMMARY:
		 *  Sets the value of a property, if the value is different from the
		 *  value that is currently stored then a MoPropertyChangedEvent will
		 *  be dispatched to any listeners.
		 *
		 * PARAMS:
		 *  String propertyName:
		 *		The name of the property you wish to set.
		 *
		 *  Any value:
		 *		The value of the property, this can be any type, including null.
		 *
		 * RETURNS (Boolean):
		 *  true if the property changed, otherwise false. You can use this value
		 *  to determine whether or not you need to update anything else.
		 *
		 */
	
		var oldValue = this.getPropertyValue(propertyName);

		if(MoAreNotEqual(oldValue, value))
		{
			this[propertyName + "$"] = value;
			this.raisePropertyChangedEvent(propertyName, oldValue, value);
			
			return true;
		}
		
		return false;
	},
	
	getAnimatablePropertyTuple : function(propertyName) {
		// @PRIVATE
		
		for(var i = 0; i < this.animatableProperties.length; i++)
		{
			var tuple = this.animatableProperties[i];

			if(tuple.getFirst() == propertyName)
				return tuple;
		}

		return null;
	},

	getAnimatablePropertySetter : function(propertyName) {
		// @PRIVATE
		
		var tuple = this.getAnimatablePropertyTuple(propertyName);

		if(tuple != null)
			return tuple.getThird().getSecond();

		return null;
	},
	
	getAnimatablePropertyGetter : function(propertyName) {
		// @PRIVATE
		
		var tuple = this.getAnimatablePropertyTuple(propertyName);

		if(tuple != null)
			return tuple.getThird().getFirst();

		return null;
	},
	
	getAnimatablePropertyOptions : function(propertyName) {
		// @PRIVATE
		
		var tuple = this.getAnimatablePropertyTuple(propertyName);
		
		if(tuple != null)
			return tuple.getSecond();

		return MoPropertyOptions.None;
	},
	
	enableAnimatableProperty : function(propertyName, getterFunc, setterFunc, options) {
		/**
		 * SUMMARY:
		 *  Enables a property to participate in animation updates, when a property is animatable
		 *  then changes to that property will also cause a layout, measure, etc... based on the
		 *  options you've provided.
		 *
		 * PARAMS:
		 *  String propertyName:
		 *		The name of the property you wish to enable.
		 *
		 *  Function getterFunc:
		 *		The function that should be used as the getter, for example, if your property name
		 *		is size, then you might use a getSize method to get the value of the size property.
		 *
		 *  Function setterFunc:
		 *		The function that should be used as the setter, for example, if your property name
		 *		is size, then you might use a setSize method to set the value of the size property.
		 *
		 *	MoPropertyOptions options = MoPropertyOptions.None:
		 *		The option flags, a combination of MoPropertyOptions values. These options specify
		 *		how changes to the property value should affect other systems, such as layout,
		 *		measurement and so on.
		 *
		 * RETURNS (void):
		 *
		 */
	
		options = MoValueOrDefault(options, MoPropertyOptions.None);
		
		if(this.animatableProperties == null)
			this.animatableProperties = new Array();

		this.animatableProperties.push(new MoTuple(propertyName, options, new MoPair(getterFunc, setterFunc)));
		
		// enable property changes for drawables, this way, when a
		// property changes the drawable can respect the options
		if(this instanceof MoDrawable)
			this.addEventHandler(MoPropertyChangedEvent.PROPERTY_CHANGED, this.handleDependantObjectPropertyChangedEvent.asDelegate(this));
	},
	
	disableAnimatableProperty : function(propertyName) {
		/**
		 * SUMMARY:
		 *  Disables a property that was previously enabled using enableAnimatableProperty, you 
		 *  can use this method if you no longer need a property to participate in animations.
		 *
		 * PARAMS:
		 *  String propertyName:
		 *		The name of the property you wish to disable.
		 *
		 * RETURNS (void):
		 *
		 */
	
		for(var i = this.animatableProperties.length - 1; i >= 0; i--)
		{
			var tuple = this.animatableProperties[i];

			if(tuple.getFirst() == propertyName)
				this.animatableProperties.removeAt(i);
		}

		// disable property changes for drawables
		if(this instanceof MoDrawable)
			this.removeEventHandler(MoPropertyChangedEvent.PROPERTY_CHANGED, this.handleDependantObjectPropertyChangedEvent.asDelegate(this));
	},

	togglePropertyChangedHandlerRecursive : function(target, handler, on) {
		// @PRIVATE
		
		if(this.animatableProperties == null)
			return;

		var props = this.animatableProperties;
		var len = props.length;
		var tuple = null;
		var propValue = null;

		// check each registered property, if one is animatable then continue
		// through that property value and so on...
		//
		// NOTE : the implementor must be responsible for removing the handlers
		//        simply by passing in false as the 'on' parameter.
		//
		for(var i = 0; i < len; ++i)
		{
			// get the property value and check it
			tuple = this.animatableProperties[i];
			propValue = tuple.getThird().getFirst().apply(this);

			// continue through until there are no more properties
			this.togglePropertyValue(propValue, target, handler, on);
		}

		// add or remove the handler
		if(on)
			this.addEventHandler(MoPropertyChangedEvent.PROPERTY_CHANGED, handler);
		else
			this.removeEventHandler(MoPropertyChangedEvent.PROPERTY_CHANGED, handler);
	},

	togglePropertyValue : function(propValue, target, handler, on) {
		// @PRIVATE
		
		if(propValue == null || (!(propValue instanceof Array) && !propValue.isAnimatable))
			return;

		// the property is an array, iterate each item
		if(propValue instanceof Array)
		{
			var len = propValue.length;

			for(var i = 0; i < len; ++i)
				this.togglePropertyValue(propValue[i], target, handler, on);
		}
		else
		{
			propValue.togglePropertyChangedHandlerRecursive(target, handler, on);
		}
	},

	raisePropertyChangedEvent : function(propName, oldValue, newValue) {
		// @PRIVATE
		
		if(this instanceof MoEventDispatcher)
			this.dispatchEvent(new MoPropertyChangedEvent(MoPropertyChangedEvent.PROPERTY_CHANGED, propName, oldValue, newValue));
	}
};


//=====================================================================
//= MoColor.js
//=====================================================================

MoColor = Class.create(MoEquatable, {
	initialize : function($super, r, g, b, a) {
		this.r = MoValueOrDefault(r, 1.0);
		this.g = MoValueOrDefault(g, 1.0);
		this.b = MoValueOrDefault(b, 1.0);
		this.a = MoValueOrDefault(a, 1.0);
	},

	add : function(color) {
		return new MoColor(
			Math.min(this.r + color.r, 1.0),
			Math.min(this.g + color.g, 1.0),
			Math.min(this.b + color.b, 1.0),
			Math.min(this.a + color.a, 1.0));
	},

	subtract : function(color) {
		return new MoColor(
			Math.max(this.r - color.r, 0.0),
			Math.max(this.g - color.g, 0.0),
			Math.max(this.b - color.b, 0.0),
			Math.max(this.a - color.a, 0.0));
	},
	
	toRGB : function() {
		return (((this.r * 255) << 16) | ((this.g * 255) << 8) | (this.b * 255));
	},

	toRGBString : function() {
		return "rgb(" + parseInt(this.r * 255) + "," + parseInt(this.g * 255) + "," + parseInt(this.b * 255) + ")";
	},

	toRGBAString : function() {
		return "rgba(" + parseInt(this.r * 255) + "," + parseInt(this.g * 255) + "," + parseInt(this.b * 255) + "," + Math.max(Math.min(this.a.toFixed(2), 1.0), 0.0) + ")";
	},

	toHex : function() {
		return "#" + this.toRGB().toString(16);
	},

	isEqualTo : function(color) {
		return (color.r == this.r && color.g == this.g && color.b == this.b && color.a == this.a);
	},

	toString : function() {
		return this.toRGBString();	
	}
});

Object.extend(MoColor, {
	Black : new MoColor(0, 0, 0, 1),
	White : new MoColor(1, 1, 1, 1),
	Red : new MoColor(1, 0, 0, 1),
	Green : new MoColor(0, 1, 0, 1),
	Blue : new MoColor(0, 0, 1, 1),
	Yellow : new MoColor(1, 1, 0, 1),
	Magenta : new MoColor(1, 0, 1, 1),
	Turquoise : new MoColor(0, 1, 1, 1),
	Transparent : new MoColor(0, 0, 0, 0),
	
	fromColor : function(color) {
		return new MoColor(color.r, color.g, color.b, color.a);
	},
	
	fromRGB : function(value) {
		return new MoColor(
			((value >> 16) & 0xff) / 255, 
			((value >> 8) & 0xff) / 255, 
			((value & 0xff)) / 255, 1);
	},

	fromCSSColor : function(value) {
		if(MoStringIsNullOrEmpty(value))
			return MoColor.Transparent;

		if(value[0] == "#")
			return MoColor.fromHex(value);

		// parse as rgb(0,0,0) or rgba(0,0,0,0)
		var colorString = value.toLowerCase();

		if(colorString[0] == "r" && colorString[1] == "g" && colorString[2] == "b")
		{
			var components = value.substring(value.indexOf("(")+1, value.length-1).split(",");

			for(var i = 0; i < components.length; ++i)
				components[i] = components[i].replace(" ", "");

			var r = components[0];
			var g = components[1];
			var b = components[2];
			var a = components.length > 3 ? components[3] : "1";
			
			return new MoColor(
				parseInt(r) / 255,
				parseInt(g) / 255,
				parseInt(b) / 255,
				parseFloat(a));
		}

		return MoColor.Transparent;
	},
	
	fromHSV : function(h, s, v, a) {
		s = Math.max(0.0, Math.min(1.0, s));
		v = Math.max(0.0, Math.min(1.0, v));

		if(s > 0)
		{
			h = ((h < 0) ? h % 360 + 360 : h % 360) / 60;
			
			if(h < 1)
			{
				return new MoColor(
					(v), 
					(v * (1 - s * (1 - h))), 
					(v * (1 - s)), a);
			}
			else if(h < 2)
			{
				return new MoColor(
					(v * ( 1 - s * (h - 1) )),
					(v),
					(v * ( 1 - s )), a);			
			}
			else if(h < 3)
			{
				return new MoColor(
					(v * ( 1 - s )),
					(v),
					(v * ( 1 - s * (3 - h) )), a);			
			}
			else if(h < 4)
			{
				return new MoColor(
					(v * ( 1 - s )),
					(v * ( 1 - s * (h - 3) )),
					(v), a);			
			}
			else if(h < 5)
			{
				return new MoColor(
					(v * ( 1 - s * (5 - h) )),
					(v * ( 1 - s )),
					(v), a);			
			}
			else
			{
				return new MoColor(
					(v),
					(v * ( 1 - s )),
					(v * ( 1 - s * (h - 5) ), a));			
			}
		}

		return new MoColor(v, v, v, a);
	},

	fromHex : function(value) {
	
		if(value.length == 9) // # + 8 color components (includes an alpha)
		{
			return new MoColor(
				parseInt('0x' + value.substring(1, 3)) / 255,
				parseInt('0x' + value.substring(3, 5)) / 255,
				parseInt('0x' + value.substring(5, 7)) / 255, 
				parseInt('0x' + value.substring(7, 9)) / 255);
		}
		else // # + 6 color components
		{
			return new MoColor(
				parseInt('0x' + value.substring(1, 3)) / 255,
				parseInt('0x' + value.substring(3, 5)) / 255,
				parseInt('0x' + value.substring(5, 7)) / 255, 1);
		}
	},

	fromHexWithAlpha : function(value, alpha) {
		var color = MoColor.fromHex(value);
		color.a = alpha;

		return color;
	},
	
	multiply255 : function(a, b) {
		var v = a * b + 128;
		return ((v >> 8) + v) >> 8;
	},
	
	
	// helper functions to initialize a color variable with a default color that
	// is expected to be changed, this way the color 'constant' doesn't also change
	// since assigning the 'constant' to a variable is by reference
	black : function() {
		return MoColor.fromColor(MoColor.Black);
	},
	
	white : function() {
		return MoColor.fromColor(MoColor.White);
	},
	
	red : function() {
		return MoColor.fromColor(MoColor.Red);
	},
	
	green : function() {
		return MoColor.fromColor(MoColor.Green);
	},
	
	blue : function() {
		return MoColor.fromColor(MoColor.Blue);
	},
	
	yellow : function() {
		return MoColor.fromColor(MoColor.Yellow);
	},
	
	magenta : function() {
		return MoColor.fromColor(MoColor.Magenta);
	},
	
	turquoise : function() {
		return MoColor.fromColor(MoColor.Turquoise);
	},
	
	transparent : function() {
		return MoColor.fromColor(MoColor.Transparent);
	}
});



//=====================================================================
//= MoUrl.js
//=====================================================================

// FIXME : implement full url class

MoUrl = Class.create({
	initialize : function(url) {
		this.rawUrl = url;
	}
});

Object.extend(MoUrl, {
	combine : function(url) {
		var arr = [url];
		var fullUrl = "";
		
		if(arguments.length > 1)
		{
			for(var i = 1; i < arguments.length; ++i)
			{
				if(!MoStringIsNullOrEmpty(arguments[i]))
					arr.push(arguments[i]);
			}
		}
		
		for(var i = 0; i < arr.length; ++i)
		{
			var value = arr[i];
			
			fullUrl += value.replace("\\", "/");
			
			if(value.charAt(value.length-1) != "/" && (i+1) < arr.length)
				fullUrl += "/";
		}

		return fullUrl;
	}
});


//=====================================================================
//= MoTransform.js
//=====================================================================

MoTransform = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super) {		
		$super();
		
		/** MoMatrix2D **/
		this.identity = MoMatrix2D.createIdentity();
		
		this.initializeAnimatableProperties();
	},
	
	getValue : function() {
		/** override **/
		return this.identity;
	},
	
	transformPoint : function(point) {
		return this.getValue().transformPoint(point);
	},
	
	transformRect : function(rect) {
		return this.getValue().transformRect(rect);
	}
});
	


//=====================================================================
//= MoGeneralTransform.js
//=====================================================================

MoGeneralTransform = Class.create(MoTransform, {
	initialize : function($super) {		
		$super();
		
		this.setCenterX(0);
		this.setCenterY(0);
		this.setX(0);
		this.setY(0);
		this.setSkewX(0);
		this.setSkewY(0);
		this.setScaleX(1);
		this.setScaleY(1);
		this.setRotation(0);
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("x", this.getX, this.setX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("y", this.getY, this.setY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("scaleX", this.getScaleX, this.setScaleX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("scaleY", this.getScaleY, this.setScaleY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("skewX", this.getSkewX, this.setSkewX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("skewY", this.getSkewY, this.setSkewY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("rotation", this.getRotation, this.setRotation, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},

	getValue : function() {
		var mx = new MoMatrix2D();
		var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);

		if(this.getScaleX() != 1 || this.getScaleY() != 1)
			mx.scaleAt(this.getScaleX(), this.getScaleY(), this.getCenterX(), this.getCenterY());

		if(this.getSkewX() != 0 || this.getSkewY() != 0)
		{
			if(hasCenterPoint)
				mx.translate(-this.getCenterX(), -this.getCenterY());

			mx.skew(this.getSkewX(), this.getSkewY());

			if(hasCenterPoint)
				mx.translate(this.getCenterX(), this.getCenterY());
		}

		if(this.getRotation() != 0)
			mx.rotateAt(this.getRotation(), this.getCenterX(), this.getCenterY());

		if(this.getX() != 0 || this.getY() != 0)
			mx.translate(this.getX(), this.getY());

		return mx;
	},
	
	getCenterX : function() {
		return this.getPropertyValue("centerX");
	},
	
	setCenterX : function(value) {
		this.setPropertyValue("centerX", value);
	},
	
	getCenterY : function() {
		return this.getPropertyValue("centerY");
	},
	
	setCenterY : function(value) {
		this.setPropertyValue("centerY", value);
	},
	
	getX : function() {
		return this.getPropertyValue("x");
	},
	
	setX : function(value) {
		this.setPropertyValue("x", value);
	},
	
	getY : function() {
		return this.getPropertyValue("y");
	},
	
	setY : function(value) {
		this.setPropertyValue("y", value);
	},
	
	getScaleX : function() {
		return this.getPropertyValue("scaleX");
	},
	
	setScaleX : function(value) {
		this.setPropertyValue("scaleX", value);
	},
	
	getScaleY : function() {
		return this.getPropertyValue("scaleY");
	},
	
	setScaleY : function(value) {
		this.setPropertyValue("scaleY", value);
	},
	
	getSkewX : function() {
		return this.getPropertyValue("skewX");
	},
	
	setSkewX : function(value) {
		this.setPropertyValue("skewX", value);
	},
	
	getSkewY : function() {
		return this.getPropertyValue("skewY");
	},
	
	setSkewY : function(value) {
		this.setPropertyValue("skewY", value);
	},
	
	getRotation : function() {
		return this.getPropertyValue("rotation");
	},
	
	setRotation : function(value) {
		this.setPropertyValue("rotation", value);
	},

	isEqualTo : function($super, other) {
		return (this.getCenterX() == other.getCenterX() &&
				this.getCenterY() == other.getCenterY() &&
				this.getX() == other.getX() &&
				this.getY() == other.getY() &&
				this.getSkewX() == other.getSkewX() &&
				this.getSkewY() == other.getSkewY() &&
				this.getScaleX() == other.getScaleX() &&
				this.getScaleY() == other.getScaleY() &&
				this.getRotation() == other.getRotation());
	}
});
	


//=====================================================================
//= MoMatrixTransform.js
//=====================================================================

MoMatrixTransform = Class.create(MoTransform, {
	initialize : function($super, matrix) {
		$super();

		this.tmp = new MoMatrix2D();
		this.setMatrix(MoValueOrDefault(matrix, new MoMatrix2D()));
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("matrix", this.getMatrix, this.setMatrix, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},
	
	getValue : function() {
		this.tmp.copyFrom(this.getMatrix());

		return this.tmp;
	},
	
	getMatrix : function() {
		return this.getPropertyValue("matrix");
	},

	setMatrix : function(value) {
		this.setPropertyValue("matrix", value);
	},

	isEqualTo : function(other) {
		return (MoAreEqual(this.getMatrix(), other.getMatrix()));
	}
});
	


//=====================================================================
//= MoRotateTransform.js
//=====================================================================

MoRotateTransform = Class.create(MoTransform, {
	initialize : function($super, angle, centerX, centerY) {
		$super();
		
		this.setAngle(MoValueOrDefault(angle, 0));
		this.setCenterX(MoValueOrDefault(centerX, 0));
		this.setCenterY(MoValueOrDefault(centerY, 0));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("angle", this.getAngle, this.setAngle, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},

	getValue : function() {
		var mx = MoMatrix2D.createIdentity();
		mx.rotateAt(this.getAngle(), this.getCenterX(), this.getCenterY());
		
		return mx;
	},
	
	getAngle : function() {
		return this.getPropertyValue("angle");
	},
	
	setAngle : function(value) {
		this.setPropertyValue("angle", value);
	},
	
	getCenterX : function() {
		return this.getPropertyValue("centerX");
	},
	
	setCenterX : function(value) {
		this.setPropertyValue("centerX", value);
	},
	
	getCenterY : function() {
		return this.getPropertyValue("centerY");
	},
	
	setCenterY : function(value) {
		this.setPropertyValue("centerY", value);
	},
	
	isEqualTo : function(other) {
		return (this.getAngle() == other.getAngle() &&
				this.getCenterX() == other.getCenterX() &&
				this.getCenterY() == other.getCenterY());
	}
});
	


//=====================================================================
//= MoScaleTransform.js
//=====================================================================

MoScaleTransform = Class.create(MoTransform, {
	initialize : function($super, scaleX, scaleY, centerX, centerY) {		
		$super();
		
		this.setScaleX(MoValueOrDefault(scaleX, 1));
		this.setScaleY(MoValueOrDefault(scaleY, 1));
		this.setCenterX(MoValueOrDefault(centerX, 0));
		this.setCenterY(MoValueOrDefault(centerY, 0));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("scaleX", this.getScaleX, this.setScaleX, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("scaleY", this.getScaleY, this.setScaleY, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
	},
	
	getValue : function() {
		var mx = MoMatrix2D.createIdentity();
		mx.scaleAt(this.getScaleX(), this.getScaleY(), this.getCenterX(), this.getCenterY());
		
		return mx;
	},
	
	transformRect : function(rect) {
		if(!rect.isEmpty())
		{
			var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);

			if(hasCenterPoint)
			{
				rect.x -= this.getCenterX();
				rect.y -= this.getCenterY();
			}
			
			rect.scale(this.getScaleX(), this.getScaleY());
			
			if(hasCenterPoint)
			{
				rect.x += this.getCenterX();
				rect.y += this.getCenterY();
			}
		}
		
		return rect;
	},
	
	getScaleX : function() {
		return this.getPropertyValue("scaleX");
	},
	
	setScaleX : function(value) {
		this.setPropertyValue("scaleX", value);
	},
	
	getScaleY : function() {
		return this.getPropertyValue("scaleY");
	},
	
	setScaleY : function(value) {
		this.setPropertyValue("scaleY", value);
	},
	
	getCenterX : function() {
		return this.getPropertyValue("centerX");
	},
	
	setCenterX : function(value) {
		this.setPropertyValue("centerX", value);
	},
	
	getCenterY : function() {
		return this.getPropertyValue("centerY");
	},
	
	setCenterY : function(value) {
		this.setPropertyValue("centerY", value);
	},
	
	isEqualTo : function(other) {
		return (this.getCenterX() == other.getCenterX() &&
				this.getCenterY() == other.getCenterY() &&
				this.getScaleX() == other.getScaleX() &&
				this.getScaleY() == other.getScaleY());
	}
});
	


//=====================================================================
//= MoSkewTransform.js
//=====================================================================

MoSkewTransform = Class.create(MoTransform, {
	initialize : function($super, skewX, skewY, centerX, centerY) {		
		$super();
		
		this.setSkewX(MoValueOrDefault(skewX, 0));
		this.setSkewY(MoValueOrDefault(skewY, 0));
		this.setCenterX(MoValueOrDefault(centerX, 0));
		this.setCenterY(MoValueOrDefault(centerY, 0));
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("skewX", this.getSkewX, this.setSkewX, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("skewY", this.getSkewY, this.setSkewY, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerX", this.getCenterX, this.setCenterX, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("centerY", this.getCenterY, this.setCenterY, MoPropertyOptions.AffectsMeasure | MoPropertyOptions.AffectsLayout);
	},

	getValue : function() {
		var mx = new MoMatrix2D();
		var hasCenterPoint = (this.getCenterX() != 0 || this.getCenterY() != 0);
		
		if(hasCenterPoint)
			mx.translate(-this.getCenterX(), -this.getCenterY());
		
		mx.skew(this.getSkewX(), this.getSkewY());
		
		if(hasCenterPoint)
			mx.translate(this.getCenterX(), this.getCenterY());
			
		return mx;
	},
	
	getSkewX : function() {
		return this.getPropertyValue("skewX");
	},
	
	setSkewX : function(value) {
		this.setPropertyValue("skewX", value);
	},
	
	getSkewY : function() {
		return this.getPropertyValue("skewY");
	},
	
	setSkewY : function(value) {
		this.setPropertyValue("skewY", value);
	},
	
	getCenterX : function() {
		return this.getPropertyValue("centerX");
	},
	
	setCenterX : function(value) {
		this.setPropertyValue("centerX", value);
	},
	
	getCenterY : function() {
		return this.getPropertyValue("centerY");
	},
	
	setCenterY : function(value) {
		this.setPropertyValue("centerY", value);
	},

	isEqualTo : function(other) {
		return (this.getCenterX() == other.getCenterX() &&
				this.getCenterY() == other.getCenterY() &&
				this.getSkewX() == other.getSkewX() &&
				this.getSkewY() == other.getSkewY());
	}
});
	


//=====================================================================
//= MoTransformSet.js
//=====================================================================

MoTransformSet = Class.create(MoTransform, {
	initialize : function($super) {		
		$super();
		
		this.setChildren(new Array());
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("children", this.getChildren, this.setChildren, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},

	getValue : function() {
		var mx = MoMatrix2D.createIdentity();
		var len = this.getChildren().length;
		
		if(len > 0)
		{
			var xform = null;
		
			for(var i = 0; i < len; i++)
			{
				xform = this.getChildren()[i];
				
				if(xform != null)
					mx.append(xform.getValue());
			}
		}

		return mx;
	},
	
	add : function(transform) {
		var children = this.getChildren();
		children.push(transform);
		
		this.setChildren(children);
	},
	
	remove : function(transform) {
		var children = this.getChildren();
		children.remove(transform);
		
		this.setChildren(children);
	},
	
	removeAt : function(index) {
		var children = this.getChildren();
		children.removeAt(index);

		this.setChildren(children);
	},
	
	getAt : function(index) {
		return this.getChildren()[index];
	},
	
	getChildren : function() {
		return this.getPropertyValue("children");
	},
	
	setChildren : function(value) {
		if(value == null)
			value = new Array();
			
		this.setPropertyValue("children", value);
	},
	
	clear : function() {
		this.setChildren(null);
	},
	
	getForType : function(type) {
		var len = this.getChildren().length;
		var xform = null;
		
		for(var i = 0; i < len; i++)
		{
			xform = this.getChildren()[i];
			
			if(xform != null && xform instanceof type)
				return xform;
		}
		
		return null;
	},
	
	isEqualTo : function(other) {
		if(this.getChildren().length == other.getChildren().length)
		{
			var len = this.getChildren().length;
			var c1 = null;
			var c2 = null;
			
			for(var i = 0; i < len; ++i)
			{
				c1 = this.getChildren()[i];
				c2 = other.getChildren()[i];
				
				if(MoAreNotEqual(c1, c2))
					return false;
			}

			return true;
		}
		
		return false;
	}
});
	


//=====================================================================
//= MoTranslateTransform.js
//=====================================================================

MoTranslateTransform = Class.create(MoTransform, {
	initialize : function($super, x, y) {		
		$super();

		this.setX(MoValueOrDefault(x, 0));
		this.setY(MoValueOrDefault(y, 0));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("x", this.getX, this.setX, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("y", this.getY, this.setY, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},

	getValue : function() {
		var mx = MoMatrix2D.createIdentity();
		mx.translate(this.getX(), this.getY());

		return mx;
	},

	transformRect : function(rect) {
		if(!rect.isEmpty())
			rect.offset(this.getX(), this.getY());
			
		return rect;
	},
	
	getX : function() {
		return this.getPropertyValue("x");
	},
	
	setX : function(value) {
		this.setPropertyValue("x", value);
	},
	
	getY : function() {
		return this.getPropertyValue("y");
	},
	
	setY : function(value) {
		this.setPropertyValue("y", value);
	},

	isEqualTo : function($super, other) {
		return (this.getX() == other.getX() &&
				this.getY() == other.getY());
	}
});
	


//=====================================================================
//= MoEffect.js
//=====================================================================

MoEffect = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super) {		
		$super();

		/** HTMLCanvasElement **/
		this.effectCanvas = document.createElement("canvas");

		/** CanvasRenderingContext2D **/
		this.effectContext = this.effectCanvas.getContext("2d");

		this.initializeAnimatableProperties();
	},

	reset : function(size) {
		var bounds = this.getRenderBounds(new MoRectangle(0, 0, size.width, size.height));

		this.effectCanvas.width = bounds.width;
		this.effectCanvas.height = bounds.height;
		this.effectContext.clearRect(0, 0, bounds.width, bounds.height);
		this.effectContext.setTransform(1, 0, 0, 1, -bounds.x, -bounds.y);

		this.resetCore(size);
	},

	resetCore : function(size) {
		/** override, to handle any initialization before the effect is processed **/
	},

	getEffectCanvas : function() {
		return this.effectCanvas;
	},

	getEffectContext : function() {
		return this.effectContext;
	},

	getRenderBounds : function(contentRect) {
		/** override, to handle any custom bounds calculation (i.e. pad for a blur ) **/
		return contentRect;
	},
	
	process : function(target) {

		// get the full pixel buffer from our effect's context
		var pixelData = MoGraphicsUtil.getImageData(this.getEffectContext(), 0, 0, this.getEffectCanvas().width, this.getEffectCanvas().height, true);
		
		// let any subclasses process the pixel buffer, if successful put the modified
		// buffer back into the effect's context
		var processedPixelData = this.processCore(target, pixelData);
		
		if(processedPixelData != null)
		{
			// clear it first so we start from a blank slate
			this.getEffectContext().clearRect(0, 0, this.getEffectCanvas().width, this.getEffectCanvas().height);
			
			// copy the modified pixel buffer back into the context
			this.getEffectContext().putImageData(processedPixelData, 0, 0);

			return true;
		}

		return false;
	},
	
	processCore : function(target, pixelData) {
		/** override, to handle custom pixel processing **/
		return null;
	}
});
	


//=====================================================================
//= MoBoxBlurEffect.js
//=====================================================================

MoBoxBlurEffect = Class.create(MoEffect, {
	initialize : function($super, radiusX, radiusY, quality) {
		$super();
		
		this.setRadiusX(MoValueOrDefault(radiusX, 4));
		this.setRadiusY(MoValueOrDefault(radiusY, 4));
		this.setQuality(MoValueOrDefault(quality, 1));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("radiusX", this.getRadiusX, this.setRadiusX, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("radiusY", this.getRadiusY, this.setRadiusY, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("quality", this.getQuality, this.setQuality, MoPropertyOptions.AffectsRender);
	},
	
	getRadiusX : function() {
		return this.getPropertyValue("radiusX");
	},
	
	setRadiusX : function(value) {
		this.setPropertyValue("radiusX", value);
	},
	
	getRadiusY : function() {
		return this.getPropertyValue("radiusY");
	},
	
	setRadiusY : function(value) {
		this.setPropertyValue("radiusY", value);
	},
	
	getQuality : function() {
		return this.getPropertyValue("quality");
	},
	
	setQuality : function(value) {
		this.setPropertyValue("quality", value);
	},
	
	getRenderBounds : function(contentRect) {
		// this is just an approximation (better yet, a guess)
		// TODO: need to figure out how to accurately calculate the bounding
		// 		 region of the blur, much like the DropShadowEffect does but
		//		 instead of calculating it directionally we need to in each
		//		 direction, that may be the solution, calculate it for east,
		//		 west, north and south... but the quality will also be a factor
		//		 in the caclulation... hmm???
		var rx = this.getRadiusX()*2;
		var ry = this.getRadiusY()*2;
		var p1 = new MoVector2D(contentRect.x - rx, contentRect.y - ry);
		var p2 = new MoVector2D(contentRect.bottomRight().x + rx, contentRect.bottomRight().y + ry);
		
		return MoRectangle.fromPoints(p1, p2);
	},
	
	processCore : function(target, pixelData) {
		
		if(this.getRadiusX() == 0 && this.getRadiusY() == 0)
			return pixelData;
		
		var iterations = this.getQuality();
		var data = pixelData.data;
		var rsum, gsum, bsum, asum;
		var x, y;
		var i, idx;
		var p, p1, p2;
		var yp, yi, yw;
		var wm = pixelData.width - 1;
		var hm = pixelData.height - 1;
		var wh = pixelData.width * pixelData.height;
		var rad1x = this.getRadiusX() + 1;
		var rad1y = this.getRadiusY() + 1;
		var divx = this.getRadiusX() + rad1x;
		var divy = this.getRadiusY() + rad1y;
		var div2 = 1 / (divx * divy);
		
		var r = [];
		var g = [];
		var b = [];
		var a = [];
		
		var vmin = [];
		var vmax = [];
		
		while(iterations-- > 0)
		{
			yw = yi = 0;
			
			for(y = 0; y < pixelData.height; y++)
			{
				rsum = data[yw + 0] * rad1x;
				gsum = data[yw + 1] * rad1x;
				bsum = data[yw + 2] * rad1x;
				asum = data[yw + 3] * rad1x;
				
				for(i = 1; i <= this.getRadiusX(); i++)
				{
					p = yw + (((i > wm ? wm : i)) << 2);
					rsum += data[p++];
					gsum += data[p++];
					bsum += data[p++];
					asum += data[p];
				}
				
				for(x = 0; x < pixelData.width; x++)
				{
					r[yi] = rsum;
					g[yi] = gsum;
					b[yi] = bsum;
					a[yi] = asum;
					
					if(y == 0)
					{
						vmin[x] = Math.min(x + rad1x, wm) << 2;
						vmax[x] = Math.max(x - this.getRadiusX(), 0) << 2;
					}
					
					p1 = yw + vmin[x];
					p2 = yw + vmax[x];
					
					rsum += data[p1++] - data[p2++];
					gsum += data[p1++] - data[p2++];
					bsum += data[p1++] - data[p2++];
					asum += data[p1] - data[p2];
					
					yi++;
				}
				
				yw += (pixelData.width << 2);
			}
			
			for(x = 0; x < pixelData.width; x++)
			{
				yp = x;
				rsum = r[yp] * rad1y;
				gsum = g[yp] * rad1y;
				bsum = b[yp] * rad1y;
				asum = a[yp] * rad1y;
				
				for(i = 1; i <= this.getRadiusY(); i++)
				{
					yp += (i > hm ? 0 : pixelData.width);
					rsum += r[yp];
					gsum += g[yp];
					bsum += b[yp];
					asum += a[yp];
				}
				
				yi = x << 2;
				
				for(y = 0; y < pixelData.height; y++)
				{
					data[yi + 0] = (rsum * div2 + 0.5) | 0;
					data[yi + 1] = (gsum * div2 + 0.5) | 0;
					data[yi + 2] = (bsum * div2 + 0.5) | 0;
					data[yi + 3] = (asum * div2 + 0.5) | 0;
					
					if(x == 0)
					{
						vmin[y] = Math.min(y + rad1y, hm) * pixelData.width;
						vmax[y] = Math.max(y - this.getRadiusY(), 0) * pixelData.width;
					}
					
					p1 = x + vmin[y];
					p2 = x + vmax[y];
					
					rsum += r[p1] - r[p2];
					gsum += g[p1] - g[p2];
					bsum += b[p1] - b[p2];
					asum += a[p1] - a[p2];
					
					yi += pixelData.width << 2;
				}
			}
		}

		return pixelData;
	}
});
	


//=====================================================================
//= MoColorBurnEffect.js
//=====================================================================

MoColorBurnEffect = Class.create(MoEffect, {
	initialize : function($super) {
		$super();

	},

	processCore : function(target, pixelData) {
		var globalBounds = target.getGlobalBounds();
		var dstData = MoGraphicsUtil.getImageData(target.getScene().getNativeGraphicsContext(), globalBounds.x, globalBounds.y, pixelData.width, pixelData.height, true);
		var src = pixelData.data;
		var dst = dstData.data;
		var len = src.length;
		var alpha = 1;

		for(var i = 0; i < len; i += 4)
		{
			var sr = src[i + 0];
			var sg = src[i + 1];
			var sb = src[i + 2];
			var sa = src[i + 3];
			var dr = dst[i + 0];
			var dg = dst[i + 1];
			var db = dst[i + 2];
			var da = dst[i + 3];
			var dor, dog, dob;
			
			if(sr != 0)
				dor = Math.max(255 - (((255 - dr) << 8) / sr), 0);
			else
				dor = sr;
			
			if(sg != 0)
				dog = Math.max(255 - (((255 - dg) << 8) / sg), 0);
			else
				dog = sg;
			
			if(sb != 0)
				dob =  Math.max(255 - (((255 - db) << 8) / sb), 0);
			else
				dob = sb;
			
			var a = alpha * sa / 255;
			var ac = 1-a;
			
			
			dst[i + 0] = (a * dor + ac * dr);
			dst[i + 1] = (a * dog + ac * dg);
			dst[i + 2] = (a * dob + ac * db);
			dst[i + 3] = (sa * alpha + da * ac);
		}
		
		return dstData;
	}
});
	


//=====================================================================
//= MoColorEffect.js
//=====================================================================

MoColorEffect = Class.create(MoEffect, {
	initialize : function($super, redScale, redOffset, greenScale, greenOffset, blueScale, blueOffset, alphaScale, alphaOffset) {
		$super();
		
		this.setRedScale(MoValueOrDefault(redScale, 1));
		this.setRedOffset(MoValueOrDefault(redOffset, 0));

		this.setGreenScale(MoValueOrDefault(greenScale, 1));
		this.setGreenOffset(MoValueOrDefault(greenOffset, 0));

		this.setBlueScale(MoValueOrDefault(blueScale, 1));
		this.setBlueOffset(MoValueOrDefault(blueOffset, 0));

		this.setAlphaScale(MoValueOrDefault(alphaScale, 1));
		this.setAlphaOffset(MoValueOrDefault(alphaOffset, 0));
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("redScale", this.getRedScale, this.setRedScale, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("greenScale", this.getGreenScale, this.setGreenScale, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blueScale", this.getBlueScale, this.setBlueScale, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("alphaScale", this.getAlphaScale, this.setAlphaScale, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("redOffset", this.getRedOffset, this.setRedOffset, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("greenOffset", this.getGreenOffset, this.setGreenOffset, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blueOffset", this.getBlueOffset, this.setBlueOffset, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("alphaOffset", this.getAlphaOffset, this.setAlphaOffset, MoPropertyOptions.AffectsRender);
	},
	
	getRedScale : function() {
		return this.getPropertyValue("redScale");
	},
	
	setRedScale : function(value) {
		this.setPropertyValue("redScale", value);
	},
	
	getGreenScale : function() {
		return this.getPropertyValue("greenScale");
	},
	
	setGreenScale : function(value) {
		this.setPropertyValue("greenScale", value);
	},
	
	getBlueScale : function() {
		return this.getPropertyValue("blueScale");
	},
	
	setBlueScale : function(value) {
		this.setPropertyValue("blueScale", value);
	},
	
	getAlphaScale : function() {
		return this.getPropertyValue("alphaScale");
	},
	
	setAlphaScale : function(value) {
		this.setPropertyValue("alphaScale", value);
	},
	
	getRedOffset : function() {
		return this.getPropertyValue("redOffset");
	},
	
	setRedOffset : function(value) {
		this.setPropertyValue("redOffset", value);
	},
	
	getGreenOffset : function() {
		return this.getPropertyValue("greenOffset");
	},
	
	setGreenOffset : function(value) {
		this.setPropertyValue("greenOffset", value);
	},
	
	getBlueOffset : function() {
		return this.getPropertyValue("blueOffset");
	},
	
	setBlueOffset : function(value) {
		this.setPropertyValue("blueOffset", value);
	},
	
	getAlphaOffset : function() {
		return this.getPropertyValue("alphaOffset");
	},
	
	setAlphaOffset : function(value) {
		this.setPropertyValue("alphaOffset", value);
	},
	
	processCore : function(target, pixelData) {
		var data = pixelData.data;
		var len = data.length;
		
		for(var i = 0; i < len; i += 4)
		{
			data[i + 0] = data[i + 0] * this.getRedScale() + this.getRedOffset();
			data[i + 1] = data[i + 1] * this.getGreenScale() + this.getGreenOffset();
			data[i + 2] = data[i + 2] * this.getBlueScale() + this.getBlueOffset();
			data[i + 3] = data[i + 3] * this.getAlphaScale() + this.getAlphaOffset();
		}
		
		return pixelData;
	}
});
	


//=====================================================================
//= MoDropShadowEffect.js
//=====================================================================

MoDropShadowEffect = Class.create(MoEffect, {
	initialize : function($super, direction, depth, blurRadius, color) {		
		$super();
		
		this.setDirection(MoValueOrDefault(direction, 315));
		this.setBlurRadius(MoValueOrDefault(blurRadius, 5));
		this.setDepth(MoValueOrDefault(depth, 5));
		this.setColor(MoValueOrDefault(color, MoColor.Black));

		this.shadowCanvas = document.createElement("canvas");
		this.shadowContext = this.shadowCanvas.getContext("2d");
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("direction", this.getDirection, this.setDirection, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("blurRadius", this.getBlurRadius, this.setBlurRadius, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("depth", this.getDepth, this.setDepth, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("color", this.getColor, this.setColor, MoPropertyOptions.AffectsRender);
	},

	getDirection : function() {
		return this.getPropertyValue("direction");
	},
	
	setDirection : function(value) {
		this.setPropertyValue("direction", value);
	},
	
	getBlurRadius : function() {
		return this.getPropertyValue("blurRadius");
	},
	
	setBlurRadius : function(value) {
		this.setPropertyValue("blurRadius", value);
	},
	
	getDepth : function() {
		return this.getPropertyValue("depth");
	},
	
	setDepth : function(value) {
		this.setPropertyValue("depth", value);
	},
	
	getColor : function() {
		return this.getPropertyValue("color");
	},
	
	setColor : function(value) {
		this.setPropertyValue("color", value);
	},

	getRenderBounds : function(contentRect) {
		var r = this.getBlurRadius();
		var d = this.getDepth();
		var dir = MoMath.degreesToRadians(this.getDirection());
		var p1 = new MoVector2D(contentRect.x - r, contentRect.y - r);
		var p2 = new MoVector2D(contentRect.bottomRight().x + r, contentRect.bottomRight().y + r);
		var x = d * Math.cos(dir);
		var y = d * Math.sin(dir);
		
		if(x >= 0)
			p2.x += x;
		else
			p1.x += x;

		if(y >= 0)
			p1.y -= y;
		else
			p2.y -= y;
		
		return MoRectangle.fromPoints(p1, p2);
	},
	
	processCore : function(target, pixelData) {
		var canvas = this.shadowCanvas;
		var ctx = this.shadowContext;	
		var dir = MoMath.degreesToRadians(-this.getDirection());
		var depth = this.getDepth();
		var x = depth * Math.cos(dir);
		var y = depth * Math.sin(dir);

		canvas.width = pixelData.width;
		canvas.height = pixelData.height;

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.shadowOffsetX = x;
		ctx.shadowOffsetY = y;
		ctx.shadowBlur = this.getBlurRadius();
		ctx.shadowColor = this.getColor().toRGBAString();
		ctx.drawImage(this.getEffectCanvas(), 0, 0);
		ctx.restore();

		return MoGraphicsUtil.getImageData(ctx, 0, 0, pixelData.width, pixelData.height, true);
	}
});
	


//=====================================================================
//= MoNormalMapEffect.js
//=====================================================================

MoNormalMapEffect = Class.create(MoEffect, {
	initialize : function($super, normalSource, lightPosition, specularSharpness) {
		$super();

		this.setNormalSource(normalSource);
		this.setLightPosition(MoValueOrDefault(lightPosition, new MoVector3D(0, 0, 150)));
		this.setLightColor(MoValueOrDefault(new MoColor(0.5, 0.5, 0.5, 0.5)));
		this.setSpecularSharpness(MoValueOrDefault(specularSharpness, 1.2));
		
		this.normalCanvas = document.createElement("canvas");
		this.normalContext = this.normalCanvas.getContext("2d");
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("normalSource", this.getNormalSource, this.setNormalSource, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("lightColor", this.getLightColor, this.setLightColor, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("lightPosition", this.getLightPosition, this.setLightPosition, MoPropertyOptions.AffectsRender);
		this.enableAnimatableProperty("specularSharpness", this.getSpecularSharpness, this.setSpecularSharpness, MoPropertyOptions.AffectsRender);
	},

	getNormalSource : function() {
		return this.getPropertyValue("normalSource");
	},

	setNormalSource : function(value) {
		this.setPropertyValue("normalSource", value);
	},
	
	getLightColor : function() {
		return this.getPropertyValue("lightColor");
	},
	
	setLightColor : function(value) {
		this.setPropertyValue("lightColor", value);
	},
	
	getLightPosition : function() {
		return this.getPropertyValue("lightPosition");
	},
	
	setLightPosition : function(value) {
		this.setPropertyValue("lightPosition", value);
	},
	
	getSpecularSharpness : function() {
		return this.getPropertyValue("specularSharpness");
	},
	
	setSpecularSharpness : function(value) {
		this.setPropertyValue("specularSharpness", value);
	},

	processCore : function(target, pixelData) {		
		var normalMap = this.getNormalSource().texture;

		if(normalMap == null || !normalMap.getIsSourceReady())
			return null;
		
		var canvas = this.normalCanvas;
		var ctx = this.normalContext;	
		
		canvas.width = pixelData.width;
		canvas.height = pixelData.height;

		// draw the normals to the scratch canvas so we can
		// can the normal pixel data
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		ctx.drawImage(normalMap.getNativeData(), 0, 0, canvas.width, canvas.height);
		ctx.restore();
		
		
		var normalPixelData = MoGraphicsUtil.getImageData(ctx, 0, 0, pixelData.width, pixelData.height, true);
		var normalData = normalPixelData.data;
		var data = pixelData.data;
		var sharpness = this.getSpecularSharpness();
		var lightColor = this.getLightColor();
		var lightR = lightColor.r * 255;
		var lightG = lightColor.g * 255;
		var lightB = lightColor.b * 255;
		var lightPos = MoVector3D.normalize(this.getLightPosition());
		var intensity = sharpness / 128;
		var ir = lightR * intensity;
		var ig = lightG * intensity;
		var ib = lightB * intensity;
		var ia = 1 - sharpness * (0.75 + lightPos.x + lightPos.y + lightPos.z);
		var colorMatrix = [
			ir * lightPos.x, ir * lightPos.y, ir * lightPos.z, 0, lightR * ia, 	// red
			ig * lightPos.x, ig * lightPos.y, ig * lightPos.z, 0, lightG * ia, 	// green
			ib * lightPos.x, ib * lightPos.y, ib * lightPos.z, 0, lightB * ia] 	// blue
		var pixelLen = pixelData.data.length;
		
		for(var i = 0; i < pixelLen; i += 4)
		{
			var nr = normalData[i + 0];
			var ng = normalData[i + 1];
			var nb = normalData[i + 2];
			var na = normalData[i + 3];
			var sr = data[i + 0];
			var sg = data[i + 1];
			var sb = data[i + 2];
			var sa = data[i + 3];

			// first apply the color matrix to our normal data
			data[i + 0] = (colorMatrix[0] * nr) + (colorMatrix[1] * ng) + (colorMatrix[2] * nb) + (colorMatrix[3] * na) + colorMatrix[4];
			data[i + 1] = (colorMatrix[5] * nr) + (colorMatrix[6] * ng) + (colorMatrix[7] * nb) + (colorMatrix[8] * na) + colorMatrix[9];
			data[i + 2] = (colorMatrix[10] * nr) + (colorMatrix[11] * ng) + (colorMatrix[12] * nb) + (colorMatrix[13] * na) + colorMatrix[14];
			data[i + 3] = lightColor.a * 255;
			
			// then second apply the blending mode, here we use a hardlight
			// blend against our original image
			nr = data[i + 0];
			ng = data[i + 1];
			nb = data[i + 2];
			na = data[i + 3];

			var a = na / 255;
			var ac = 1 - a;

			if(nr > 127)
				nr = 255 - 2 * MoColor.multiply255(255 - nr, 255 - sr);
			else
				nr = 2 * MoColor.multiply255(nr, sr);
			
			if(ng > 127)
				ng = 255 - 2 * MoColor.multiply255(255 - ng, 255 - sg);
			else
				ng = 2 * MoColor.multiply255(ng, sg);
				
			if(nb > 127)
				nb = 255 - 2 * MoColor.multiply255(255 - nb, 255 - sb);
			else
				nb = 2 * MoColor.multiply255(nb, sb);
			
			data[i + 0] = (a * nr + ac * sr);
			data[i + 1] = (a * ng + ac * sg);
			data[i + 2] = (a * nb + ac * sb);
			data[i + 3] = (na + sa * ac);
		}
		
		return pixelData;
	}
});
	


//=====================================================================
//= MoBrush.js
//=====================================================================

MoBrush = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super) {
		$super();
		
		/** Boolean **/
		this.isAvailable = false;
		
		/** CanvasGradient/CanvasPattern **/
		this.nativeBrushCache = null;
		
		this.setOpacity(1);
		this.initializeAnimatableProperties();
	},

	initializeAnimatablePropertiesCore : function() {		
		this.enableAnimatableProperty("transform", this.getTransform, this.setTransform, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
		this.enableAnimatableProperty("opacity", this.getOpacity, this.setOpacity, MoPropertyOptions.AffectsLayout);
	},

	getIsAvailable : function() {
		return this.isAvailable;
	},
	
	getTransform : function() {
		return this.getPropertyValue("transform");
	},
	
	setTransform : function(value) {
		this.setPropertyValue("transform", value);
	},
	
	getOpacity : function() {
		return this.getPropertyValue("opacity");
	},
	
	setOpacity : function(value) {
		this.setPropertyValue("opacity", Math.min(1, Math.max(0, value)));
	},

	raiseAvailableEvent : function() {
		this.isAvailable = true;
		this.dispatchEvent(new MoSourceEvent(MoSourceEvent.READY));
		this.raisePropertyChangedEvent("isAvailable", false, true);
	},

	isEqualTo : function(other) {
		if(this.getOpacity() == other.getOpacity())
			return MoAreEqual(this.getTransform(), other.getTransform());

		return false;
	}
});


//=====================================================================
//= MoSolidColorBrush.js
//=====================================================================

MoSolidColorBrush = Class.create(MoBrush, {
	initialize : function($super, color) {
		$super();

		this.setColor(color);
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("color", this.getColor, this.setColor, MoPropertyOptions.AffectsLayout);
	},

	getColor : function() {
		return this.getPropertyValue("color");
	},

	setColor : function(value) {
		this.setPropertyValue("color", value);
	},

	isEqualTo : function($super, other) {
		if($super(other))
			return MoAreEqual(this.getColor(), other.getColor());

		return false;
	}
});

Object.extend(MoSolidColorBrush, {
	
	fromColor : function(color) {
		return new MoSolidColorBrush(color);
	},

	fromColorHex : function(hexColor) {
		return MoSolidColorBrush.fromColor(MoColor.fromHex(hexColor));
	},

	fromColorHexWithAlpha : function(hexColor, alpha) {
		return MoSolidColorBrush.fromColor(MoColor.fromHexWithAlpha(hexColor, alpha));
	},
	
	fromColorRGB : function(r, g, b) {
		return MoSolidColorBrush.fromColor(new MoColor(r, g, b, 1.0));
	},
	
	fromColorRGBA : function(r, g, b, a) {
		return MoSolidColorBrush.fromColor(new MoColor(r, g, b, a));
	},
	
	black : function() {
		return MoSolidColorBrush.fromColor(MoColor.black());
	},
	
	white : function() {
		return MoSolidColorBrush.fromColor(MoColor.white());
	},
	
	red : function() {
		return MoSolidColorBrush.fromColor(MoColor.red());
	},
	
	green : function() {
		return MoSolidColorBrush.fromColor(MoColor.green());
	},
	
	blue : function() {
		return MoSolidColorBrush.fromColor(MoColor.blue());
	},
	
	yellow : function() {
		return MoSolidColorBrush.fromColor(MoColor.yellow());
	},
	
	magenta : function() {
		return MoSolidColorBrush.fromColor(MoColor.magenta());
	},
	
	turquoise : function() {
		return MoSolidColorBrush.fromColor(MoColor.turquoise());
	},
	
	transparent : function() {
		return MoSolidColorBrush.fromColor(MoColor.transparent());
	}
});


//=====================================================================
//= MoGradientBrush.js
//=====================================================================

MoGradientBrush = Class.create(MoBrush, {
	initialize : function($super) {
		$super();
		
		this.setColorStops(new Array());
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("colorStops", this.getColorStops, this.setColorStops, MoPropertyOptions.AffectsLayout);
	},
	
	getColorStops : function() {
		return this.getPropertyValue("colorStops");
	},

	setColorStops : function(value) {
		if(value == null)
			value = new Array();

		this.setPropertyValue("colorStops", value);
	},
	
	getColorStopCount : function() {
		return this.getColorStops().length;
	},

	getColorStop : function(index) {
		return this.getColorStops()[index];
	},

	addColorStop : function(value) {		
		var stops = this.getColorStops();
		stops.push(value);

		this.setColorStops(stops);
	},
	
	clearColorStops : function() {
		this.setColorStops(null);
	},

	isEqualTo : function($super, other) {
		if($super(other) &&  this.getColorStopCount() == other.getColorStopCount())
		{
			var len = this.getColorStopCount();
			var stopA = null;
			var stopB = null;
			
			for(var i = 0; i < len; ++i)
			{
				stopA = this.getColorStop(i);
				stopB = other.getColorStop(i);

				if(stopA.isNotEqualTo(stopB))
					return false;
			}
			
			return true;
		}

		return false;
	}
});


//=====================================================================
//= MoGradientStop.js
//=====================================================================

MoGradientStop = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super, color, offset) {
		$super();

		this.setColor(MoValueOrDefault(color, MoColor.Transparent));
		this.setOffset(MoValueOrDefault(offset, 0));
		
		/** MoGradientBrush **/
		this.brush = null;
		
		this.initializeAnimatableProperties();
	},

	initializeAnimatablePropertiesCore : function() {
		this.enableAnimatableProperty("color", this.getColor, this.setColor, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("offset", this.getOffset, this.setOffset, MoPropertyOptions.AffectsLayout);
	},

	getColor : function() {
		return this.getPropertyValue("color");
	},

	setColor : function(value) {
		this.setPropertyValue("color", value);
	},

	getOffset : function() {
		return this.getPropertyValue("offset");
	},
	
	setOffset : function(value) {
		this.setPropertyValue("offset", value);
	},
	
	isEqualTo : function(other) {
		return (MoAreEqual(this.getColor(), other.getColor()) && this.getOffset() && other.getOffset());
	},

	toString : function() {
		return "GradientStop[ offset=" + this.getOffset() + ", color=" + this.getColor() + " ]";
	}
});


//=====================================================================
//= MoLinearGradientBrush.js
//=====================================================================

MoLinearGradientBrush = Class.create(MoGradientBrush, {
	initialize : function($super) {
		$super();

		this.setStartPoint(new MoVector2D(0, 0));
		this.setEndPoint(new MoVector2D(1, 1));
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("startPoint", this.getStartPoint, this.setStartPoint);
		this.enableAnimatableProperty("endPoint", this.getEndPoint, this.setEndPoint);
	},

	getStartPoint : function() {
		return this.getPropertyValue("startPoint");
	},
	
	setStartPoint : function(value) {
		this.setPropertyValue("startPoint", value);
	},

	getEndPoint : function() {
		return this.getPropertyValue("endPoint");
	},

	setEndPoint : function(value) {
		this.setPropertyValue("endPoint", value);
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) &&
				MoAreEqual(this.getStartPoint(), other.getStartPoint()) &&
				MoAreEqual(this.getEndPoint(), other.getEndPoint()));
	}
});

Object.extend(MoLinearGradientBrush, {

	computeStartPointFromAngle : function(angle) {		
		return MoMath.pointOfAngle(
			MoMath.degreesToRadians(180-(angle % 360))).normalizeZero();
	},

	computeEndPointFromAngle : function(angle) {
		return MoMath.pointOfAngle(
			MoMath.degreesToRadians(360-(angle % 360))).normalizeZero();
	},

	fromGradientStops : function(stops) {
		var brush = new MoLinearGradientBrush();
		brush.setColorStops(stops);
		
		return brush;
	},
	
	fromGradientStopsWithAngle : function(stops, angle) {
		var brush = MoLinearGradientBrush.fromGradientStops(stops);
		brush.setStartPoint(MoLinearGradientBrush.computeStartPointFromAngle(angle));
		brush.setEndPoint(MoLinearGradientBrush.computeEndPointFromAngle(angle));
		
		return brush;
	},

	fromColorsWithAngle : function(startColor, endColor, angle) {
		var stops = new Array(
			new MoGradientStop(startColor, 0), 
			new MoGradientStop(endColor, 1));
			
		return MoLinearGradientBrush.fromGradientStopsWithAngle(stops, angle);
	}
});


//=====================================================================
//= MoRadialGradientBrush.js
//=====================================================================

MoRadialGradientBrush = Class.create(MoGradientBrush, {
	initialize : function($super) {
		$super();

		this.setStartPoint(new MoVector2D(0.5, 0.5));
		this.setEndPoint(new MoVector2D(0.5, 0.5));
		this.setStartRadius(0);
		this.setEndRadius(1);
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("startPoint", this.getStartPoint, this.setStartPoint, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("startRadius", this.getStartRadius, this.setStartRadius, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("endPoint", this.getEndPoint, this.setEndPoint, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("endRadius", this.getEndRadius, this.setEndRadius, MoPropertyOptions.AffectsLayout);
	},

	getStartPoint : function() {
		return this.getPropertyValue("startPoint");
	},
	
	setStartPoint : function(value) {
		this.setPropertyValue("startPoint", value);
	},
	
	getEndPoint : function() {
		return this.getPropertyValue("endPoint");
	},

	setEndPoint : function(value) {
		this.setPropertyValue("endPoint", value);
	},

	getStartRadius : function() {
		return this.getPropertyValue("startRadius");
	},
	
	setStartRadius : function(value) {
		this.setPropertyValue("startRadius", value);
	},

	getEndRadius : function() {
		return this.getPropertyValue("endRadius");
	},
	
	setEndRadius : function(value) {
		this.setPropertyValue("endRadius", value);
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) &&
				MoAreEqual(this.getStartPoint(), other.getStartPoint()) &&
				MoAreEqual(this.getEndPoint(), other.getEndPoint()) &&
				this.getStartRadius() == other.getStartRadius() &&
				this.getEndRadius() == other.getEndRadius());
	}
});

Object.extend(MoRadialGradientBrush, {

	fromGradientStops : function(stops) {
		var brush = new MoRadialGradientBrush();
		brush.setColorStops(stops);
		
		return brush;
	},

	fromColors : function(startColor, endColor) {
		var stops = new Array(
			new MoGradientStop(startColor, 0), 
			new MoGradientStop(endColor, 1));

		return MoRadialGradientBrush.fromGradientStops(stops);
	}
});


//=====================================================================
//= MoImageBrush.js
//=====================================================================

MoImageBrush = Class.create(MoBrush, {
	initialize : function($super) {
		$super();
		
		/** MoTextureSource **/
		this.texture = null;
		
		this.setHorizontalAlignment(MoHorizontalAlignment.Center);
		this.setVerticalAlignment(MoVerticalAlignment.Center);
		this.setStretch(MoStretch.Fill);
	},

	getSourceUrl : function() {
		return this.getPropertyValue("sourceUrl");
	},

	setSourceUrl : function(value) {
		if(this.setPropertyValue("sourceUrl", value))
			this.loadImage();
	},
	
	getHorizontalAlignment : function() {
		return this.getPropertyValue("horizontalAlignment");
	},
	
	setHorizontalAlignment : function(value) {
		this.setPropertyValue("horizontalAlignment", value);
	},
	
	getVerticalAlignment : function() {
		return this.getPropertyValue("verticalAlignment");
	},
	
	setVerticalAlignment : function(value) {
		this.setPropertyValue("verticalAlignment", value);
	},
	
	getStretch : function() {
		return this.getPropertyValue("stretch");
	},
	
	setStretch : function(value) {
		this.setPropertyValue("stretch", value);
	},

	loadImage : function() {
	
		this.texture = null;

		if(this.getSourceUrl() != null)
		{
			this.texture = new MoTextureSource();
			this.texture.addEventHandler(MoSourceEvent.READY, this.onTextureSourceReady.asDelegate(this));
			this.texture.setUrl(this.getSourceUrl());

			this.raisePropertyChangedEvent("texture");
		}
	},
	
	onTextureSourceReady : function(event) {
		this.raiseAvailableEvent();
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) && this.getSourceUrl() == other.getSourceUrl());
	}
});

Object.extend(MoImageBrush, {
	
	fromUrl : function(url) {
		var brush = new MoImageBrush();
		brush.setSourceUrl(url);
		
		return brush;
	}
});


//=====================================================================
//= MoVideoBrush.js
//=====================================================================

MoVideoBrush = Class.create(MoBrush, {
	initialize : function($super, sourceElement) {
		$super();

		this.sourceElement = sourceElement;
		this.sourceElement.addEventHandler(MoVideoEvent.FRAME_CHANGE, this.handleFrameChangeEvent.asDelegate(this));
		this.isFirstFrame = false;
		
		this.setHorizontalAlignment(MoHorizontalAlignment.Center);
		this.setVerticalAlignment(MoVerticalAlignment.Center);
		this.setStretch(MoStretch.Fill);
		this.setFrame(0);
	},

	getNaturalSize : function() {
		return this.sourceElement.getNaturalSize();
	},

	getSourceElement : function() {
		return this.sourceElement.getSourceElement();
	},
	
	getCurrentPosition : function() {
		return this.sourceElement.getCurrentPosition();
	},
	
	getStretch : function() {
		return this.getPropertyValue("stretch");
	},
	
	setStretch : function(value) {
		this.setPropertyValue("stretch", value);
	},
	
	getHorizontalAlignment : function() {
		return this.getPropertyValue("horizontalAlignment");
	},
	
	setHorizontalAlignment : function(value) {
		this.setPropertyValue("horizontalAlignment", value);
	},
	
	getVerticalAlignment : function() {
		return this.getPropertyValue("verticalAlignment");
	},
	
	setVerticalAlignment : function(value) {
		this.setPropertyValue("verticalAlignment", value);
	},
	
	getFrame : function() {
		return this.getPropertyValue("frame");
	},
	
	setFrame : function(value) {
		this.setPropertyValue("frame", value);
	},

	handleFrameChangeEvent : function(event) {
		if(!this.isFirstFrame)
		{
			this.isFirstFrame = true;
			this.raiseAvailableEvent();
		}

		this.setFrame(this.getFrame() + 1);
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) && this.sourceElement == other.sourceElement);
	}
});


//=====================================================================
//= MoPen.js
//=====================================================================

MoPen = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super, brush, thickness) {
		$super();
		
		this.setBrush(brush);
		this.setLineCap(MoPenLineCap.Flat);
		this.setLineJoin(MoPenLineJoin.Miter);
		this.setMiterLimit(10);
		this.setDashCap(MoPenLineCap.Square);
		this.setDashStyle(MoDashStyle.Solid);
		this.setThickness(MoValueOrDefault(thickness, 1));

		this.initializeAnimatableProperties();
	},

	initializeAnimatablePropertiesCore : function() {
		this.enableAnimatableProperty("brush", this.getBrush, this.setBrush, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("lineCap", this.getLineCap, this.setLineCap, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("lineJoin", this.getLineJoin, this.setLineJoin, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("miterLimit", this.getMiterLimit, this.setMiterLimit, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("dashCap", this.getDashCap, this.setDashCap, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("dashStyle", this.getDashStyle, this.setDashStyle, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("thickness", this.getThickness, this.setThickness, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},
	
	getBrush : function() {
		return this.getPropertyValue("brush");
	},
	
	setBrush : function(value) {
		this.setPropertyValue("brush", value);
	},

	getLineCap : function() {
		return this.getPropertyValue("lineCap");
	},
	
	setLineCap : function(value) {
		this.setPropertyValue("lineCap", value);
	},
	
	getLineJoin : function() {
		return this.getPropertyValue("lineJoin");
	},
	
	setLineJoin : function(value) {
		this.setPropertyValue("lineJoin", value);
	},
	
	getMiterLimit : function() {
		return this.getPropertyValue("miterLimit");
	},
	
	setMiterLimit : function(value) {
		this.setPropertyValue("miterLimit", value);
	},
	
	getDashCap : function() {
		return this.getPropertyValue("dashCap");
	},
	
	setDashCap : function(value) {
		this.setPropertyValue("dashCap", value);
	},
	
	getDashStyle : function() {
		return this.getPropertyValue("dashStyle");
	},
	
	setDashStyle : function(value) {
		this.setPropertyValue("dashStyle", value);
	},
	
	getThickness : function() {
		return this.getPropertyValue("thickness");
	},
	
	setThickness : function(value) {
		this.setPropertyValue("thickness", value);
	},

	isEqualTo : function(other) {
		return (this.getThickness() == other.getThickness() &&
				this.getMiterLimit() == other.getMiterLimit() &&
				this.getDashCap() == other.getDashCap() &&
				this.getDashStyle() == other.getDashStyle() &&
				this.getLineJoin() == other.getLineJoin() &&
				this.getLineCap() == other.getLineCap() &&
				MoAreEqual(this.getBrush(), other.getBrush()));
	}
});


//=====================================================================
//= MoPenLineCap.js
//=====================================================================

MoPenLineCap = {
	"Flat"		: 0,
	"Round"		: 1,
	"Square"	: 2
};


//=====================================================================
//= MoPenLineJoin.js
//=====================================================================

MoPenLineJoin = {
	"Miter"	: 0,
	"Bevel"	: 1,
	"Round"	: 2
};


//=====================================================================
//= MoDashStyle.js
//=====================================================================

MoDashStyle = Class.create({
	initialize : function(dashes, offset) {
	
		/** Number[] **/
		this.dashes = MoValueOrDefault(dashes, new Array());
		
		/** Number **/
		this.offset = MoValueOrDefault(offset, 0);
	},
	
	getDashes : function() {
		return this.dashes;
	},
	
	setDashes : function(value) {
		this.dashes = value;
	},
	
	getOffset : function() {
		return this.offset;
	},
	
	setOffset : function(value) {
		this.offset = value;
	}
});

Object.extend(MoDashStyle, {

	// ----
	Solid : new MoDashStyle(),
	
	// * * * *
	Dot : new MoDashStyle(new Array(1, 2), 0),
	
	// - - - -
	Dash : new MoDashStyle(new Array(2, 2), 2),
	
	// - * - * - * -
	DashDot : new MoDashStyle(new Array(2, 2, 1, 2), 1),
	
	// - * * - * * -
	DashDotDot : new MoDashStyle(new Array(2, 2, 1, 2, 1, 2, 1), 1)
});


//=====================================================================
//= MoImageSource.js
//=====================================================================

MoImageSource = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.isSourceReady = false;
		this.size = MoSize.Zero();
		this.data = null;
	},

	getIsValid : function() {
		return true;
	},

	getNativeData : function() {
		return this.data;
	},

	getIsSourceReady : function() {
		return this.isSourceReady;
	},

	getWidth : function() {
		return this.getSize().width;
	},
	
	getHeight : function() {
		return this.getSize().height;
	},
	
	getSize : function() {
		return this.size;
	},
	
	load : function() {
	
	},

	raiseSourceReadyEvent : function(args) {
		this.dispatchEvent(new MoSourceEvent(MoSourceEvent.READY));
	}
});



//=====================================================================
//= MoCanvasSource.js
//=====================================================================

MoCanvasSource = Class.create(MoImageSource, {
	initialize : function($super, canvas) {
		$super();
		
		/** Canvas **/
		this.canvas = null;
		
		this.reset();
		this.setCanvas(canvas);
	},

	getCanvas : function() {
		return this.canvas;
	},

	setCanvas : function(value) {
		if(this.canvas != value)
		{
			this.reset();
			this.canvas = value;
			this.load();
		}
	},
	
	getSize : function($super) {
		if(this.canvas != null && (this.canvas.width != this.size.width || this.canvas.height != this.size.height))
		{
			this.size.width = this.canvas.width;
			this.size.height = this.canvas.height;
		}
		
		return $super();
	},
	
	reset : function() {		
		this.data = null;
		this.size = MoSize.Zero();
		this.isSourceReady = false;
		this.canvas = null;
	},

	load : function() {
		if(this.isSourceReady)
		{
			this.raiseSourceReadyEvent();
			return;
		}

		this.data = this.canvas;
		this.size.width = this.canvas.width;
		this.size.height = this.canvas.height;
		this.isSourceReady = true;
		
		this.raiseSourceReadyEvent();
	},
		
	isEqualTo : function(other) {
	
		// there is really no good way to compare canvas elements
		// for equality, since the contents is what would decide
		// whether two canvases are equal to each other, however,
		// comparing the pixel buffer of both or the png image data
		// would require a significant amount of time, so, for
		// rendering to occur we must return false so that it assumes
		// the previous source and current source has changed and needs
		// to be updated, not optimal but it's better than the compare
		
		return false;
	}
});



//=====================================================================
//= MoTextureData.js
//=====================================================================

MoTextureData = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.image = null;
		this.isLoaded = false;
	},

	load : function(url) {
		this.image = new Image();
		this.image.addEventListener("load", this.handleLoadEvent.asDelegate(this), false);
		this.image.addEventListener("error", this.handleErrorEvent.asDelegate(this), false);
		this.image.src = url;

		this.isLoaded = false;
	},

	handleLoadEvent : function(e) {
		this.isLoaded = true;
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
	},

	handleErrorEvent : function(e) {
		this.isLoaded = false;
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));
	}
});


//=====================================================================
//= MoTextureSource.js
//=====================================================================

MoTextureSource = Class.create(MoImageSource, {
	initialize : function($super, path, autoload, cachePolicy) {
		$super();

		this.url = null;
		this.autoload = MoValueOrDefault(autoload, true);
		this.cachePolicy = MoValueOrDefault(cachePolicy, MoTextureCachePolicy.Cache);
		this.hasError = false;
		this.error = null;
		this.setUrl(path);
	},

	getIsValid : function() {
		return !this.getHasError();
	},

	getHasError : function() {
		return this.hasError;
	},
	
	getError : function() {
		return this.error;
	},
	
	getCachePolicy : function() {
		return this.cachePolicy;
	},

	getUrl : function() {
		return this.url;
	},

	setUrl : function(value) {
		if(this.url != value)
		{
			this.reset();
			this.url = value;
			
			if(this.autoload)
				this.load();
		}
	},

	raiseLoadCompletedEvent : function() {
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
		this.raiseSourceReadyEvent();
	},

	raiseLoadFailedEvent : function() {
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));
	},
	
	raiseLoadProgressEvent : function() {
		// TODO : need to figure out a good way to dispatch actual progress info
		this.dispatchEvent(new MoProgressEvent(MoProgressEvent.PROGRESS, 100, 100));
	},

	reset : function() {		
		this.data = null;
		this.size = MoSize.Zero();
		this.isSourceReady = false;
		this.hasError = false;
		this.error = "";
		this.url = null;
	},

	load : function() {
		if(this.isSourceReady)
		{
			this.raiseLoadCompletedEvent();
			return;
		}

		var url = this.url;
		var cacheKey = this.url.toLowerCase();
		var textureData = MoTextureCacheGet(cacheKey);

		// no cached texture, load from the server
		if(textureData == null)
		{
			// add a random number to the url so we can bypass the browser cache
			if(this.shouldAlwaysLoadFromServer())
			{
				var str = "s2=" + MoMath.randomIntTo(1000);

				if(url.indexOf("?") == -1)
					url += "?" + str;
				else
					url += "&" + str;
			}

			// create the texture data proxy and load in the data
			textureData = new MoTextureData();
			textureData.addEventHandler(MoLoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
			textureData.addEventHandler(MoLoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));
			textureData.load(url);

			// cache this texture now so that it can be re-used right away, even before it's fully loaded
			if(this.shouldCacheTexture())
				MoTextureCacheAdd(cacheKey, textureData);
		}

		// the texture is cached, load from memory
		else
		{
			// the texture data is already loaded, so just finish up as usual
			if(textureData.isLoaded)
				this.finishLoad(textureData);
			else
			{
				// since the data is not yet loaded, we still need to listen for the events even
				// through we are not the original loader so that everything will get setup correctly
				textureData.addEventHandler(MoLoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
				textureData.addEventHandler(MoLoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));
			}
		}
	},

	finishLoad : function(textureData) {
		// keep a reference to the native image and sizes
		this.data = textureData.image;
		this.size.width = this.data.width;
		this.size.height = this.data.height;
		
		// notify this source is now ready to use
		this.isSourceReady = true;
		this.raiseLoadCompletedEvent();
	},

	handleLoadEvent : function(event) {
		this.removeEventHandlers(event.getTarget());
		this.finishLoad(event.getTarget());
	},

	handleErrorEvent : function(event) {
		// loading failed, notify this source cannot be used
		//
		// TODO : need to see about using more informative error messages
		//        about that actual reason, response code, etc... that was
		//        returned from the server.
		//
		this.hasError = true;
		this.error = "Texture failed to load.";
		this.isSourceReady = false;

		this.removeEventHandlers(event.getTarget());
		this.raiseLoadFailedEvent();
	},

	shouldAlwaysLoadFromServer : function() {
		return (this.getCachePolicy() == MoTextureCachePolicy.InMemory || this.getCachePolicy() == MoTextureCachePolicy.NoCache);
	},
	
	shouldCacheTexture : function() {
		return (this.getCachePolicy() == MoTextureCachePolicy.InMemory || this.getCachePolicy() == MoTextureCachePolicy.Cache);
	},
	
	removeEventHandlers : function(textureData) {
		if(textureData == null)
			return;

		textureData.removeEventHandler(MoLoadEvent.SUCCESS, this.handleLoadEvent.asDelegate(this));
		textureData.removeEventHandler(MoLoadEvent.FAILURE, this.handleErrorEvent.asDelegate(this));
	}
});

Object.extend(MoTextureSource, {
	fromFile : function(path, cachePolicy) {
		return new MoTextureSource(path, true, cachePolicy);
	}
});



//=====================================================================
//= MoTextureAtlas.js
//=====================================================================

MoTextureAtlasTextureRule = Class.create({
	initialize : function() {
		this.platform = null;
		this.pixelRatio = NaN;
		this.width = NaN;
		this.height = NaN;
	}
});

MoTextureAtlasTexture = Class.create({
	initialize : function(url, sw, sh) {
		this.url = url;
		this.sourceWidth = MoValueOrDefault(sw, null);
		this.sourceHeight = MoValueOrDefault(sh, null);
		this.rules = [];
	},
	
	getSourceWidth : function() {
		return this.sourceWidth;
	},
	
	getSourceHeight : function() {
		return this.sourceHeight;
	},
	
	hasPixelRatio : function(currentRatio) {
		return this.searchRules("ratio", currentRatio);
	},
	
	hasPlatform : function(currentPlatform) {
		return this.searchRules("platform", currentPlatform);
	},
	
	getClosestWidth : function(width) {
		var rule = null;
		var len = this.rules.length;
		var result = null;
		var delta = 0;
		
		for(var i = 0; i < len; ++i)
		{
			rule = this.rules[i];
			
			if(isNaN(rule.width))
				continue;
			
			delta = Math.abs(width - rule.width);
			
			if(result == null || (delta < result))
				result = delta;
		}

		return result;
	},
	
	getClosestHeight : function(height) {
		var rule = null;
		var len = this.rules.length;
		var result = null;
		var delta = 0;
		
		for(var i = 0; i < len; ++i)
		{
			rule = this.rules[i];
			
			if(isNaN(rule.height))
				continue;
			
			delta = Math.abs(height - rule.height);
			
			if(result == null || (delta < result))
				result = delta;
		}

		return result;
	},
	
	searchRules : function(propName, value) {
		var rule = null;
		var len = this.rules.length;
		var hasValue = false;
		
		for(var i = 0; i < len; ++i)
		{
			rule = this.rules[i];
			
			switch(propName)
			{
				case "ratio":
					if(isNaN(rule.pixelRatio))
						continue;

					hasValue = (rule.pixelRatio == value);
					break;
				case "platform":
					if(MoStringIsNullOrEmpty(rule.platform))
						continue;

					hasValue = (rule.platform.toLowerCase() == value.toLowerCase());
					break;
			}
			
			if(hasValue)
				return true;
		}

		return false;
	},
	
	cloneWithPlatform : function(platform) {
		var tex = new MoTextureAtlasTexture(this.url, this.sourceWidth, this.sourceHeight);
		var len = this.rules.length;
		
		for(var i = 0; i < len; ++i)
		{
			if(this.rules[i].platform == platform)
				tex.rules.push(this.rules[i]);
		}
		
		return tex;
	},
	
	cloneWithPixelRatio : function(ratio) {
		var tex = new MoTextureAtlasTexture(this.url, this.sourceWidth, this.sourceHeight);
		var len = this.rules.length;
		
		for(var i = 0; i < len; ++i)
		{
			if(this.rules[i].pixelRatio == ratio)
				tex.rules.push(this.rules[i]);
		}
		
		return tex;
	}
});

MoTextureAtlasSprite = Class.create({
	initialize : function(name) {
		this.name = name;
		this.uv = MoRectangle.Zero();
		this.rect = MoRectangle.Zero();
	}
});

MoTextureAtlasSpriteInfo = Class.create({
	initialize : function(id, name) {
		this.id = id;
		this.name = name;
		this.sourceRect = MoRectangle.Zero();
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.rotation = 0;
		this.scaleX = 1;
		this.scaleY = 1;
		this.tx = 0;
		this.ty = 0;
		this.depth = 0;
	}
});

MoTextureAtlasAnimation = Class.create({
	initialize : function(name) {
		this.name = name;
		this.duration = 1;
		this.delay = 0;
		this.repeat = 1;
		this.repeatBehavior = MoRepeatBehavior.Loop;
		this.frames = [];
	},

	getFrameCount : function() {
		return this.frames.length;
	},
	
	getSprites : function(frameIndex) {
		if(frameIndex >= 0 && frameIndex < this.frames.length)
			return this.frames[frameIndex].sprites;

		throw new Error("Unable to find any sprites at '" + frameIndex + "'");
	}
});

MoTextureAtlasAnimationFrame = Class.create({
	initialize : function(spriteRef) {
		this.sprites = [];
	}
});

MoTextureAtlas = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();

		this.url = null;
		this.baseUrl = null;
		this.isReady = false;
		this.platformTexture = null;
		this.platformTextureSource = null;
		this.textures = [];
		this.sprites = [];
		this.animations = [];
		this.groups = [];
	},
	
	getUrl : function() {
		return this.url;
	},

	getBaseUrl : function() {
		return this.baseUrl;
	},
	
	setBaseUrl : function(value) {
		this.baseUrl = value;
	},
	
	getIsReady : function() {
		return this.isReady;
	},
	
	getTextureSource : function() {
		return this.platformTextureSource;
	},
	
	getSpriteRect : function(spriteName) {
		var sprite = this.lookupSprite(spriteName);
		var spriteRect = sprite.uv;
		var textureWidth = this.platformTextureSource.getWidth();
		var textureHeight = this.platformTextureSource.getHeight();

		return new MoRectangle(
			spriteRect.x * textureWidth, spriteRect.y * textureHeight, 
			spriteRect.width * textureWidth, spriteRect.height * textureHeight);
	},
	
	getSprite : function(instanceName, animationName) {
		return new MoSprite(instanceName, animationName, this);
	},

	getImage : function(instanceName, spriteName, enableTiling) {
		enableTiling = MoValueOrDefault(enableTiling, false);

		return MoImage.create(instanceName, this.platformTextureSource, this.getSpriteRect(spriteName), enableTiling);
	},
	
	getAnimation : function(animationName) {
		var len = this.animations.length;
		
		for(var i = 0; i < len; ++i)
		{
			if(this.animations[i].name.toLowerCase() == animationName.toLowerCase())
				return this.animations[i];
		}

		throw new Error("Unable to find sprite animation '" + animationName + "'");
	},
	
	getAnimationFrameCount : function(animationName) {
		var animation = this.getAnimation(animationName);

		return animation.frames.length;
	},
	
	load : function(url) {
		var request = MoCreateHttpRequestObject();
		var requestUrl = url;

		this.url = requestUrl;
		this.baseUrl = requestUrl.substring(0, requestUrl.lastIndexOf("/")+1);

		if(MoIsNull(request))
		{
			MoDebugWrite("Unable to create XMLHttpRequest object.", MoDebugLevel.Error);
			this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));

			return;
		}

		request.onreadystatechange = (function() {
			if(request.readyState == 4)
			{
				if(request.status == 200 || request.status == 304 || (request.status == 0 && requestUrl.substring(0, 4) == "file"))
					this.parse(request.responseXML);
				else
				{
					MoDebugWrite("Unable to load texture atlas from url: #{0}, reason=#{1}, responseCode=#{2}", MoDebugLevel.Error, requestUrl, request.statusText, request.status);
					this.dispatchEvent(new MoLoadEvent(MoLoadEvent.FAILURE));
				}
			}
		}).bind(this);

		request.open("GET", requestUrl, true);
		request.send(null);
	},

	parse : function(xml) {
		var doc = xml.documentElement;
		var node = null;
		var attr = null;
		var len = doc.childNodes.length;
		
		// parse textures
		this.parseNode(doc, "mo-textures", (function(n) { 
			this.parseNode(n, "mo-texture", this.parseTexture.bind(this)); 
		}).bind(this));
		
		// parse sprites
		this.parseNode(doc, "mo-sprites", (function(n) { 
			this.parseNode(n, "mo-sprite", this.parseSprite.bind(this)); 
		}).bind(this));
		
		// parse animations
		this.parseNode(doc, "mo-animations", (function(n) { 
			this.parseNode(n, "mo-animation", this.parseAnimation.bind(this)); 
		}).bind(this));
		
		this.platformTexture = this.lookupTexture();
		this.platformTextureSource = new MoTextureSource(MoUrl.combine(this.baseUrl, this.platformTexture.url), false);
		this.platformTextureSource.addEventHandler(MoSourceEvent.READY, this.textureSourceReadyHandler.asDelegate(this));
		this.platformTextureSource.load();
	},
	
	textureSourceReadyHandler : function(evt) {
		// update the animation sprites before notifying listeners
		// that we are ready, this way the data is prepared ahead of
		// time and won't need to be processed per animation frame
		var textureWidth = this.platformTextureSource.getWidth();
		var textureHeight = this.platformTextureSource.getHeight();
		
		for(var i = 0, len1 = this.animations.length; i < len1; ++i)
		{
			for(var j = 0, len2 = this.animations[i].frames.length; j < len2; ++j)
			{
				for(var k = 0, len3 = this.animations[i].frames[j].sprites.length; k < len3; ++k)
				{
					var sprite = this.animations[i].frames[j].sprites[k];
					var spriteSource = this.lookupSprite(sprite.name);
					var spriteRect = spriteSource.uv;
					
					// create the source region within the texture
					sprite.sourceRect.x = spriteRect.x * textureWidth;
					sprite.sourceRect.y = spriteRect.y * textureHeight;
					sprite.sourceRect.width = spriteRect.width * textureWidth;
					sprite.sourceRect.height = spriteRect.height * textureHeight;
					
					// calculate the actual size of the sprite
					sprite.width = (spriteSource.rect.width == 0 ? spriteRect.width : spriteSource.rect.width) * textureWidth;
					sprite.height = (spriteSource.rect.height == 0 ? spriteRect.height : spriteSource.rect.height) * textureHeight;
				}
			}
		}

		this.isReady = true;
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
	},
	
	lookupSprite : function(spriteName) {
		var len = this.sprites.length;
		var sprite = null;
		
		for(var i = 0; i < len; ++i)
		{
			sprite = this.sprites[i];
			
			if(sprite.name.toLowerCase() == spriteName.toLowerCase())
				return sprite;
		}

		throw new Error("Unable to find sprite '" + spriteName + "'");
	},
	
	lookupTexture : function() {
	
		// no textures available
		if(this.textures.length == 0)
			throw new Error("Unable to use texture atlas, no textures found.");
			
		// only one texture available, so just use it
		if(this.textures.length == 1)
			return this.textures[0];
	
		// otherwise let's try and find the right texture, textures
		// with platform specific rules trump everything else
		var possibles = this.getTexturesForPlatform(this.textures, MoGetPlatformType());
		
		// only one texture with platform found
		if(possibles.length == 1)
			return possibles[0];
					
		possibles = this.getTexturesForPixelRatio(possibles, MoScreen.getCurrent().getPixelScale());
		
		// only one texture with pixel ratio found
		if(possibles.length == 1)
			return possibles[0];
			
		possibles = this.getTexturesForSize(possibles);
		
		// regardless if a good size was found, we will always
		// have at least one value
		return possibles[0];
	},
	
	getTexturesForSize : function(list) {
		var screenWidth = MoScreen.getCurrent().getBounds().width;
		var screenHeight = MoScreen.getCurrent().getBounds().height;
		var len = list.length;
		var tex = null;
		var result = null;
		var delta = null;

		for(var i = 0; i < len; ++i)
		{
			tex = list[i];
			
			var widthDelta = tex.getClosestWidth(screenWidth);
			var heightDelta = tex.getClosestHeight(screenHeight);

			if(widthDelta == null && heightDelta == null)
				continue;
			
			var sizeDelta = (widthDelta == null ? heightDelta : widthDelta);
			
			if(delta == null || sizeDelta < delta)
			{
				result = tex;
				delta = sizeDelta;
			}
		}
		
		// no results found, fallback to original list
		if(result == null)
			return list;

		return [result];
	},
	
	getTexturesForPlatform : function(list, platform) {
		var results = [];
		var len = list.length;
		var tex = null;
		
		for(var i = 0; i < len; ++i)
		{
			tex = list[i];
			
			if(tex.hasPlatform(platform))
				results.push(tex.cloneWithPlatform(platform));
		}
		
		if(results.length == 0)
			return list;
		
		return results;
	},
	
	getTexturesForPixelRatio : function(list, pixelRatio) {
		var results = [];
		var len = list.length;
		var tex = null;
		
		for(var i = 0; i < len; ++i)
		{
			tex = list[i];
			
			if(tex.hasPixelRatio(pixelRatio))
				results.push(tex.cloneWithPixelRatio(pixelRatio));
		}

		if(results.length == 0)
			return list;
		
		return results;
	},
	
	parseNode : function(node, name, parseFunc, context) {
		var nodes = node.getElementsByTagName(name);
		
		if(MoIsNull(nodes))
			return null;
		
		for(var i = 0; i < nodes.length; i++)
			parseFunc(nodes[i], context);
	},
	
	parseTexture : function(textureNode) {
		var tex = new MoTextureAtlasTexture(
			this.getAttributeValue(textureNode, "url"),
			this.getAttributeValue(textureNode, "w", null),
			this.getAttributeValue(textureNode, "h", null));
		
		this.parseNode(textureNode, "mo-texture-rule", this.parseTextureRule.bind(this), tex);
		
		this.textures.push(tex);
	},
	
	parseTextureRule : function(ruleNode, tex) {
		var rule = new MoTextureAtlasTextureRule();
		rule.platform = this.getAttributeValue(ruleNode, "os-platform");
		rule.pixelRatio = parseInt(this.getAttributeValue(ruleNode, "pixel-ratio"), NaN);
		rule.width = parseInt(this.getAttributeValue(ruleNode, "screen-width"), NaN);
		rule.height = parseInt(this.getAttributeValue(ruleNode, "screen-height"), NaN);

		tex.rules.push(rule);
	},
	
	parseSprite : function(spriteNode) {
		var sprite = new MoTextureAtlasSprite(this.getAttributeValue(spriteNode, "name"));		
		sprite.uv = this.parseRect(this.getAttributeValue(spriteNode, "uv"));
		sprite.rect = this.parseRect(this.getAttributeValue(spriteNode, "rect", null));
		
		this.sprites.push(sprite);
	},
	
	parseAnimation : function(animationNode) {
		var animation = new MoTextureAtlasAnimation(this.getAttributeValue(animationNode, "name"));		
		animation.duration = parseFloat(this.getAttributeValue(animationNode, "duration"));
		animation.delay = parseFloat(this.getAttributeValue(animationNode, "delay", 0));
		animation.repeat = parseFloat(this.getAttributeValue(animationNode, "repeat", 1));
		animation.repeatBehavior = this.parseRepeatBehavior(this.getAttributeValue(animationNode, "repeat-type"));

		this.parseNode(animationNode, "mo-frame", this.parseAnimationFrame.bind(this), animation);

		this.animations.push(animation);
	},
	
	parseAnimationFrame : function(frameNode, animation) {
		var frame = new MoTextureAtlasAnimationFrame();
		
		this.parseNode(frameNode, "mo-sprite", this.parseAnimationSprite.bind(this), frame);
		
		animation.frames.push(frame);
	},
	
	parseAnimationSprite : function(spriteNode, animationFrame) {
		var spriteId = this.getAttributeValue(spriteNode, "id");
		var spriteName = this.getAttributeValue(spriteNode, "name");
		var sprite = new MoTextureAtlasSpriteInfo(spriteId, spriteName);

		sprite.x = parseFloat(this.getAttributeValue(spriteNode, "x", 0));
		sprite.y = parseFloat(this.getAttributeValue(spriteNode, "y", 0));
		sprite.rotation = parseFloat(this.getAttributeValue(spriteNode, "rotation", 0));
		sprite.scaleX = parseFloat(this.getAttributeValue(spriteNode, "sx", 0));
		sprite.scaleY = parseFloat(this.getAttributeValue(spriteNode, "sy", 0));
		sprite.tx = parseFloat(this.getAttributeValue(spriteNode, "tx", 0));
		sprite.ty = parseFloat(this.getAttributeValue(spriteNode, "ty", 0));
		sprite.depth = parseFloat(this.getAttributeValue(spriteNode, "depth", 0));
		
		animationFrame.sprites.push(sprite);
	},

	parseRect : function(value) {
		if(MoIsNull(value))
			return MoRectangle.Zero();
		
		return MoRectangle.parse(value);
	},
	
	parseRepeatBehavior : function(value) {
		if(value == "reverse")
			return MoRepeatBehavior.Reverse;
		
		return MoRepeatBehavior.Loop;
	},
	
	getAttributeValue : function(node, attrName, defaultValue) {
		defaultValue = MoValueOrDefault(defaultValue, null);

		if(node.attributes.length > 0)
		{
			var attr = node.attributes.getNamedItem(attrName)
			
			if(!MoIsNull(attr))
				return attr.value;
		}
		
		return defaultValue;
	}
});


//=====================================================================
//= MoVideoSource.js
//=====================================================================

MoVideoSource = Class.create(MoImageSource, {
	initialize : function($super, videoElement) {
		$super();
		
		this.videoElement = null;
		
		this.reset();
		this.setVideoElement(videoElement);
	},

	getVideoElement : function() {
		return this.videoElement;
	},

	setVideoElement : function(value) {
		if(this.videoElement != value)
		{
			this.reset();
			this.videoElement = value;
			this.load();
		}
	},
	
	reset : function() {
		this.data = null;
		this.size = MoSize.Zero();
		this.isSourceReady = false;
		this.videoElement = null;
	},

	load : function() {	
		if(this.isSourceReady)
		{
			this.raiseSourceReadyEvent();
			return;
		}

		var duration = this.videoElement.duration;

		if(isNaN(duration) || duration == 0)
			this.videoElement.addEventListener("durationchange", this.handleDurationChangeEvent.bind(this), false);
		else
			this.update();
	},

	update : function() {
		this.data = this.videoElement;
		this.size.width = this.videoElement.videoWidth;
		this.size.height = this.videoElement.videoHeight;
		this.isSourceReady = true;

		this.raiseSourceReadyEvent();
	},

	handleDurationChangeEvent : function(e) {
		this.update();
	}
});



//=====================================================================
//= MoGraphicsOp.js
//=====================================================================

MoGraphicsOp = {
//  @PRIVATE
	"MoveTo"		: 1,
	"LineTo"		: 2,
	"CurveTo"		: 3,
	"CubicCurveTo"	: 4,
	"Image"			: 5,
	"TiledImage"	: 6,
	"Fill"			: 7,
	"Stroke"		: 8,
	"BeginPath"		: 9,
	"ClosePath"		: 10,
	"RoundRect"		: 11,
	"Text"			: 12
};


//=====================================================================
//= MoGraphicsProcessor.js
//=====================================================================

MoGraphicsItem = Class.create(
// @PRIVATE 
{
	initialize : function() {
		this.bounds = new MoRectangle();
	},

	computeBounds : function() {
		/** override **/
	}
});

MoGraphicsPathItem = Class.create(MoGraphicsItem, 
// @PRIVATE 
{
	initialize : function($super) {
		$super();

		this.fillOp = null;
		this.strokeOp = null;
		this.strokedBounds = null;
		this.lastMoveSegment = null;
		this.lastSegment = null;
		this.paintOps = [];
		this.ops = [];
		this.segments = null;
	},
	
	beginSegments : function() {
		this.lastMoveSegment = null;
		this.lastSegment = null;
		this.segments = [];
	},

	computeBounds : function() {
		if(this.ops.length == 0)
			return;
		
		//**************************************************************************
		//* NOTE: instead of computing the initial bounds here this process has
		//*      been merged to occur during the main process method, this allows
		//*      use to remove an extra loop
		//**************************************************************************
		
		// now that we have the initial bounds, we can compute the final stroked bounds
		// this only needs to happen if we actually have a stroke, otherwise we're done
		if(this.strokeOp != null)
		{
			var params = this.strokeOp.getSecond();

			var thickness = params[0][0];
			var metrics = new MoRectangle(-thickness * 0.5, -thickness * 0.5, thickness, thickness);
			var miterLimit = Math.max(params[0][1], 1);
			var joinType = params[0][2];
			
			// copy the non-stroked bounds
			this.strokedBounds = new MoRectangle();
			this.strokedBounds.copyFrom(this.bounds);
			
			// we will always need to adjust the bounds by the stroke thickness, centered on the outline
			this.strokedBounds.inflate(metrics.right(), metrics.bottom());
			
			// TODO : need to figure in SQUARE and ROUND line caps, square is close but round pushes
			//        beyond the bounds in some cases so we need to apply an extra half a stroke (?)
			//        to non-connecting segments.
			
			if(joinType != "miter")
				return;

			// if we have a miter join, then we will need to adjust for that as well, this is
			// not perfect, but it should be good enough to always extend the bounds of the 
			// path
			this.computeMiterJoins(metrics, miterLimit);
		}
	},
	
	computeMiterJoins : function(strokeMetrics, miterLimit) {
		var count = this.segments.length;
		var jointStartIndex = 0;
		var jointStartSeg = null;
		var jointEndIndex = -1;
		var jointEndSeg = null;
		var openIndex = 0;
		var moveX = 0;
		var moveY = 0;

		while(true)
		{
			// locate the first operation with a valid tangent or a move operation
			while(jointStartIndex < count && !(this.segments[jointStartIndex] instanceof MoPathMoveSegment))
			{
				var prevSeg = jointStartIndex > 0 ? this.segments[jointStartIndex-1] : null;

				if(this.segments[jointStartIndex].hasValidTangent(prevSeg))
					break;

				jointStartIndex++;
			}

			// no valid operations found
			if(jointStartIndex >= count)
				break;
				

			// get the operation that we will begin at
			jointStartSeg = this.segments[jointStartIndex];

			// we found an 'open' operation, save the position and try to use the
			// next operation as the starting point
			if(jointStartSeg instanceof MoPathMoveSegment)
			{
				openIndex = jointStartIndex + 1;
				moveX = jointStartSeg.x;
				moveY = jointStartSeg.y;

				jointStartIndex++;
				continue;
			}

			// the current and previous operation are 'closed' and form a joint 
			if((jointStartIndex == count-1 || (this.segments[jointStartIndex+1] instanceof MoPathMoveSegment) && jointStartSeg.x == moveX && jointStartSeg.y == moveY))
				jointEndIndex = openIndex;

			// move to the next operation
			else
				jointEndIndex = jointStartIndex+1;
			
			// now locate the ending operation with a valid tangent or a move operation
			while(jointEndIndex < count && !(this.segments[jointEndIndex] instanceof MoPathMoveSegment))
			{
				if(this.segments[jointEndIndex].hasValidTangent(jointStartSeg))
					break;
				
				jointEndIndex++;
			}
			
			// no valid operations found
			if(jointEndIndex >= count)
				break;
			
			
			// get the operation that we will finish at
			jointEndSeg = this.segments[jointEndIndex];
			
			// if the end operation is not a move, then we have a valid a joint, adjust
			// our bounds to include the miter
			if(!(jointEndSeg instanceof MoPathMoveSegment))
			{
				this.adjustBoundsForMiter(
					jointStartIndex > 0 ? this.segments[jointStartIndex-1] : null,
					jointStartSeg,
					jointEndSeg,
					miterLimit,
					strokeMetrics.width * 0.5);
			}

			// move to the next operation, it's possible the end operation comes before
			// the starting operation because of closed paths
			jointStartIndex = jointStartIndex >= jointEndIndex ? jointStartIndex + 1 : jointEndIndex;
		}
	},

	ensureSubPath : function(segment) {
		// if there isn't a previous move segment then we must assume
		// the current segment as an implicit move
		//
		// for example:
		//      beginPath();
		//                    <-- no explicit move
		//      lineTo(0,0);  <-- assume implicit move
		//      lineTo(100, 0);
		//
		if(this.lastMoveSegment == null)
			this.lastMoveSegment = segment;
	},

	closePath : function() {
		
		// if the last move segment is not the same as the last path segment
		// then we need make a straight line from the last segment to the
		// last move segment
		if(this.lastMoveSegment != null && this.lastSegment != null)
		{
			if(this.lastSegment.x != this.lastMoveSegment.x || this.lastSegment.y != this.lastMoveSegment.y)
				this.segments.push(new MoPathLineSegment(this.lastMoveSegment.x, this.lastMoveSegment.y));
		}

		this.lastMoveSegment = null;
	},
	
	moveTo : function(segment) {
		this.segments.push(segment);
		
		// we're starting a new sub-path
		this.lastSegment = this.lastMoveSegment = segment;
	},
	
	pathTo : function(segment) {
		// adjust the current bounds to include this segment
		this.adjustBoundsForSegment(segment);
		
		// see ensureSubPath for details
		this.ensureSubPath(segment);
		
		// add this segment, these will be used for rendering and computing
		// the stroked bounds
		this.segments.push(segment);

		// we need to keep a reference to the last segment so we can close out
		// the path (if required) and more importantly to adjust the bounds,
		// since we need two segments for accuracy
		this.lastSegment = segment;
	},

	text : function(text, x, y, font) {
		var size = font.measureString(text);

		// the text is quite simple, we don't render individual text glyphs (yet)
		// so we can only add the measured approximate rendered bounds, but it
		// seems to be good enough
		this.bounds.union(x, y, x + size.width, y + size.height);
	},
	
	adjustBoundsForSegment : function(segment) {
		// merge the segments bounds into our bounds
		if(segment != null)
			segment.mergeBounds(this.lastSegment, this.bounds);
	},
	
	adjustBoundsForMiter : function(op0, op1, op2, miterLimit, weight) {
		// joint tip
		var jointX = op1.x;
		var jointY = op1.y;
		
		// end tangent for first operation
		var t0 = new MoVector2D();
		var ts1 = op1.getTangent(op0, false);

		t0.x = ts1[0];
		t0.y = ts1[1];
		
		// start tangent for second operation
		var t1 = new MoVector2D();
		var ts2 = op2.getTangent(op1, true);

		t1.x = ts2[0];
		t1.y = ts2[1];

		
		// we must have at least one valid tangent
		if(t0.length() == 0 || t1.length() == 0)
			return;
		
		// convert the tangents to unit vectors
		t1.normalize(1);
		t0.normalize(1);
		t0.x = -t0.x;
		t0.y = -t0.y;
		
		// find the vector from t0 to the mid-point of [t0,t1]
		var midPoint = new MoVector2D(
			(t1.x - t0.x) * 0.5,
			(t1.y - t0.y) * 0.5);

		// sin(A/2) == midPoint.length() / t1.length()
		var alpha = midPoint.length();
		
		// ensure that we skip any degenerate joints that are close to 0 degrees
		if(Math.abs(alpha) < 1.0E-9)
			return;
		
		// find the vector of the bisect
		var bisect = new MoVector2D(
			(t0.x + t1.x) * -0.5, 
			(t0.y + t1.y) * -0.5);

		// joint is at 180 degrees, nothing to do
		if(bisect.length() == 0)
			return;
		
		// compute based on the set miter limit
		if(alpha == 0 || miterLimit < (1 / alpha))
		{	
			// normalize the mid point first, we need the bisect vector
			midPoint.normalize((weight - miterLimit * weight * alpha) / bisect.length());

			// convert bisect to a unit vector
			bisect.normalize(1);
			
			var px = jointX + miterLimit * weight * bisect.x + midPoint.x;
			var py = jointY + miterLimit * weight * bisect.y + midPoint.y;
			
			this.strokedBounds.union(px, py, px, py);
			
			px = jointX + miterLimit * weight * bisect.x - midPoint.x;
			py = jointY + miterLimit * weight * bisect.y - midPoint.y;
			
			this.strokedBounds.union(px, py, px, py);
		}
		else
		{
			// the miter limit was not reached so add the tip of the stroke
			bisect.normalize(1);
			
			var tipX = jointX + bisect.x * weight / alpha;
			var tipY = jointY + bisect.y * weight / alpha;
			
			// adjust the current path rect
			this.strokedBounds.union(tipX, tipY, tipX, tipY);
		}	
	}
});

MoGraphicsImageItem = Class.create(MoGraphicsItem, 
// @PRIVATE 
{
	initialize : function($super, op) {
		$super();
		
		this.imageOp = op;
	},

	computeBounds : function() {
		var params = this.imageOp.getSecond();
		var x = params[5];		// dstX
		var y = params[6];		// dstY
		var width = params[7];	// dstWidth
		var height = params[8];	// dstHeight
		var mx = params[9];		// matrix
		
		this.bounds.x = x;
		this.bounds.y = y;
		this.bounds.width = width;
		this.bounds.height = height;
		
		if(mx != null)
			this.bounds = mx.transformRect(this.bounds);
	}
});


MoGraphicsProcessor = Class.create(
// @PRIVATE 
{
	initialize : function() {
		this.items = [];
		this.currentPath = null;
		this.bounds = new MoRectangle();
		this.strokedBounds = null;
	},

	process : function(ops) {
		this.items = [];
		this.currentPath = null;
		this.bounds = new MoRectangle();
		this.strokedBounds = null;
	
		if(ops == null || ops.length == 0)
			return;

		var len = ops.length;
		var op = null;
		var opType = null;
		var params = null;
		var item = null;

		//***********************************************************************************************
		// process each operation first and group them into items, which can be a path or image item, this
		// give us unique paths to work with, each item should have it's own bounds, that is used for computing
		// the entire bounding rect and more importantly for accurately creating the stroke/fill patterns. we
		// also do this so that we can easily compute the stroked bounds, dashes, etc...
		//***********************************************************************************************
		for(var i = 0; i < len; ++i)
		{
			op = ops[i];
			opType = op.getFirst();

			switch(opType)
			{
				case MoGraphicsOp.BeginPath:
					this.processBeginPath(op);
					break;
				case MoGraphicsOp.ClosePath:
				case MoGraphicsOp.MoveTo:
				case MoGraphicsOp.LineTo:
				case MoGraphicsOp.CurveTo:
				case MoGraphicsOp.CubicCurveTo:
					this.processPathOp(op, opType);
					break;
				case MoGraphicsOp.Image:
				case MoGraphicsOp.TiledImage:
					this.processImage(op);
					break;
				case MoGraphicsOp.Text:
					this.processPathOp(op, opType);
					break;
				case MoGraphicsOp.Fill:
					this.processFillOp(op);
					break;
				case MoGraphicsOp.Stroke:
					this.processStrokeOp(op);
					break;
			}
		}
		
		// finish any pending path
		this.finishPathItem();

		// no items were generated, this is possible if we only received path operations with no fill
		// or stroke, there MUST be a fill, stroke or image to be considered a complete item
		if(this.items.length == 0)
			return;

		//***********************************************************************************************
		// now that we have all the items nicely organized we can go through each one and compute the
		// bounds, the initial non-stroked bounds is computed first, once that is finished we can then
		// compute the stroked bounds, the stroked bounds is what we will use for everything, strokes,
		// fills, hit testing, dirty regions, clips, etc...
		//***********************************************************************************************		
		len = this.items.length;

		for(var i = 0; i < len; ++i)
		{
			item = this.items[i];
			
			// compute the item's bounds, if there is a stroke this
			// will also compute the stroked bounds
			item.computeBounds();

			// union the item's bounds with our total bounds
			this.bounds.unionWithRect(item.bounds);

			// might not have a stroke
			if(item.strokedBounds != null)
			{
				// union the item's stroked bounds with our total stroked bounds
				if(this.strokedBounds == null)
					this.strokedBounds = new MoRectangle();

				this.strokedBounds.unionWithRect(item.strokedBounds);
			}
		}
	},

	ensurePathItem : function() {
		if(this.currentPath == null)
		{
			this.currentPath = new MoGraphicsPathItem();
			this.currentPath.beginSegments();
		}
	},

	finishPathItem : function() {
		// add the current path
		if(this.currentPath != null)
		{
			// the current path is only valid if it has a stroke or a fill, otherwise
			// there is nothing to do
			if(this.currentPath.strokeOp != null || this.currentPath.fillOp != null)
				this.items.push(this.currentPath);

			this.currentPath = null;
		}
	},

	processBeginPath : function(op) {
		this.finishPathItem();	
		
		this.processPathOp(op);
	},

	processPathOp : function(op, opType) {
		this.ensurePathItem();
		this.currentPath.ops.push(op);
		
		var params = op.getSecond();
		
		switch(opType)
		{
			case MoGraphicsOp.ClosePath:
				this.currentPath.closePath();
				break;
			case MoGraphicsOp.MoveTo:
				this.currentPath.moveTo(params[0]);
				break;
			case MoGraphicsOp.LineTo:
			case MoGraphicsOp.CurveTo:
			case MoGraphicsOp.CubicCurveTo:
				this.currentPath.pathTo(params[0]);
				break;
			case MoGraphicsOp.Text:
				
				this.currentPath.text(params[0], params[1], params[2], params[3]);
				break;
		}
	},

	processFillOp : function(op) {
		if(this.currentPath == null)
			return;

		this.currentPath.fillOp = op;
		this.currentPath.paintOps.push(op);
	},

	processStrokeOp : function(op) {
		if(this.currentPath == null)
			return;

		this.currentPath.strokeOp = op;
		this.currentPath.paintOps.push(op);
	},

	processImage : function(op) {
		this.items.push(new MoGraphicsImageItem(op));
	}
});


//=====================================================================
//= MoGraphics.js
//=====================================================================

MoGraphicsBrushType = {
	"Unknown"		: 0,
	"Solid"			: 1,
	"Linear"		: 2,
	"Radial"		: 3,
	"Image"			: 4,
	"Video"			: 5
};

MoGraphics = Class.create({
	initialize : function(drawable) {
		this.drawable = drawable;
		this.offscreenSurface = null;
		this.offscreenStyleSurface = null;
		this.ops = new Array();
		this.lastOps = null;
		this.lastBounds = new MoRectangle(0, 0, 0, 0);
		this.currentTextOp = null;
		this.currentPathItem = null;
		this.hasChangedSinceLastRender = true;
		this.cachedPatterns = new MoDictionary();
		this.processor = new MoGraphicsProcessor();
		this.needsProcessing = false;
		this.tmpRect = new MoRectangle(0,0,0,0);
		this.tmpVect = new MoVector2D(0,0);
		this.tmpSize = new MoSize(0,0);
		this.tmpScaleTransform = new MoScaleTransform(0,0);
		this.tmpTranslateTransform = new MoTranslateTransform(0,0);
		this.tmpMatrix = new MoMatrix2D();
	},

	getHasChangedSinceLastRender : function() {
		return this.hasChangedSinceLastRender;
	},
	
	pushOp : function(type /** ... **/) {
		var op = new MoPair(type, new Array());
		
		for(var i = 1; i < arguments.length; i++)
			op.getSecond().push(arguments[i]);

		this.ops.push(op);
	},
	
	beginPath : function() {
		this.pushOp(MoGraphicsOp.BeginPath);
	},
	
	closePath : function() {
		this.pushOp(MoGraphicsOp.ClosePath);
	},
	
	fill : function(brush, compositeOp) {
		compositeOp = MoValueOrDefault(compositeOp, MoCompositeOperator.SourceOver);

		this.drawable.registerGraphicsObject(brush);
		this.pushOp(MoGraphicsOp.Fill, this.createParamsFromBrush(brush), compositeOp);
	},

	stroke : function(pen, compositeOp) {
		compositeOp = MoValueOrDefault(compositeOp, MoCompositeOperator.SourceOver);

		this.drawable.registerGraphicsObject(pen);
		this.pushOp(MoGraphicsOp.Stroke, this.createParamsFromPen(pen), compositeOp);
	},

	clear : function() {
		this.lastOps = this.ops;
		this.ops = new Array();
		this.needsProcessing = true;
		this.hasChangedSinceLastRender = true;
		this.drawable.clearGraphicsObjects();
		this.drawable.invalidate();
	},

	moveTo : function(x, y) {
		this.pushOp(MoGraphicsOp.MoveTo, new MoPathMoveSegment(x, y));
	},
	
	lineTo : function(x, y) {
		this.pushOp(MoGraphicsOp.LineTo, new MoPathLineSegment(x, y));
	},
	
	curveTo : function(cx, cy, x, y) {		
		this.pushOp(MoGraphicsOp.CurveTo, new MoPathQuadraticBezierSegment(x, y, cx, cy));
	},
	
	cubicCurveTo : function(cx1, cy1, cx2, cy2, x, y) {
		this.pushOp(MoGraphicsOp.CubicCurveTo, new MoPathCubicBezierSegment(x, y, cx1, cy1, cx2, cy2));
	},
	
	arcTo : function(x, y, width, height, startAngle, sweepAngle, direction) {
		direction = MoValueOrDefault(direction, MoSweepDirection.Clockwise);
		
		this.makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, true);
	},

	drawOpenArc : function(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {
		direction = MoValueOrDefault(direction, MoSweepDirection.Clockwise);
		fromCenter = MoValueOrDefault(fromCenter, true);
		
		if(!fromCenter)
		{
			x += width * 0.5;
			y += height * 0.5;
		}
		
		this.beginPath();
		this.makeArcPath(x, y, width, height, startAngle, sweepAngle, direction, false);
	},

	drawArc : function(x, y, width, height, startAngle, sweepAngle, direction, fromCenter) {
		this.drawOpenArc(x, y, width, height, startAngle, sweepAngle, direction, fromCenter);
		this.closePath();
	},
	
	drawEllipse : function(x, y, width, height, isCenter) {
		isCenter = MoValueOrDefault(isCenter, true);
	
		var radiusX = width * 0.5;
		var radiusY = height * 0.5;
		var centerX = x;
		var centerY = y;
		var kappa = MoGraphics.Kappa;

		if(!isCenter)
		{
			centerX += radiusX;
			centerY += radiusY;
		}

		this.beginPath();
		this.moveTo(centerX + radiusX, centerY);
		this.cubicCurveTo(centerX + radiusX, centerY - kappa * radiusY, centerX + kappa * radiusX, centerY - radiusY, centerX, centerY - radiusY);
		this.cubicCurveTo(centerX - kappa * radiusX, centerY - radiusY, centerX - radiusX, centerY - kappa * radiusY, centerX - radiusX, centerY);
		this.cubicCurveTo(centerX - radiusX, centerY + kappa * radiusY, centerX - kappa * radiusX, centerY + radiusY, centerX, centerY + radiusY);
		this.cubicCurveTo(centerX + kappa * radiusX, centerY + radiusY, centerX + radiusX, centerY + kappa * radiusY, centerX + radiusX, centerY);
		this.closePath();
	},

	drawCircle : function(x, y, radius, isCenter) {
		this.drawEllipse(x, y, radius * 2, radius * 2, isCenter);
	},

	drawImage : function(imageSource, x, y, width, height, repeat, matrix) {	
		this.drawImageComplex(imageSource, 0, 0, imageSource.getWidth(), imageSource.getHeight(), x, y, width, height, repeat, matrix);
	},

	drawImageComplex : function(imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat, matrix) {
		dstX = MoValueOrDefault(dstX, 0);
		dstY = MoValueOrDefault(dstY, 0);
		dstWidth = MoValueOrDefault(dstWidth, srcWidth);
		dstHeight = MoValueOrDefault(dstHeight, srcHeight);
		repeat = MoValueOrDefault(repeat, false);
		
		// identity matrices still have an overhead of transformations
		// and state changes, so skip omit these
		if(matrix != null && matrix.isIdentity())
			matrix = null;

		// make sure we don't use the object reference, otherwise
		// a user will need to pass in a new matrix everytime.
		if(matrix != null)
			matrix = matrix.copy();

		if(repeat)
			this.pushOp(MoGraphicsOp.TiledImage, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, matrix);
		else
			this.pushOp(MoGraphicsOp.Image, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, matrix);
	},

	drawLine : function(x1, y1, x2, y2) {
		this.beginPath();
		this.moveTo(x1, y1);
		this.lineTo(x2, y2);
	},
	
	drawRect : function(x, y, width, height) {	
		this.beginPath();
		this.moveTo(x, y);
		this.lineTo(x + width, y);
		this.lineTo(x + width, y + height);
		this.lineTo(x, y + height);
		this.closePath();
	},

	drawRoundRect : function(x, y, width, height, radius) {
		radius = MoValueOrDefault(radius, 0);
		
		// not a rounded rectangle, just draw as a normal rectangle
		if(radius <= 0)
		{
			this.drawRect(x, y, width, height);
			return;
		}
		
		this.makeRoundRectPath(x, y, width, height, radius);
	},
	
	drawRoundRectComplex : function(x, y, width, height, cornerRadii) {
		// not a rounded rectangle, just draw as a normal rectangle
		if(cornerRadii.isSquare())
		{
			this.drawRect(x, y, width, height);
			return;
		}

		this.makeRoundRectPathComplex(x, y, width, height, cornerRadii);
	},
	
	drawPoly : function(points, dontClosePath) {
		dontClosePath = MoValueOrDefault(dontClosePath, false);

		var len = points.length;
		var pt = null;
		var isFirst = true;
		
		this.beginPath();
		
		for(var i = 0; i < len; ++i)
		{
			pt = points[i];
			
			if(isFirst)
			{
				this.moveTo(pt.x, pt.y);
				
				isFirst = false;
				continue;
			}
			
			this.lineTo(pt.x, pt.y);
		}

		if(!dontClosePath)
			this.closePath();
	},

	drawPath : function(path) {
		if(path == null || path.length == 0)
			return;

		var segment = null;
		var segments = path.segments;
		var len = segments.length;

		this.beginPath();

		for(var i = 0; i < len; ++i)
		{
			segment = segments[i];
			
			if(i == 0 && !(segment instanceof MoPathMoveSegment))
				this.moveTo(0, 0);
			
			if(segment instanceof MoPathMoveSegment)
				this.moveTo(segment.x, segment.y);
			else if(segment instanceof MoPathLineSegment)
				this.lineTo(segment.x, segment.y);
			else if(segment instanceof MoPathQuadraticBezierSegment)
				this.curveTo(segment.cx, segment.cy, segment.x, segment.y);
			else if(segment instanceof MoPathCubicBezierSegment)
				this.cubicCurveTo(segment.cx1, segment.cy1, segment.cx2, segment.cy2, segment.x, segment.y);
		}
	},
	
	drawText : function(text, x, y, font) {
		this.pushOp(MoGraphicsOp.Text, text, x, y, font);
	},
	
	makeArcPath : function(x, y, width, height, startAngle, sweepAngle, direction, connectWithPrevOp) {
		var theta = 0;
		var angle = 0;
		var angleH = 0;
		var segmentCount = 0;
		var tx = 0;
		var ty = 0;
		var cx = 0;
		var cy = 0;
		var rx = width*0.5;
		var ry = height*0.5;
		
		startAngle = MoMath.degreesToRadians(startAngle);
		sweepAngle = MoMath.degreesToRadians(sweepAngle);

		if (Math.abs(sweepAngle) > 2 * Math.PI)
			sweepAngle = 2 * Math.PI;

		sweepAngle *= direction;
		segmentCount = Math.ceil(Math.abs(sweepAngle) / (Math.PI * 0.25));
		theta = -(sweepAngle / segmentCount);
		angle = -startAngle;

		if (segmentCount > 0)
		{
			tx = x + Math.cos( startAngle) * rx;
			ty = y + Math.sin(-startAngle) * ry;

			if(connectWithPrevOp)
				this.lineTo(tx, ty);
			else
				this.moveTo(tx, ty);

			for (var i = 0; i < segmentCount; ++i)
			{
				angle += theta;
				angleH = angle - theta * 0.5;
				
				cx = x + Math.cos(angleH) * (rx / Math.cos(theta * 0.5));
				cy = y + Math.sin(angleH) * (ry / Math.cos(theta * 0.5));

				tx = x + Math.cos(angle) * rx;
				ty = y + Math.sin(angle) * ry;
				
				this.curveTo(cx, cy, tx, ty);
			}
		}
	},
	
	makeRoundRectPath : function(x, y, width, height, radius) {
		var arcSize = radius * 2;

		this.beginPath();
		this.arcTo(x + width - radius, y + radius, arcSize, arcSize, 90, 90);
		this.arcTo(x + width - radius, y + height - radius, arcSize, arcSize, 0, 90);
		this.arcTo(x + radius, y + height - radius, arcSize, arcSize, 270, 90);
		this.arcTo(x + radius, y + radius, arcSize, arcSize, 180, 90);
		this.closePath();
	},
	
	makeRoundRectPathComplex : function(x, y, width, height, cornerRadius) {
		var xw = x + width;
		var yh = y + height;
		var minSize = (width < height ? width * 2 : height * 2);
		var tl = cornerRadius.getTopLeft(); 
		var tr = cornerRadius.getTopRight();
		var bl = cornerRadius.getBottomLeft();
		var br = cornerRadius.getBottomRight();
		var a, s;
		var ac = 0.292893218813453;
		var sc = 0.585786437626905;
		
		tl = (tl < minSize ? tl : minSize);
		tr = (tr < minSize ? tr : minSize);
		bl = (bl < minSize ? bl : minSize);
		br = (br < minSize ? br : minSize);
		
		this.beginPath();
		
		// bottom right
		a = br * ac;
		s = br * sc;
		
		this.moveTo(xw, yh - br);
		this.curveTo(xw, yh - s, xw - a, yh - a);
		this.curveTo(xw - s, yh, xw - br, yh);
		
		// bottom left
		a = bl * ac;
		s = bl * sc;
		this.lineTo(x + bl, yh);
		this.curveTo(x + s, yh, x + a, yh - a);
		this.curveTo(x, yh - s, x, yh - bl);
		
		// top left
		a = tl * ac;
		s = tl * sc;
		this.lineTo(x, y + tl);
		this.curveTo(x, y + s, x + a, y + a);
		this.curveTo(x + s, y, x + tl, y);
		
		// top right
		a = tr * ac;
		s = tr * sc;
		this.lineTo(xw - tr, y);
		this.curveTo(xw - s, y, xw - a, y + a);
		this.curveTo(xw, y + s, xw, y + tr);
		this.lineTo(xw, yh - br);
		
		this.closePath();
	},

	render : function(ctx) {
				
		this.processIfNeeded();
		
		// reset dirty flag
		this.hasChangedSinceLastRender = false;
		
		// nothing to do
		if(this.processor.items.length == 0)
			return;
		
		var renderBounds = this.getStrokeBounds().toIntRect().inflate(4, 4);
		var itemCount = this.processor.items.length;
		var item = null;
		var op = null;
		var opType = null;
		var params = null;
		
		this.currentPathItem = null;

		// setup the render clip
		ctx.save();
		ctx.beginPath();
		ctx.rect(renderBounds.x, renderBounds.y, renderBounds.width, renderBounds.height);
		ctx.clip();
		
		for(var i = 0; i < itemCount; ++i)
		{
			item = this.processor.items[i];

			// render the item as an image
			if(item instanceof MoGraphicsImageItem)
			{
				op = item.imageOp;
				opType = op.getFirst();
				params = op.getSecond();
				
				switch(opType)
				{
					case MoGraphicsOp.TiledImage:
						this.drawImageImpl(ctx, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], true, params[9]);
						break;
					case MoGraphicsOp.Image:
						this.drawImageImpl(ctx, params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7], params[8], false, params[9]);
						break;
				}
			}
			
			// render the item as a path, or text
			else
			{
				if(item.ops.length == 0)
					continue;

				var len = item.ops.length;
				var bounds = (item.strokedBounds == null ? item.bounds : item.strokedBounds);

				this.currentTextOp = null;
				this.currentPathItem = item;
				
				// must always start off with a beginPath
				op = item.ops[0];
				opType = op.getFirst();

				if(opType != MoGraphicsOp.BeginPath)
					this.beginPathImpl(ctx);

				for(var j = 0; j < len; ++j)
				{
					op = item.ops[j];
					opType = op.getFirst();
					params = op.getSecond();

					this.currentTextOp = null;
							
					switch(opType)
					{
						case MoGraphicsOp.BeginPath:
							this.beginPathImpl(ctx);
							break;
						case MoGraphicsOp.ClosePath:
							this.closePathImpl(ctx);
							break;
						case MoGraphicsOp.MoveTo:
							this.moveToImpl(ctx, params[0]);
							break;
						case MoGraphicsOp.LineTo:
							this.lineToImpl(ctx, params[0]);
							break;
						case MoGraphicsOp.CurveTo:
							this.quadraticCurveToImpl(ctx, params[0]);
							break;
						case MoGraphicsOp.CubicCurveTo:
							this.bezierCurveToImpl(ctx, params[0]);
							break;
						case MoGraphicsOp.Text:
							this.currentTextOp = op;
							this.drawTextImpl(ctx, bounds, item.fillOp, item.strokeOp, params[0], params[1], params[2], params[3]);
							break;
					}
				}
				
				if(this.currentTextOp != null)
					continue;
				
				// now paint the path, fill and stroke can be in any order, should
				// only ever be two or less paint operations, but just incase
				var paintOpCount = item.paintOps.length;
				
				for(var j = 0; j < paintOpCount; ++j)
				{
					op = item.paintOps[j];
					opType = op.getFirst();
					params = op.getSecond();
					
					switch(opType)
					{
						case MoGraphicsOp.Fill:
							this.fillImpl(ctx, bounds, params[0], params[1], false);
							break;
						case MoGraphicsOp.Stroke:
							this.strokeImpl(ctx, bounds, params[0], params[1], false);
							break;
					}
				}
			}
		}
		
		ctx.restore();
	},
	
	renderAlphaMask : function(ctx, maskBrush, width, height) {
		// make a rect that will be filled in with our mask
		ctx.beginPath();
		ctx.rect(0, 0, width, height);

		this.tmpRect.x = this.tmpRect.y = 0;
		this.tmpRect.width = width;
		this.tmpRect.height = height;

		this.drawable.registerGraphicsObject(maskBrush);
		
		// fill the mask rect
		this.fillImpl(ctx, this.tmpRect, this.createParamsFromBrush(maskBrush), MoCompositeOperator.DestinationIn);
	},
	
	processIfNeeded : function() {
		if(!this.needsProcessing)
			return;	
		
		this.processor.process(this.ops, this.drawable);
		this.needsProcessing = false;
	},

	getBounds : function() {
		this.processIfNeeded();

		return this.processor.bounds;
	},
	
	getStrokeBounds : function() {
		this.processIfNeeded();

		if(this.processor.strokedBounds != null)
			return this.processor.strokedBounds;

		return this.processor.bounds;		
	},

	beginPathImpl : function(ctx) {
		ctx.beginPath();
	},

	closePathImpl : function(ctx) {
		ctx.closePath();
	},

	moveToImpl : function(ctx, segment) {
		ctx.moveTo(segment.x, segment.y);
	},

	lineToImpl : function(ctx, segment) {
		ctx.lineTo(segment.x, segment.y);
	},
	
	quadraticCurveToImpl : function(ctx, segment) {
		ctx.quadraticCurveTo(segment.cx, segment.cy, segment.x, segment.y);
	},

	bezierCurveToImpl : function(ctx, segment) {
		ctx.bezierCurveTo(segment.cx1, segment.cy1, segment.cx2, segment.cy2, segment.x, segment.y);
	},

	drawImageImpl : function(ctx, imageSource, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight, repeat, matrix) {

		if(!imageSource.getIsSourceReady())
			return;
		
		var nativeData = imageSource.getNativeData();

		/** NON-REPEATING IMAGE **/
		if(!repeat)
		{
			// bugfix: it seems that FF will randomly throw an exception if the source rect is provided, so we omit
			//         this for the video element only, which is fine, if a user needs a specific rect from the video
			//         a VideoBrush should be used instead anyway.
			if(imageSource instanceof MoVideoSource)
				ctx.drawImage(nativeData, dstX, dstY, dstWidth, dstHeight);
			else
			{
				if(MoIsNull(matrix))
					ctx.drawImage(nativeData, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
				else
				{
					ctx.save();
					ctx.transform(matrix.m11, matrix.m12, matrix.m21, matrix.m22, matrix.offsetX, matrix.offsetY);
					ctx.drawImage(nativeData, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight);
					ctx.restore();
				}
			}

			return;
		}
	

		/** REPEATING IMAGE **/

		// !!! TODO : need to support the matrix for repeating images... (do we apply it to the drawn image? or to the entire pattern??)

		// create the offscreen surface (if needed) that we will use
		// to render the source tile into, patterns are as-is so we
		// must draw the tile first then create the pattern from the
		// offscreen surface. most likely this surface will be used
		// multiple times, hence the reason for keeping it in memory
		if(this.offscreenSurface == null)
			this.offscreenSurface = document.createElement("canvas");

		// round the dimensions to whole numbers		
		this.offscreenSurface.width = MoMath.round(srcWidth);
		this.offscreenSurface.height = MoMath.round(srcHeight);

		// create and reset the offscreen context, then render the tile
		// into it at 0,0
		var offscreenContext = this.offscreenSurface.getContext("2d");

		offscreenContext.clearRect(0, 0, this.offscreenSurface.width, this.offscreenSurface.height);
		offscreenContext.beginPath();
		offscreenContext.drawImage(nativeData, srcX, srcY, srcWidth, srcHeight, 0, 0, srcWidth, srcHeight);

		// now create the pattern from our surface, repeating in both directions
		var pattern = ctx.createPattern(this.offscreenSurface, "repeat");

		// draw the final tiled image into our main context, the pattern
		// will handle tiling (i.e. via repeat), this is much faster than
		// computing the tiles ourself and rendering each one using drawImage
		//
		// NOTE : here we translate instead of passing in the dstX/dstY to
		//		  the rect method, this will actually translate the entire
		//		  pattern, the latter method would end up just clipping
		ctx.save();
		ctx.beginPath();
		ctx.translate(dstX, dstY);
		ctx.rect(0, 0, dstWidth, dstHeight);
		ctx.fillStyle = pattern;
		ctx.fill();
		ctx.restore();
	},
	
	drawTextImpl : function(ctx, boundsRect, fillOp, strokeOp, text, x, y, font) {
	
		if(fillOp != null)
			this.fillImpl(ctx, boundsRect, fillOp.getSecond()[0], fillOp.getSecond()[1], true);

		if(strokeOp != null)
			this.strokeImpl(ctx, boundsRect, strokeOp.getSecond()[0], strokeOp.getSecond()[1], true);
	},
	
	fillImpl : function(ctx, boundsRect, brushParams, compositeOp, forText) {
	
		if(brushParams == null)
		{
			ctx.fillStyle = this.createFallbackStyle();
			
			if(forText)
				this.fillText(ctx);
			else
				ctx.fill();
			
			return;
		}

		var success = true;
		var saveState = false;
		var alpha = ctx.globalAlpha;
		var currentCompositeOp = ctx.globalCompositeOperation;

		// if the brush has a transform we will need to save our current state and restore it, this adds a bit of overhead
		// so we only do this if we absolutley must (hence the saving of the alpha directly)
		if(this.getMustSaveContextForBrush(brushParams))
			saveState = true;

		try
		{
			if(saveState)
				ctx.save();

			ctx.globalCompositeOperation = this.getCompositeOperatorString(compositeOp);
			ctx.fillStyle = this.createStyleFromBrush(ctx, boundsRect, brushParams, false);
			
			// the brush may have it's own alpha channel, so we append it to the global alpha
			// this will relieve us of some overhead of making a copy of the brushes color(s), however, the 
			// color(s) could also have their own alpha which will be in the style created
			ctx.globalAlpha *= brushParams[brushParams.length-2];
			
			if(forText)
				this.fillText(ctx);
			else
				ctx.fill();
		}
		catch(e)
		{
			success = false;
			MoDebugWrite(e.toString(), MoDebugLevel.Error);
		}
		finally
		{
			// restore back to our previous state
			if(!saveState)
			{
				ctx.globalAlpha = alpha;
				ctx.globalCompositeOperation = currentCompositeOp;
			}
			else
				ctx.restore();
		}
		
		return success;
	},

	fillText : function(ctx) {
		if(this.currentTextOp == null)
			return;

		var params = this.currentTextOp.getSecond();
		var text = params[0];
		var x = params[1];
		var y = params[2];
		var font = params[3];

		ctx.font = font.toString();
		ctx.textBaseline = "top";
		ctx.fillText(text, x, y);
	},

	strokeImpl : function(ctx, boundsRect, penParams, compositeOp, forText) {
		if(penParams == null)
		{
			ctx.strokeStyle = this.createFallbackStyle();
			
			if(forText)
				this.strokeText(ctx);
			else
				ctx.stroke();
			
			return;
		}

		var success = true;
		var lineWidth = penParams[0];
		var lineCap = penParams[3];
		var dashCap = penParams[6];
		var dashStyle = penParams[5];
		var dashSuccess = false;
		var brushParams = penParams[4];
		var saveState = false;
		var alpha = ctx.globalAlpha;
		var currentCompositeOp = ctx.globalCompositeOperation;
		
		// if the brush has a transform we will need to save our current state and restore it, this adds a bit of overhead
		// so we only do this if we absolutley must (hence the saving of the alpha directly)
		if(this.getMustSaveContextForBrush(brushParams))
			saveState = true;
		
		try
		{
			if(saveState)
				ctx.save();

			ctx.globalCompositeOperation = this.getCompositeOperatorString(compositeOp);
			ctx.strokeStyle = this.createStyleFromBrush(ctx, boundsRect, brushParams, true);

			// the brush may have it's own alpha channel, so we append it to the global alpha
			// this will relieve us of some overhead of making a copy of the brushes color(s), however, the 
			// color(s) could also have their own alpha which will be in the style created
			ctx.globalAlpha *= brushParams[brushParams.length-2];

			ctx.lineWidth = lineWidth;
			ctx.miterLimit = penParams[1];
			ctx.lineJoin = penParams[2];

			// dashing is currently available for paths created through the MoGraphics class only
			// so text cannot have a dashed path since we currently use the native font rendering provided
			// by the canvas context.
			//
			// TODO : implement our own OpenType or TrueType font reader and renderer so we can use precise
			//        bounds caclulation, dashing, etc...
			//
			if(!forText && dashStyle != null && dashStyle != MoDashStyle.Solid && lineWidth > 0)
			{
				dashSuccess = this.dashCurrentPath(ctx, dashStyle, lineWidth, dashCap, lineCap);
			}
			
			if(!dashSuccess)
			{
				ctx.lineCap = lineCap;
				
				if(forText)
					this.strokeText(ctx);
				else
					ctx.stroke();
			}
		}
		catch(e)
		{
			success = false;
			MoDebugWrite(e.toString(), MoDebugLevel.Error);
		}
		finally
		{
			// restore back to our previous state
			if(!saveState)
			{
				ctx.globalAlpha = alpha;
				ctx.globalCompositeOperation = currentCompositeOp;
			}
			else
				ctx.restore();
		}

		return success;
	},
	
	strokeText : function(ctx) {
		if(this.currentTextOp == null)
			return;

		var params = this.currentTextOp.getSecond();
		var text = params[0];
		var x = params[1];
		var y = params[2];
		var font = params[3];

		ctx.font = font.toString();
		ctx.textBaseline = "top";
		ctx.strokeText(text, x, y);
	},
	
	/** Pen Parameters **/
	createParamsFromPen : function(pen) {
		if(pen == null || pen.getBrush() == null)
			return null;
	
		return [pen.getThickness(),
				pen.getMiterLimit(),
				this.getLineJoinString(pen.getLineJoin()),
				this.getLineCapString(pen.getLineCap()),
				this.createParamsFromBrush(pen.getBrush()),
				pen.getDashStyle(),
				this.getLineCapString(pen.getDashCap())];
	},
	
	
	/** Brush Parameters **/
	
	createParamsFromBrush : function(brush) {
		if(brush == null)
			return null;

		var params = null;
		
		if(brush instanceof MoSolidColorBrush)
			params = this.createParamsFromSolidColorBrush(brush);
		else if(brush instanceof MoLinearGradientBrush)
			params = this.createParamsFromLinearGradientBrush(brush);
		else if(brush instanceof MoRadialGradientBrush)
			params = this.createParamsFromRadialGradientBrush(brush);
		else if(brush instanceof MoImageBrush)
			params = this.createParamsFromImageBrush(brush);
		else if(brush instanceof MoVideoBrush)
			params = this.createParamsFromVideoBrush(brush);
		else
		{
			MoDebugWrite("Graphics.createParamsFromBrush() found an unknown brush type.", MoDebugLevel.Warning);
			
			// the brush is unknown so just return a solid type with the fallback color
			params = [MoGraphicsBrushType.Solid, this.createFallbackStyle()];
			params.push(1); 	// opacity
			params.push(null); 	// matrix

			return params;
		}

		params.push(brush.getOpacity());

		if(brush.getTransform() != null)
			params.push(brush.getTransform().getValue());
		else
			params.push(null);

		return params;
	},
	
	createParamsFromSolidColorBrush : function(brush) {
		return [MoGraphicsBrushType.Solid, brush.getColor().toRGBAString()];
	},
	
	createParamsFromGradientBrush : function(brush) {
		var len = brush.getColorStopCount();
		var stop = null;
		var stops = [];
		
		for(var i = 0; i < len; ++i)
		{
			stop = brush.getColorStop(i);
			stops.push([stop.getColor().toRGBAString(), stop.getOffset()]);
		}

		return stops;
	},

	createParamsFromLinearGradientBrush : function(brush) {	
		return [MoGraphicsBrushType.Linear,
				brush.getStartPoint().x, 
				brush.getStartPoint().y,
				brush.getEndPoint().x, 
				brush.getEndPoint().y,
				this.createParamsFromGradientBrush(brush)];
	},

	createParamsFromRadialGradientBrush : function(brush) {	
		return [MoGraphicsBrushType.Radial,
				brush.getStartPoint().x, 
				brush.getStartPoint().y,
				brush.getStartRadius(),
				brush.getEndPoint().x, 
				brush.getEndPoint().y,
				brush.getEndRadius(),
				this.createParamsFromGradientBrush(brush)];
	},
	
	createParamsFromImageBrush : function(brush) {
		if(!brush.getIsAvailable())
			return [MoGraphicsBrushType.Solid, this.createFallbackStyle()];

		return [MoGraphicsBrushType.Image,
				brush.texture.getSize().width,
				brush.texture.getSize().height,
				brush.texture.getNativeData(),
				brush.getSourceUrl(),
				brush.getStretch(),
				brush.getHorizontalAlignment(),
				brush.getVerticalAlignment()];
	},

	createParamsFromVideoBrush : function(brush) {
		if(!brush.getIsAvailable())
			return [MoGraphicsBrushType.Solid, this.createFallbackStyle()];
	
		var naturalSize = brush.getNaturalSize();
		
		return [MoGraphicsBrushType.Video,
				naturalSize.width,
				naturalSize.height,
				brush.getSourceElement(),
				brush.getCurrentPosition(),
				brush.getStretch(),
				brush.getHorizontalAlignment(),
				brush.getVerticalAlignment()];
	},
	
	/** Brush Styles **/
	
	createStyleFromBrush : function(ctx, boundsRect, brushParams, isStroking) {
		var type = brushParams[0];
		
		switch(type)
		{
			case MoGraphicsBrushType.Solid:
				return this.createStyleFromSolidColorBrush(brushParams);
			case MoGraphicsBrushType.Linear:
				return this.createStyleFromLinearGradientBrush(ctx, boundsRect, brushParams, isStroking);
			case MoGraphicsBrushType.Radial:
				return this.createStyleFromRadialGradientBrush(ctx, boundsRect, brushParams, isStroking);
			case MoGraphicsBrushType.Image:
				return this.createStyleFromImageBrush(ctx, boundsRect, brushParams, isStroking);
			case MoGraphicsBrushType.Video:
				return this.createStyleFromVideoBrush(ctx, boundsRect, brushParams, isStroking);
		}

		MoDebugWrite("Graphics.fill() found an unknown brush type. " + type, MoDebugLevel.Warning);
		
		return this.createFallbackStyle();
	},

	createStyleFromSolidColorBrush : function(brushParams) {
		return brushParams[1];
	},

	createStyleFromLinearGradientBrush : function(ctx, boundsRect, brushParams, isStroking) {
		var startX = brushParams[1];
		var startY = brushParams[2];
		var endX = brushParams[3];
		var endY = brushParams[4];
		var stops = brushParams[5];
		var xform = brushParams[7];
		var len = stops.length;
		var stop = null;
		var rect = boundsRect;

		// pre-transform start/end points
		startX = rect.x + (startX * rect.width);
		startY = rect.y + (startY * rect.height);
		endX = rect.x + (endX * rect.width);
		endY = rect.y + (endY * rect.height);
		
		if(xform != null)
		{
			// transform the start point
			this.tmpVect.x = startX;
			this.tmpVect.y = startY;
			this.tmpVect = xform.transformPoint(this.tmpVect);
			
			startX = this.tmpVect.x;
			startY = this.tmpVect.y;
			
			
			// transform the end point
			this.tmpVect.x = endX;
			this.tmpVect.y = endY;
			this.tmpVect = xform.transformPoint(this.tmpVect);
			
			endX = this.tmpVect.x;
			endY = this.tmpVect.y;
		}

		var pattern = ctx.createLinearGradient(startX, startY, endX, endY);

		for(var i = 0; i < len; ++i)
		{
			stop = stops[i];
			
			pattern.addColorStop(stop[1], stop[0]);
		}

		return pattern;
	},
	
	// TODO : for some reason, this fails when the start/end radius and points are lowered or increased,
	//        the results fail differently in IE and FF so something is def wrong with the below
	
	createStyleFromRadialGradientBrush : function(ctx, boundsRect, brushParams, isStroking) {
		var startX = brushParams[1];
		var startY = brushParams[2];
		var startRadius = brushParams[3];
		var endX = brushParams[4];
		var endY = brushParams[5];
		var endRadius = brushParams[6];
		var stops = brushParams[7];
		var xform = brushParams[9];
		var len = stops.length;
		var stop = null;
		var rect = boundsRect;
		
		if(xform != null)
			rect = xform.transformRect(rect);
		/*
		console.log(
			rect.x + (startX * rect.width),
			rect.y + (startY * rect.height),
			startRadius * Math.max(rect.width, rect.height),
			rect.x + (endX * rect.width),
			rect.y + (endY * rect.height),
			endRadius * Math.max(rect.width, rect.height));
		*/
		var pattern = ctx.createRadialGradient(
			/** start point / radius **/
			rect.x + (startX * rect.width), 
			rect.y + (startY * rect.height), 
			startRadius * Math.max(rect.width, rect.height),

			/** end point / radius **/
			rect.x + (endX * rect.width), 
			rect.y + (endY * rect.height), 
			endRadius * Math.max(rect.width, rect.height));

		for(var i = 0; i < len; ++i)
		{
			stop = stops[i];
			
			pattern.addColorStop(stop[1], stop[0]);
		}

		return pattern;
	},
	
	//***********************************************************************************************
	// TODO : need to cache image patterns, more likely than not, these patterns will not change in
	//        subsequent renders so caching them can dramatically speed up performance, especially
	//        when animating. But, it get's a bit complex because strokes have a intermediate stage
	//        where it renders to a offscreen canvas first, which is then used to create that pattern,
	//        so if a transform changes, then the cache would be invalidated. Fills are much more easy,
	//        the pattern could just be cached based on the url because any transforms are applied
	//        directly to the source context, we don't get the wierdness with fills as we do with the
	//        strokes.
	//***********************************************************************************************
	
	createStyleFromImageBrush : function(ctx, boundsRect, brushParams, isStroking) {
		var sourceWidth = brushParams[1];
		var sourceHeight = brushParams[2];
		var nativeData = brushParams[3];
		var sourceUrl = brushParams[4].toLowerCase();
		var stretch = brushParams[5];
		var horizontalAlignment = brushParams[6];
		var verticalAlignment = brushParams[7];
		var xform = brushParams[9];
		var patternSize = this.computePatternSize(stretch, boundsRect, sourceWidth, sourceHeight);
		var patternPosition = this.computePatternPosition(horizontalAlignment, verticalAlignment, patternSize, boundsRect);
		var pattern = this.createBrushStylePattern(ctx, nativeData, xform, patternSize, isStroking);

		this.setContextTransform(ctx, this.makeBrushStyleMatrix(xform, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking));

		return pattern;
	},

	createStyleFromVideoBrush : function(ctx, boundsRect, brushParams, isStroking) {
		var sourceWidth = brushParams[1];
		var sourceHeight = brushParams[2];
		var sourceElement = brushParams[3];
		var stretch = brushParams[5];
		var horizontalAlignment = brushParams[6];
		var verticalAlignment = brushParams[7];
		var xform = brushParams[9];
		var patternSize = this.computePatternSize(stretch, boundsRect, sourceWidth, sourceHeight);
		var patternPosition = this.computePatternPosition(horizontalAlignment, verticalAlignment, patternSize, boundsRect);
		var pattern = this.createBrushStylePattern(ctx, sourceElement, xform, patternSize, isStroking);
		
		this.setContextTransform(ctx, this.makeBrushStyleMatrix(xform, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking));

		return pattern;
	},

	createFallbackStyle : function() {
		return MoColor.Transparent.toRGBAString();
	},

	createBrushStylePattern : function(ctx, sourceElement, brushMatrix, patternSize, isStroking) {
		// for strokes with a pattern, we must do some intermediate drawing
		if(isStroking)
			return ctx.createPattern(this.createBrushPatternSource(sourceElement, brushMatrix, patternSize.width, patternSize.height), "no-repeat");

		return ctx.createPattern(sourceElement, "no-repeat");
	},

	createBrushPatternSource : function(sourceElement, xform, width, height) {
		// create the offscreen surface that we will use to render the source style
		// into, strokes with a video and texture need to first be rendered into a 
		// seperate surface that can then be used as the final source when creating
		// the pattern, otherwise if we scale the stroke itself it will end up looking
		// like ass, this produces a much better and accurate stroke
		if(this.offscreenStyleSurface == null)
			this.offscreenStyleSurface = document.createElement("canvas");

		var surfaceWidth = width;
		var surfaceHeight = height;
		var alignX = 0;
		var alignY = 0;

		// if the brush has a transform, we need to run that transform here
		if(xform != null)
		{
			this.tmpRect = xform.transformRect(new MoRectangle(0, 0, width, height));

			// re-align so that the source is drawn at 0,0
			alignX = -this.tmpRect.x;
			alignY = -this.tmpRect.y;

			// get the post-transform size
			surfaceWidth = this.tmpRect.width;
			surfaceHeight = this.tmpRect.height;
		}

		// round the dimensions to whole numbers		
		this.offscreenStyleSurface.width = MoMath.round(surfaceWidth);
		this.offscreenStyleSurface.height = MoMath.round(surfaceHeight);

		var ctx = this.offscreenStyleSurface.getContext("2d");

		if(xform != null)
			ctx.setTransform(xform.m11, xform.m12, xform.m21, xform.m22, xform.offsetX + alignX, xform.offsetY + alignY);

		ctx.drawImage(sourceElement, 0, 0, width, height);
		
		return this.offscreenStyleSurface;
	},
	
	/** Other **/
	
	makeBrushStyleMatrix : function(brushMatrix, patternPosition, patternSize, sourceWidth, sourceHeight, isStroking) {
		this.tmpMatrix.setIdentity();

		if(brushMatrix != null)
		{
			if(isStroking)
			{
				this.tmpRect = brushMatrix.transformRect(new MoRectangle(patternPosition.x, patternPosition.y, patternSize.width, patternSize.height));
				this.tmpMatrix.translate(this.tmpRect.x, this.tmpRect.y);
			}
			else
			{
				this.tmpMatrix.scale(patternSize.width / sourceWidth, patternSize.height / sourceHeight);
				this.tmpMatrix.translate(patternPosition.x, patternPosition.y);
				this.tmpMatrix.append(brushMatrix);
			}
		}
		else
		{
			if(!isStroking)
				this.tmpMatrix.scale(patternSize.width / sourceWidth, patternSize.height / sourceHeight);
		
			this.tmpMatrix.translate(patternPosition.x, patternPosition.y);
		}

		return this.tmpMatrix;
	},
	
	computePatternSize : function(stretch, boundsRect, sourceWidth, sourceHeight) {
		var scaleX = boundsRect.width / sourceWidth;
		var scaleY = boundsRect.height / sourceHeight;
		var minScale = Math.min(scaleX, scaleY);
		var maxScale = Math.max(scaleX, scaleY);
	
		switch(stretch)
		{
			case MoStretch.Uniform:
				scaleX = minScale;
				scaleY = minScale;
				break;
			case MoStretch.UniformToFill:
				scaleX = maxScale;
				scaleY = maxScale;
				break;
			case MoStretch.Fill:
				break;
			case MoStretch.None:
				scaleX = scaleY = 1;
				break;
		}

		this.tmpSize.width = (sourceWidth * scaleX);
		this.tmpSize.height = (sourceHeight * scaleY);

		return this.tmpSize;
	},

	computePatternPosition : function(horizontalAlignment, verticalAlignment, patternSize, dstRect) {
		this.tmpVect.x = dstRect.x + ((dstRect.width - patternSize.width) * horizontalAlignment);
		this.tmpVect.y = dstRect.y + ((dstRect.height - patternSize.height) * verticalAlignment);
		
		return this.tmpVect;
	},
	
	dashCurrentPath : function(ctx, dashStyle, lineWidth, dashCap, lineCap) {
		var srcDashOffset = dashStyle.getOffset();
		var srcDashes = dashStyle.getDashes();
		var srcDashCount = Math.min(srcDashes.length, 32);
		var dashes = [];
		var sumDashLength = 0;
		var sumInvDashLength = 0;
		
		// compute the real dash lengths based on our pen's stroke weight, we also need
		// to sum the entire set of dash lengths so we can check that we have a valid
		// set of dashes and compute the real dash offset
		for(var i = 0; i < srcDashCount; ++i)
		{
			// ensure we don't have negative values
			//
			// TODO : should probably limit to 1 so it is atleast a solid dash?
			//
			dashes.push(Math.max(srcDashes[i], 0) * lineWidth);
			
			sumDashLength += dashes[i];
		}

		// unable to actual perform an dashing
		if(Math.abs(MoMath.toPrecision(sumDashLength, 2)) <= 0.01)
			return false;

		var dashCount = 0;
		var dashIndex = 0;
		var dashCurvePos = 0;
		var dashPos = 0;
		var dashOffset = 0;
		var dashPoint = new MoVector2D(0, 0);
		var segment = null;
		var segmentLength = 0;
		var segmentCount = 0;
		var segmentStartIndex = 0;
		var segmentStopIndex = 0;
		var segmentLine = null;
		var prevSegment = null;
		var lineX = 0;
		var lineY = 0;
		var moveX = 0;
		var moveY = 0;
		var firstMoveDone = false;
		var isDashingDone = false;
		var isDashOffset = false;
		var isDashEven = false;
		var useDashCap = false;
		var flatSegments = [];

		// capping each dash is an expensive process since we have to render
		// each dash individually, so if the caps are the same we can wait
		// till the end to stroke, which will apply the same cap on all strokes
		// otherwise, instead of dashing directly to the context we builds up a
		// set of dash segments so we can handle start and ending caps
		if(dashCap != lineCap)
			useDashCap = true;

		// round down to an even number
		dashCount = MoMath.evenRoundDown(dashes.length);
		
		// get the inverse of the sum of the dash lengths
		sumInvDashLength = 1 / sumDashLength;
		
		// compute the initial dash offset
		dashOffset -= Math.floor((srcDashOffset * lineWidth) * sumInvDashLength) * sumDashLength;

		while(dashOffset >= dashes[dashIndex])
		{
			dashOffset -= dashes[dashIndex];
			
			if(++dashIndex >= dashCount)
				dashIndex = 0;
		}
		
		// now we need to flatten the current path down to something more
		// managable for high quality dashing, otherwise we wouldn't be able
		// to draw curved dashes
		
		flatSegments = this.flattenCurrentPath();
		
		if(flatSegments == null)
			return false;
		
		// get the new flattened segment count
		segmentCount = flatSegments.length;
		
		// start with the first segment
		prevSegment = flatSegments[0];
		moveX = prevSegment.x;
		moveY = prevSegment.y;
		
		// there will already be a path in our context from previous
		// draw operations that assumed a solid stroke, this will clear all sub-paths and
		// start a new path for us to draw into
		ctx.beginPath();

		// finally, go through all our segments and draw each dash
		for(var i = 1; i < segmentCount; ++i)
		{
			segment = flatSegments[i];
			segmentLine = new MoLine(prevSegment.x, prevSegment.y, segment.x, segment.y);
			segmentLength = segmentLine.length();
			segmentStopIndex = segmentStartIndex + segmentLength;
			
			isDashingDone = dashCurvePos >= segmentStopIndex;
			
			while(!isDashingDone)
			{
				dashPoint.x = 0;
				dashPoint.y = 0;
				dashPos = dashCurvePos + dashes[dashIndex] - dashOffset - segmentStartIndex;
				
				isDashOffset = dashOffset > 0;
				isDashEven = (dashIndex & 1) == 0;

				// unable to dash anymore, the dash extends beyond this line so we need to subtract
				// the dash part that we've already used and move to the next segment
				if(dashPos > segmentLength)
				{
					dashCurvePos = segmentStopIndex;
					dashOffset = dashes[dashIndex] - (dashPos - segmentLength);
					
					dashPoint.x = segmentLine.x2;
					dashPoint.y = segmentLine.y2;

					isDashingDone = true;
				}
				
				// the dash is on this line, keep dashing
				else
				{
					dashCurvePos = dashPos + segmentStartIndex;
					dashOffset = 0;
					
					dashPoint = segmentLine.pointAt(dashPos/segmentLength);
					
					if(++dashIndex >= dashCount)
						dashIndex = 0;
					
					isDashingDone = dashCurvePos >= segmentStopIndex;
				}

				if(isDashEven)
				{
					lineX = dashPoint.x;
					lineY = dashPoint.y;
					
					// we only want to start a new subpath if we have a dash offset, otherwise
					// we need to just continue dashing
					if(!isDashOffset || !firstMoveDone)
					{
						ctx.moveTo(moveX, moveY);
						firstMoveDone = true;
					}

					ctx.lineTo(lineX, lineY);
					
					moveX = lineX;
					moveY = lineY;
				}
				else
				{
					moveX = dashPoint.x;
					moveY = dashPoint.y;
				}
			}
			
			// go to the next segment
			segmentStartIndex = segmentStopIndex;
			prevSegment = segment;
		}

		// stroke the dashed path first
		ctx.lineCap = dashCap;
		ctx.stroke();
		
		// finally, we need to draw all the line caps, these are different than the
		// dash caps, i.e. the start and end of a non-connecting path
		if(useDashCap)
		{
			// TODO : need to implement different caps for non-connecting paths
		}

		return true;
	},

	flattenCurrentPath : function() {
		if(this.currentPathItem.segments == null || this.currentPathItem.segments.length == 0)
			return null;

		var segmentCount = this.currentPathItem.segments.length;
		var segment = null;
		var flatSegments = [];

		for(var i = 0; i < segmentCount; ++i)
		{
			segment = this.currentPathItem.segments[i];

			if(segment instanceof MoPathMoveSegment)
			{
				flatSegments.push(segment);
			}
			else
			{
				var lineSegments = segment.flattenForThreshold(2, (i > 0 ? this.currentPathItem.segments[i-1] : null));

				for(var j = 0; j < lineSegments.length; ++j)
				{
					flatSegments.push(lineSegments[j]);
				}
			}
		}

		return flatSegments;
	},

	getMustSaveContextForBrush : function(brushParams) {
		return (brushParams[brushParams.length-1] != null || brushParams[0] == MoGraphicsBrushType.Image || brushParams[0] == MoGraphicsBrushType.Video);
	},

	setContextTransform : function(ctx, mx) {
		ctx.transform(mx.m11, mx.m12, mx.m21, mx.m22, mx.offsetX, mx.offsetY);
	},

	// getCurrentStrokeDashStyle : function() {
		// if(this.strokeIndex == -1)
			// return null;
		
		// var op = this.ops[this.strokes[this.pathIndex][this.strokeIndex]];
		// var dashStyle = op.getSecond()[0][5];

		// if(dashStyle != null && dashStyle == MoDashStyle.Solid)
			// return null;
		
		// return dashStyle;
	// },
	
	getLineCapString : function(penLineCap) {
		switch(penLineCap)
		{
			case MoPenLineCap.Round:
				return "round";
			case MoPenLineCap.Square:
				return "square";
		}
		
		return "butt";
	},
	
	getLineJoinString : function(penLineJoin) {
		switch(penLineJoin)
		{
			case MoPenLineJoin.Bevel:
				return "bevel";
			case MoPenLineJoin.Round:
				return "round";
		}
		
		return "miter";
	},
	
	getCompositeOperatorString : function(compositeOp) {
		switch(compositeOp)
		{
			case MoCompositeOperator.Clear:
				return "clear";
			case MoCompositeOperator.SourceIn:
				return "source-in";
			case MoCompositeOperator.SourceOut:
				return "source-out";
			case MoCompositeOperator.SourceAtop:
				return "source-atop";
			case MoCompositeOperator.DestinationOver:
				return "destination-over";
			case MoCompositeOperator.DestinationIn:
				return "destination-in";
			case MoCompositeOperator.DestinationOut:
				return "destination-out";
			case MoCompositeOperator.DestinationAtop:
				return "destination-atop";
			case MoCompositeOperator.Xor:
				return "xor";
			case MoCompositeOperator.Copy:
				return "copy";
		}
		
		return "source-over";
	}
});

Object.extend(MoGraphics, {
	Kappa : 0.5522847498307933,
	MiterJointAccuracy : 1.0E-9
});


//=====================================================================
//= MoGraphicsUtil.js
//=====================================================================

var MoGraphicsUtil = {};

Object.extend(MoGraphicsUtil, 
/**
 * @CLASS
 *
 * SUMMARY:
 *  Utility class for helping out with various graphics associated tasks.
 *
 */
{
	getImageData : function(context, x, y, width, height, requestPermission) {
		try
		{
			return context.getImageData(x, y, width, height);
		}
		catch(e)
		{
			if(!requestPermission)
				return null;

			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

			try
			{
				return context.getImageData(x, y, width, height);
			}
			catch(e) { }
		}
		
		return null;
	}
});


//=====================================================================
//= MoKey.js
//=====================================================================

MoKey = {
	"None" 					: 0,
	"Cancel" 				: 1,
	"Back" 					: 2,
	"Tab" 					: 3,
	"LineFeed" 				: 4,
	"Clear" 				: 5,
	"Enter" 				: 6,
	"Pause" 				: 7,
	"CapsLock" 				: 8,
	"Escape" 				: 9,
	"Space" 				: 10,
	"PageUp" 				: 11,
	"PageDown" 				: 12,
	"Next" 					: 13,
	"End" 					: 14,
	"Home" 					: 15,
	"Left" 					: 16,
	"Up" 					: 17,
	"Right" 				: 18,
	"Down" 					: 19,
	"Select" 				: 20,
	"Print" 				: 21,
	"Execute" 				: 22,
	"PrintScreen" 			: 23,
	"Insert" 				: 24,
	"Delete" 				: 25,
	"Help" 					: 26,
	"D0" 					: 27,
	"D1" 					: 28,
	"D2" 					: 29,
	"D3" 					: 30,
	"D4" 					: 31,
	"D5" 					: 32,
	"D6" 					: 33,
	"D7" 					: 34,
	"D8" 					: 35,
	"D9" 					: 36,
	"A" 					: 37,
	"B" 					: 38,
	"C" 					: 39,
	"D" 					: 40,
	"E" 					: 41,
	"F" 					: 42,
	"G" 					: 43,
	"H" 					: 44,
	"I" 					: 45,
	"J" 					: 46,
	"K" 					: 47,
	"L" 					: 48,
	"M" 					: 49,
	"N" 					: 50,
	"O" 					: 51,
	"P" 					: 52,
	"Q" 					: 53,
	"R" 					: 54,
	"S" 					: 55,
	"T" 					: 56,
	"U" 					: 57,
	"V" 					: 58,
	"W" 					: 59,
	"X" 					: 60,
	"Y" 					: 61,
	"Z" 					: 62,
	"LWin" 					: 63,
	"RWin" 					: 64,
	"Apps" 					: 65,
	"Sleep" 				: 66,
	"NumPad0" 				: 67,
	"NumPad1" 				: 68,
	"NumPad2" 				: 69,
	"NumPad3" 				: 70,
	"NumPad4" 				: 71,
	"NumPad5" 				: 72,
	"NumPad6" 				: 73,
	"NumPad7" 				: 74,
	"NumPad8" 				: 75,
	"NumPad9" 				: 76,
	"Multiply" 				: 77,
	"Add" 					: 78,
	"Separator" 			: 79,
	"Subtract" 				: 80,
	"Decimal" 				: 81,
	"Divide" 				: 82,
	"F1" 					: 83,
	"F2" 					: 84,
	"F3" 					: 85,
	"F4" 					: 86,
	"F5" 					: 87,
	"F6" 					: 88,
	"F7" 					: 89,
	"F8" 					: 90,
	"F9" 					: 91,
	"F10" 					: 92,
	"F11" 					: 93,
	"F12" 					: 94,
	"F13" 					: 95,
	"F14" 					: 96,
	"F15" 					: 97,
	"F16" 					: 98,
	"F17" 					: 99,
	"F18" 					: 100,
	"F19" 					: 101,
	"F20" 					: 102,
	"F21" 					: 103,
	"F22" 					: 104,
	"F23" 					: 105,
	"F24" 					: 106,
	"NumLock" 				: 107,
	"Scroll" 				: 108,
	"LeftShift" 			: 109,
	"RightShift" 			: 110,
	"LeftCtrl" 				: 111,
	"RightCtrl" 			: 112,
	"LeftAlt" 				: 113,
	"RightAlt" 				: 114,
	"BrowserBack" 			: 115,
	"BrowserForward" 		: 116,
	"BrowserRefresh" 		: 117,
	"BrowserStop" 			: 118,
	"BrowserSearch" 		: 119,
	"BrowserFavorites" 		: 120,
	"BrowserHome" 			: 121,
	"VolumeMute" 			: 122,
	"VolumeDown" 			: 123,
	"VolumeUp" 				: 124,
	"MediaNextTrack" 		: 125,
	"MediaPreviousTrack" 	: 126,
	"MediaStop" 			: 127,
	"MediaPlayPause" 		: 128,
	"LaunchMail" 			: 129,
	"SelectMedia" 			: 130,
	"LaunchApplication1" 	: 131,
	"LaunchApplication2" 	: 132,
	"System" 				: 133,
	"CrSel" 				: 134,
	"ExSel" 				: 135,
	"EraseEof" 				: 136,
	"Play" 					: 137,
	"Zoom" 					: 138,
	"SemiColon"				: 139,
	"Comma"					: 140,
	"Period"				: 141,
	"Quote"					: 142,
	"BackQuote"				: 143,
	"Slash"					: 144,
	"BackSlash"				: 145,
	"OpenBracket"			: 146,
	"CloseBracket"			: 147,
	
	fromKeyCode : function(keyCode) {
		switch(keyCode)
		{
			case 3:
				return MoKey.Cancel;
			case 8:
				return MoKey.Back;
			case 9:
				return MoKey.Tab;
			case 12:
				return MoKey.Clear;
			case 13:
				return MoKey.Enter;
			case 16:
			case 160:
				return MoKey.LeftShift;
			case 17:
			case 162:
				return MoKey.LeftCtrl;
			case 18:
			case 164:
				return MoKey.LeftAlt;
			case 19:
				return MoKey.Pause;
			case 20:
				return MoKey.CapsLock;
			case 27:
				return MoKey.Escape;
			case 32:
				return MoKey.Space;
			case 33:
				return MoKey.PageUp;
			case 34:
				return MoKey.PageDown;
			case 35:
				return MoKey.End;
			case 36:
				return MoKey.Home;
			case 37:
				return MoKey.Left;
			case 38:
				return MoKey.Up;
			case 39:
				return MoKey.Right;
			case 40:
				return MoKey.Down;
			case 41:
				return MoKey.Select;
			case 42:
				return MoKey.Print;
			case 43:
				return MoKey.Execute;
			case 44:
				return MoKey.PrintScreen;
			case 45:
				return MoKey.Insert;
			case 46:
				return MoKey.Delete;
			case 47:
				return MoKey.Help;
			case 48:
				return MoKey.D0;
			case 49:
				return MoKey.D1;
			case 50:
				return MoKey.D2;
			case 51:
				return MoKey.D3;
			case 52:
				return MoKey.D4;
			case 53:
				return MoKey.D5;
			case 54:
				return MoKey.D6;
			case 55:
				return MoKey.D7;
			case 56:
				return MoKey.D8;
			case 57:
				return MoKey.D9;
			case 59:
				return MoKey.SemiColon;
			case 65:
				return MoKey.A;
			case 66:
				return MoKey.B;
			case 67:
				return MoKey.C;
			case 68:
				return MoKey.D;
			case 69:
				return MoKey.E;
			case 70:
				return MoKey.F;
			case 71:
				return MoKey.G;
			case 72:
				return MoKey.H;
			case 73:
				return MoKey.I;
			case 74:
				return MoKey.J;
			case 75:
				return MoKey.K;
			case 76:
				return MoKey.L;
			case 77:
				return MoKey.M;
			case 78:
				return MoKey.N;
			case 79:
				return MoKey.O;
			case 80:
				return MoKey.P;
			case 81:
				return MoKey.Q;
			case 82:
				return MoKey.R;
			case 83:
				return MoKey.S;
			case 84:
				return MoKey.T;
			case 85:
				return MoKey.U;
			case 86:
				return MoKey.V;
			case 87:
				return MoKey.W;
			case 88:
				return MoKey.X;
			case 89:
				return MoKey.Y;
			case 90:
				return MoKey.Z;
			case 91:
				return MoKey.LWin;
			case 92:
				return MoKey.RWin;
			case 93:
				return MoKey.Apps;
			case 95:
				return MoKey.Sleep;
			case 96:
				return MoKey.NumPad0;
			case 97:
				return MoKey.NumPad1;
			case 98:
				return MoKey.NumPad2;
			case 99:
				return MoKey.NumPad3;
			case 100:
				return MoKey.NumPad4;
			case 101:
				return MoKey.NumPad5;
			case 102:
				return MoKey.NumPad6;
			case 103:
				return MoKey.NumPad7;
			case 104:
				return MoKey.NumPad8;
			case 105:
				return MoKey.NumPad9;
			case 106:
				return MoKey.Multiply;
			case 107:
				return MoKey.Add;
			case 108:
				return MoKey.Separator;
			case 109:
				return MoKey.Subtract;
			case 110:
				return MoKey.Decimal;
			case 111:
				return MoKey.Divide;
			case 112:
				return MoKey.F1;
			case 113:
				return MoKey.F2;
			case 114:
				return MoKey.F3;
			case 115:
				return MoKey.F4;
			case 116:
				return MoKey.F5;
			case 117:
				return MoKey.F6;
			case 118:
				return MoKey.F7;
			case 119:
				return MoKey.F8;
			case 120:
				return MoKey.F9;
			case 121:
				return MoKey.F10;
			case 122:
				return MoKey.F11;
			case 123:
				return MoKey.F12;
			case 124:
				return MoKey.F13;
			case 125:
				return MoKey.F14;
			case 126:
				return MoKey.F15;
			case 127:
				return MoKey.F16;
			case 128:
				return MoKey.F17;
			case 129:
				return MoKey.F18;
			case 130:
				return MoKey.F19;
			case 131:
				return MoKey.F20;
			case 132:
				return MoKey.F21;
			case 133:
				return MoKey.F22;
			case 134:
				return MoKey.F23;
			case 135:
				return MoKey.F24;
			case 144:
				return MoKey.NumLock;
			case 145:
				return MoKey.Scroll;
			case 161:
				return MoKey.RightShift;
			case 163:
				return MoKey.RightCtrl;
			case 165:
				return MoKey.RightAlt;
			case 166:
				return MoKey.BrowserBack;
			case 167:
				return MoKey.BrowserForward;
			case 168:
				return MoKey.BrowserRefresh;
			case 169:
				return MoKey.BrowserStop;
			case 170:
				return MoKey.BrowserSearch;
			case 171:
				return MoKey.BrowserFavorites;
			case 172:
				return MoKey.BrowserHome;
			case 173:
				return MoKey.VolumeMute;
			case 174:
				return MoKey.VolumeDown;
			case 175:
				return MoKey.VolumeUp;
			case 176:
				return MoKey.MediaNextTrack;
			case 177:
				return MoKey.MediaPreviousTrack;
			case 178:
				return MoKey.MediaStop;
			case 179:
				return MoKey.MediaPlayPause;
			case 180:
				return MoKey.LaunchMail;
			case 181:
				return MoKey.SelectMedia;
			case 182:
				return MoKey.LaunchApplication1;
			case 183:
				return MoKey.LaunchApplication2;
			case 188:
				return MoKey.Comma;
			case 190:
				return MoKey.Period;
			case 191:
				return MoKey.Slash;
			case 192:
				return MoKey.BackQuote;
			case 219:
				return MoKey.OpenBracket;
			case 220:
				return MoKey.BackSlash;
			case 221:
				return MoKey.CloseBracket;
			case 222:
				return MoKey.Quote;
			case 247:
				return MoKey.CrSel;
			case 248:
				return MoKey.ExSel;
			case 249:
				return MoKey.EraseEof;
			case 250:
				return MoKey.Play;
			case 251:
				return MoKey.Zoom;
		}
		
		return MoKey.None;
	},
	
	fromCharCode : function(charCode) {	
		switch(charCode)
		{
			case 48:
				return MoKey.D0;
			case 49:
				return MoKey.D1;
			case 50:
				return MoKey.D2;
			case 51:
				return MoKey.D3;
			case 52:
				return MoKey.D4;
			case 53:
				return MoKey.D5;
			case 54:
				return MoKey.D6;
			case 55:
				return MoKey.D7;
			case 56:
				return MoKey.D8;
			case 57:
				return MoKey.D9;
			case 59:
				return MoKey.SemiColon;
			case 65:
			case 97:
				return MoKey.A;
			case 66:
			case 98:
				return MoKey.B;
			case 67:
			case 99:
				return MoKey.C;
			case 68:
			case 100:
				return MoKey.D;
			case 69:
			case 101:
				return MoKey.E;
			case 70:
			case 102:
				return MoKey.F;
			case 71:
			case 103:
				return MoKey.G;
			case 72:
			case 104:
				return MoKey.H;
			case 73:
			case 105:
				return MoKey.I;
			case 74:
			case 106:
				return MoKey.J;
			case 75:
			case 107:
				return MoKey.K;
			case 76:
			case 108:
				return MoKey.L;
			case 77:
			case 109:
				return MoKey.M;
			case 78:
			case 110:
				return MoKey.N;
			case 79:
			case 111:
				return MoKey.O;
			case 80:
			case 112:
				return MoKey.P;
			case 81:
			case 113:
				return MoKey.Q;
			case 82:
			case 114:
				return MoKey.R;
			case 83:
			case 115:
				return MoKey.S;
			case 84:
			case 116:
				return MoKey.T;
			case 85:
			case 117:
				return MoKey.U;
			case 86:
			case 118:
				return MoKey.V;
			case 87:
			case 119:
				return MoKey.W;
			case 88:
			case 120:
				return MoKey.X;
			case 89:
			case 121:
				return MoKey.Y;
			case 90:
			case 122:
				return MoKey.Z;
			case 42:
				return MoKey.Multiply;
			case 43:
				return MoKey.Add;
			case 124:
				return MoKey.Separator;
			case 45:
				return MoKey.Subtract;
			case 46:
				return MoKey.Period;
			case 47:
				return MoKey.Divide;
			case 44:
				return MoKey.Comma;
			case 96:
				return MoKey.BackQuote;
			case 91:
				return MoKey.OpenBracket;
			case 92:
				return MoKey.BackSlash;
			case 93:
				return MoKey.CloseBracket;
			case 39:
				return MoKey.Quote;
		}
		
		return MoKey.None;
	},
	
	toKeyCode : function(key) {
		switch(key)
		{
			case MoKey.Cancel:
				return 3;
			case MoKey.Back:
				return 8;
			case MoKey.Tab:
				return 9;
			case MoKey.Clear:
				return 12;
			case MoKey.Enter:
				return 13;
			case MoKey.LeftShift:
				return 16;
			case MoKey.LeftCtrl:
				return 17;
			case MoKey.LeftAlt:
				return 18;
			case MoKey.Pause:
				return 19;
			case MoKey.CapsLock:
				return 20;
			case MoKey.Escape:
				return 27;
			case MoKey.Space:
				return 32;
			case MoKey.PageUp:
				return 33;
			case MoKey.PageDown:
				return 34;
			case MoKey.End:
				return 35;
			case MoKey.Home:
				return 36;
			case MoKey.Left:
				return 37;
			case MoKey.Up:
				return 38;
			case MoKey.Right:
				return 39;
			case MoKey.Down:
				return 40;
			case MoKey.Select:
				return 41;
			case MoKey.Print:
				return 42;
			case MoKey.Execute:
				return 43;
			case MoKey.PrintScreen:
				return 44;
			case MoKey.Insert:
				return 45;
			case MoKey.Delete:
				return 46;
			case MoKey.Help:
				return 47;
			case MoKey.D0:
				return 48;
			case MoKey.D1:
				return 49;
			case MoKey.D2:
				return 50;
			case MoKey.D3:
				return 51;
			case MoKey.D4:
				return 52;
			case MoKey.D5:
				return 53;
			case MoKey.D6:
				return 54;
			case MoKey.D7:
				return 55;
			case MoKey.D8:
				return 56;
			case MoKey.D9:
				return 57;
			case MoKey.SemiColon:
				return 59;
			case MoKey.A:
				return 65;
			case MoKey.B:
				return 66;
			case MoKey.C:
				return 67;
			case MoKey.D:
				return 68;
			case MoKey.E:
				return 69;
			case MoKey.F:
				return 70;
			case MoKey.G:
				return 71;
			case MoKey.H:
				return 72;
			case MoKey.I:
				return 73;
			case MoKey.J:
				return 74;
			case MoKey.K:
				return 75;
			case MoKey.L:
				return 76;
			case MoKey.M:
				return 77;
			case MoKey.N:
				return 78;
			case MoKey.O:
				return 79;
			case MoKey.P:
				return 80;
			case MoKey.Q:
				return 81;
			case MoKey.R:
				return 82;
			case MoKey.S:
				return 83;
			case MoKey.T:
				return 84;
			case MoKey.U:
				return 85;
			case MoKey.V:
				return 86;
			case MoKey.W:
				return 87;
			case MoKey.X:
				return 88;
			case MoKey.Y:
				return 89;
			case MoKey.Z:
				return 90;
			case MoKey.LWin:
				return 91;
			case MoKey.RWin:
				return 92;
			case MoKey.Apps:
				return 93;
			case MoKey.Sleep:
				return 95;
			case MoKey.NumPad0:
				return 96;
			case MoKey.NumPad1:
				return 97;
			case MoKey.NumPad2:
				return 98;
			case MoKey.NumPad3:
				return 99;
			case MoKey.NumPad4:
				return 100;
			case MoKey.NumPad5:
				return 101;
			case MoKey.NumPad6:
				return 102;
			case MoKey.NumPad7:
				return 103;
			case MoKey.NumPad8:
				return 104;
			case MoKey.NumPad9:
				return 105;
			case MoKey.Multiply:
				return 106;
			case MoKey.Add:
				return 107;
			case MoKey.Separator:
				return 108;
			case MoKey.Subtract:
				return 109;
			case MoKey.Decimal:
				return 110;
			case MoKey.Divide:
				return 111;
			case MoKey.F1:
				return 112;
			case MoKey.F2:
				return 113;
			case MoKey.F3:
				return 114;
			case MoKey.F4:
				return 115;
			case MoKey.F5:
				return 116;
			case MoKey.F6:
				return 117;
			case MoKey.F7:
				return 118;
			case MoKey.F8:
				return 119;
			case MoKey.F9:
				return 120;
			case MoKey.F10:
				return 121;
			case MoKey.F11:
				return 122;
			case MoKey.F12:
				return 123;
			case MoKey.F13:
				return 124;
			case MoKey.F14:
				return 125;
			case MoKey.F15:
				return 126;
			case MoKey.F16:
				return 127;
			case MoKey.F17:
				return 128;
			case MoKey.F18:
				return 129;
			case MoKey.F19:
				return 130;
			case MoKey.F20:
				return 131;
			case MoKey.F21:
				return 132;
			case MoKey.F22:
				return 133;
			case MoKey.F23:
				return 134;
			case MoKey.F24:
				return 135;
			case MoKey.NumLock:
				return 144;
			case MoKey.Scroll:
				return 145;
			case MoKey.RightShift:
				return 161;
			case MoKey.RightCtrl:
				return 163;
			case MoKey.RightAlt:
				return 165;
			case MoKey.BrowserBack:
				return 166;
			case MoKey.BrowserForward:
				return 167;
			case MoKey.BrowserRefresh:
				return 168;
			case MoKey.BrowserStop:
				return 169;
			case MoKey.BrowserSearch:
				return 170;
			case MoKey.BrowserFavorites:
				return 171;
			case MoKey.BrowserHome:
				return 172;
			case MoKey.VolumeMute:
				return 173;
			case MoKey.VolumeDown:
				return 174;
			case MoKey.VolumeUp:
				return 175;
			case MoKey.MediaNextTrack:
				return 176;
			case MoKey.MediaPreviousTrack:
				return 177;
			case MoKey.MediaStop:
				return 178;
			case MoKey.MediaPlayPause:
				return 179;
			case MoKey.LaunchMail:
				return 180;
			case MoKey.SelectMedia:
				return 181;
			case MoKey.LaunchApplication1:
				return 182;
			case MoKey.LaunchApplication2:
				return 183;
			case MoKey.Comma:
				return 188;
			case MoKey.Period:
				return 190;
			case MoKey.Slash:
				return 191;
			case MoKey.BackQuote:
				return 192;
			case MoKey.OpenBracket:
				return 219;
			case MoKey.BackSlash:
				return 220;
			case MoKey.CloseBracket:
				return 221;
			case MoKey.Quote:
				return 222;
			case MoKey.CrSel:
				return 247;
			case MoKey.ExSel:
				return 248;
			case MoKey.EraseEof:
				return 249;
			case MoKey.Play:
				return 250;
			case MoKey.Zoom:
				return 251;
		}
		
		return 0;
	}
};


//=====================================================================
//= MoKeyEvent.js
//=====================================================================

MoKeyEvent = Class.create(MoEvent, {
	initialize : function($super, type, key, isDown, isRepeat, modifierKeys, charCode, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, true));

		/** Boolean **/
		this.isDown = MoValueOrDefault(isDown, false);

		/** Boolean **/
		this.isUp = MoValueOrDefault(!isDown, false);

		/** Boolean **/
		this.isRepeat = MoValueOrDefault(isRepeat, false);

		/** Number **/
		this.keyCode = key;

		/** Number **/
		this.charCode = MoValueOrDefault(charCode, -1);

		/** MoKey **/
		this.key = (this.keyCode != 0 ? MoKey.fromKeyCode(this.keyCode) : MoKey.fromCharCode(this.charCode));

		/** MoModifierKeys **/
		this.modifierKeys = MoValueOrDefault(modifierKeys, MoModifierKeys.None);
	},

	getIsDown : function() {
		return this.isDown;
	},

	getIsUp : function() {
		return this.isUp;
	},
	
	getIsRepeat : function() {
		return this.isRepeat;
	},
	
	getKeyCode : function() {
		return this.keyCode;
	},

	getCharCode : function() {
		return this.charCode;
	},

	getKey : function() {
		return this.key;
	},
	
	getModifierKeys : function() {
		return this.modifierKeys;
	},
	
	getIsAltKeyDown : function() {
		return this.readModifierFlag(MoModifierKeys.Alt);
	},
	
	getIsControlKeyDown : function() {
		return this.readModifierFlag(MoModifierKeys.Control);
	},
	
	getIsShiftKeyDown : function() {
		return this.readModifierFlag(MoModifierKeys.Shift);
	},
	
	getIsMetaKeyDown : function() {
		return this.readModifierFlag(MoModifierKeys.Meta);
	},
	
	readModifierFlag : function(flag) {
		return ((this.modifierKeys & flag) == flag);
	},

	toString : function() {
		var keyStr = "None";

		for(var s in MoKey)
		{
			if(MoKey[s] == this.key)
			{
				keyStr = s;
				break;
			}
		}

		return String.format("KeyEvent[ keyCode=#{0}, charCode=#{1}, key=#{2}, altKeyDown=#{3}, ctrlKeyDown=#{4}, shiftKeyDown=#{5}, metaKeyDown=#{6}, isDown=#{7}, isRepeat=#{8}",
			this.keyCode, this.charCode, keyStr, this.getIsAltKeyDown(), this.getIsControlKeyDown(), this.getIsShiftKeyDown(), this.getIsMetaKeyDown(), this.getIsDown(), this.getIsRepeat());
	}
});

Object.extend(MoKeyEvent, {
	KEY_DOWN : "keyDown",
	KEY_UP : "keyUp",
	KEY_PRESS : "keyPress"
});



//=====================================================================
//= MoModifierKeys.js
//=====================================================================

MoModifierKeys = {
	"None"		: 0,
	"Alt"		: 1,
	"Control"	: 2,
	"Shift"		: 4,
	"Meta"		: 8,
	
	fromValues : function(alt, ctrl, shift, meta) {
		var bits = MoModifierKeys.None;
		
		if(alt)
			bits |= MoModifierKeys.Alt;
		
		if(ctrl)
			bits |= MoModifierKeys.Control;
		
		if(shift)
			bits |= MoModifierKeys.Shift;
		
		if(meta)
			bits |= MoModifierKeys.Meta;
		
		return bits;
	}
};


//=====================================================================
//= MoMouseButton.js
//=====================================================================

MoMouseButton = {
	"Unknown"	: 0,
	"Left"		: 1,
	"Right"		: 2,
	"Middle"	: 3,
	"XButton1"	: 4,
	"XButton2"	: 5
};



//=====================================================================
//= MoMouseEvent.js
//=====================================================================

MoMouseEvent = Class.create(MoEvent, {
	initialize : function($super, type, x, y, button, modifiers, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, false));

		this.modifiers = modifiers;
		this.isLeftButtonDown = (button == MoMouseButton.Left);
		this.isMiddleButtonDown = (button == MoMouseButton.Middle);
		this.isRightButtonDown = (button == MoMouseButton.Right);
		this.isXButton1Down = (button == MoMouseButton.XButton1);
		this.isXButton2Down = (button == MoMouseButton.XButton2);
		this.x = x;
		this.y = y;
		this.lastTarget = null;

		this.pos = new MoVector2D(this.x, this.y);
		this.localX = 0;
		this.localY = 0;
	},
	
	getModifierFlags : function() {
		return this.modifiers;
	},
	
	getModifierState : function(mkey) {
		return ((this.modifiers & mkey) != MoModifierKeys.None);
	},
	
	getIsAltDown : function() {
		return this.getModifierState(MoModifierKeys.Alt);
	},
	
	getIsCtrlDown : function() {
		return this.getModifierState(MoModifierKeys.Control);
	},
	
	getIsShiftDown : function() {
		return this.getModifierState(MoModifierKeys.Shift);
	},
	
	getIsMetaDown : function() {
		return this.getModifierState(MoModifierKeys.Meta);
	},
	
	getIsLeftButtonDown : function() {
		return this.isLeftButtonDown;
	},
	
	getIsRightButtonDown : function() {
		return this.isRightButtonDown;
	},
	
	getIsMiddleButtonDown : function() {
		return this.isMiddleButtonDown;
	},
	
	getIsXButton1Down : function() {
		return this.isXButton1Down;
	},
	
	getIsXButton2Down : function() {
		return this.isXButton2Down;
	},
	
	getX : function() {
		return this.x;
	},
	
	getY : function() {
		return this.y;
	},
	
	getLocalX : function() {
		if(!this.recomputeLocalPosition())
			return this.x;

		return this.localX;
	},
	
	getLocalY : function() {
		if(!this.recomputeLocalPosition())
			return this.y;
			
		return this.localY;
	},
	
	recomputeLocalPosition : function(target) {
		var target = this.currentTarget || this.target;
		
		if(MoIsNull(target))
		{
			this.lastTarget = null;
			return false;
		}

		if(target != this.lastTarget)
		{
			this.lastTarget = target;
			
			if(this.lastTarget.pointToLocal)
			{
				var pt = this.lastTarget.pointToLocal(this.pos);
				
				this.localX = pt.x;
				this.localY = pt.y;
			}
		}	
		
		return true;
	}
});

Object.extend(MoMouseEvent, {
	MOUSE_DOWN : "mouseDown",
	MOUSE_UP : "mouseUp",
	MOUSE_UP_OUTSIDE : "mouseUpOutside",
	MOUSE_ENTER : "mouseEnter",
	MOUSE_LEAVE : "mouseLeave",
	MOUSE_MOVE : "mouseMove",
	MOUSE_WHEEL : "mouseWheel",
	CLICK : "click",
	DOUBLE_CLICK : "doubleClick"
});


//=====================================================================
//= MoMouseButtonEvent.js
//=====================================================================

MoMouseButtonEvent = Class.create(MoMouseEvent, {
	initialize : function($super, type, button, pressed, x, y, clickCount, modifiers, bubbles, cancelable) {
		$super(type, x, y, button, modifiers, bubbles, cancelable);

		this.mouseButton = button;
		this.isDown = pressed;
		this.clickCount = MoValueOrDefault(clickCount, 1);
	}
});



//=====================================================================
//= MoMouseWheelDirection.js
//=====================================================================

MoMouseWheelDirection = {
	"Up" 	: 0,
	"Down" 	: 1
};



//=====================================================================
//= MoMouseWheelEvent.js
//=====================================================================

MoMouseWheelEvent = Class.create(MoMouseEvent, {
	initialize : function($super, type, delta, x, y, modifiers, bubbles, cancelable) {
		$super(type, x, y, MoMouseButton.Middle, modifiers, bubbles, cancelable);

		this.delta = delta;
		this.direction = (delta > 0 ? MoMouseWheelDirection.Down : MoMouseWheelDirection.Up);
	}
});


//=====================================================================
//= MoTouchPoint.js
//=====================================================================

MoTouchPoint = Class.create(MoEquatable, {
	initialize : function($super, id, sceneX, sceneY) {
		$super();
		
		this.id = id;
		this.sceneX = sceneX;
		this.sceneY = sceneY;
	},
	
	getId : function() {
		return this.id;
	},
	
	getSceneX : function() {
		return this.sceneX;
	},
	
	getSceneY : function() {
		return this.sceneY;
	},
	
	isEqualTo : function($super, other) {
		return ($super(other) &&
				 this.id == other.id &&
				 this.sceneX == other.sceneX &&
				 this.sceneY == other.sceneY);
	}
});


//=====================================================================
//= MoTouchEvent.js
//=====================================================================

MoTouchEvent = Class.create(MoEvent, {
	initialize : function($super, type, touchPoints, scale, rotation, bubbles, cancelable) {
		$super(type, MoValueOrDefault(bubbles, true), MoValueOrDefault(cancelable, true));

		this.points = touchPoints;
		this.scale = scale;
		this.rotation = rotation;
	},
	
	getScale : function() {
		return this.scale;
	},
	
	getRotation : function() {
		return this.rotation;
	},
	
	getAllTouches : function() {
		return this.points;
	}
});

Object.extend(MoTouchEvent, {
	TOUCH_START : "touchStart",
	TOUCH_END : "touchEnd",
	TOUCH_MOVE : "touchMove",
	TOUCH_CANCEL : "touchCancel"
});


//=====================================================================
//= MoInputManager.js
//=====================================================================

MoTouchTarget = Class.create(
// @PRIVATE 
{
	initialize : function(drawable) {
		this.drawable = drawable;
		this.points = [];
	}
});

MoNavigationSearchResult = Class.create(
// @PRIVATE
{
	initialize : function() {
		this.target = null;
		this.distance = null;
	}
});

// TODO : need to convert mouse/touch coordinates to local coordinates when dispatching the event to
//        that target

// TODO : need to hookup the following events/gestures for mobile
//          - tap        (analogous to single click)
//          - doubleTap  (analogous to double click)
//          - flick
//          - swipe
//          - pinch      (pinchIn / pinchOut)
//          - shake

MoInputManager = Class.create(MoEventDispatcher, 
// @PRIVATE 
{
	initialize : function(scene) {
		
		/** MoSurface **/
		this.target = scene;
		
		/** MoVector2D **/
		this.mousePosition = MoVector2D.Zero();
		
		/** MoDrawable **/
		this.mouseOverTarget = null;

		/** MoDrawable **/
		this.mouseTarget = null;
		
		/** MoDrawable **/
		this.focusTarget = null;
		
		/** Boolean **/
		this.hasMouse = false;
		
		this.touchPosition = MoVector2D.Zero();
		this.touchTargets = [];
		this.hasTouch = false;
		
		/** Number **/
		this.lastKeyDown = 0;
		this.lastKeyDownTime = 0;
		this.lastKeyPress = 0;
		this.lastKeyPressTime = 0;
		this.lastNavigationButton = 0;
		this.lastNavigationTime = 0;
		
		// register all the events we plan to receive
		this.registerEvents();
	},

	getTarget : function() {
		return this.target;
	},
	
	getFocusTarget : function() {
		return this.focusTarget;
	},

	unregisterEvents : function() {
		var canvas = this.getTarget().getNativeCanvas();
		
		canvas.removeEventListener("mousedown", this.handleMouseDown.asDelegate(this), false);
		canvas.removeEventListener("mouseup", this.handleMouseUp.asDelegate(this), false);
		canvas.removeEventListener("mousemove", this.handleMouseMove.asDelegate(this), false);
		canvas.removeEventListener("mouseover", this.handleMouseOver.asDelegate(this), false);
		canvas.removeEventListener("mouseout", this.handleMouseOut.asDelegate(this), false);
		canvas.removeEventListener("dblclick", this.handleDoubleClick.asDelegate(this), false);
		
		if(window.isNativeHost)
		{
			canvas.removeEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
		}
		else
		{
			if(MoIsIE())
			{
				canvas.removeEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
			}
			else if(MoIsFirefox())
			{
				//canvas.addEventListener("MozMousePixelScroll", this.handleMouseWheel.asDelegate(this), false);		
				canvas.removeEventListener("DOMMouseScroll", this.handleMouseWheel.asDelegate(this), false);
			}
		}
		
		canvas.removeEventListener("contextmenu", this.handleContextMenu.asDelegate(this), false);
		
		canvas.removeEventListener("touchstart", this.handleTouchStart.asDelegate(this), false);
		canvas.removeEventListener("touchend", this.handleTouchEnd.asDelegate(this), false);
		canvas.removeEventListener("touchmove", this.handleTouchMove.asDelegate(this), false);
		canvas.removeEventListener("touchcancel", this.handleTouchCancel.asDelegate(this), false);
		
		canvas.removeEventListener("gesturestart", this.handleGestureStart.asDelegate(this), false);
		canvas.removeEventListener("gesturechange", this.handleGestureChange.asDelegate(this), false);
		canvas.removeEventListener("gestureend", this.handleGestureEnd.asDelegate(this), false);
		
		window.removeEventListener("keydown", this.handleKeyDown.asDelegate(this), false);
		window.removeEventListener("keyup", this.handleKeyUp.asDelegate(this), false);
		window.removeEventListener("keypress", this.handleKeyDown.asDelegate(this), false);
	},
	
	registerEvents : function() {
		this.registerMouseEvents();
		this.registerKeyboardEvents();
		this.registerGamepadEvents();
	},
	
	registerMouseEvents : function() {
		var canvas = this.getTarget().getNativeCanvas();
		
		// we only want to listen to these events from the canvas, this will give
		// use greater control while handling multi-canvas applications
		canvas.addEventListener("mousedown", this.handleMouseDown.asDelegate(this), false);
		canvas.addEventListener("mouseup", this.handleMouseUp.asDelegate(this), false);
		canvas.addEventListener("mousemove", this.handleMouseMove.asDelegate(this), false);
		canvas.addEventListener("mouseover", this.handleMouseOver.asDelegate(this), false);
		canvas.addEventListener("mouseout", this.handleMouseOut.asDelegate(this), false);
		canvas.addEventListener("dblclick", this.handleDoubleClick.asDelegate(this), false);
		
		// TODO : see what the other browsers support for mouse wheel scrolling
		if(window.isNativeHost)
		{
			canvas.addEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
		}
		else
		{
			if(MoIsIE())
			{
				canvas.addEventListener("mousewheel", this.handleMouseWheel.asDelegate(this), false);
			}
			else if(MoIsFirefox())
			{
				// for firefox we need to use the special DOMMouseScroll event
				//canvas.addEventListener("MozMousePixelScroll", this.handleMouseWheel.asDelegate(this), false);		
				canvas.addEventListener("DOMMouseScroll", this.handleMouseWheel.asDelegate(this), false);
			}
		}
		
		canvas.addEventListener("contextmenu", this.handleContextMenu.asDelegate(this), false);
		
		canvas.addEventListener("touchstart", this.handleTouchStart.asDelegate(this), false);
		canvas.addEventListener("touchend", this.handleTouchEnd.asDelegate(this), false);
		canvas.addEventListener("touchmove", this.handleTouchMove.asDelegate(this), false);
		canvas.addEventListener("touchcancel", this.handleTouchCancel.asDelegate(this), false);
		
		canvas.addEventListener("gesturestart", this.handleGestureStart.asDelegate(this), false);
		canvas.addEventListener("gesturechange", this.handleGestureChange.asDelegate(this), false);
		canvas.addEventListener("gestureend", this.handleGestureEnd.asDelegate(this), false);
	},

	registerKeyboardEvents : function() {		
		window.addEventListener("keydown", this.handleKeyDown.asDelegate(this), false);
		window.addEventListener("keyup", this.handleKeyUp.asDelegate(this), false);
		window.addEventListener("keypress", this.handleKeyDown.asDelegate(this), false);
	},
	
	registerGamepadEvents : function() {
		var gp = MoGamepad.getInstance();
		
		gp.addEventHandler(MoGamepadButtonEvent.DOWN, this.handleGamepadButtonDown.d(this));
		gp.addEventHandler(MoGamepadButtonEvent.UP, this.handleGamepadButtonUp.d(this));
	},
	
	// TODO : need to implement a custom context menu and/or allowing the native context menu
	handleContextMenu : function(evt) {	
		//evt.preventDefault();
	},
	
	mouseButtonFromNativeButton : function(id) {
		switch(id)
		{
			case 0:
				return MoMouseButton.Left;
			case 1:
				return MoMouseButton.Middle;
			case 2:
				return MoMouseButton.Right;
		}
		
		return MoMouseButton.Unknown;
	},
	
	updateMousePosition : function(globalX, globalY) {
		var sourcePosition = this.getTarget().getAbsoluteSourcePosition();
		var sourceBounds = this.getTarget().getBounds();
		var actualPosition = new MoVector2D(globalX - sourcePosition.x, globalY - sourcePosition.y);
		
		this.hasMouse = sourceBounds.containsPoint(actualPosition);

		if(this.hasMouse)
		{
			this.mousePosition.x = actualPosition.x;
			this.mousePosition.y = actualPosition.y;
		}
	},
	
	updateTouchPosition : function(globalX, globalY) {
		var sourcePosition = this.getTarget().getAbsoluteSourcePosition();
		var sourceBounds = this.getTarget().getBounds();
		var actualPosition = new MoVector2D(globalX - sourcePosition.x, globalY - sourcePosition.y);
		
		this.hasTouch = sourceBounds.containsPoint(actualPosition);

		if(this.hasTouch)
		{
			this.touchPosition.x = actualPosition.x;
			this.touchPosition.y = actualPosition.y;
		}
	},
	
	getModifierKeysFromEvent : function(evt) {
		return MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey)
	},
	
	focus : function(target, isMouse) {
		isMouse = MoValueOrDefault(isMouse, false);

		// focus if we have moved to a new target drawable
		if(target != this.focusTarget)
		{
			if(!isMouse || (isMouse && !MoIsNull(target) && target.getIsMouseFocusEnabled()))
			{
				// focus out for the previously focused target
				if(!MoIsNull(this.focusTarget))
				{					
					// allow any listeners to cancel the event and keep focus, in which
					// case we simply bail out so the new target doesn't take focus
					if(!this.focusTarget.handleEvent(new MoEvent(MoEvent.FOCUS_OUT, false, true)))
						return;

					this.focusTarget.setIsFocused(false);
					this.focusTarget = null;
				}

				// focus in to the new target
				if(!MoIsNull(target))
				{
					// navigation zone's should not be allowed to receive focus directly
					// however, their children possibly can, so we need to see there is
					// a suitable target to take the focus
					if(target.getIsNavigationZone())
					{
						target = this.findFirstAvailableFocusTarget(target);
						
						// no suitable target to take focus, just abort
						if(MoIsNull(target))
							return;
					}
					
					this.focusTarget = target;
					
					// focus in on the target as long as the user didn't cancel
					if(this.focusTarget.handleEvent(new MoEvent(MoEvent.FOCUS_IN, false, true)))
						this.focusTarget.setIsFocused(true);
				}
			}
		}
	},

	handleMouseMove : function(evt) {

		var isMouseWithin = this.hasMouse;

		this.updateMousePosition(evt.clientX, evt.clientY);
		
		// there is no mouse captured and the new mouse position is not in
		// our canvas
		if(!isMouseWithin && !this.hasMouse)
			return;
		
		// get the hit test object
		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if(hitTestResult != null)
		{
			if(hitTestResult != this.mouseOverTarget)
			{
				if(this.mouseOverTarget != null)
					this.mouseOverTarget.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));

				hitTestResult.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_ENTER, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
			}
		
			this.mouseOverTarget = hitTestResult;

			hitTestResult.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_MOVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
		}
		else if(this.mouseOverTarget != null)
		{
			this.mouseOverTarget.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
			this.mouseOverTarget = null;
		}
	},

	handleMouseDown : function(evt) {

		this.updateMousePosition(evt.clientX, evt.clientY);

		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if(hitTestResult != null)
		{
			hitTestResult.handleEvent(new MoMouseButtonEvent(MoMouseEvent.MOUSE_DOWN, this.mouseButtonFromNativeButton(evt.button), true, this.mousePosition.x, this.mousePosition.y, 1, this.getModifierKeysFromEvent(evt)));
			
			this.mouseTarget = hitTestResult;
			this.focus(this.mouseTarget);
		}
	},

	handleMouseUp : function(evt) {
		this.updateMousePosition(evt.clientX, evt.clientY);
		
		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if(this.mouseTarget != null)
		{
			if(this.mouseTarget == hitTestResult)
			{
				hitTestResult.handleEvent(new MoMouseButtonEvent(MoMouseEvent.MOUSE_UP, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 0, this.getModifierKeysFromEvent(evt)));
				hitTestResult.handleEvent(new MoMouseButtonEvent(MoMouseEvent.CLICK, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 1, this.getModifierKeysFromEvent(evt)));
			}
			else
			{
				
				this.mouseTarget.handleEvent(new MoMouseButtonEvent(MoMouseEvent.MOUSE_UP_OUTSIDE, this.mouseButtonFromNativeButton(evt.button), false, this.mousePosition.x, this.mousePosition.y, 0, this.getModifierKeysFromEvent(evt)));
			}
		}

		this.mouseTarget = null;
	},
	
	handleMouseOver : function(evt) {
		this.getTarget().handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_ENTER, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
	},
	
	handleMouseOut : function(evt) {
		if(this.mouseOverTarget != null)
			this.mouseOverTarget.handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
	
		// the mouse has left the canvas, fire off an event to the target scene
		// and reset all our current mouse info, since we no longer care about any
		// mouse events.
		this.getTarget().handleEvent(new MoMouseEvent(MoMouseEvent.MOUSE_LEAVE, this.mousePosition.x, this.mousePosition.y, this.mouseButtonFromNativeButton(evt.button), this.getModifierKeysFromEvent(evt)));
		
		this.hasMouse = false;
		this.mouseTarget = null;
		this.mouseOverTarget = null;
	},
	
	handleDoubleClick : function(evt) {
	
		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);

		if(hitTestResult != null)
			hitTestResult.handleEvent(new MoMouseButtonEvent(MoMouseEvent.DOUBLE_CLICK, this.mouseButtonFromNativeButton(evt.button), true, this.mousePosition.x, this.mousePosition.y, 2, this.getModifierKeysFromEvent(evt)));
	},

	handleMouseWheel : function(evt) {

		if(!this.hasMouse)
			return;

		var hitTestResult = this.getTarget().hitTest(this.mousePosition.x, this.mousePosition.y);
		
		if(hitTestResult != null)
		{
			// TODO : update the delta calculation when pixel scrolling is implemented

			var scrollDelta = (evt.wheelDelta ? evt.wheelDelta : evt.detail);

			if(scrollDelta > 100 || scrollDelta < -100)
				scrollDelta /= -150;
			
			var delta = scrollDelta;
			
			if(delta != 0)
				delta = Math.abs(delta) / delta;
			
			delta = Math.min((Math.abs(scrollDelta) / 100), 1) * delta;
			
			hitTestResult.handleEvent(new MoMouseWheelEvent(MoMouseEvent.MOUSE_WHEEL, delta, this.mousePosition.x, this.mousePosition.y, this.getModifierKeysFromEvent(evt)));
		}
	},
	
	handleKeyDown : function(evt) {
		var keyEvent = null;
		var isSameKey = false;
		var isRepeat = false;
			
		if(evt.type == "keydown")
		{
			isSameKey = (evt.keyCode == this.lastKeyDown);
			isRepeat = (isSameKey && ((evt.timeStamp - this.lastKeyDownTime) <= 50));
		}
			
		// it's possible that the focus target might not 
		// have focus anymore if the user toggled it off
		if(!MoIsNull(this.focusTarget) && this.focusTarget.getIsFocused())
		{
			// fire key down event
			if(evt.type == "keydown")
			{
				keyEvent = new MoKeyEvent(MoKeyEvent.KEY_DOWN, evt.keyCode, true, isRepeat, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1);

				this.focusTarget.handleEvent(keyEvent);
			}

			// fire key press event
			if(evt.type == "keypress")
			{
				isSameKey = (evt.charCode == this.lastKeyPress);
				isRepeat = (isSameKey && ((evt.timeStamp - this.lastKeyPressTime) <= 50));
				keyEvent = new MoKeyEvent(MoKeyEvent.KEY_PRESS, evt.keyCode, true, isRepeat, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey));

				this.focusTarget.handleEvent(keyEvent);
			}
		}

		if(evt.type == "keydown")
		{
			this.lastKeyDown = evt.keyCode;
			this.lastKeyDownTime = evt.timeStamp;
			
			var key = MoKey.fromKeyCode(evt.keyCode);
			
			if((MoIsNull(keyEvent) || (!MoIsNull(keyEvent) && !keyEvent.getIsDefaultPrevented())) && this.isNavigationKey(key))
				this.processKeyboardNavigationEvent(key);

			// always send to application
			if(!MoApplication.getInstance().dispatchEvent(new MoKeyEvent(MoKeyEvent.KEY_DOWN, evt.keyCode, true, isRepeat, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1)))
			{
				evt.preventDefault();
				return;
			}
		}

		if(evt.type == "keypress")
		{
			this.lastKeyPress = evt.charCode;
			this.lastKeyPressTime = evt.timeStamp;
		}

		if(keyEvent != null && keyEvent.getIsDefaultPrevented())
			evt.preventDefault();
	},

	handleKeyUp : function(evt) {
		// it's possible that the focus target might not 
		// have focus anymore if the user toggled it off
		if(!MoIsNull(this.focusTarget) && this.focusTarget.getIsFocused())
			this.focusTarget.handleEvent(new MoKeyEvent(MoKeyEvent.KEY_UP, evt.keyCode, false, false, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1));
			
		// always send to application
		MoApplication.getInstance().dispatchEvent(new MoKeyEvent(MoKeyEvent.KEY_UP, evt.keyCode, false, false, MoModifierKeys.fromValues(evt.altKey, evt.ctrlKey, evt.shiftKey, evt.metaKey), -1));
	},

	handleGamepadButtonDown : function(e) {
		if(!MoIsNull(this.focusTarget) && this.focusTarget.getIsFocused())
		{
			var evt = new MoGamepadButtonEvent(MoGamepadButtonEvent.DOWN, e.getIndex(), e.getButton(), e.getIsDown(), e.getTimestamp(), true, true);
			
			this.focusTarget.handleEvent(evt);
			
			if(evt.getIsDefaultPrevented())
				return;
		}

		// check if the event came from the current input gamepad
		// and try to process and navigation
		if(e.getIndex() == MoGamepad.getInputIndex() && this.isNavigationButton(e.getButton()))
		{
			if(this.lastNavigationTime == 0 || (e.getTimestamp() - this.lastNavigationTime > 100))
			{
				this.lastNavigationTime = e.getTimestamp();
				this.lastNavigationButton = e.getButton();
				
				this.processGamepadNavigationEvent(e);
			}
		}
	},
	
	handleGamepadButtonUp : function(e) {
		if(this.focusTarget == null)
			return;

		// just pass the event directly through, however, in the future we may want/need
		// to change this to support repeating flags, timing, etc...
		if(this.focusTarget.getIsFocused())
			this.focusTarget.handleEvent(new MoGamepadButtonEvent(MoGamepadButtonEvent.UP, e.getIndex(), e.getButton(), e.getIsDown(), e.getTimestamp(), true));
	},

	processGamepadNavigationEvent : function(e) {
		switch(e.getButton())
		{
			case MoGamepadButtons.DPadUp:
			case MoGamepadButtons.LeftStickUp:
				this.processNavigationEvent(MoNavigationDirection.Up);
				break;
			case MoGamepadButtons.DPadDown:
			case MoGamepadButtons.LeftStickDown:
				this.processNavigationEvent(MoNavigationDirection.Down);
				break;
			case MoGamepadButtons.DPadLeft:
			case MoGamepadButtons.LeftStickLeft:
				this.processNavigationEvent(MoNavigationDirection.Left);
				break;
			case MoGamepadButtons.DPadRight:
			case MoGamepadButtons.LeftStickRight:
				this.processNavigationEvent(MoNavigationDirection.Right);
				break;
		}
	},

	processKeyboardNavigationEvent : function(key) {
		switch(key)
		{
			case MoKey.Up:
				this.processNavigationEvent(MoNavigationDirection.Up);
				break;
			case MoKey.Down:
				this.processNavigationEvent(MoNavigationDirection.Down);
				break;
			case MoKey.Left:
				this.processNavigationEvent(MoNavigationDirection.Left);
				break;
			case MoKey.Right:
				this.processNavigationEvent(MoNavigationDirection.Right);
				break;
		}
	},
	
	processNavigationEvent : function(direction) {
		var navEnterEvent = null;
		var navLeaveEvent = null;
		var currentFocusTarget = this.focusTarget;
		var currentNavigationZone = (MoIsNull(currentFocusTarget) ? null : currentFocusTarget.getNavigationZone());

		// try to find the first available navigation zone if the current 
		// focus target does not have one or if there is no focus target
		if(MoIsNull(currentFocusTarget) || MoIsNull(currentNavigationZone))
			currentNavigationZone = this.findFirstNavigationZone(this.target);

		// unable to find a suitable navigation zone to search in
		if(MoIsNull(currentNavigationZone))
			return;

		// we do not yet have a focus target to use as a search
		// reference, so try and find the first one available in
		// the navigation zone
		if(MoIsNull(currentFocusTarget))
		{
			currentFocusTarget = this.findFirstAvailableFocusTarget(currentNavigationZone);
			
			// still unable to find a focus target, so just focus on the navigation
			// zone and let it handle input events
			if(MoIsNull(currentFocusTarget))
				currentFocusTarget = currentNavigationZone;

			this.navigate(direction, this.focusTarget, currentFocusTarget);
			return;
		}

		// otherwise, try to move focus in the requested direction
		var navigationMode = currentFocusTarget.getNavigationMode();
		var navigationDirectionNormal = MoVector2D.Zero();
		
		switch(direction)
		{
			case MoNavigationDirection.Up:
				navigationDirectionNormal.y = -1;
				break;
			case MoNavigationDirection.Down:
				navigationDirectionNormal.y = 1;
				break;
			case MoNavigationDirection.Left:
				navigationDirectionNormal.x = -1;
				break;
			case MoNavigationDirection.Right:
				navigationDirectionNormal.x = 1;
				break;
		}

		// search for the next target that can take focus
		var searchResult = this.findNextFocusTarget(currentFocusTarget, currentNavigationZone, direction, navigationDirectionNormal, navigationMode);
		
		// if the search found a suitable target, then focus on it
		this.navigate(direction, this.focusTarget, searchResult.target);
	},

	navigate : function(direction, targetFrom, targetTo) {
		// send a leave event to the current target
		if(!MoIsNull(targetFrom))
		{
			var navLeaveEvent = new MoNavigationEvent(MoNavigationEvent.LEAVE, direction, targetFrom, targetTo, true, true);

			// allow the navigation to be cancelled
			if(!targetFrom.handleEvent(navLeaveEvent))
				return false;
		}

		if(!MoIsNull(targetTo))
		{
			// then an enter event to the new target
			var navEnterEvent = new MoNavigationEvent(MoNavigationEvent.ENTER, direction, targetFrom, targetTo, true, true);

			// also check if it was cancelled, this will still allow listeners
			// to focus or run other custom navigation rules without auto-focusing
			if(!targetTo.handleEvent(navEnterEvent))
				return false;

			targetTo.focus();
		}

		return true;
	},

	findNextFocusTarget : function(focusReference, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode) {		
		var searchResult = new MoNavigationSearchResult();
		var referencePosition = this.getNavigationPositionForDirection(focusReference, navigationDirection);

		// run the search
		this.findNextFocusTargetImpl(focusReference, referencePosition, searchResult, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode);

		// no target was found, the last step is to go to the navigation
		// zone above the current and see if there is a sibling that has
		// a suitable target to take focus, otherwise no change in focus
 		if(MoIsNull(searchResult.target))
		{		
			var nextSearchTarget = searchTarget.getNavigationZone(false);
			var nextNavigationZone = null;

			// unable to find any suitable target to focus on to
			if(MoIsNull(nextSearchTarget))
				return searchResult;

			// reset search result
			searchResult.distance = null;
			searchResult.target = null;

			// set our reference point to the navigation zone
			referencePosition = this.getNavigationPositionForDirection(searchTarget, navigationDirection);

			// search only the zone's first level children
			for(var i = 0, len = nextSearchTarget.getCount(); i < len; ++i)
			{
				var c = nextSearchTarget.getAt(i);
				
				// exclude the existing search target since we
				// have already exhausted all possiblities from it
				if(c == searchTarget)
					continue;
				
				// make sure there is a suitable focus target
				var firstAvailableTarget = this.findFirstAvailableFocusTarget(c);
				
				if(firstAvailableTarget == null)
					continue;
				
				// check if the zone is in the right direction
				var position = this.getNavigationPositionForDirection(c, this.getOppositeNavigationDirection(navigationDirection));
				var distance = position.distance(referencePosition);
				var direction = position.subtract(referencePosition);

				direction.normalize();

				if((MoIsNull(searchResult.distance) || distance < searchResult.distance) && ((direction.x * navigationDirectionNormal.x) > 0 || (direction.y * navigationDirectionNormal.y) > 0))
				{
					if (navigationMode == MoNavigationMode.Normal || (navigationMode == MoNavigationMode.Constrain && nextSearchTarget.getParent() == searchTarget.getParent()))
					{
						// found one... update our search result
						nextNavigationZone = c;
						
						searchResult.target = firstAvailableTarget;
						searchResult.distance = distance;
					}
				}
			}
		}
		
		return searchResult;
	},
	
	findNextFocusTargetImpl : function(focusReference, referencePosition, searchResult, searchTarget, navigationDirection, navigationDirectionNormal, navigationMode) {
		// only visible containers can be searched
		if(MoIsNull(searchTarget) || !searchTarget.getVisible())
			return;
	
		// must not be the current focused element, must be visible and must have navigation focus enabled
		// to be considered a target candidate
		if(searchTarget != focusReference && searchTarget.getIsNavigationFocusEnabled())
		{
			// check if the target is in the right direction
			var position = this.getNavigationPositionForDirection(searchTarget, this.getOppositeNavigationDirection(navigationDirection));
			var distance = position.distance(referencePosition);
			var direction = position.subtract(referencePosition);
			
			direction.normalize();

			if((MoIsNull(searchResult.distance) || distance < searchResult.distance) && ((direction.x * navigationDirectionNormal.x) > 0 || (direction.y * navigationDirectionNormal.y) > 0))
			{
				if (navigationMode == MoNavigationMode.Normal || (navigationMode == MoNavigationMode.Constrain && searchTarget.getParent() == focusReference.getParent()))
				{
					searchResult.target = searchTarget;
					searchResult.distance = distance;
				}
			}
		}

		// keep going until the entire tree has been searched
		for(var i = 0, len = searchTarget.getCount(); i < len; ++i)
			this.findNextFocusTargetImpl(focusReference, referencePosition, searchResult, searchTarget.getAt(i), navigationDirection, navigationDirectionNormal, navigationMode);
	},
	
	findFirstAvailableFocusTarget : function(searchTarget) {
		if(!MoIsNull(searchTarget) && searchTarget.getVisible() && searchTarget.getIsNavigationFocusEnabled())
			return searchTarget;

		for(var i = 0, len = searchTarget.getCount(); i < len; ++i)
		{
			var target = this.findFirstAvailableFocusTarget(searchTarget.getAt(i));

			if(!MoIsNull(target))
				return target;
		}

		return null;
	},

	findFirstNavigationZone : function(searchTarget) {
		if(!MoIsNull(searchTarget) && searchTarget.getVisible() && searchTarget.getIsNavigationZone())
			return searchTarget;

		for(var i = 0, len = searchTarget.getCount(); i < len; ++i)
		{
			var target = this.findFirstNavigationZone(searchTarget.getAt(i));

			if(!MoIsNull(target))
				return target;
		}

		return null;
	},
	
	getOppositeNavigationDirection : function(direction) {
		switch(direction)
		{
			case MoNavigationDirection.Up:
				return MoNavigationDirection.Down;
			case MoNavigationDirection.Down:
				return MoNavigationDirection.Up;
			case MoNavigationDirection.Left:
				return MoNavigationDirection.Right;
			case MoNavigationDirection.Right:
				return MoNavigationDirection.Left;
		}
	},
	
	getNavigationPositionForDirection : function(target, direction) {
		var width = target.getWidth();
		var height = target.getHeight();
		var position = target.pointToGlobal(MoVector2D.Zero());

		switch(direction)
		{
			case MoNavigationDirection.Down:
				position.y += (height * 0.5);
				break;
			case MoNavigationDirection.Right:
				position.x += (width * 0.5);
				break;
		}

		return position;
	},

	isNavigationButton : function(button) {
		return (button == MoGamepadButtons.DPadUp || 
				button == MoGamepadButtons.DPadDown || 
				button == MoGamepadButtons.DPadLeft ||
				button == MoGamepadButtons.DPadRight ||
				button == MoGamepadButtons.LeftStickUp ||
				button == MoGamepadButtons.LeftStickDown ||
				button == MoGamepadButtons.LeftStickLeft ||
				button == MoGamepadButtons.LeftStickRight);
	},

	isNavigationKey : function(key) {
		return (key == MoKey.Down ||
				key == MoKey.Up ||
				key == MoKey.Left ||
				key == MoKey.Right);
	},

	handleTouchStart : function(evt) {
		var touches = evt.changedTouches;
		var touch = null;
		var len = touches.length;
		var targets = [];
		
		// determine which drawables have been touched
		for(var i = 0; i < len; ++i)
		{
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);
			
			// the touch exists within our scene
			if(this.hasTouch)
			{
				// determine which drawable has been hit
				var hitTestResult = this.getTarget().hitTest(this.touchPosition.x, this.touchPosition.y);
				
				if(hitTestResult != null)
				{
					// we'll need to store this target so we can track
					// it later during move/end events
					if(!this.touchTargets.contains(hitTestResult))
						this.touchTargets.push(hitTestResult);

					// add the touch id
					hitTestResult.touches.push(touch.identifier);
					
					// add the touch info to our targets
					this.addTouchPointToTarget(targets, hitTestResult, new MoTouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
				}
			}
		}
		
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		// now we can send an event to each of the
		// target drawables found
		len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var target = targets[i];
			
			if(!target.drawable.handleEvent(new MoTouchEvent(MoTouchEvent.TOUCH_START, target.points, evt.scale, evt.rotation)))
				cancelEvent = true;
		}

		// stop the device from processing the native touch event
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleTouchEnd : function(evt) {
		var touches = evt.changedTouches;
		var touch = null;
		var len = touches.length;
		var targets = [];
		
		// determine which drawables have been touched
		for(var i = 0; i < len; ++i)
		{
			touch = touches[i];
			
			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);
			
			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			var target = this.findTouchTarget(touch.identifier, true);
			
			if(target == null)
				continue;
			
			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new MoTouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}
		
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		// now we can send an event to each of the
		// target drawables found
		len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var target = targets[i];
			
			// if the drawable doesn't contain anymore touches
			// then we must remove it from the global target list
			if(target.drawable.touches.length == 0)
				this.touchTargets.remove(target.drawable);

			if(!target.drawable.handleEvent(new MoTouchEvent(MoTouchEvent.TOUCH_END, target.points, evt.scale, evt.rotation)))
				cancelEvent = true;
		}
		
		// stop the device from processing the native touch event
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleTouchMove : function(evt) {
		var touches = evt.changedTouches;
		var touch = null;
		var len = touches.length;
		var targets = [];
		
		// determine which drawables have been touched
		for(var i = 0; i < len; ++i)
		{
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);
			
			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			var target = this.findTouchTarget(touch.identifier, false);
			
			if(target == null)
				continue;
			
			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new MoTouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}
		
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		// now we can send an event to each of the
		// target drawables found
		len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var target = targets[i];

			if(!target.drawable.handleEvent(new MoTouchEvent(MoTouchEvent.TOUCH_MOVE, target.points, evt.scale, evt.rotation)))
				cancelEvent = true;
		}
		
		// stop the device from processing the native touch event
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleTouchCancel : function(evt) {
		var touches = evt.changedTouches;
		var touch = null;
		var len = touches.length;
		var targets = [];
		
		// determine which drawables have been touched
		for(var i = 0; i < len; ++i)
		{
			touch = touches[i];

			// update the touch position to local scene coordinates
			this.updateTouchPosition(touch.clientX, touch.clientY);
			
			// see if we have a target for the given identifier, otherwise
			// we don't have anything to do, this would most likely never
			// occur but just in case
			var target = this.findTouchTarget(touch.identifier, true);
			
			if(target == null)
				continue;
			
			// add the touch info to our target list
			this.addTouchPointToTarget(targets, target, new MoTouchPoint(touch.identifier, this.touchPosition.x, this.touchPosition.y));
		}
		
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		// now we can send an event to each of the
		// target drawables found
		len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var target = targets[i];
			
			// if the drawable doesn't contain anymore touches
			// then we must remove it from the global target list
			if(target.drawable.touches.length == 0)
				this.touchTargets.remove(target.drawable);

			if(!target.drawable.handleEvent(new MoTouchEvent(MoTouchEvent.TOUCH_CANCEL, target.points, evt.scale, evt.rotation)))
				cancelEvent = true;
		}
		
		// stop the device from processing the native touch event
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleGestureStart : function(evt) {
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		if(!this.getTarget().handleEvent(new MoGestureEvent(MoGestureEvent.GESTURE_START, evt.rotation, evt.scale)))
			cancelEvent = true;
		
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleGestureChange : function(evt) {
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		if(!this.getTarget().handleEvent(new MoGestureEvent(MoGestureEvent.GESTURE_CHANGE, evt.rotation, evt.scale)))
			cancelEvent = true;
		
		if(cancelEvent)
			evt.preventDefault();
	},
	
	handleGestureEnd : function(evt) {
		var cancelEvent = !MoApplication.getInstance().getEnableNativeGestures();
		
		if(!this.getTarget().handleEvent(new MoGestureEvent(MoGestureEvent.GESTURE_END, evt.rotation, evt.scale)))
			cancelEvent = true;
		
		if(cancelEvent)
			evt.preventDefault();
	},
	
	addTouchPointToTarget : function(targets, drawable, point) {
		var len = targets.length;
		
		for(var i = 0; i < len; ++i)
		{
			var touchTarget = targets[i];
			
			if(touchTarget.drawable == drawable)
			{
				touchTarget.points.push(point);
				return;
			}
		}
		
		var touchTarget = new MoTouchTarget(drawable);
		touchTarget.points.push(point);
		targets.push(touchTarget);
	},
	
	findTouchTarget : function(id, doRemove) {
		var len = this.touchTargets.length;
		var target = null;
		
		for(var i = 0; i < len; ++i)
		{
			target = this.touchTargets[i];
			
			for(var j = 0; j < target.touches.length; ++j)
			{
				if(target.touches[j] == id)
				{
					if(doRemove)
						target.touches.removeAt(j);
					
					return target;
				}
			}
		}
		
		return null;
	}
});



//=====================================================================
//= MoLayoutManager.js
//=====================================================================

MoLayoutBin = Class.create(
// @PRIVATE 
{
	initialize : function() {
		this.items = new MoDictionary();
		this.length = 0;
	}
});

MoLayoutPriorityQueue = Class.create(
// @PRIVATE 
{
	initialize : function() {
		this.priorityBins = new Array();
		this.minPriority = 0;
		this.maxPriority = -1;
	},
	
	addObject : function(obj, priority) {

		//console.log("MoLayoutManager: adding object (" + obj.name + ")");
	
        // Update our min and max priorities.
        if (this.maxPriority < this.minPriority)
        {
            this.minPriority = this.maxPriority = priority;
        }
        else
        {
            if (priority < this.minPriority)
                this.minPriority = priority;

            if (priority > this.maxPriority)
                this.maxPriority = priority;
        }

        var bin = this.priorityBins[priority];
        
        if (bin == null)
        {
            // If no hash exists for the specified priority, create one.
            bin = new MoLayoutBin();
            this.priorityBins[priority] = bin;
            bin.items.set(obj, true);
            bin.length++;
        }
        else
        {
            // If we don't already hold the obj in the specified hash, add it
            // and update our item count.
            if (bin.items.get(obj) == null)
            {
                bin.items.set(obj, true);
                bin.length++;
            }
        }
	},
	
	removeLargest : function() {
        var obj = null;

		//console.log("MoLayoutManager: removeLargest");
		
        if (this.minPriority <= this.maxPriority)
        {
            var bin = this.priorityBins[this.maxPriority];
			
            while (bin == null || bin.length == 0)
            {
                this.maxPriority--;
				
                if (this.maxPriority < this.minPriority)
                    return null;
					
                bin = this.priorityBins[this.maxPriority];
            }
        
            // Remove the item with largest priority from our priority queue.
            // Must use a for loop here since we're removing a specific item
            // from a 'Dictionary' (no means of directly indexing).
			var keys = bin.items.getKeys();
			
			for(var i = 0; i < keys.length; ++i)
			{
				obj = keys[i];
				this.removeChild(obj, this.maxPriority);
				break;
			}

            // Update maxPriority if applicable.
            while (bin == null || bin.length == 0)
            {
                this.maxPriority--;
				
                if (this.maxPriority < this.minPriority)
                    break;
					
                bin = this.priorityBins[this.maxPriority];
            }
            
        }
        
        return obj;
	},
	
	removeLargestChild : function(client) {
        var max = this.maxPriority;
        var min = client.getDepth();

		//console.log("MoLayoutManager: removeLargestChild (" + client.name + ")");
		
        while (min <= max)
        {
            var bin = this.priorityBins[max];
			
            if (bin != null && bin.length > 0)
            {
                if (max == client.getDepth())
                {
                    // If the current level we're searching matches that of our
                    // client, no need to search the entire list, just check to see
                    // if the client exists in the queue (it would be the only item
                    // at that nestLevel).
                    if (bin.items.get(client) != null)
                    {
                        this.removeChild(client, max);
						
                        return client;
                    }
                }
                else
                {
					var keys = bin.items.getKeys();
					var key = null;
					
					for(var i = 0; i < keys.length; ++i)
					{
						key = keys[i];
						
						if(this.contains(client, key))
						{
							this.removeChild(key, max);
							return key;
						}
					}
                }
                
                max--;
            }
            else
            {
                if (max == this.maxPriority)
                    this.maxPriority--;
					
                max--;
				
                if (max < min)
                    break;
            }           
        }

        return null;
	},
	
	removeSmallest : function() {
        var obj = null;

		//console.log("MoLayoutManager: removeSmallest");
		
        if (this.minPriority <= this.maxPriority)
        {
            var bin = this.priorityBins[this.minPriority];
			
            while (bin == null || bin.length == 0)
            {
                this.minPriority++;
				
                if (this.minPriority > this.maxPriority)
                    return null;
					
                bin = this.priorityBins[this.minPriority];
            }           

            // Remove the item with smallest priority from our priority queue.
            // Must use a for loop here since we're removing a specific item
            // from a 'Dictionary' (no means of directly indexing).

			var keys = bin.items.getKeys();

			obj = keys[0];
			this.removeChild(obj, this.minPriority);

            // Update minPriority if applicable.
            while (bin == null || bin.length == 0)
            {
                this.minPriority++;
				
                if (this.minPriority > this.maxPriority)
                    break;

                bin = this.priorityBins[this.minPriority];
            }           
        }

        return obj;
	},
	
	removeSmallestChild : function(client) {
        var min = client.getDepth();

		//console.log("MoLayoutManager: removeSmallestChild (" + client.name + ")");
		
        while (min <= this.maxPriority)
        {
            var bin = this.priorityBins[min];
			
            if (bin != null && bin.length > 0)
            {   
                if (min == client.getDepth())
                {
                    // If the current level we're searching matches that of our
                    // client, no need to search the entire list, just check to see
                    // if the client exists in the queue (it would be the only item
                    // at that nestLevel).
                    if (bin.items.get(client) != null)
                    {
                        this.removeChild(client, min);
                        return client;
                    }
                }
                else
                {
					var keys = bin.items.getKeys();
					var key = null;
					
					for(var i = 0; i < keys.length; ++i)
					{
						key = keys[i];
						
						if(this.contains(client, key))
						{
							this.removeChild(key, min);
							return key;
						}
					}
                }
                
                min++;
            }
            else
            {
                if (min == this.minPriority)
                    this.minPriority++;
					
                min++;
				
                if (min > this.maxPriority)
                    break;
            }           
        }
        
        return null;
	},
	
	removeChild : function(client, level) {
		level = MoValueOrDefault(level, -1);
		
		//console.log("MoLayoutManager: removeChild (" + client.name + ")");
		
        var priority = (level >= 0) ? level : client.getDepth();
        var bin = this.priorityBins[priority];

        if (bin != null && bin.items.get(client) != null)
        {
			bin.items.remove(client);
            bin.length--;
			
            return client;
        }
		
        return null;
	},
	
	removeAll : function() {
        this.priorityBins = [];
        this.minPriority = 0;
        this.maxPriority = -1;
	},
	
	isEmpty : function() {
		return (this.minPriority > this.maxPriority);
	},
	
	contains : function(parent, child) {
		return parent.exists(child);
	}
});

MoLayoutManager = Class.create(MoEventDispatcher, 
// @PRIVATE 
{
	initialize : function($super) {
		$super();
		
		/** holds the drawables that have been processed and are
			pending an update notification **/
		this.pendingUpdateQueue = new MoLayoutPriorityQueue();	
		
		/** holds the level of the current drawable that is
			being validated by the validateDrawableNow call, this
			is used for nested validation calls. during an immediate
			validation we only want drawables at this level or deeper
			to be re-queued **/
		this.currentDepth = MoMaxInt;

		/** holds the drawables that have had their properties
			invalidated and are awaiting validation **/
		this.propertiesQueue = new MoLayoutPriorityQueue();
		
		/** holds the drawables that have had their measurements
			invalidated and are awaiting validation **/
		this.measureQueue = new MoLayoutPriorityQueue();
		
		/** holds the drawables that have had their layout 
			invalidated and are awaiting validation **/
		this.layoutQueue = new MoLayoutPriorityQueue();
		
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
	},
	
	invalidateProperties : function(drawable) {		

		//console.log("MoLayoutManager: invalidateProperties (" + drawable.name + ")");
	
		if(!this.arePropertiesInvalid)
		{
			this.arePropertiesInvalid = true;
			this.registerListeners();
		}
		
		if(this.currentDepth <= drawable.getDepth())
			this.arePropertiesInvalidNow = true;
		
		this.propertiesQueue.addObject(drawable, drawable.getDepth());
	},
	
	requestMeasure : function(drawable) {
		//console.log("MoLayoutManager: requestMeasure (" + drawable.name + ")");
		
		if(!this.areMeasurementsInvalid)
		{
			this.areMeasurementsInvalid = true;
			this.registerListeners();
		}
		
		if(this.currentDepth <= drawable.getDepth())
			this.areMeasurementsInvalidNow = true;
		
		this.measureQueue.addObject(drawable, drawable.getDepth());
	},
	
	requestLayout : function(drawable) {
		//console.log("MoLayoutManager: requestLayout (" + drawable.name + ")");
	
		if(!this.areLayoutsInvalid)
		{
			this.areLayoutsInvalid = true;
			this.registerListeners();
		}
		
		this.layoutQueue.addObject(drawable, drawable.getDepth());
	},
	
	
	validateProperties : function() {
		if(!this.arePropertiesInvalid)
			return;
	
		var drawable = this.propertiesQueue.removeSmallest();
		
		while(drawable != null)
		{
			if(drawable.canValidate())
			{
				//console.log("MoLayoutManager: validateProperties (" + drawable.name + ")");
				
				drawable.validateProperties();
				
				this.queuePendingUpdate(drawable);
			}
			
			drawable = this.propertiesQueue.removeSmallest();
		}
		
		if(this.propertiesQueue.isEmpty())
		{
			this.arePropertiesInvalid = false;
		}
	},
	
	validateMeasure : function() {
		if(!this.areMeasurementsInvalid)
			return;
	
		var drawable = this.measureQueue.removeLargest();
		
		while(drawable != null)
		{
			//console.log("MoLayoutManager: validateMeasure (" + drawable.name + ")");
			
			if(drawable.canValidate())
			{
				drawable.validateMeasure();
				
				this.queuePendingUpdate(drawable);
			}
			
			drawable = this.measureQueue.removeLargest();
		}
		
		if(this.measureQueue.isEmpty())
		{
			this.areMeasurementsInvalid = false;
		}
	},
	
	validateLayout : function() {
		if(!this.areLayoutsInvalid)
			return;
	
		var drawable = this.layoutQueue.removeSmallest();
		
		while(drawable != null)
		{
			if(drawable.canValidate())
			{
				//console.log("MoLayoutManager: validateLayout (" + drawable.name + ")");
				
				drawable.validateLayout();
				
				this.queuePendingUpdate(drawable);
			}
			
			drawable = this.layoutQueue.removeSmallest();
		}
		
		if(this.layoutQueue.isEmpty())
		{
			this.areLayoutsInvalid = false;
		}
	},

	process : function() {
	
		//console.log("MoLayoutManager: process");
	
		// validate properties, measurements, and layouts
		this.validateAll();

		// reset listener registration, we will either re-register or our visuals
		// are initialized and updated
		this.areListenersRegistered = false;

		// still invalid, wait for the next frame/render to try another pass
		// at validating
		if(this.isInvalid())
		{
			this.registerListeners();
			return;
		}

		var drawable = this.pendingUpdateQueue.removeLargest();
		
		while(drawable != null)
		{
			//console.log("MoLayoutManager: drawable layout update (" + drawable.name + ")");
			
			// mark this drawable as initialized
			if(!drawable.getIsInitialized())
				drawable.setIsInitialized(true);

			// notify and mark that this drawable is updated
			drawable.dispatchEvent(new MoEvent(MoEvent.UPDATED));
			drawable.isPendingUpdate = false;

			// remove from the update queue
			drawable = this.pendingUpdateQueue.removeLargest();
		}

		// notify any listeners that this layout manager
		// has been completely updated
		this.dispatchEvent(new MoEvent(MoEvent.LAYOUT_UPDATED));
	},
	
	validateAll : function() {
		this.validateProperties();
		this.validateMeasure();
		this.validateLayout();
	},
	
	validateNow : function() {
		var infiniteLoopGuard = 0;

		while(this.areListenersRegistered && infiniteLoopGuard++ < 100)
			this.process();
	},

	validateDrawableNow : function(targetDrawable, dontValidateVisualStack) {		
		dontValidateVisualStack = MoValueOrDefault(dontValidateVisualStack, false);
		
		var isRunning = false;
		var previousDepth = this.currentDepth;
		var drawable = null;
		
		if(this.currentDepth == MoMaxInt)
			this.currentDepth = targetDrawable.getDepth();
		
		while(!isRunning)
		{
			// exit as soon as all the properties and sizes have been 
			// validated or if the visual stack is going to be validated
			// then we'll exit if no changes in properties or sizes occured
			// while the visual stack was being validated
			isRunning = true;
			

			/*********************************************************/
			/**                VALIDATE PROPERTIES                  **/
			/*********************************************************/
			drawable = this.propertiesQueue.removeSmallestChild(targetDrawable);

			while(drawable != null)
			{
				if(drawable.canValidate())
				{
					drawable.validateProperties();
					
					this.queuePendingUpdate(drawable);
				}
				
				drawable = this.propertiesQueue.removeSmallestChild(targetDrawable);
			}
			
			if(this.propertiesQueue.isEmpty())
			{
				this.arePropertiesInvalid = false;
				this.arePropertiesInvalidNow = false;
			}
			
			
			/*********************************************************/
			/**                  VALIDATE MEASURE                   **/
			/*********************************************************/
			drawable = this.measureQueue.removeLargestChild(targetDrawable);
			
			while(drawable != null)
			{
				if(drawable.canValidate())
				{
					drawable.validateMeasure();
					
					this.queuePendingUpdate(drawable);
				}
				
				drawable = this.measureQueue.removeLargestChild(targetDrawable);
			}
			
			if(this.measureQueue.isEmpty())
			{
				this.areMeasurementsInvalid = false;
				this.areMeasurementsInvalidNow = false;
			}
			

			/*********************************************************/
			/**                   VALIDATE LAYOUT                   **/
			/*********************************************************/
			if(!dontValidateVisualStack)
			{
				drawable = this.layoutQueue.removeSmallestChild(targetDrawable);
				
				while(drawable != null)
				{
					if(drawable.canValidate())
					{
						drawable.validateLayout();
						
						this.queuePendingUpdate(drawable);
					}
					
					if(this.arePropertiesInvalidNow)
					{
						drawable = this.propertiesQueue.removeSmallestChild(targetDrawable);
						
						if(drawable != null)
						{
							this.propertiesQueue.addObject(drawable, drawable.getDepth());
							
							isRunning = false;
							break;
						}
					}
					
					if(this.areMeasurementsInvalidNow)
					{
						drawable = this.measureQueue.removeLargestChild(targetDrawable);
						
						if(drawable != null)
						{
							this.measureQueue.addObject(drawable, drawable.getDepth());
							
							isRunning = false;
							break;
						}
					}
					
					drawable = this.layoutQueue.removeSmallestChild(targetDrawable);
				}
				
				if(this.layoutQueue.isEmpty())
					this.areLayoutsInvalid = false;
			}
		}
		
		if(previousDepth == MoMaxInt)
		{
			this.currentDepth = MoMaxInt;
			
			if(!dontValidateVisualStack)
			{
				drawable = this.pendingUpdateQueue.removeLargestChild(targetDrawable);
				
				while(drawable != null)
				{
					if(!drawable.getIsInitialized())
						drawable.setIsInitialized(true);
					
					drawable.dispatchEvent(new MoEvent(MoEvent.UPDATED));
					drawable.isPendingUpdate = false;
					
					drawable = this.pendingUpdateQueue.removeLargestChild(targetDrawable);
				}
			}
		}
	},
	
	isInvalid : function() {
		return (this.arePropertiesInvalid || this.areMeasurementsInvalid || this.areLayoutsInvalid);
	},
	
	queuePendingUpdate : function(drawable) {
		if(drawable == null || drawable.isPendingUpdate)
			return;

		this.pendingUpdateQueue.addObject(drawable, drawable.getDepth());
		drawable.isPendingUpdate = true;
	},
	
	registerListeners : function() {
		if(this.areListenersRegistered)
			return;
	
		var app = MoApplication.getInstance();
		
		// listen for the next frame event to occur which will
		// process any validation/initialization that is pending
		app.addEventHandler(MoFrameEvent.ENTER, this.handleFrameTickEvent.asDelegate(this));
		
		// wait to invalidate until the first frame has finished, this way we
		// can use the entire frame for initial startup
		if(this.frameSkipped)
			app.invalidate();
		
		this.areListenersRegistered = true;
	},
	
	handleFrameTickEvent : function(event) {
		var app = MoApplication.getInstance();
		
		// we only wanted to skip a single frame
		if(!this.frameSkipped)
		{
			this.frameSkipped = true;
		}
		else
		{
			// remove event callbacks until our validation/initialization
			// phase completes to avoid any redundant calls
			app.removeEventHandler(MoFrameEvent.ENTER, this.handleFrameTickEvent.asDelegate(this));
			
			var d1 = new Date();
			this.process();
			var d2 = new Date();
			//console.log("!!! MoLayoutManager: t=" + (d2 - d1));
		}
	}
});

Object.extend(MoLayoutManager, 
// @PRIVATE 
{
	UPDATED : "updateComplete",
	Instance : null,
	
	getInstance : function() {
		if(MoLayoutManager.Instance == null)
			MoLayoutManager.Instance = new MoLayoutManager();

		return MoLayoutManager.Instance;
	}
});


//=====================================================================
//= MoDrawable.js
//=====================================================================

MoDrawableFlags = {
	"None"					: 0,
	"InvalidProperties"		: 1,
	"IsPendingMeasure"		: 2,
	"IsPendingLayout"		: 4,
	"IsRoot"				: 8,
	"Initialized"			: 16,
	"IsLayoutVisible"		: 32,
	"Enabled"				: 64,
	"InvalidMatrix"			: 128,
	"UseBitmapCaching"		: 256
};

MoDrawable = Class.create(MoNamedObjectCollection, MoAnimatable, {
	initialize : function($super, name) {
		$super(name);

		this.isPendingUpdate = false;
		this.isPendingSceneAddEvent = false;
		this.isPendingFocus = false;
		this.visible = true;
		this.parent = null;
		this.scene = null;
		this.flags = MoDrawableFlags.None;
		this.lastX = 0;
		this.lastY = 0;
		this.lastWidth = 0;
		this.lastHeight = 0;
		this.lastExactWidth = 0;
		this.lastExactHeight = 0;
		this.lastUnscaledWidth = 0;
		this.lastUnscaledHeight = 0;
		this.lastComputedBounds = MoRectangle.Empty();
		this.lastUseBitmapCachingValue = false;
		this.lastScene = null;
		this.isDoubleClickEnabled = true;
		this.isMouseFocusEnabled = true;
		this.isNavigationFocusEnabled = false;
		this.isNavigationZone = false;
		this.isHitTestVisible = true;
		this.isHitTestChildrenEnabled = true;
		this.isFocused = false;
		this.navigationMode = null;
		this.alwaysMeasure = false;
		this.alwaysDirty = false;
		this.horizontalAlignment = MoHorizontalAlignment.Left;
		this.verticalAlignment = MoVerticalAlignment.Top;
		this.layoutX = 0;
		this.layoutY = 0;
		this.alphaMask = null;
		this.alphaAffectsVisibility = false;
		this.depth = 0;
		this.dock = MoDock.None;
		this.graphics = new MoGraphics(this);
		this.bitmapCache = null;
		this.bitmapEffectCache = null;
		this.renderTransform = null;
		this.renderEffects = null;
		this.userDirtyRegions = new Array();
		this.layoutMatrix = new MoMatrix2D();
		this.globalLayoutMatrix = null;
		this.layoutManager = MoLayoutManager.getInstance();
		this.graphicsObjectRefs = new Array();
		this.dirtyRegion = new MoDirtyRegion();
		this.lastDirtyRegion = null;
		this.selfDirty = false;
		this.touches = new Array();
		this.localBounds = new MoRectangle(0, 0, 0, 0);
		this.globalBounds = new MoRectangle(0, 0, 0, 0);
		this.clipChildren = false;

		this.setMarginUniform(0);
		this.setX(0);
		this.setY(0);
		this.setWidth(0);
		this.setHeight(0);
		this.setExactWidth(NaN);
		this.setExactHeight(NaN);
		this.setPercentWidth(NaN);
		this.setPercentHeight(NaN);
		this.setMeasuredWidth(0);
		this.setMeasuredHeight(0);
		this.setScaleX(1);
		this.setScaleY(1);
		this.setSkewX(0);
		this.setSkewY(0);
		this.setRotation(0);
		this.setTransformOrigin(MoVector2D.Zero());
		this.setAlpha(1);
		this.setIsLayoutVisible(true);
		this.setEnabled(true);
		this.setUseBitmapCaching(false);
		this.setClip(null);
		
		this.initializeAnimatableProperties();
	},
	
	initializeAnimatablePropertiesCore : function() {
		this.enableAnimatableProperty("marginLeft", this.getMarginLeft, this.setMarginLeft);
		this.enableAnimatableProperty("marginRight", this.getMarginRight, this.setMarginRight);
		this.enableAnimatableProperty("marginTop", this.getMarginTop, this.setMarginTop);
		this.enableAnimatableProperty("marginBottom", this.getMarginBottom, this.setMarginBottom);
		this.enableAnimatableProperty("x", this.getX, this.setX);
		this.enableAnimatableProperty("y", this.getY, this.setY);
		this.enableAnimatableProperty("exactWidth", this.getExactWidth, this.setExactWidth);
		this.enableAnimatableProperty("exactHeight", this.getExactHeight, this.setExactHeight);
		this.enableAnimatableProperty("percentWidth", this.getPercentWidth, this.setPercentWidth);
		this.enableAnimatableProperty("percentHeight", this.getPercentHeight, this.setPercentHeight);
		this.enableAnimatableProperty("measuredWidth", this.getMeasuredWidth, this.setMeasuredWidth);
		this.enableAnimatableProperty("measuredHeight", this.getMeasuredHeight, this.setMeasuredHeight);
		this.enableAnimatableProperty("unscaledWidth", this.getUnscaledWidth, this.setUnscaledWidth);
		this.enableAnimatableProperty("unscaledHeight", this.getUnscaledHeight, this.setUnscaledHeight);
		this.enableAnimatableProperty("width", this.getWidth, this.setWidth);
		this.enableAnimatableProperty("height", this.getHeight, this.setHeight);
		this.enableAnimatableProperty("scaleX", this.getScaleX, this.setScaleX);
		this.enableAnimatableProperty("scaleY", this.getScaleY, this.setScaleY);
		this.enableAnimatableProperty("transformOrigin", this.getTransformOrigin, this.setTransformOrigin);
		this.enableAnimatableProperty("skewX", this.getSkewX, this.setSkewX);
		this.enableAnimatableProperty("skewY", this.getSkewY, this.setSkewY);
		this.enableAnimatableProperty("rotation", this.getRotation, this.setRotation);
		this.enableAnimatableProperty("alpha", this.getAlpha, this.setAlpha);
		this.enableAnimatableProperty("clip", this.getClip, this.setClip);
	},

	readFlag : function(flag) {	
		return ((this.flags & flag) != MoDrawableFlags.None);
	},

	writeFlag : function(flag, value) {
		this.flags = value ? (this.flags | flag) : (this.flags & ~flag);
	},
	
	getHasInvalidMatrix : function() {
		return this.readFlag(MoDrawableFlags.InvalidMatrix);
	},
	
	setHasInvalidMatrix : function(value) {
		this.writeFlag(MoDrawableFlags.InvalidMatrix, value);
	},

	getHasInvalidProperties : function() {
		return this.readFlag(MoDrawableFlags.InvalidProperties);
	},
	
	setHasInvalidProperties : function(value) {
		this.writeFlag(MoDrawableFlags.InvalidProperties, value);
	},
	
	getIsPendingMeasure : function() {
		return this.readFlag(MoDrawableFlags.IsPendingMeasure);
	},
	
	setIsPendingMeasure : function(value) {
		this.writeFlag(MoDrawableFlags.IsPendingMeasure, value);
	},
	
	getIsPendingLayout : function() {
		return this.readFlag(MoDrawableFlags.IsPendingLayout);
	},
	
	setIsPendingLayout : function(value) {
		this.writeFlag(MoDrawableFlags.IsPendingLayout, value);
	},
	
	getIsRoot : function() {
		return this.readFlag(MoDrawableFlags.IsRoot);
	},

	setIsRoot : function(value) {
		this.writeFlag(MoDrawableFlags.IsRoot, value);
	},
	
	getUseBitmapCaching : function() {
		return this.readFlag(MoDrawableFlags.UseBitmapCaching);
	},

	setUseBitmapCaching : function(value) {
		if(this.getUseBitmapCaching() != value)
		{
			// bitmap caching must be enabled to use effects, if
			// the value is false just exit
			if((this.renderEffects != null || this.alphaMask != null) && !value)
				return;

			this.writeFlag(MoDrawableFlags.UseBitmapCaching, value);

			this.invalidateProperties();
			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},

	getScene : function() {
		return this.scene;
	},
	
	setScene : function(value) {
		if(this.scene != value)
		{
			this.scene = value;
			
			var len = this.getCount();
			var child = null;

			for(var i = 0; i < len; ++i)
			{
				child = this.getAt(i);

				if(child != null)
					child.setScene(this.scene);
			}
			
			if(!MoIsNull(this.scene) && this.isPendingFocus)
				this.focus();
		}
	},
	
	getParent : function() {
		return this.parent;
	},

	getGraphics : function() {
		return this.graphics;
	},
	
	getAlphaMask : function() {
		return this.alphaMask;
	},

	setAlphaMask : function(value) {
		if(this.alphaMask != value)
		{
			this.alphaMask = value;

			if(this.alphaMask == null)
			{
				if(this.renderEffects == null)
					this.setUseBitmapCaching(this.lastUseBitmapCachingValue);
			}
			else
			{
				if(this.renderEffects == null)
					this.lastUseBitmapCachingValue = this.getUseBitmapCaching();

				this.setUseBitmapCaching(true);
			}
			
			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},

	getRenderEffects : function() {
		return this.renderEffects;
	},

	setRenderEffects : function(value) {
		
		// unregister current effects
		if(this.renderEffects != null)
		{
			for(var i = 0; i < this.renderEffects.length; ++i)
				this.unregisterDependantObject(this.renderEffects[i]);
		}

		this.renderEffects = value;

		if(this.renderEffects == null)
		{
			this.bitmapEffectCache = null;
			
			// reset the bitmap cache back to the previous value
			if(this.alphaMask == null)
				this.setUseBitmapCaching(this.lastUseBitmapCachingValue);
		}
		else
		{
			// register all the render effects as dependant objects so if there
			// properties change we can invalidate the current state and reprocess
			for(var i = 0; i < this.renderEffects.length; ++i)
				this.registerDependantObject(this.renderEffects[i]);

			// bitmap caching must be enabled to use the effects, so we
			// save a copy of the existing value then turn it on, it will
			// be reset if the effects are removed
			if(this.alphaMask == null)
				this.lastUseBitmapCachingValue = this.getUseBitmapCaching();
			
			this.setUseBitmapCaching(true);
		}
		
		// invalidate the bitmap cache so it will
		// be recreated during the next render
		if(this.bitmapCache != null)
		{
			this.bitmapCache.width = 0;
			this.bitmapCache.height = 0;
		}
		
		this.requestMeasure();
		this.requestParentMeasureAndLayout();
	},
	
	getNavigationMode : function(selfOnly) {
		selfOnly = MoValueOrDefault(selfOnly, false);
		
		// we already have one
		if(!MoIsNull(this.navigationMode))
			return this.navigationMode;

		// none on ourself, so go up the parent chain
		// until we find one
		if(!selfOnly)
		{
			var next = this.getParent();

			while(!MoIsNull(next))
			{
				if(!MoIsNull(next.navigationMode))
					return next.navigationMode;
				
				next = next.getParent();
			}
		}

		// still none found so assume normal mode
		return MoNavigationMode.Normal;
	},
	
	setNavigationMode : function(value) {
		this.navigationMode = value;
	},
	
	getIsInitialized : function() {
		return this.readFlag(MoDrawableFlags.Initialized);
	},

	setIsInitialized : function(value) {		
		this.writeFlag(MoDrawableFlags.Initialized, value);

		if(value)
		{
			// ensure that we are visible, but don't raise any
			// events here
			this.setVisible(this.visible, true);

			// notify that we are now officially created
			this.dispatchEvent(new MoEvent(MoEvent.CREATED));
		}
	},

	getIsLayoutVisible : function() {
		return this.readFlag(MoDrawableFlags.IsLayoutVisible);
	},
	
	setIsLayoutVisible : function(value) {
		if(this.getIsLayoutVisible() != value)
		{
			this.writeFlag(MoDrawableFlags.IsLayoutVisible, value);

			var p = this.getParent();

			if(p != null)
			{
				p.requestMeasure();
				p.requestLayout();
			}
		}
	},
	
	getEnabled : function() {
		return this.readFlag(MoDrawableFlags.Enabled);
	},

	setEnabled : function(value) {		
		this.writeFlag(MoDrawableFlags.Enabled, value);
		this.requestLayout();
	},
	
	getVisible : function() {
		return this.visible;
	},

	setVisible : function(value, disableRaiseEvent) {
		disableRaiseEvent = MoValueOrDefault(disableRaiseEvent, false);

		// value is the same, nothing to do 
		if(this.visible == value)
			return;

		this.visible = value;
		this.requestLayout();
		
		// since we aren't even initialized yet, we don't want
		// to raise any events
		if(!this.getIsInitialized())
			return;

		if(!disableRaiseEvent)
			this.dispatchEvent(new MoEvent((value ? MoEvent.SHOW : MoEvent.HIDE)));
	},

	getIsFocused : function() {
		return this.isFocused;
	},
	
	setIsFocused : function(value) {
		if(this.isFocused != value)
		{
			this.isFocused = value;

			this.invalidateProperties();
			this.requestLayout();
		}
	},
	
	getIsDoubleClickEnabled : function() {
		return this.isDoubleClickEnabled;
	},
	
	setIsDoubleClickEnabled : function(value) {
		this.isDoubleClickEnabled = value;
	},
	
	getIsNavigationZone : function() {
		return this.isNavigationZone;
	},
	
	setIsNavigationZone : function(value) {
		this.isNavigationZone = value;
	},
	
	getIsNavigationFocusEnabled : function() {
		return this.isNavigationFocusEnabled;
	},
	
	setIsNavigationFocusEnabled : function(value) {
		this.isNavigationFocusEnabled = value;
	},
	
	getIsMouseFocusEnabled : function() {
		return this.isMouseFocusEnabled;
	},
	
	setIsMouseFocusEnabled : function(value) {
		this.isMouseFocusEnabled = value;
	},
	
	getIsHitTestVisible : function() {
		return this.isHitTestVisible;
	},
	
	setIsHitTestVisible : function(value) {
		this.isHitTestVisible = value;
	},
	
	getIsHitTestChildrenEnabled : function() {
		return this.isHitTestChildrenEnabled;
	},
	
	setIsHitTestChildrenEnabled : function(value) {
		this.isHitTestChildrenEnabled = value;
	},
	
	getRenderTransform : function() {
		return this.renderTransform;
	},

	setRenderTransform : function(value) {
		if(this.renderTransform != null)
			this.unregisterDependantObject(this.renderTransform);

		if(this.renderTransform != value)
		{
			this.renderTransform = value;

			this.registerDependantObject(this.renderTransform);
			this.requestLayout();
		}
	},

	getLayoutMatrix : function() {
		return this.layoutMatrix;
	},

	getConcatenatedMatrix : function() {
		if(this.globalLayoutMatrix != null)
			return this.globalLayoutMatrix;
		
		var mx = new MoMatrix2D();
		var p = this;
		
		while(p != null)
		{
			mx.append(p.getLayoutMatrix());
			
			if(p != this && p.renderTransform)
				mx.append(p.renderTransform.getValue());
			
			p = p.getParent();
		}

		this.globalLayoutMatrix = mx;

		return mx;
	},
	
	getDock : function() {
		return this.dock;
	},

	setDock : function(value) {
		if(this.dock != value)
		{
			this.dock = value;
			this.requestParentMeasureAndLayout();
		}
	},
	
	getHorizontalAlignment : function() {
		return this.horizontalAlignment;
	},
	
	setHorizontalAlignment : function(value) {
		if(this.horizontalAlignment != value)
		{
			this.horizontalAlignment = value;
			this.invalidateMatrix();
		}
	},
	
	getVerticalAlignment : function() {
		return this.verticalAlignment;
	},
	
	setVerticalAlignment : function(value) {
		if(this.verticalAlignment != value)
		{
			this.verticalAlignment = value;
			this.invalidateMatrix();
		}
	},
	
	getClip : function() {
		return this.getPropertyValue("clip");
	},
	
	setClip : function(value) {
		this.setPropertyValue("clip", value);
	},
	
	getClipChildren : function() {
		return this.clipChildren;
	},

	setClipChildren : function(value) {
		this.clipChildren = value;
	},
	
	getMargin : function() {
		return new MoBorderMetrics(
			this.getMarginLeft(),
			this.getMarginTop(),
			this.getMarginRight(),
			this.getMarginBottom());
	},
	
	getMarginLeft : function() {
		return this.getPropertyValue("marginLeft");
	},
	
	getMarginTop : function() {
		return this.getPropertyValue("marginTop");
	},
	
	getMarginRight : function() {
		return this.getPropertyValue("marginRight");
	},
	
	getMarginBottom : function() {
		return this.getPropertyValue("marginBottom");
	},
	
	setMargin : function() {
		switch(arguments.length)
		{
			case 1:
				this.setMarginUniform(arguments[0]);
				break;
			case 2:
				this.setMarginTop(arguments[0]);
				this.setMarginBottom(arguments[0]);
				this.setMarginLeft(arguments[1]);
				this.setMarginRight(arguments[1]);
				break;
			case 3:
				this.setMarginTop(arguments[0]);
				this.setMarginLeft(arguments[1]);
				this.setMarginRight(arguments[1]);
				this.setMarginBottom(arguments[2]);
				break;
			case 4:
				this.setMarginTop(arguments[0]);
				this.setMarginRight(arguments[1]);
				this.setMarginBottom(arguments[2]);
				this.setMarginLeft(arguments[3]);
				break;
			default:
				this.setMarginUniform(0);
				break;
		}
	},
	
	setMarginUniform : function(value) {
		this.setMargin(value, value, value, value);
	},
	
	setMarginLeft : function(value) {
		if(this.setPropertyValue("marginLeft", value))
			this.invalidateMatrix();
	},

	setMarginTop : function(value) {
		if(this.setPropertyValue("marginTop", value))
			this.invalidateMatrix();
	},
	
	setMarginRight : function(value) {
		if(this.setPropertyValue("marginRight", value))
			this.invalidateMatrix();
	},
	
	setMarginBottom : function(value) {
		if(this.setPropertyValue("marginBottom", value))
			this.invalidateMatrix();
	},
	
	getX : function() {
		return this.getPropertyValue("x");
	},
	
	setX : function(value) {		
		if(this.setPropertyValue("x", value))
		{
			this.layoutX = value;

			this.invalidateMatrix();
			this.invalidateProperties();
		}
	},
	
	getY : function() {
		return this.getPropertyValue("y");
	},
	
	setY : function(value) {		
		if(this.setPropertyValue("y", value))
		{
			this.layoutY = value;
		
			this.invalidateMatrix();
			this.invalidateProperties();
		}
	},
	
	hasExactSize : function() {
		return (!isNaN(this.getExactWidth()) && !isNaN(this.getExactHeight()));
	},

	getExactWidth : function() {
		return this.getPropertyValue("exactWidth");
	},
	
	setExactWidth : function(value) {	
		if(this.setPropertyValue("exactWidth", value))
		{
			if(!isNaN(value))
				this.setPercentWidth(NaN);

			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getExactHeight : function() {
		return this.getPropertyValue("exactHeight");
	},
	
	setExactHeight : function(value) {	
		if(this.setPropertyValue("exactHeight", value))
		{
			if(!isNaN(value))
				this.setPercentHeight(NaN);
			
			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},
	
	hasPercentSize : function() {
		return (!isNaN(this.getPercentWidth()) && !isNaN(this.getPercentHeight()));
	},
	
	getPercentWidth : function() {
		return this.getPropertyValue("percentWidth");
	},
	
	setPercentWidth : function(value) {		
		if(this.setPropertyValue("percentWidth", value))
		{
			if(!isNaN(value))
				this.setExactWidth(NaN);
			
			this.requestParentMeasureAndLayout();
		}
	},
	
	getPercentHeight : function() {
		return this.getPropertyValue("percentHeight");
	},
	
	setPercentHeight : function(value) {		
		if(this.setPropertyValue("percentHeight", value))
		{
			if(!isNaN(value))
				this.setExactHeight(NaN);

			this.requestParentMeasureAndLayout();
		}
	},
	
	getMeasuredWidth : function() {
		return this.getPropertyValue("measuredWidth");
	},
	
	setMeasuredWidth : function(value) {		
		this.setPropertyValue("measuredWidth", value);
	},
	
	getMeasuredHeight : function() {
		return this.getPropertyValue("measuredHeight");
	},
	
	setMeasuredHeight : function(value) {		
		this.setPropertyValue("measuredHeight", value);
	},
	
	getExactOrMeasuredWidth : function() {		
		return !isNaN(this.getExactWidth()) ? this.getExactWidth() : this.getMeasuredWidth();
	},
	
	getExactOrMeasuredHeight : function() {			
		return !isNaN(this.getExactHeight()) ? this.getExactHeight() : this.getMeasuredHeight();
	},
	
	getUnscaledWidth : function() {		
		return this.getWidth();
	},
	
	setUnscaledWidth : function(value) {				
		if(this.getExactWidth() == value)
			return;

		if(!isNaN(value))
			this.setPercentWidth(NaN);

		this.setExactWidth(value);

		this.requestMeasure();
		this.requestParentMeasureAndLayout();
	},
	
	getUnscaledHeight : function() {
		return this.getHeight();
	},
	
	setUnscaledHeight : function(value) {
		if(this.getExactHeight() == value)
			return;
		
		if(!isNaN(value))
			this.setPercentHeight(NaN);
		
		this.setExactHeight(value);
		
		this.requestMeasure();
		this.requestParentMeasureAndLayout();
	},
	
	getWidth : function() {
		return this.getPropertyValue("width");
	},
	
	setWidth : function(value) {	
		if(this.getExactWidth() != value)
		{
			this.setExactWidth(value);
			this.requestMeasure();
		}
		
		if(this.setPropertyValue("width", value))
		{
			this.invalidateProperties();
			this.requestLayout();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getHeight : function() {
		return this.getPropertyValue("height");
	},
	
	setHeight : function(value) {
		if(this.getExactHeight() != value)
		{
			this.setExactHeight(value);
			this.requestMeasure();
		}
		
		if(this.setPropertyValue("height", value))
		{
			this.invalidateProperties();
			this.requestLayout();
			this.requestParentMeasureAndLayout();
		}
	},

	getTransformOrigin : function() {
		return this.getPropertyValue("transformOrigin");
	},
	
	setTransformOrigin : function(value) {
		if(this.setPropertyValue("transformOrigin", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getScaleX : function() {
		return this.getPropertyValue("scaleX");
	},
	
	setScaleX : function(value) {		
		if(this.setPropertyValue("scaleX", value))
		{			
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getScaleY : function() {
		return this.getPropertyValue("scaleY");
	},
	
	setScaleY : function(value) {		
		if(this.setPropertyValue("scaleY", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getSkewX : function() {
		return this.getPropertyValue("skewX");
	},
	
	setSkewX : function(value) {
		if(this.setPropertyValue("skewX", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getSkewY : function() {
		return this.getPropertyValue("skewY");
	},
	
	setSkewY : function(value) {
		if(this.setPropertyValue("skewY", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getRotation : function() {
		return this.getPropertyValue("rotation");
	},
	
	setRotation : function(value) {		
		if(this.setPropertyValue("rotation", value))
		{
			this.invalidateMatrix();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getAlpha : function() {
		return this.getPropertyValue("alpha");
	},

	setAlpha : function(value) {
		if(this.setPropertyValue("alpha", value))
		{
			this.invalidate();
			this.requestLayout();
		}

		if(this.alphaAffectsVisibility)
			this.setVisible(this.getAlpha() > 0);
	},

	getAlphaAffectsVisibility : function() {
		return this.alphaAffectsVisibility;
	},

	setAlphaAffectsVisibility : function(value) {
		this.alphaAffectsVisibility = value;
	},
	
	getDepth : function() {
		return this.depth;
	},
	
	setDepth : function(value) {

		// we are probably not added to any draw hierarcy yet
		// so just exit out, this will be called again when
		// we start to initialize
		if(value == 1 && !this.getIsRoot())
			return;
		
		var nextDepth = value;
		
		// update our depth and notify the layout manager
		// that we have a new depth
		if(value > 0 && this.depth != value)
		{
			this.depth = value;
			this.updateLayoutManager();

			nextDepth++;
		}
		else if(value == 0)
		{
			this.depth = value = 0;
		}
		else
		{
			nextDepth++;
		}

		// update our children's depth as well
		var len = this.getCount();
		var child = null;
		
		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(child != null)
				child.setDepth(nextDepth);
		}
	},

	flipX : function() {
		this.setTransformOrigin(this.getCenter());
		this.setScaleX(-this.getScaleX());
	},

	flipY : function() {
		this.setTransformOrigin(this.getCenter());
		this.setScaleY(-this.getScaleY());
	},

	focus : function() {
		var surface = this.getScene();
		
		this.isPendingFocus = false;
		
		if(!MoIsNull(surface))
			surface.inputManager.focus(this);
		else
			this.isPendingFocus = true;
	},
	
	getNavigationZone : function(allowSelf) {
		allowSelf = MoValueOrDefault(allowSelf, true);

		var next = this;
		
		while(!MoIsNull(next))
		{
			if(next.getVisible() && next.getIsNavigationZone() && (allowSelf || (!allowSelf && next != this)))
				return next;

			next = next.getParent();
		}
		
		return null;
	},
	
	addAt : function($super, child, idx) {
		this.beforeChildAdd(child);
		$super(child, idx);
		this.childAdded(child);
		
		return child;
	},

	beforeChildAdd : function(child) {
		child.changeParentAndScene(this, this.getScene());
		child.setDepth(this.getDepth() + 1);
	},
	
	childAdded : function(child) {
		if(!child.getIsInitialized())
			child.initializeSelf();
	},

	remove : function($super, child) {
		this.beforeChildRemove(child);
		$super(child);
		this.childRemoved(child);
		
		return child;
	},
	
	beforeChildRemove : function(child) {

	},
	
	childRemoved : function(child) {
		child.changeParentAndScene(null, null);
		child.scene = null;
	},
	
	removeFromParent : function() {
		var parent = this.getParent();
		
		if(parent != null)
		{
			parent.remove(this);
			parent.invalidate();
		}
	},
	
	updateLayoutManager : function() {
		if(this.getIsPendingLayout())
			this.layoutManager.requestLayout(this);
		
		if(this.getIsPendingMeasure())
			this.layoutManager.requestMeasure(this);
		
		if(this.getHasInvalidProperties())
			this.layoutManager.invalidateProperties(this);

		MoApplication.getInstance().invalidate();
	},

	changeParentAndScene : function(newParent, newScene) {

		var parentChanged = (this.parent != newParent);
		var sceneChanged = (this.scene != newScene);

		if(newParent == null)
		{
			this.parent = null;
			this.setDepth(0);
		}
		else
		{
			this.parent = newParent;
		}

		if(newScene == null)
			this.scene = null;
		else
		{
			this.setScene(newScene);
		}

		if(parentChanged)
		{
			// if the parent and scene changed then we have either been added to or removed
			// from the parent's scene, which means we need fire an update but only after 
			// we have been initialized and our children have been created (in the add case)
			if(sceneChanged)
			{
				if(this.scene == null)
					this.dispatchEvent(new MoEvent(MoEvent.REMOVED_FROM_SCENE));
				else if(!this.getIsInitialized())
					this.isPendingSceneAddEvent = true;
			}

			this.dispatchEvent(new MoEvent(MoEvent.PARENT_CHANGED));
		}
	},

	initializeSelf : function() {
		if(this.getIsInitialized())
			return;
		
		// notify that we are starting initialization
		this.dispatchEvent(new MoEvent(MoEvent.PRE_INIT));
		
		// create the child hierarcy
		this.createChildren();
		
		// notify the the children have been created
		this.raiseChildrenCreatedEvent();

		// notify that initialization has completed
		this.dispatchEvent(new MoEvent(MoEvent.INIT_COMPLETE));
	},
	
	createChildren : function() {
		/** override **/
	},
	
	canValidate : function() {
		return (this.getDepth() > 0);
	},
	
	requestParentMeasureAndLayout : function() {
		if(!this.getIsLayoutVisible())
			return;
		
		var p = this.getParent();

		if(p == null)
			return;
			
		p.requestMeasure();
		p.requestLayout();
	},
	
	validateNow : function() {
		this.layoutManager.validateDrawableNow(this);
	},
	
	invalidateMatrix : function() {
		if(!this.getHasInvalidMatrix())
		{
			this.setHasInvalidMatrix(true);
			
			if(this.getDepth() > 0 && !this.getIsPendingLayout())
				this.layoutManager.requestLayout(this);
		}
	},
	
	invalidateGlobalChildMatrices : function() {
		var len = this.getCount();
		var child = null;
		
		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);
			
			if(child != null && child.getVisible())
				child.invalidateGlobalChildMatrices();
		}

		this.globalLayoutMatrix = null;
	},

	validateMatrix : function() {
		if(this.getHasInvalidMatrix())
		{
			var tx = this.layoutX;
			var ty = this.layoutY;

			this.layoutMatrix.setIdentity();
			this.layoutMatrix.translate(-this.getTransformOrigin().x, -this.getTransformOrigin().y);
			this.layoutMatrix.scale(this.getScaleX(), this.getScaleY());
			this.layoutMatrix.skew(this.getSkewX(), this.getSkewY());
			this.layoutMatrix.rotate(this.getRotation());
			this.layoutMatrix.translate(tx + this.getTransformOrigin().x, ty + this.getTransformOrigin().y);
			this.layoutMatrix.truncateToPrecision(2);
			
			this.invalidate();
			this.invalidateGlobalChildMatrices();
			this.setHasInvalidMatrix(false);
		}
	},

	invalidateProperties : function() {
		if(!this.getHasInvalidProperties())
		{
			this.setHasInvalidProperties(true);

			if(this.canValidate())
				this.layoutManager.invalidateProperties(this);
		}
	},

	validateProperties : function() {
		if(this.getHasInvalidProperties())
		{
			this.commitProperties();
			this.setHasInvalidProperties(false);
		}
	},

	commitProperties : function() {
		if(this.getUseBitmapCaching())
		{
			// create the cached canvas that we will render into
			if(this.bitmapCache == null)
			{
				this.bitmapCache = document.createElement("canvas");
				this.bitmapCache.width = 0;
				this.bitmapCache.height = 0;
			}
		}
		else
		{
			this.bitmapCache = null;
			this.bitmapEffectCache = null;
		}

		if(this.getX() != this.lastX || this.getY() != this.lastY)
			this.raisePositionChangedEvent();

		if(this.getWidth() != this.lastWidth || this.getHeight() != this.lastHeight)
			this.raiseResizedEvent();
	},

	requestMeasure : function() {
		if(!this.getIsPendingMeasure())
		{
			this.setIsPendingMeasure(true);
			
			if(this.canValidate())
				this.layoutManager.requestMeasure(this);
		}
	},
	
	validateMeasure : function(recursive) {		
		recursive = MoValueOrDefault(recursive, false);

		if(MoPrintMeasureOrder)
			MoDebugWrite("Measure Validation: drawable: #{0}, recursive: #{1}, pending: #{2}", MoDebugLevel.Info, this.getName(), recursive, this.getIsPendingMeasure());

		if(recursive)
		{
			var len = this.getCount();
			var child = null;
			
			for(var i = 0; i < len; ++i)
			{
				child = this.getAt(i);
				
				if(child != null)
					child.validateMeasure(true);
			}
		}
		
		if(this.getIsPendingMeasure())
		{
			var hasSizeChanged = this.performMeasure();
			
			if(MoPrintMeasureOrder)
				MoDebugWrite("\tSize Changed: #{0}", MoDebugLevel.Info, hasSizeChanged);
				
			if(hasSizeChanged)
				this.invalidate();

			if(hasSizeChanged && this.getIsLayoutVisible())
			{
				this.requestLayout();
				this.requestParentMeasureAndLayout();
			}
		}
	},

	performMeasure : function() {
		if(!this.getIsPendingMeasure())
			return false;

		var hasSizeChanged = false;

		// if we don't have an exact size we can skip the measure pass, as long
		// as the control hasn't ask to always measure
		if(!this.hasExactSize() || this.alwaysMeasure)
		{
			if(MoPrintMeasureOrder)
				MoDebugWrite("\tRan measure(): #{0}", MoDebugLevel.Info, "yes");

			this.measure();
		}
		else
		{
			if(MoPrintMeasureOrder)
				MoDebugWrite("\tRan measure(): #{0}", MoDebugLevel.Info, "no");
		}

		// the measurement is no longer invalid
		this.setIsPendingMeasure(false);
		
		// check if the current size changed since the last
		// time we measured ourself, if so save it so we can
		// check on the next measure
		var newWidth = (!isNaN(this.getExactWidth()) ? this.getExactWidth() : this.getMeasuredWidth());
		
		if(newWidth != this.lastExactWidth)
		{
			this.lastExactWidth = newWidth;
			hasSizeChanged = true;
		}
		
		var newHeight = (!isNaN(this.getExactHeight()) ? this.getExactHeight() : this.getMeasuredHeight());
		
		if(newHeight != this.lastExactHeight)
		{
			this.lastExactHeight = newHeight;
			hasSizeChanged = true;
		}

		if(MoPrintMeasureOrder)
			MoDebugWrite("\tSize: #{0}, #{1}", MoDebugLevel.Info, newWidth, newHeight);
			
		return hasSizeChanged;
	},
	
	measure : function() {
		this.setMeasuredWidth(0);
		this.setMeasuredHeight(0);
	},
	
	setActualSize : function(w, h) {	
		var changed = false;
		
		if(this.getPropertyValue("width") != w)
		{
			this.setPropertyValue("width", w);
			changed = true;
		}
		
		if(this.getPropertyValue("height") != h)
		{
			this.setPropertyValue("height", h);
			changed = true;
		}

		if(changed)
		{
			this.invalidate();
			this.requestLayout();
			this.raiseResizedEvent();
		}
	},

	requestLayout : function() {		
		if(!this.getIsPendingLayout())
		{
			this.setIsPendingLayout(true);
			
			if(this.canValidate())				
				this.layoutManager.requestLayout(this);
		}
	},
	
	validateLayout : function() {		
		if(this.getIsPendingLayout())
		{			
			// ensure we have a valid matrix
			this.validateMatrix();
			
			var unscaledWidth = this.getWidth();
			var unscaledHeight = this.getHeight();
			
			this.layout(unscaledWidth, unscaledHeight);
			
			this.lastUnscaledWidth = unscaledWidth;
			this.lastUnscaledHeight = unscaledHeight;
			
			this.setIsPendingLayout(false);
		}
		else
		{
			this.validateMatrix();
		}
	},
	
	layout : function(unscaledWidth, unscaledHeight) {
		/** override **/
	},

	setLayoutPosition : function(x, y) {		
		var changed = false;
		
		if(this.layoutX != x)
		{
			this.layoutX = x;
			changed = true;
		}
		
		if(this.layoutY != y)
		{
			this.layoutY = y;
			changed = true;
		}
		
		if(changed)
			this.invalidateMatrix();
	},

	invalidate : function() {
		this.selfDirty = true;
		this.invalidateRegion(this.globalBounds.x, this.globalBounds.y, this.globalBounds.width, this.globalBounds.height);
	},

	invalidateRegion : function(x, y, width, height) {
		this.dirtyRegion.grow(x, y, x + width, y + height);
		MoApplication.getInstance().invalidate();
	},

	getCenter : function(bbox) {
		bbox = MoValueOrDefault(bbox, false);
		
		if(bbox)
			return this.getBounds().center(true);
			
		return new MoVector2D(this.getWidth() * 0.5, this.getHeight() * 0.5);
	},
	
	getGlobalCenter : function() {
		return this.getGlobalBounds().center();
	},

	getGlobalBounds : function() {
		return this.globalBounds;
	},

	getBounds : function() {
		return this.localBounds;
	},

	hitTest : function(x, y, precise) {
		precise = MoValueOrDefault(precise, false);

		if(!this.getVisible())
			return null;

		return this.performHitTestImpl(x, y, precise);
	},
	
	performHitTestImpl : function(x, y, precise) {
		var len = this.getCount();
		var child = null;

		if(len > 0 && this.getIsHitTestChildrenEnabled())
		{
			for(var i = len-1; i >= 0; i--)
			{
				child = this.getAt(i);
				
				if(child != null)
				{
					var found = child.hitTest(x, y, precise);
					
					if(found != null)
						return found;
				}
			}
		}
		
		if(!this.getIsHitTestVisible())
			return null;
		
		if(this.lastComputedBounds.contains(x, y))
		{
			if(precise)
			{
				// TODO : render just a copy of this Graphics object into an in-memory context and try
				//		  isPointInPath or just fallback to the pixel test method
				throw new Error("Precise hit testing not yet implemented.");
			}
			
			// done, the point is within our bounds
			return this;
		}

		// found nothing
		return null;
	},
	
	pointTo : function(drawable, point) {
		var globalPoint = this.pointToGlobal(point);
		var newPoint = drawable.pointToLocal(globalPoint);
		
		return newPoint;
	},

	pointToGlobal : function(point) {
		var mx = this.getConcatenatedMatrix();
		var globalPoint = mx.transformPoint(point);

		return globalPoint;
	},
	
	pointToLocal : function(point) {
		var mx = this.getConcatenatedMatrix().invert();
		var localPoint = mx.transformPoint(point);
		
		return localPoint;
	},

	pointToParent : function(point) {
		return this.pointTo(this.getParent(), point);
	},
	
	handleEvent : function(event) {
		if(event.getType() == MoMouseEvent.DOUBLE_CLICK && !this.getIsDoubleClickEnabled())
			event.stopImmediatePropagation();
		
		// TODO : handle touch/gesture events to build custom pinch/swipe/etc... events
		
		return this.dispatchEvent(event);
	},
	
	raiseChildrenCreatedEvent : function() {
		this.invalidateProperties();
		this.requestMeasure();
		this.requestLayout();
		
		this.dispatchEvent(new MoEvent(MoEvent.CHILDREN_CREATED));

		if(this.isPendingSceneAddEvent)
		{
			this.isPendingSceneAddEvent = false;

			if(this.getScene() != null)			
				this.dispatchEvent(new MoEvent(MoEvent.ADDED_TO_SCENE));
		}
	},
	
	raisePositionChangedEvent : function() {
		this.dispatchEvent(new MoEvent(MoEvent.POSITION_CHANGED));
		this.lastX = this.getX();
		this.lastY = this.getY();
	},

	raiseResizedEvent : function() {
		this.dispatchEvent(new MoEvent(MoEvent.RESIZED));
		this.lastWidth = this.getWidth();
		this.lastHeight = this.getHeight();
	},

	registerDependantObject : function(obj) {
		if(obj == null)
			return;

		obj.togglePropertyChangedHandlerRecursive(this, this.handleDependantObjectPropertyChangedEvent.asDelegate(this), true);
	},

	unregisterDependantObject : function(obj) {
		if(obj == null)
			return;

		obj.togglePropertyChangedHandlerRecursive(this, this.handleDependantObjectPropertyChangedEvent.asDelegate(this), false);
	},
	
	registerGraphicsObject : function(obj) {
		if(obj == null || this.graphicsObjectRefs.contains(obj))
			return;

		this.graphicsObjectRefs.push(obj);
		this.registerDependantObject(obj);
	},
	
	unregisterGraphicsObject : function(obj) {
		if(obj == null || !this.graphicsObjectRefs.contains(obj))
			return;

		this.graphicsObjectRefs.remove(obj);
		this.unregisterDependantObject(obj);
	},
	
	clearGraphicsObjects : function() {
		var len = this.graphicsObjectRefs.length;
		var obj = null;

		for(var i = 0; i < len; ++i)
		{
			obj = this.graphicsObjectRefs[i];

			if(obj != null)
				this.unregisterGraphicsObject(obj);
		}

		this.graphicsObjectRefs = new Array();
	},
	
	handleDependantObjectPropertyChangedEvent : function(event) {

		// this is a very important step, because values may or may not be null when we register the object
		// and javascript doesn't have a way to lookup type information when new, valid values, are added we
		// need to toggle on/off notifications so that we don't cause memory leaks, orphanded handlers, etc...
		var oldValue = event.getOldValue();
		var newValue = event.getNewValue();
		
		// stop receiving notifications from the old value
		if(oldValue != null && oldValue.isAnimatable)
			oldValue.togglePropertyChangedHandlerRecursive(this, this.handleDependantObjectPropertyChangedEvent.asDelegate(this), false);
		
		// start receiving notifications from the new value
		if(newValue != null && newValue.isAnimatable)
			newValue.togglePropertyChangedHandlerRecursive(this, this.handleDependantObjectPropertyChangedEvent.asDelegate(this), true);


		// this is the final very important step to ensure that rendering get's updated when dependent graphics
		// objects change, based on the specified option we execute the appropriate action, property changes may
		// affect either the measure, layout, parent's measure, parent's layout or some combination thereof or 
		// nothing at all
		var propOptions = event.getTarget().getAnimatablePropertyOptions(event.getPropertyName());

		if(propOptions != MoPropertyOptions.None)
		{
			// affects the measure phase
			if((propOptions & MoPropertyOptions.AffectsMeasure) != MoPropertyOptions.None)
				this.requestMeasure();
			
			// affects the layout phase
			if((propOptions & MoPropertyOptions.AffectsLayout) != MoPropertyOptions.None)
				this.requestLayout();
			
			// affects the parent's measure phase
			if((propOptions & MoPropertyOptions.AffectsParentMeasure) != MoPropertyOptions.None)
			{
				if(this.getParent() != null)
					this.getParent().requestMeasure();
			}

			// affects the parent's layout phase
			if((propOptions & MoPropertyOptions.AffectsParentLayout) != MoPropertyOptions.None)
			{
				if(this.getParent() != null)
					this.getParent().requestLayout();
			}

			if((propOptions & MoPropertyOptions.AffectsRender) != MoPropertyOptions.None)
			{
				this.invalidate();
				this.requestLayout();
			}
		}
	},
	
	areAnyGraphicsDirty : function() {
		if(this.selfDirty || this.graphics.getHasChangedSinceLastRender())
			return true;
	
		var len = this.getCount();
		var c = null;
		
		for(var i = 0; i < len; ++i)
		{
			c = this.getAt(i);
			
			if(c.getVisible())
				return c.areAnyGraphicsDirty();
		}

		return false;
	},
	
	updateDirtyRegions : function() {
		var len = this.getCount();
		var c = null;

		for(var i = 0; i < len; ++i)
		{
			c = this.getAt(i);
			
			if(c.getVisible())
				c.updateDirtyRegions();
		}
	
		// FIXME : need to update this so we do not have to compute the global
		//         bounds during every single render
		
		// get the new bounds from our graphics, if the graphics does not have
		// any strokes then the non-stroked bounds will just be returned
		this.computeBounds(this.graphics.getStrokeBounds());
		
		// add a dirty region if the bounds have changed or any of our graphics
		// are dirty
		if(this.globalBounds.isNotEqualTo(this.lastComputedBounds) || this.areAnyGraphicsDirty())
		{
			// the the region tracker perform the intersections
			MoDirtyRegionTracker.current().add(this.lastComputedBounds.x-4, this.lastComputedBounds.y-4, this.lastComputedBounds.width+8, this.lastComputedBounds.height+8);
			MoDirtyRegionTracker.current().add(this.globalBounds.x, this.globalBounds.y, this.globalBounds.width, this.globalBounds.height);
			
			this.lastComputedBounds.x = this.globalBounds.x;
			this.lastComputedBounds.y = this.globalBounds.y;
			this.lastComputedBounds.width = this.globalBounds.width;
			this.lastComputedBounds.height = this.globalBounds.height;
		}
	},

	renderRecursive : function(gfx) {
		if(this.getUnscaledWidth() <= 0 || this.getUnscaledHeight() <= 0)
			return;
		
		// save the current bounds
		this.lastComputedBounds.x = this.globalBounds.x;
		this.lastComputedBounds.y = this.globalBounds.y;
		this.lastComputedBounds.width = this.globalBounds.width;
		this.lastComputedBounds.height = this.globalBounds.height;
		
		gfx.save();
		
		// we have a bitmap cached, this might be either from the user
		// or from an effect, to use effects bitmap caching must be used,
		// otherwise we would still have to generate this bitmap to render
		// the effects
		if(this.bitmapCache != null)
			this.renderBitmapCache(gfx);

		// nothing unusual, so just render normally
		else
			this.renderRecursiveImpl(gfx, false);

		gfx.restore();

		// compute the local/global bounds, this will give us the actual bounds
		// based on what was actually rendered
		this.computeBounds(this.graphics.getStrokeBounds());
		
		// save the current dirty region and reset it
		this.lastDirtyRegion = this.dirtyRegion.copy();
		this.dirtyRegion.clear();

		// reset dirty flag
		this.selfDirty = false;
	},

	renderBitmapCache : function(gfx) {
		var cacheWidth = this.bitmapCache.width;
		var cacheHeight = this.bitmapCache.height;
		var cacheSizeChanged = false;
		var cacheGfx = this.bitmapCache.getContext("2d");
		var renderableBitmap = this.bitmapCache;
		
		// the cache size and our size has changed so we need to reset our current
		// cache, which will invalidate it and require us to redraw
		if(cacheWidth != this.getUnscaledWidth() || cacheHeight != this.getUnscaledHeight())
		{
			this.bitmapCache.width = Math.ceil(this.getUnscaledWidth());
			this.bitmapCache.height = Math.ceil(this.getUnscaledHeight());

			cacheWidth = this.bitmapCache.width;
			cacheHeight = this.bitmapCache.height;
			cacheSizeChanged = true;
		}

		// we optimize by only redrawing if either the cache size has changed or
		// if the user graphics has changed since the previous update
		if(cacheSizeChanged || this.areAnyGraphicsDirty())
		{
			// erase the entire cache surface
			cacheGfx.clearRect(0, 0, this.bitmapCache.width , this.bitmapCache.height);

			// now we can render into our cache context as usual, however, instead of
			// applying the top level translation here we always render in the top left
			// corner and apply the translations once the final bitmap has been composited
			this.renderRecursiveImpl(cacheGfx, true);

			// finally, once the source bitmap has been composited we apply any render
			// effects to it, which will give us the final bitmap that will be used for
			// rendering to the display
			if(this.renderEffects != null && this.renderEffects.length > 0)
			{
				var len = this.renderEffects.length;
				var fx = null;
				var fxGfx = null;

				for(var i = 0; i < len; ++i)
				{
					fx = this.renderEffects[i];

					if(fx == null)
						continue;

					// reset the effect to our source bitmap size
					fx.reset(new MoSize(cacheWidth, cacheHeight));

					// draw the currently composited bitmap, as we iterate, this bitmap
					// is reassigned so that each effect is layered one on top of the other
					// which will give us a bitmap with all the effects
					fxGfx = fx.getEffectContext();
					fxGfx.drawImage(renderableBitmap, 0, 0);

					if(fx.process(this))
						renderableBitmap = fx.getEffectCanvas();
				}

				this.bitmapEffectCache = renderableBitmap;
			}
		}

		// we might have a cache of the bitmap effects, if so, we will use
		// this instead of the bitmap cache
		if(this.bitmapEffectCache != null)
			renderableBitmap = this.bitmapEffectCache;

		// the size of our drawable and the actual render size might differ, in which case
		// we need to compensate for this so we can re-align ourself to the correct position
		var dx = (this.getUnscaledWidth() - renderableBitmap.width) * 0.5;
		var dy = (this.getUnscaledHeight() - renderableBitmap.height) * 0.5;
		
		// finally we can actually render our bitmap, in this case, it's going to either
		// be the bitmapCache or the bitmapEffectCache

		this.applyRenderTransforms(gfx);
		
		gfx.drawImage(renderableBitmap, 0, 0, renderableBitmap.width, renderableBitmap.height, dx, dy, renderableBitmap.width, renderableBitmap.height);			
	},

	renderRecursiveImpl : function(gfx, skipTransform) {
		skipTransform = MoValueOrDefault(skipTransform, false);

		// set the user clip region, if specified, so that
		// it clips the entire content but is not affected
		// by any layout/render transformations
		var clip = this.getClip();
		
		if(!MoIsNull(clip))
		{
			gfx.beginPath();
			gfx.rect(clip.x, clip.y, clip.width, clip.height);
			gfx.clip();
		}

		// apply layout and render transforms, unless a skip
		// is requested (i.e. when drawing from bitmap cache)
		if(!skipTransform)
			this.applyRenderTransforms(gfx);

		// update the global alpha
		gfx.globalAlpha *= this.getAlpha();
		
		// perform the actual render operation
		this.graphics.render(gfx);
		
		// when specified, clip just the child content
		if(this.clipChildren)
		{
			gfx.beginPath();
			gfx.rect(0, 0, this.getUnscaledWidth(), this.getUnscaledHeight());
			gfx.clip();
		}
		
		// go ahead and run through our children and
		// try to render any visible ones
		//
		// TODO : should children that are not included
		//        in the layout be discarded?
		//
		var len = this.getCount();
		var child = null;

		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(MoIsNull(child))
				continue;
			
			if(child.getVisible())
				child.renderRecursive(gfx);
		}

		// finally we need to render our alpha mask, if we have one, this is only done
		// when bitmap caching is enabled, since we need to change the compositing 
		// operation we don't want to affect the main context
		if(this.alphaMask != null)
			this.graphics.renderAlphaMask(gfx, this.alphaMask, this.getUnscaledWidth(), this.getUnscaledHeight());
	},

	applyRenderTransforms : function(context) {

		//***********************************************************************************************
		// we optimize here by applying both transforms independently, it would be significantly slower
		// to allocate a new matrix and multiply these together each time they change or render, the
		// native context implementation will be able to handle the math much faster
		//***********************************************************************************************

		context.transform(this.layoutMatrix.m11, this.layoutMatrix.m12, this.layoutMatrix.m21, this.layoutMatrix.m22, this.layoutMatrix.offsetX, this.layoutMatrix.offsetY);

		var mx = (this.renderTransform == null ? null : this.renderTransform.getValue());

		if(mx != null)
			context.transform(mx.m11, mx.m12, mx.m21, mx.m22, mx.offsetX, mx.offsetY);
	},
	
	computeBounds : function(strokedBounds) {
		var mx = (this.renderTransform == null ? new MoMatrix2D() : this.renderTransform.getValue());
		var rect = new MoRectangle(strokedBounds.x, strokedBounds.y, strokedBounds.width, strokedBounds.height);
		
		if(rect.isZero())
		{
			rect.width = this.getUnscaledWidth();
			rect.height = this.getUnscaledHeight();
		}
		
		// if we have any render effects then we will have to take them
		// into account as well since they may go outside of our initial bounds
		// i.e. for a drop shadow or blur effect
		if(this.renderEffects != null && this.renderEffects.length > 0)
		{
			var len = this.renderEffects.length;
			var fx = null;

			for(var i = 0; i < len; ++i)
			{
				fx = this.renderEffects[i];
				
				if(fx == null)
					continue;

				rect.unionWithRect(fx.getRenderBounds(rect));
			}
		}

		mx.append(this.getConcatenatedMatrix());
		
		if(mx.isIdentity())
		{
			this.globalBounds.copyFrom(rect);
			this.localBounds.copyFrom(rect);
		}
		else
		{
			this.globalBounds = mx.transformRect(rect);
			this.localBounds = mx.invert().transformRect(rect);
		}

		//console.log(this.name + " computed: " + this.globalBounds.toString());
	}
});





//=====================================================================
//= MoInterpolator.js
//=====================================================================

MoInterpolator = Class.create({
	initialize : function() { },
	
	/** override **/
	interpolate : function(fraction, startValue, endValue) {
		return null;
	},
	
	/** override **/
	increment : function(baseValue, incrementValue) {
		return null;
	},
	
	/** override **/
	decrement : function(baseValue, decrementValue) {
		return null;
	}
});



//=====================================================================
//= MoColorInterpolator.js
//=====================================================================

MoColorInterpolator = Class.create(MoInterpolator, {
	initialize : function($super) { 
		$super();
	},
	
	interpolate : function(fraction, startValue, endValue) {
		if(fraction == 0)
			return startValue;
		else if(fraction == 1)
			return endValue;
		
		var f = Math.min(1, Math.max(0, fraction));
		
		return new MoColor(
			startValue.r + (f * (endValue.r - startValue.r)),
			startValue.g + (f * (endValue.g - startValue.g)),
			startValue.b + (f * (endValue.b - startValue.b)), 1);
	},

	increment : function(baseValue, incrementValue) {
		return new MoColor(
			Math.min(baseValue.r + incrementValue.r, 1.0),
			Math.min(baseValue.g + incrementValue.g, 1.0),
			Math.min(baseValue.b + incrementValue.b, 1.0), 1);
	},
	
	decrement : function(baseValue, decrementValue) {
		return new MoColor(
			Math.min(baseValue.r - incrementValue.r, 0),
			Math.min(baseValue.g - incrementValue.g, 0),
			Math.min(baseValue.b - incrementValue.b, 0), 1);		
	}
});

Object.extend(MoColorInterpolator, {
	Instance : null,
	
	getInstance : function() {
		if(MoColorInterpolator.Instance == null)
			MoColorInterpolator.Instance = new MoColorInterpolator();
		
		return MoColorInterpolator.Instance;
	}
});



//=====================================================================
//= MoNumberInterpolator.js
//=====================================================================

MoNumberInterpolator = Class.create(MoInterpolator, {
	initialize : function($super) { 
		$super();
	},
	
	interpolate : function(fraction, startValue, endValue) {
		if(fraction == 0)
			return startValue;
		else if(fraction == 1)
			return endValue;
		
		return startValue + (fraction * (endValue - startValue));
	},

	increment : function(baseValue, incrementValue) {
		return baseValue + incrementValue;
	},
	
	decrement : function(baseValue, decrementValue) {
		return baseValue - decrementValue;
	}
});

Object.extend(MoNumberInterpolator, {
	Instance : null,
	
	getInstance : function() {
		if(MoNumberInterpolator.Instance == null)
			MoNumberInterpolator.Instance = new MoNumberInterpolator();
		
		return MoNumberInterpolator.Instance;
	}
});



//=====================================================================
//= MoVectorInterpolator.js
//=====================================================================

MoVectorInterpolator = Class.create(MoInterpolator, {
	initialize : function($super) { 
		$super();
		
		this.numberInterpolator = MoNumberInterpolator.getInstance();
	},
	
	interpolate : function(fraction, startValue, endValue) {
		if(fraction == 0)
			return startValue;
		else if(fraction == 1)
			return endValue;

		return new MoVector2D(
			this.numberInterpolator.interpolate(fraction, startValue.x, endValue.x),
			this.numberInterpolator.interpolate(fraction, startValue.y, endValue.y));
	},

	increment : function(baseValue, incrementValue) {
		return new MoVector2D(
			this.numberInterpolator.increment(baseValue.x, incrementValue.x),
			this.numberInterpolator.increment(baseValue.y, incrementValue.y));	
	},
	
	decrement : function(baseValue, decrementValue) {
		return new MoVector2D(
			this.numberInterpolator.decrement(baseValue.x, incrementValue.x),
			this.numberInterpolator.decrement(baseValue.y, incrementValue.y));	
	}
});

Object.extend(MoVectorInterpolator, {
	Instance : null,
	
	getInstance : function() {
		if(MoVectorInterpolator.Instance == null)
			MoVectorInterpolator.Instance = new MoVectorInterpolator();
		
		return MoVectorInterpolator.Instance;
	}
});



//=====================================================================
//= MoAnimation.js
//=====================================================================

MoAnimation = Class.create(MoEventDispatcher, 
/**
 * @CLASS
 *
 * SUMMARY:
 *  This class defines the base for all other animations, typically you do not create an instance of this
 *	class directly, but instead use one of it's subclasses.
 *
 *	When another animation class does not meet your needs, this class can be used to create custom animations
 *	by specifying the properties and values using the animationPaths property, interpolation, easing and repeat
 *	behavior.
 *	
 *
 * @EVENT MoAnimationEvent.BEGIN
 *
 * SUMMARY:
 *	Dispatched when the animation has begun.
 *
 * @EVENT MoAnimationEvent.STOP
 *
 * SUMMARY:
 *	Dispatched when the animation has been stopped.
 *
 * REMARKS:
 *	This event doesn't always indicate the animation is finished, to
 *	find out when the animation has actually been completed, use the
 *	MoAnimationEvent.COMPLETE event instead.
 *
 * @EVENT MoAnimationEvent.COMPLETE
 *
 * SUMMARY:
 *	Dispatched when the animation has completed all the way to the end.
 *
 * @EVENT MoAnimationEvent.REPEAT
 *
 * SUMMARY:
 *	Dispatched when the animation has repeated.
 *
 */
{	
	initialize : function($super, drawable) {
		/**
		 * SUMMARY:
		 *	Creates a new MoAnimation object that animates one or more properties on
		 *	the specified animatable.
		 *
		 *	Even though the parameter name is drawable, any object that has been defined
		 *	with the MoAnimatable mixin can participate in animations.
		 *
		 * PARAMS:
		 *  MoAnimatable drawable:
		 *		An instance of a MoAnimatable that will receive the animation updates.
		 */
		$super();
		
		this.drawable = drawable;
		this.animationPaths = [];
		this.easingFunction = new MoSineEase(MoEasingMode.Out);
		this.interpolator = MoNumberInterpolator.getInstance();
		this.repeatBehavior = MoRepeatBehavior.Loop;
		this.repeatCount = 1;
		this.repeatDelay = 0;
		this.delay = 0;
		this.seekTime = 0;
		this.duration = 500;
		this.durationHasBeenSet = false;
		this.reverseAnimation = false;
		this.animator = null;
	},
	
	getDrawable : function() {
		/**
		 * SUMMARY:
		 * 	Gets the drawable associated with this animation.
		 *
		 * RETURNS (MoDrawable):
		 *  The drawable that was specified during initialization.
		 */
	
		return this.drawable;
	},
	
	setDrawable : function(value) {
		/**
		 * SUMMARY:
		 * 	Associates a drawable with this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoDrawable value:
		 *		An instance of a MoDrawable, this drawable will be
		 *		updated according to the animating property's options.
		 *
		 * RETURNS (void):
		 */

		this.throwIfHaveAnimator();
		this.drawable = value;
	},

	getAnimationPaths : function() {
		/**
		 * SUMMARY:
		 * 	Gets an array of MoAnimationPath objects that can be used to
		 *  find tune your animation.
		 *
		 * RETURNS (MoAnimationPath[]):
		 *  An array of MoAnimationPath objects.
		 */
	
		return this.animationPaths;
	},

	clearAnimationPaths : function() {
		/**
		 * SUMMARY:
		 *  Removes all animation paths from this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * RETURNS (void):
		 */
	
		this.throwIfHaveAnimator();
		this.animationPaths = [];
	},

	addAnimationPath : function(path) {
		/**
		 * SUMMARY:
		 *  Adds a new MoAnimationPath to this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoAnimationPath path:
		 *		The MoAnimationPath you wish to add.
		 *
		 * RETURNS (void):
		 */
		 
		this.throwIfHaveAnimator();
		this.animationPaths.push(path);
	},

	getEasingFunction : function() {
		/**
		 * SUMMARY:
		 *  Gets the easing function associated with this animation.
		 *
		 *  The default easing function is a MoSineEase.
		 *
		 * RETURNS (MoEasingFunction):
		 *  A MoEasingFunction, if no easing function was set then
		 *  the default MoSineEase will be returned
		 */
		 
		return this.easingFunction;
	},
	
	setEasingFunction : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the easing function for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoEasingFunction value:
		 *		An instance of an easing function.
		 *
		 * RETURNS (void):
		 */
		 
		this.throwIfHaveAnimator();
		
		if(value == null)
			value = MoAnimation.getNullEasingFunction();
		
		this.easingFunction = value;
	},

	getInterpolator : function() {
		/**
		 * SUMMARY:
		 *  Gets the current interpolator associated with this animation.
		 *
		 *  The default is a MoNumberInterpolator.
		 *
		 * RETURNS (MoInterpolator):
		 *  A MoInterpolator, if no interpolator was set then
		 *  the default MoNumberInterpolator will be returned.
		 */
	
		return this.interpolator;
	},
	
	setInterpolator : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the interpolator for this animation. By default the
		 *  MoNumberInterpolator is used which performs the interpolation
		 *  from one number value to another, however, if your value is a
		 *  color, for example, you may wish to use the MoColorInterpolator
		 *  instead.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoInterpolator value:
		 *		An instance of an interpolator.
		 *
		 * RETURNS (void):
		 */
		 
		this.throwIfHaveAnimator();
		this.interpolator = value;
	},
	
	getRepeatBehavior : function() {
		/**
		 * SUMMARY:
		 *  Gets the current repeat behavior for this animation.
		 *
		 *  The default is a MoRepeatBehavior.Loop.
		 *
		 * RETURNS (MoRepeatBehavior):
		 *  A value indicating one of the constants in MoRepeatBehavior.
		 */

		return this.repeatBehavior;
	},
	
	setRepeatBehavior : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the repeat behavior for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  MoRepeatBehavior value:
		 *		A constant MoRepeatBehavior value.
		 *
		 * RETURNS (void):
		 */
		 
		this.throwIfHaveAnimator();
		this.repeatBehavior = value;
	},
	
	getRepeatCount : function() {
		/**
		 * SUMMARY:
		 *  Gets the number of times this animation should be repeated.
		 *
		 *  The default is a 1, meaning it will play a single time.
		 *
		 * RETURNS (Integer):
		 *  The number of times this animation will be repeated. If the
		 *  value is 0, then it will repeat forever.
		 */
	
		return this.repeatCount;
	},
	
	setRepeatCount : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the repeat count for this animation.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Integer value:
		 *		A number that indicates how many times this animation
		 *		should be repeated, 0 indicates it will repeat forever,
		 *		1 will make the animation play once, 2 will make it play
		 *		twice and so on...
		 *
		 * RETURNS (void):
		 */
	
		this.throwIfHaveAnimator();
		this.repeatCount = value;
	},
	
	getRepeatDelay : function() {
		/**
		 * SUMMARY:
		 *  Gets the delay (in milliseconds) for when the animation should
		 *  start playing again after it has finished.
		 *
		 *  The default is a 0.
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds to wait before repeating this animation.
		 */
		 
		return this.repeatDelay;
	},
	
	setRepeatDelay : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the delay (in milliseconds) before the animation is
		 *  repeated.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Number value:
		 *		The number of milliseconds to wait before repeating.
		 *
		 * RETURNS (void):
		 */
	
		this.throwIfHaveAnimator();
		this.repeatDelay = value;
	},
	
	getDelay : function() {
		/**
		 * SUMMARY:
		 *  Gets the delay (in milliseconds) for when this animation should
		 *  start for the first time.
		 *
		 *  The default is a 0.
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds to wait before playing this animation.
		 */
		 
		return this.delay;
	},
	
	setDelay : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the delay (in milliseconds) before the animation is
		 *  played.
		 *
		 * REMARKS:
		 *  Throws an error if the animator has already been created.
		 *
		 * PARAMS:
		 *  Number value:
		 *		The number of milliseconds to wait before playing.
		 *
		 * RETURNS (void):
		 */
	
		this.throwIfHaveAnimator();
		this.delay = value;
	},
	
	getDuration : function() {
		/**
		 * SUMMARY:
		 *  Gets the duration (in milliseconds) that the animation should play for.
		 *
		 *  The default is a 500 (half a second).
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds this animation should last.
		 */
		 
		return this.duration;
	},
	
	setDuration : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the duration (in milliseconds) for how long the animation should
		 *  last.
		 *
		 * PARAMS:
		 *  Number value:
		 *		The number of milliseconds to play before the animation stops.
		 *
		 * RETURNS (void):
		 */
	
		this.duration = value;
		this.durationHasBeenSet = true;
	},
	
	getCurrentTime : function() {
		/**
		 * SUMMARY:
		 *  Gets the current time (in milliseconds).
		 *
		 * RETURNS (Number):
		 *  The number of milliseconds that have elapsed since the animation
		 *  started.
		 */
	
		return (this.animator != null ? this.animator.getElapsedTotalTime() : this.seekTime);
	},
	
	setCurrentTime : function(value) {
		/**
		 * SUMMARY:
		 *  Moves the playhead (in milliseconds) to the specified value.
		 *
		 * PARAMS:
		 *  Number value:
		 *		The number of milliseconds from (0 - duration) to seek to.
		 *
		 * RETURNS (void):
		 */
	
		if(this.animator != null)
			this.animator.setElapsedTotalTime(value);
		
		this.seekTime = value;
	},
	
	getIsRunning : function() {
		/**
		 * SUMMARY:
		 *  Determines whether or not this animation is currently running.
		 *
		 * RETURNS (Boolean):
		 *  true if the animation is running; otherwise false.
		 */
		 
		return (this.animator != null ? this.animator.getIsRunning() : false);
	},
	
	setPlayInReversed : function(value) {
		/**
		 * SUMMARY:
		 *  Sets whether or not this animation should play forward or reverse.
		 *
		 * PARAMS:
		 *  Boolean value:
		 *		true to play the animation in reverse; otherwise false.
		 *
		 * RETURNS (void):
		 */
	
		if(value && this.animator != null)
			this.animator.reverse();

		this.reverseAnimation = value;
	},
	
	play : function() {
		/**
		 * SUMMARY:
		 *  Begins playing the animation from the start.
		 *
		 * RETURNS (void):
		 */
	
		this.playImpl();
	},

	playImpl : function() {
		// @PRIVATE
		var paths = this.getAnimationPaths();
	
		// since there is nothing to animate just fire off a timer when the
		// animation is supposed to finish so that any code expecting a completion 
		// event can still function
		if(paths == null || paths.length == 0)
		{
			var timer = new MoTimer(this.getDuration(), 1);
			timer.addEventHandler(MoTimerEvent.TICK, this.handleEmptyAnimationTick.asDelegate(this));
			timer.start();

			return;
		}
		
		var len = paths.length;

		for(var i = 0; i < len; ++i)
		{
			var ka = paths[i];
			var keyframes = ka.getKeyframes();
			
			if(keyframes == null)
				continue;
				
			// if we have a global interpolator then use it for
			// our key frame animations instead
			if(this.getInterpolator() != null)
				ka.setInterpolator(this.getInterpolator());

			var maxKeyframeDuration = ka.getDuration();
			
			if(this.getDuration() > 0 && maxKeyframeDuration > this.getDuration())
				this.setDuration(maxKeyframeDuration);
		}
		
		this.animator = new MoAnimator(this.getDuration());
		this.animator.setTarget(this);
		this.animator.setRepeatBehavior(this.getRepeatBehavior());
		this.animator.setRepeatCount(this.getRepeatCount());
		this.animator.setRepeatDelay(this.getRepeatDelay());
		this.animator.setDelay(this.getDelay());
		this.animator.setAnimationPaths(paths);
		this.animator.setInterpolator(this.getInterpolator());
		this.animator.setEaser(this.getEasingFunction());
		
		if(this.reverseAnimation)
			this.animator.setPlayInReversed(true);
		
		this.animator.play();
		
		if(this.seekTime > 0)
			this.animator.setElapsedTotalTime(this.seekTime);
	},
	
	pause : function() {
		/**
		 * SUMMARY:
		 *  Pauses this animation at the current time.
		 *
		 * RETURNS (void):
		 */
	
		if(this.animator != null)
			this.animator.pause();
	},
	
	stop : function() {
		/**
		 * SUMMARY:
		 *  Stops the animation and resets the playhead back to zero.
		 *
		 * RETURNS (void):
		 */
	
		if(this.animator != null)
			this.animator.stop();
	},
	
	resume : function() {
		/**
		 * SUMMARY:
		 *  Resumes playback from the current position.
		 *
		 * RETURNS (void):
		 */
	
		if(this.animator != null)
			this.animator.resume();
	},
	
	reverse : function() {
		/**
		 * SUMMARY:
		 *  Reverses the playback.
		 *
		 * RETURNS (void):
		 */
		 
		if(this.animator != null)
			this.animator.reverse();
		
		this.reverseAnimation = !this.reverseAnimation;
	},
	
	end : function() {
		/**
		 * SUMMARY:
		 *  Immediately ends this animation an sends a MoAnimationEvent.COMPLETE event, 
		 *  this is called internally, however, there may times when you wish to manually
		 *  end an animation and have it's COMPLETE event dispatched.
		 *
		 * RETURNS (void):
		 */
		if(this.animator != null)
		{
			this.animator.end();
			this.animator = null;
		}
	},
	
	finish : function() {
		// @PRIVATE
		this.dispatchEvent(new MoAnimationEvent(MoAnimationEvent.COMPLETE));
		this.animator = null;
	},
	
	handleEmptyAnimationTick : function(event) {
		// @PRIVATE
		this.finish();
	},
	
	applyValues : function(animator) {
		// @PRIVATE
		var paths = this.getAnimationPaths();
		var len = paths.length;

		for(var i = 0; i < len; ++i)
		{
			var propertyName = paths[i].getProperty();

			this.setValue(propertyName, animator.getCurrentValue().get(propertyName));
		}
	},
	
	finalizeValues : function() {
		// @PRIVATE
		
		var prevValue = null;
		var path = null;
		var keyframes = null;
		var len = this.animationPaths.length;
		
		for(var i = 0; i < len; ++i)
		{
			path = this.animationPaths[i];
			keyframes = path.keyframes;
			
			if(MoIsNull(keyframes) || keyframes.length == 0)
				continue;
				
			if(!this.isValidValue(keyframes[0].value))
				keyframes[0].value = this.getCurrentValue(path.property);
				
			prevValue = keyframes[0].value;
			
			for(var j = 1; j < keyframes.length; ++j)
			{
				var kf = keyframes[j];

				if(!this.isValidValue(kf.value))
					kf.value = prevValue;

				prevValue = kf.value;
			}
		}
	},
	
	isValidValue : function(value) {
		// @PRIVATE
		return ((value instanceof Number && !isNaN(Number(value))) || (!(value instanceof Number) && value !== null));
	},

	startAnimationImpl : function(animator) {
		// @PRIVATE
		this.finalizeValues();
		this.dispatchEvent(new MoAnimationEvent(MoAnimationEvent.BEGIN));
	},

	updateAnimationImpl : function(animator) {
		// @PRIVATE
		this.applyValues(animator);
	},

	repeatAnimationImpl : function(animator) {
		// @PRIVATE
		this.dispatchEvent(new MoAnimationEvent(MoAnimationEvent.REPEAT));
	},
	
	endAnimationImpl : function(animator) {
		// @PRIVATE
		this.finish();
	},
	
	stopAnimationImpl : function(animator) {
		// @PRIVATE
		this.dispatchEvent(new MoAnimationEvent(MoAnimationEvent.STOP));
	},
	
	setValue : function(propertyName, value) {
		// @PRIVATE
		var setter = this.drawable.getAnimatablePropertySetter(propertyName);
		
		if(setter != null)
			setter.apply(this.drawable, [value]);
	},
	
	getCurrentValue : function(propertyName) {
		// @PRIVATE
		var getter = this.drawable.getAnimatablePropertyGetter(propertyName);
		
		if(getter != null)
			return getter.apply(this.drawable);
	},

	throwIfHaveAnimator : function() {
		// @PRIVATE
		if(!MoIsNull(this.animator) && this.getIsRunning())
			throw new Error("Cannot set property value when animation has already started.");
	}
});

Object.extend(MoAnimation, {
	// @PRIVATE
	NullEasingFunction : null,
	
	getNullEasingFunction : function() {
		// @PRIVATE
		if(MoIsNull(MoAnimation.NullEasingFunction))
			MoAnimation.NullEasingFunction = new MoLinearEase();
			
		return MoAnimation.NullEasingFunction;
	}
});


//=====================================================================
//= MoAnimationSet.js
//=====================================================================

MoAnimationSet = Class.create(MoEventDispatcher, {	
	initialize : function($super) {
		$super();
		
		this.animations = new Array();
	},

	play : function() {
		/** override **/
	},

	pause : function() {
		/** override **/
	},

	resume : function() {
		/** override **/
	},

	stop : function() {
		/** override **/
	},

	reverse : function() {
		/** override **/
	},

	getAnimationAt : function(index) {
		return this.animations[index];
	},
	
	getAnimationCount : function() {
		return this.animations.length;
	},
	
	indexOfAnimation : function(animation) {
		return this.animations.indexOf(animation);
	},
	
	addAnimation : function(animation) {
		this.animations.push(animation);
	},
	
	removeAnimation : function(animation) {
		this.animations.remove(animation);
	},
	
	removeAnimationAt : function(index) {
		this.animations.removeAt(index);
	},
		
	clear : function() {
		this.animations.clear();
	}
});


//=====================================================================
//= MoAnimator.js
//=====================================================================

MoAnimator = Class.create(MoEventDispatcher, 
// @PRIVATE
{

	initialize : function($super, duration) {
		$super();

		this.duration = MoValueOrDefault(duration, 0);
		this.startTime = -1;
		this.currentTime = -1;
		this.currentStartTime = -1;
		this.totalTime = -1;
		this.delay = 0;
		this.delayTime = -1;
		this.delayIndex = -1;
		this.repeatBehavior = MoRepeatBehavior.Loop;
		this.repeatDelay = 0;
		this.repeatCount = 1;
		this.isRunning = false;
		this.isReversed = false;
		this.interpolator = null;
		this.target = null;
		this.index = -1;
		this.hasStarted = false;
		this.currentValue = null;
		this.currentFraction = 0;
		this.easer = new MoLinearEase();
		this.doSeek = false;
		this.doReverse = false;
		this.playInReverse = false;
		this.animationPaths = null;
	},
	
	getAnimationPaths : function() {
		return this.animationPaths;
	},

	setAnimationPaths : function(value) {
		this.animationPaths = value;
	},
	
	getEaser : function() {
		return this.easer;
	},
	
	setEaser : function(value) {
		this.easer = value;
	},
	
	getDuration : function() {
		return this.duration;
	},
	
	setDuration : function(value) {
		this.duration = value;
	},
	
	getDelay : function() {
		return this.delay;
	},
	
	setDelay : function(value) {
		this.delay = value;
	},
	
	getRepeatBehavior : function() {
		return this.repeatBehavior;
	},
	
	setRepeatBehavior : function(value) {
		this.repeatBehavior = value;
	},
	
	getRepeatCount : function() {
		return this.repeatCount;
	},
	
	setRepeatCount : function(value) {
		this.repeatCount = value;
	},
	
	getRepeatDelay : function() {
		return this.repeatDelay;
	},
	
	setRepeatDelay : function(value) {
		this.repeatDelay = value;
	},
	
	getIsRunning : function() {
		return this.isRunning;
	},
	
	getInterpolator : function() {
		return this.interpolator;
	},
	
	setInterpolator : function(value) {
		this.interpolator = value;
	},
	
	getTarget : function() {
		return this.target;
	},
	
	setTarget : function(value) {
		this.target = value;
	},
	
	getPlayInReverse : function() {
		return this.playInReverse;
	},
	
	setPlayInReverse : function(value) {

		if(this.isRunning)
		{
			if(this.isReversed != value)
			{
				this.isReversed = value;
				this.seek(this.duration - this.currentTime, true);
			}
		}
		
		this.doReverse = value;
		this.playInReverse = value;
	},
	
	getElapsedTotalTime : function() {
		return this.totalTime + this.delay;
	},
	
	setElapsedTotalTime : function(value) {
		this.seek(value, true);
	},
	
	getElapsedTime : function() {
		return this.currentTime;
	},
	
	getCurrentFractionValue : function() {
		return this.currentFraction;
	},
	
	getCurrentValue : function() {
		return this.currentValue;
	},
	
	play : function() {
		this.stopImpl();
		
		var len = this.animationPaths.length;
		var keyframes = null;
		var keyframeZero = null;

		for(var i = 0; i < len; ++i)
		{
			keyframes = this.animationPaths[i].getKeyframes();

			// the path has no keyframes, just move on
			if(keyframes.length == 0)
				continue;

			keyframeZero = keyframes[0];
			
			// ensure that the first keyframe is zero
			if(!keyframeZero.getIsValidKeyTime())
				keyframeZero.setKeyTime(0);

			// the first key frame doesn't start at zero so we need to put in
			// some filler frames to make up for the difference
			else if(keyframeZero.getKeyTime() > 0)
			{
				var startTime = keyframeZero.getKeyTime();
				
				// add a keyframe at zero with an invalid value
				keyframes.splice(0, 0, new MoKeyframe(0, null));
				
				// then add another keyframe right before it, if the first keyframe
				// starts at 1000ms then this keyframe would be 999, so 0-999, 999-1000, etc...
				keyframes.splice(1, 0, new MoKeyframe(startTime-1, null));

				// in reverse we just add the first value to the new filler keyframes
				// we just added, this way it just continues to zero with the same end
				// value all the way through
				if(this.getPlayInReverse())
				{
					keyframes[0].setValue(keyframes[2].getValue());
					keyframes[1].setValue(keyframes[2].getValue());
				}
			}

			for(var j = 1; j < keyframes.length; ++j)
			{
				// the keyframe's has an invalid time so the only thing we can really do is
				// just set it to our duration
				//
				// FIXME : we should just figure out the actual time it should be in this case
				//		   based on the keyframe before and after this keyframe
				//		   i.e. just pick something in the middle
				if(!keyframes[j].getIsValidKeyTime())
					keyframes[j].setKeyTime(this.getDuration());
			}

			// validate the keyframes, i.e. this will update our keyframes
			// time slice for the specified duration
			this.animationPaths[i].validateKeyframesForDuration(this.getDuration());
		}
		
		// reverse playback
		if(this.doReverse)
			this.isReversed = true;
		
		// don't start the animation now, add to our list of delayed
		// animations until it's ready to go
		if(this.getDelay() > 0 && !this.getPlayInReverse())
			this.delayAnimation(this.getDelay());

		// start it now
		else
			this.start();
	},
	
	pause : function() {
		if(this.delayIndex != -1)
		{
			var delayedAnimator = MoAnimator.DelayedAnimators[this.delayIndex];
			var pendingTime = delayedAnimator.getDelay();
			
			if(!isNaN(pendingTime) && pendingTime != -1)
			{
				this.delayTime = pendingTime - MoAnimator.getCurrentTime();
				this.removeFromDelayedAnimations();
			}
		}
		
		this.isRunning = false;
	},
	
	resume : function() {
		this.isRunning = true;
		
		if(this.delayTime >= 0)
		{
			this.delayAnimation(this.delayTime);
		}
		else
		{
			this.currentStartTime = MoAnimator.CurrentTimeTick - this.currentTime;
			this.startTime = MoAnimator.CurrentTimeTick - this.totalTime;
			
			if(this.doReverse)
			{
				this.reverse();
				this.doReverse = false;
			}
		}
	},
	
	start : function() {

		var actualStartTime = 0;
		
		if(!this.playInReverse)
		{
			if(this.delayIndex != -1)
			{
				var delayedAnimator = MoAnimator.DelayedAnimators[this.delayIndex];
				var overrun = MoAnimator.getCurrentTime() - delayedAnimator.getDelay();
				
				if(overrun > 0)
					actualStartTime = Math.min(overrun, this.duration);

				this.removeFromDelayedAnimations();
			}
		}
		
		this.updateTargetState(MoAnimator.TargetState.Start);
		this.updateInterpolators();
		this.updateValue(0, true);

		MoAnimator.addAnimator(this);

		this.startTime = this.currentStartTime;
		this.isRunning = true;
		
		if(actualStartTime > 0)
			this.seek(actualStartTime);
		
		this.hasStarted = true;
	},
	
	stop : function() {
		this.stopImpl();
		this.updateTargetState(MoAnimator.TargetState.Stop);
	},
	
	stopImpl : function() {
		this.removeFromDelayedAnimations();
	
		if(this.index >= 0)
		{
			MoAnimator.removeAnimatorAt(this.index);

			this.index = -1;
			this.isReversed = false;
			this.isRunning = false;
		}
	},
	
	end : function() {
		
		// remove the delayed animator, if exists
		if(this.delay > 0)
			this.removeFromDelayedAnimations();
		
		// make sure things go through the normal states
		if(!this.hasStarted)
			this.updateTargetState(MoAnimator.TargetState.Start);
		
		if(this.repeatCount > 1 && this.repeatBehavior == MoRepeatBehavior.Reverse && (this.repeatCount % 2 == 0))
			this.isReversed = true;
		
		// update to the end
		if(!(this.doReverse && this.delay > 0))
			this.updateValue(this.duration, true);

		// stop officially
		if(this.isRunning)
			this.stopImpl();
		else
			MoAnimator.stopTimerIfDone();
		
		// update targets state
		this.updateTargetState(MoAnimator.TargetState.End);		
	},
	
	seek : function(time, includeDelay) {
		includeDelay = MoValueOrDefault(includeDelay, false);
		
		this.startTime = this.currentStartTime = (MoAnimator.CurrentTimeTick - time);
		this.doSeek = true;
		
		if(!this.isRunning || this.playInReverse)
		{
			var isRunningTmp = this.isRunning;
			
			MoAnimator.CurrentTimeTick = MoAnimator.getCurrentTime();
			
			if(includeDelay && this.delay > 0)
			{
				if(this.delayIndex != -1)
				{
					var delayedAnimator = MoAnimator.DelayedAnimators[this.delayIndex];
					var postDelaySeekTime = time - this.delay;
					
					this.removeFromDelayedAnimations();
					
					if(this.playInReverse)
						postDelaySeekTime -= this.duration;
					
					if(postDelaySeekTime < 0)
					{
						this.delayAnimation(this.delay - time);
						return;
					}
					else
					{						
						time -= this.delay;
						
						if(!this.isRunning)
							this.start();
						
						this.startTime = this.currentStartTime = (MoAnimator.CurrentTimeTick - time);

						this.update();
						this.doSeek = false;
						return;
					}
				}
			}
			
			if(!isRunningTmp)
			{
				this.updateTargetState(MoAnimator.TargetState.Start);
				this.updateInterpolators();
			}
			
			this.startTime = this.currentStartTime = (MoAnimator.CurrentTimeTick - time);
		}
		
		this.update();
		this.doSeek = false;
	},
	
	reverse : function() {
		if(this.isRunning)
		{
			this.doReverse = false;
			this.seek(this.duration - this.currentTime);
			this.isReversed = !this.isReversed;
		}
		else
		{
			this.doReverse = !this.doReverse;
		}
	},
	
	updateInterpolators : function() {
		if(this.interpolator != null && this.animationPaths != null)
		{
			var len = this.animationPaths.length;

			for(var i = 0; i < len; ++i)
				this.animationPaths[i].setInterpolator(this.getInterpolator());
		}
	},	
	
	updateValue : function(time, updateTarget) {
		this.currentValue = new MoDictionary();

		// there is no specified duration so just update the animation
		// to the final values
		if(this.duration == 0)
		{
			this.updateValueForZeroDuration(updateTarget);
			return;
		}
		
		if(this.isReversed)
			time = this.duration - time;
		
		// compute the current easing fraction and update our value table
		this.currentFraction = this.easer.ease(time / this.duration);
		this.updateValueForFraction(this.currentFraction);

		// update the targets state
		if(updateTarget)
			this.updateTargetState(MoAnimator.TargetState.Update);
	},

	updateValueForFraction : function(fraction) {
		if(this.animationPaths != null)
		{
			var len = this.animationPaths.length;

			for(var i = 0; i < len; ++i)
			{
				this.currentValue.set(
					this.animationPaths[i].getProperty(),
					this.animationPaths[i].getValue(fraction));
			}
		}
	},

	updateValueForZeroDuration : function(updateTarget) {
		var len = this.animationPaths.length;

		for(var i = 0; i < len; ++i)
		{
			var keyframeIndex = (this.isReversed ? 0 : this.animationPaths[i].getKeyframes().length-1);
				
			this.currentValue.set(
				this.animationPaths[i].getProperty(), 
				this.animationPaths[i].getKeyframes()[keyframeIndex].getValue());
		}
			
		if(updateTarget)
			this.updateTargetState(MoAnimator.TargetState.Update);
	},
	
	update : function() {
		var repeated = false;
		
		if(this.isRunning || this.doSeek)
		{
			var currentTimeTick = MoAnimator.CurrentTimeTick;
			var currentTime = currentTimeTick - this.currentStartTime;

			// update our total running time
			this.totalTime = currentTimeTick - this.startTime;
			
			if(currentTime >= this.duration)
			{
				var currentRepeatCount = 2;
				
				if((this.duration + this.repeatDelay) > 0)
					currentRepeatCount += Math.floor((this.totalTime - this.duration) / (this.duration + this.repeatDelay));

				// continue repetition
				if(this.repeatCount == 0 || currentRepeatCount <= this.repeatCount)
				{
					// there is no delay, so repeat this animation right away
					if(this.repeatDelay == 0)
					{
						this.currentTime = currentTime % this.duration;
						this.currentStartTime = MoAnimator.CurrentTimeTick - this.currentTime;
						
						currentTime = this.currentTime;
						
						if(this.repeatBehavior == MoRepeatBehavior.Reverse)
							this.isReversed = !this.isReversed;
						
						repeated = true;
					}
					else
					{
						// there is a delay in repeating, if we are seeking we need to 
						// compensate for this
						if(this.doSeek)
						{
							this.currentTime = currentTime % (this.duration + this.repeatDelay);
							
							if(this.currentTime > this.duration)
								this.currentTime = this.duration;
							
							this.updateValue(this.currentTime, true);
							return false;
						}

						// otherwise just remove this animator and wait for the
						// repeatDelay time to pass to start again
						else
						{
							this.currentTime = this.duration;
							this.updateValue(this.currentTime, true);
							
							MoAnimator.removeAnimator(this);
							
							var timer = new MoTimer(this.repeatDelay, 1);
							timer.addEventHandler(MoTimerEvent.TICK, this.repeatDelayTimerTick.asDelegate(this));
							timer.start();
							
							return false;
						}
					}
				}

				// this is done
				else if(currentTime > this.duration)
				{	
					currentTime = this.duration;
					this.totalTime = this.duration;
				}
			}
			
			// update the current animation time
			this.currentTime = currentTime;

			if(currentTime >= this.duration && !this.doSeek)
			{
				// this animation is finished
				if(!this.playInReverse || this.delay == 0)
				{
					this.updateValue(currentTime, false);
					this.end();
					
					return true;
				}
				else
				{
					this.stopImpl();
					this.delayAnimation(this.delay);
				}
			}
			else
			{
				if(repeated)
					this.updateTargetState(MoAnimator.TargetState.Repeat);
				
				this.updateValue(currentTime, true);
			}
		}

		return false;
	},
	
	repeatDelayTimerTick : function(event) {
		// swap reverse
		if(this.repeatBehavior == MoRepeatBehavior.Reverse)
			this.isReversed = !this.isReversed;

		// update the target back to the start
		this.updateValue(0, true);
		this.updateTargetState(MoAnimator.TargetState.Repeat);

		// add the animator back into our running list
		MoAnimator.addAnimator(this);
	},

	updateTargetState : function(state) {

		if(this.target == null)
			return;

		switch(state)
		{
			case MoAnimator.TargetState.Start:
				this.target.startAnimationImpl(this);
				break;
			case MoAnimator.TargetState.Stop:
				this.target.stopAnimationImpl(this);
				break;
			case MoAnimator.TargetState.Update:
				this.target.updateAnimationImpl(this);
				break;
			case MoAnimator.TargetState.Repeat:
				this.target.repeatAnimationImpl(this);
				break;
			case MoAnimator.TargetState.End:
				this.target.endAnimationImpl(this);
				break;
		}
	},
	
	delayAnimation : function(delayTime) {

		// ensure our timer is running
		MoAnimator.startTimerIfNeeded();

		// determine the index at which the new animation should be added
		// delayed animators are ordered by their delayed time
		var startTime = this.computeDelayedAnimationStartTime(delayTime);
		var index = this.getDelayedAnimationIndexBeforeTime(startTime);
		var delayedAnimator = new MoDelayedAnimator(this, startTime);

		if(index == -1)
			MoAnimator.DelayedAnimators.push(delayedAnimator);
		else
			MoAnimator.DelayedAnimators.splice(index, 0, delayedAnimator);

		// make sure all the delayed animations have their index
		// values updated so there are in sequential order
		this.updateDelayedAnimationIndices();
	},

	computeDelayedAnimationStartTime : function(delayTime) {
		return MoAnimator.getCurrentTime() + delayTime;
	},

	getDelayedAnimationIndexBeforeTime : function(t) {
		var len = MoAnimator.DelayedAnimators.length;

		for(var i = 0; i < len; ++i)
		{
			if(t < MoAnimator.DelayedAnimators[i].getDelay())
				return i;
		}

		return -1;
	},

	updateDelayedAnimationIndices : function() {
		var len = MoAnimator.DelayedAnimators.length;
		var animator = null;
		
		for(var i = 0; i < len; ++i)
		{
			animator = MoAnimator.DelayedAnimators[i].getAnimator();
			animator.delayIndex = i;
		}
	},

	removeFromDelayedAnimations : function() {
		if(this.delayIndex != -1)
		{
			MoAnimator.DelayedAnimators.removeAt(this.delayIndex);
			this.delayIndex = -1;
		}
	}
});

MoDelayedAnimator = Class.create({	
	initialize : function(animator, delay) {
		this.animator = animator;
		this.delay = MoValueOrDefault(delay, 0);
	},
	
	getAnimator : function() {
		return this.animator;
	},
	
	setAnimator : function(value) {
		this.animator = value;
	},
	
	getDelay : function() {
		return this.delay;
	},
	
	setDelay : function(value) {
		this.delay = value;
	}
});

Object.extend(MoAnimator, 
// @PRIVATE
{
	TargetState : {
		"Start"		: 1,
		"Stop"		: 2,
		"Update"	: 3,
		"Repeat"	: 4,
		"End"		: 5
	},
	
	ActiveAnimators : new Array(),
	DelayedAnimators : new Array(),
	AnimationTimer : null,
	AnimationTimerInterval : 10,
	CurrentTimeTick : -1,
	CurrentTime : -1,
	CurrentStartTime : -1,
	
	addAnimator : function(animator) {
	
		animator.index = MoAnimator.getActiveAnimationCount();
		
		MoAnimator.ActiveAnimators.push(animator);
		MoAnimator.startTimerIfNeeded();
		MoAnimator.CurrentTimeTick = MoAnimator.getCurrentTime();
		
		animator.currentStartTime = MoAnimator.CurrentTimeTick;
	},
	
	removeAnimator : function(animator) {
		MoAnimator.removeAnimatorAt(animator.index);
	},
	
	removeAnimatorAt : function(index) {
		if(index >= 0 && index < MoAnimator.getActiveAnimationCount())
		{
			MoAnimator.ActiveAnimators.removeAt(index);
			
			for(var i = index; i < MoAnimator.getActiveAnimationCount(); i++)
			{
				var animation = MoAnimator.ActiveAnimators[i];
				animation.index--;
			}
		}
		
		MoAnimator.stopTimerIfDone();
	},
	
	startTimerIfNeeded : function() {
		if(MoAnimator.AnimationTimer == null)
		{
			MoAnimator.pulse();
			
			var timer = new MoTimer(MoAnimator.AnimationTimerInterval);
			timer.addEventHandler(MoTimerEvent.TICK, MoAnimator.animationTimerTick);
			timer.start();

			MoAnimator.AnimationTimer = timer;
		}
	},

	stopTimerIfDone : function() {
		if(MoAnimator.AnimationTimer != null && MoAnimator.getActiveAnimationCount() == 0 && MoAnimator.getDelayedAnimationCount() == 0)
		{
			MoAnimator.CurrentTimeTick = -1;
			MoAnimator.AnimationTimer.reset();
			MoAnimator.AnimationTimer = null;
		}
	},
	
	animationTimerTick : function(event) {
		var i = 0;
		
		MoAnimator.CurrentTimeTick = MoAnimator.pulse();

		while(i < MoAnimator.ActiveAnimators.length)
		{
			var incrementIndex = true;
			var animation = MoAnimator.ActiveAnimators[i];
			
			if(animation != null)
				incrementIndex = !animation.update();

			if(incrementIndex)
				++i;
		}
		
		while(MoAnimator.DelayedAnimators.length > 0)
		{
			var delayedAnim = MoAnimator.DelayedAnimators[0].getAnimator();
			var delay = MoAnimator.DelayedAnimators[0].getDelay();
			
			if(delay < MoAnimator.getCurrentTime())
			{
				if(delayedAnim.getPlayInReverse())
					delayedAnim.end();
				else
					delayedAnim.start();
			}
			else
			{
				break;
			}
		}
	},
	
	pulse : function() {
		var startTime = MoAnimator.CurrentStartTime;
		var currentTime = MoAnimator.CurrentTime;
		
		if(startTime < 0)
			startTime = MoGetTimer();

		currentTime = MoGetTimer() - startTime;

		MoAnimator.CurrentStartTime = startTime;
		MoAnimator.CurrentTime = currentTime;

		return currentTime;
	},
	
	getCurrentTime : function() {
		if(MoAnimator.CurrentTime < 0)
			return MoAnimator.pulse();

		return MoAnimator.CurrentTime;
	},
	
	getActiveAnimationCount : function() {
		return MoAnimator.ActiveAnimators.length;
	},
	
	getDelayedAnimationCount : function() {
		return MoAnimator.DelayedAnimators.length;
	}
});


//=====================================================================
//= MoEasingFunction.js
//=====================================================================

MoEasingFunction = Class.create({
	initialize : function(easingModeOrPercent) {
	
		/** MoEasingMode / Number (0.0 - 1.0) **/
		this.easingPercent = MoValueOrDefault(easingModeOrPercent, MoEasingMode.Out);
	},
	
	getEasingModeOrPercent : function() {
		return this.easingPercent;
	},
	
	setEasingModeOrPercent : function(value) {
		this.easingPercent = value;
	},
	
	ease : function(t) {	
		var easeOutValue = 1 - this.easingPercent;
		
		if(t <= this.easingPercent && this.easingPercent > 0)
			return this.easingPercent * this.easeIn(t / this.easingPercent);

		return this.easingPercent + easeOutValue * this.easeOut((t - this.easingPercent) / easeOutValue);
	},
	
	easeIn : function(t) {
		return t;
	},
	
	easeOut : function(t) {
		return t;
	}
});


//=====================================================================
//= MoEasingMode.js
//=====================================================================


MoEasingMode = {

/**
 * @CLASS
 *
 * SUMMARY:
 *	Defines the easing modes that can be applied to an MoEasingFunction.
 *
 * EXAMPLE:
 *	<code>
 *		var ease = new MoCubicEase(MoEasingMode.InOut);
 *	</code>
 *
 */

	/**
	 * SUMMARY:
	 *  Specifies that the easing instance spends the entire animation easing out.
	 */
	Out		: 0,
	
	/**
	 * SUMMARY:
	 *  Specifies that an easing instance that eases in for the first half and 
	 *  eases out for the remainder.
	 */
	InOut	: 0.5,
	
	/**
	 * SUMMARY:
	 *  Specifies that the easing instance spends the entire animation easing in.
	 */
	In		: 1
};


//=====================================================================
//= MoPowerEase.js
//=====================================================================

MoPowerEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent, pow) {
		$super(easingModeOrPercent);
		
		this.pow = MoValueOrDefault(pow, 2);
	},
	
	getPow : function() {
		return this.pow;
	},
	
	setPow : function(value) {
		this.pow = value;
	},

	easeIn : function(t) {
		if(t < 0)
			return 0;
		
		if(t > 1)
			return 1;

		return Math.pow(t, this.getPow());
	},
	
	easeOut : function(t) {
		if(t < 0)
			return 0;
		
		if(t > 1)
			return 1;

		return 1 - Math.pow(1 - t, this.getPow());
	}
});


//=====================================================================
//= MoBackEase.js
//=====================================================================

MoBackEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent, amplitude) {
		$super(easingModeOrPercent);

		this.amplitude = MoValueOrDefault(amplitude, 1.2);
	},
	
	getAmplitude : function() {
		return this.amplitude;
	},
	
	setAmplitude : function(value) {
		this.amplitude = value;
	},
	
	easeIn : function(t) {
		return (t * t * ((this.getAmplitude() + 1) * t - this.getAmplitude()));
	},
	
	easeOut : function(t) {		
		return (1 - (t = 1 - t) * t * ((this.getAmplitude() + 1) * t - this.getAmplitude()));
	}
});


//=====================================================================
//= MoBounceEase.js
//=====================================================================

MoBounceEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent);
	},
	
	easeIn : function(t) {
		return 1 - this.easeOut(1 - t);
	},
	
	easeOut : function(t) {
		if(t < (1 / 2.75))
			return 7.5625 * t * t;
		else if(t < (2 / 2.75))
			return (7.5625 * (t -= (1.5 / 2.75)) * t + .75);
		else if(t < (2.5 / 2.75))
			return (7.5625 * (t -= (2.25/2.75)) * t + .9375);
		else
			return (7.5625 * (t -= (2.625/2.75)) * t + .984375);
	}
});


//=====================================================================
//= MoCircEase.js
//=====================================================================

MoCircEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent);
	},

	easeIn : function(t) {
		return -(Math.sqrt(1 - t * t) - 1);
	},
	
	easeOut : function(t) {		
		return Math.sqrt(1 - (t = t - 1) * t);
	}
});


//=====================================================================
//= MoCubicEase.js
//=====================================================================

MoCubicEase = Class.create(MoPowerEase, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent, 3);
	}
});


//=====================================================================
//= MoElasticEase.js
//=====================================================================

MoElasticEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent, amplitude, period) {
		$super(easingModeOrPercent);
		
		this.amplitude = MoValueOrDefault(amplitude, 1);
		
		this.period = MoValueOrDefault(period, 0.45);
	},
	
	getAmplitude : function() {
		return this.amplitude;
	},
	
	setAmplitude : function(value) {
		this.amplitude = value;
	},
	
	getPeriod : function() {
		return this.period;
	},
	
	setPeriod : function(value) {
		this.period = value;
	},

	ease : function(t) {
		var b = 0;
		var c = 1;
		var d = 1;
		var a = this.getAmplitude();
		var p = this.getPeriod();

		if(t == 0)
			return b;

		if((t /= d) == 1)
			return b + c;

		if(!p)
			p = d * 0.3;

		var s;

		if(!a || a < Math.abs(c))
		{
			a = c;
			s = p / 4;
		}
		else
		{
			s = p / (2 * Math.PI) * Math.asin(c / a);
		}

		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	}
});


//=====================================================================
//= MoExpoEase.js
//=====================================================================

MoExpoEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent);
	},

	easeIn : function(t) {
		return (t == 0) ? t : Math.pow(2, 10 * (t - 1)) - 0.001;
	},
	
	easeOut : function(t) {		
		return (t == 1) ? t : 1.001 * (-Math.pow(2, -10 * t) + 1);
	}
});


//=====================================================================
//= MoLinearEase.js
//=====================================================================

MoLinearEase = Class.create({
	initialize : function(easeInFraction, easeOutFraction) {
		this.easeInFraction = MoValueOrDefault(easeInFraction, 0);
		this.easeOutFraction = MoValueOrDefault(easeOutFraction, 0);
	},
	
	getEaseInFraction : function() {
		return this.easeInFraction;
	},
	
	setEaseInFraction : function(value) {
		this.easeInFraction = value;
	},
	
	getEaseOutFraction : function() {
		return this.easeOutFraction;
	},
	
	setEaseOutFraction : function(value) {
		this.easeOutFraction = value;
	},
	
	ease : function(t) {
		if(this.easeInFraction == 0 && this.easeOutFraction == 0)
			return t;
		
		var runRate = 1 / (1 - this.easeInFraction / 2 - this.easeOutFraction / 2);
		
		if(t < this.easeInFraction)
			return t * runRate * (t / this.easeInFraction) / 2;
		
		if(t > (1 - this.easeOutFraction))
		{
			var decTime = t - (1 - this.easeOutFraction);
			var decProportion = decTime / this.easeOutFraction;
			
			return runRate * (1 - this.easeInFraction / 2 - this.easeOutFraction + decTime * (2 - decProportion) / 2);
		}
		
		return runRate * (t - this.easeInFraction / 2);
	}
});


//=====================================================================
//= MoQuadEase.js
//=====================================================================

MoQuadEase = Class.create(MoPowerEase, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent, 2);
	}
});


//=====================================================================
//= MoQuartEase.js
//=====================================================================

MoQuartEase = Class.create(MoPowerEase, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent, 4);
	}
});


//=====================================================================
//= MoQuintEase.js
//=====================================================================

MoQuintEase = Class.create(MoPowerEase, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent, 5);
	}
});


//=====================================================================
//= MoSineEase.js
//=====================================================================

MoSineEase = Class.create(MoEasingFunction, {
	initialize : function($super, easingModeOrPercent) {
		$super(easingModeOrPercent);
	},
	
	easeIn : function(t) {
		return 1 - Math.cos(t * Math.PI / 2);
	},
	
	easeOut : function(t) {
		return Math.sin(t * Math.PI / 2);
	}
});


//=====================================================================
//= MoBasicAnimation.js
//=====================================================================

MoBasicAnimation = Class.create(MoAnimation, {
	initialize : function($super, target, propertyName, fromValue, toValue) {
		$super(target);

		this.fromValue = fromValue;
		this.toValue = toValue;
		this.propertyName = propertyName;
	},

	getFromValue : function() {
		return this.fromValue;
	},

	setFromValue : function(value) {
		this.fromValue = value;
	},
	
	getToValue : function() {
		return this.toValue;
	},
	
	setToValue : function(value) {
		this.toValue = value;
	},
	
	getPropertyName : function() {
		return this.propertyName;
	},

	setPropertyName : function(value) {
		this.propertyName = value;
	},
	
	play : function() {
		var animationPath = new MoAnimationPath(this.getPropertyName());
		animationPath.addKeyframe(new MoKeyframe(0, this.getFromValue()));
		animationPath.addKeyframe(new MoKeyframe(this.getDuration(), this.getToValue()));

		this.clearAnimationPaths();
		this.addAnimationPath(animationPath);

		this.playImpl();
	}
});


//=====================================================================
//= MoColorAnimation.js
//=====================================================================

MoColorAnimation = Class.create(MoBasicAnimation, {	
	initialize : function($super, target, propertyName, fromColor, toColor) {
		$super(target, propertyName, fromColor, toColor);

		this.setInterpolator(MoColorInterpolator.getInstance());
	}
});


//=====================================================================
//= MoKeyframe.js
//=====================================================================

MoKeyframe = Class.create(MoEquatable, {
	initialize : function(keyTime, value) {
	
		/** Number **/
		this.keyTime = MoValueOrDefault(keyTime, -1);
		
		/** Object **/
		this.value = value;
		
		/** Number **/
		this.keyTimeFraction = -1;

		/** MoAnimationEaser **/
		this.easer = MoKeyframe.DefaultEaser;
	},
	
	getValue : function() {
		return this.value;
	},
	
	setValue : function(value) {
		this.value = value;
	},
	
	getKeyTime : function() {
		return this.keyTime;
	},
	
	setKeyTime : function(value) {
		this.keyTime = value;
	},
	
	getEaser : function() {
		return this.easer;
	},

	setEaser : function(value) {
		this.easer = MoValueOrDefault(value, MoKeyframe.DefaultEaser);
	},

	getTimeFraction : function() {
		return this.keyTimeFraction;
	},

	getIsValidKeyTime : function() {
		var t = this.getKeyTime();

		return (!isNaN(t) && t != -1);
	}
});

Object.extend(MoKeyframe, {
	DefaultEaser : new MoLinearEase()
});


//=====================================================================
//= MoAnimationPath.js
//=====================================================================

MoAnimationPath = Class.create(MoEquatable, 
/**
 * @CLASS
 *
 * SUMMARY:
 *  The MoAnimationPath class represents a collection of MoKeyframe objects for an animation and the name of the 
 *  property on the target that should be animated. Each keyframe defines the property value at a specific instance
 *  in time while an animation is running. The animation then interpolates between the values specified by two keyframes
 *  to compute the final property value.
 *
 */
{
	initialize : function(property) {
		/**
		 * SUMMARY:
		 *  Initializes a new instance of the MoAnimationPath class with the specified property.
		 *
		 * PARAMS:
		 *  String property:
		 *		The name of the property you wish to animate.
		 *
		 * RETURNS (void):
		 */
		 
		this.property = MoValueOrDefault(property, null);
		this.keyframes = new Array();
		this.interpolator = MoNumberInterpolator.getInstance();
	},
	
	getProperty : function() {
		/**
		 * SUMMARY:
		 *  Gets the name of the target property to be animated.
		 *
		 * RETURNS (String):
		 *  The property name.
		 */
	
		return this.property;
	},
	
	setProperty : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the name of the target property to be animated.
		 *
		 * PARAMS:
		 *  String property:
		 *		The name of the property you wish to animate.
		 *
		 * RETURNS (void):
		 */
		 
		this.property = value;
	},
	
	getInterpolator : function() {
		/**
		 * SUMMARY:
		 *  Gets the current interpolator, if no interpolator was set
		 *  then the default MoNumberInterpolator is returned.
		 *
		 * RETURNS (MoInterpolator):
		 *  The interpolator.
		 */
		return this.interpolator;
	},
	
	setInterpolator : function(value) {
		/**
		 * SUMMARY:
		 *  Sets the interpolator that will determine how the value of two keyframes
		 *  will be calculated.
		 *
		 * PARAMS:
		 *  MoInterpolator value:
		 *		The interpolator to use, this value cannot be null.
		 *
		 * RETURNS (void):
		 */
		this.interpolator = value;
	},
	
	getKeyframes : function() {
		/**
		 * SUMMARY:
		 *  Gets an array of MoKeyframe objects that represent the time/value pairs
		 *  that the property will take during animation.
		 *
		 * RETURNS (MoKeyframe[]):
		 *  A reference to the MoKeyframe array.
		 */
		return this.keyframes;
	},
	
	setKeyframes : function(value) {
		/**
		 * SUMMARY:
		 *  Set a sequence of MoKeyframe objects that will represent the time/value pairs
		 *  that the property will take duration animation. Each pair of keyframes determines
		 *  the animation during the time interval between the two. If the later of the two 
		 *  keyframes contains an easing function, then it will be used to determine the 
		 *  behavior during that time interval.
		 *
		 *  The sequence of keyframes must be of increasing time values, sorted from lowest
		 *  to highest.
		 *
		 * REMARKS:
		 *  All animations always start at 0 and will last for the duration equal to the time
		 *  value of the last keyframe. If no keyframe is defined at 0, then that keyframe is
		 *  implicit and uses the value of the target property at the time the animation begins.
		 *
		 * PARAMS:
		 *  MoKeyframe[] value:
		 *		An array of MoKeyframe objects.
		 *
		 * RETURNS (void):
		 */
		this.keyframes = value;
	},

	clearKeyframes : function() {
		/**
		 * SUMMARY:
		 *  Removes all keyframes.
		 *
		 * RETURNS (void):
		 */
		this.keyframes = [];
	},

	addKeyframe : function(keyframe) {
		/**
		 * SUMMARY:
		 *  Adds a single keyframe to the path. See setKeyframes for a description of how
		 *  keyframes work.
		 *
		 * PARAMS:
		 *  MoKeyframe keyframe:
		 *		The keyframe to set, the time must be greater than the time of the last keyframe
		 *		and the keyframe cannot be null.
		 *
		 * RETURNS (void):
		 */
		this.keyframes.push(keyframe);
	},
	
	getDuration : function() {
		// @PRIVATE
		if(this.getKeyframes() == null)
			return -1;

		var keyframes = this.getKeyframes();
		var len = keyframes.length;
		var duration = 0;
		
		for(var i = 0; i < len; i++)
			duration = Math.max(keyframes[i].getKeyTime(), duration);

		return duration;
	},
	
	getValue : function(fraction) {
		/**
		 * SUMMARY:
		 *  Gets the interpolated value from the specified elapsed time fraction. The value is calculated by
		 *  determining the keyframe interval that the specified fraction falls within and then interpolates
		 *  between the values of the keyframes in that interval.
		 *
		 * PARAMS:
		 *  Number fraction:
		 *		The elapsed time fraction, specified in the overall duration of the animation, from 0.0 - 1.0.
		 *
		 *		For example, if the total duration is 1 seconds long, and you want to find out what the value
		 *		would be at half a second, you would pass in 0.5.
		 *
		 * RETURNS (Any):
		 *  The interpolated property value.
		 */
		if(this.getKeyframes() == null)
			return null;

		var keyframes = this.getKeyframes();
		var len = keyframes.length;
		
		// only two key frames, so this is a from/to, just interpolate using the
		// provided fraction, this may be outside of 0.0-1.0 for elastic type easing
		if(len == 2 && keyframes[1].getTimeFraction() == 1)
		{		
			return this.interpolator.interpolate(
				keyframes[1].getEaser() == null ? fraction : keyframes[1].getEaser().ease(fraction),
				keyframes[0].getValue(), 
				keyframes[1].getValue());
		}
		
		// ensure that all the key frame fractions are valid, if not
		// we need to update them so they are all scaled out according
		// to the last key frames duration
		if(!this.areKeyframesValid())
			this.validateKeyframesForDuration(keyframes[len-1].getKeyTime());

		// don't waste cpu cycles if we are at the last keyframe
		if(fraction == 1 && keyframes[len-1].keyTimeFraction == 1)
			return keyframes[len-1].getValue();
			
		// start with the first keyframe
		var prevValue = keyframes[0].getValue();
		var prevTimeFraction = keyframes[0].getTimeFraction();

		for(var i = 1; i < len; i++)
		{
			var kf = keyframes[i];
			
			// find the key frame that the specified fraction falls between
			if(fraction >= prevTimeFraction && fraction < kf.getTimeFraction())
			{
				var easer = kf.getEaser();
				var t = (fraction - prevTimeFraction) / (kf.getTimeFraction() - prevTimeFraction);
	
				if(easer != null)
					t = easer.ease(t);

				// interpolate between the previous value and this value
				return this.interpolator.interpolate(t, prevValue, kf.getValue());
			}

			prevTimeFraction = kf.getTimeFraction();
			prevValue = kf.getValue();
		}

		return keyframes[len-1].getValue();
	},

	areKeyframesValid : function() {
		// @PRIVATE
		return (this.keyframes[0].getTimeFraction() != -1);
	},

	validateKeyframesForDuration : function(duration) {
		// @PRIVATE
		var keyframes = this.getKeyframes();
		var len = keyframes.length;

		for(var i = 0; i < len; i++)
		{
			var kf = keyframes[i];
			kf.keyTimeFraction = (kf.getKeyTime() / duration);
		}
	}
});


//=====================================================================
//= MoParallelAnimation.js
//=====================================================================

MoParallelAnimation = Class.create(MoAnimationSet, {	
	initialize : function($super) {
		$super();
	},
	
	play : function() {
		this.updateAnimations("play");
	},
	
	pause : function() {
		this.updateAnimations("pause");
	},
	
	stop : function() {
		this.updateAnimations("stop");
	},
	
	resume : function() {
		this.updateAnimations("resume");
	},
	
	reverse : function() {
		this.updateAnimations("reverse");
	},
	
	updateAnimations : function(toState) {
		var len = this.getAnimationCount();
		var animation = null;

		for(var i = 0; i < len; i++)
		{
			animation = this.getAnimationAt(i);
			
			if(animation != null)
			{
				switch(toState)
				{
					case "play":
						animation.play();
						break;
					case "pause":
						animation.pause();
						break;
					case "resume":
						animation.resume();
						break;
					case "reverse":
						animation.reverse();
						break;
					case "stop":
						animation.stop();
						break;
				}
			}
		}	
	}
});


//=====================================================================
//= MoSequenceAnimation.js
//=====================================================================

MoSequenceAnimation = Class.create(MoAnimationSet, {	
	initialize : function($super) {
		$super();
		
		this.currentAnimationIndex = 0;
	},
	
	getCurrentAnimation : function() {
		if(this.currentAnimationIndex < this.getAnimationCount())
			return this.getAnimationAt(this.currentAnimationIndex);

		return null;
	},
	
	play : function() {
		this.playNext();
	},
	
	playNext : function() {
		if(this.currentAnimationIndex < this.getAnimationCount())
		{
			var animation = this.getAnimationAt(this.currentAnimationIndex++);

			if(animation != null)
			{
				animation.addEventHandler(MoAnimationEvent.COMPLETE, this.handleCurrentAnimationCompleteEvent.asDelegate(this));
				animation.play();
			}
		}
	},
	
	pause : function() {
		var animation = this.getCurrentAnimation();
		
		if(animation != null)
			animation.pause();
	},
	
	stop : function() {
		var animation = this.getCurrentAnimation();
		
		if(animation != null)
			animation.stop();
	},
	
	resume : function() {
		var animation = this.getCurrentAnimation();
		
		if(animation != null)
			animation.resume();
	},
	
	reverse : function() {
		var animation = this.getCurrentAnimation();
		
		if(animation != null)
			animation.reverse();
	},
	
	handleCurrentAnimationCompleteEvent : function(event) {
		this.playNext();
	}
});


//=====================================================================
//= MoFPSGraph.js
//=====================================================================

MoFPSClock = Class.create(
// @PRIVATE
{
	initialize : function() {
		this.currentTime = 0;
		this.elapsedTime = 0;
		this.totalTime = 0;
		this.lastTime = 0;
		this.bestTime = 0;
		this.worstTime = 0;
		this.frameTime = 0;
		this.frameCount = 0;
		this.suspendStartTime = 0;
		this.suspendElapsedTime = 0;
		this.suspendCount = 0;
		this.lastFPS = 0;
		this.avgFPS = 0;
		this.bestFPS = 0;
		this.worstFPS = 0;
		
		this.reset();
	},

	getElapsedTime : function() {
		return this.elapsedTime;
	},
	
	getTotalTime : function() {
		return this.totalTime;
	},
	
	getBestTime : function() {
		return this.bestTime;
	},
	
	getWorstTime : function() {
		return this.worstTime;
	},
	
	getAverageFPS : function() {
		return this.avgFPS;
	},
	
	getBestFPS : function() {
		return this.bestFPS;
	},
	
	getWorstFPS : function() {
		return this.worstFPS;
	},
	
	reset : function() {
		this.lastTime = MoGetTimer();
		this.totalTime = 0;
		this.elapsedTime = 0;
		this.currentTime = this.lastTime;
		this.frameTime = this.lastTime;
		this.frameCount = 0;
		this.avgFPS = 0;
		this.bestFPS = 0;
		this.lastFPS = 0;
		this.worstFPS = 9999.0;
		this.bestTime = 999999;
		this.worstTime = 0;
		this.suspendCount = 0;
		this.suspendElapsedTime = 0;
		this.suspendStartTime = 0;
	},
	
	resume : function() {
		if(--this.suspendCount <= 0)
		{
			var ts = MoGetTimer();
			
			this.suspendCount = 0;
			this.suspendElapsedTime += ts - this.suspendStartTime;
			this.suspendStartTime = 0;
		}
	},
	
	suspend : function() {
		this.suspendCount++;
		
		if(this.suspendCount == 1)
			this.suspendStartTime = MoGetTimer();
	},
	
	update : function() {
		var ts = MoGetTimer();
		
		this.frameCount++;
		this.lastTime = this.lastTime + this.suspendElapsedTime;
		this.elapsedTime = ts - this.lastTime;
		this.lastTime = ts;
		this.suspendElapsedTime = 0;
		
		this.bestTime = Math.min(this.bestTime, this.elapsedTime);
		this.worstTime = Math.max(this.worstTime, this.elapsedTime);
		
		if((ts - this.frameTime) > 1000)
		{
			var count = this.frameCount;
			var deltaTime = (ts - this.frameTime);
			
			this.lastFPS = count / deltaTime * 1000;
			
			if(this.avgFPS == 0)
				this.avgFPS = this.lastFPS;
			else
				this.avgFPS = (this.avgFPS + this.lastFPS) * 0.5;
			
			this.bestFPS = Math.max(this.bestFPS, this.lastFPS);
			this.worstFPS = Math.min(this.worstFPS, this.lastFPS);
			
			this.frameTime = ts;
			this.frameCount = 0;
		}

		this.totalTime += this.elapsedTime;
	}
});

MoFPSGraph = Class.create(
// @PRIVATE
{
	initialize : function() {
		this.width = 175;
		this.height = 60;
		this.averages = [];
		
		for(var i = 0; i < 100; i++)
			this.averages.push(0);
	},
	
	render : function(gfx, x, y) {
		var app = MoApplication.getInstance();
		var clock = app.fpsClock;
		var graphX = 0.5;
		var graphY = 0.5;
		var graphWidth = this.width-1;
		var graphHeight = (this.height-30)-1;
		var maxBarHeight = graphHeight - 10;
		
		gfx.save();
		gfx.translate(x, y);
		gfx.beginPath();
		gfx.rect(0, 0, this.width, this.height);
		gfx.clip();
		
		// render the background and border
		gfx.fillStyle = "rgba(255,255,255,0.5)";
		gfx.strokeStyle = "white";
		gfx.beginPath();
		gfx.rect(graphX, graphY, graphWidth, graphHeight);
		gfx.stroke();
		gfx.fill();
		
		// draw graph markers
		gfx.lineWidth = 1;
		gfx.strokeStyle = "rgba(0,0,0,0.5)";
		gfx.beginPath();
		gfx.moveTo(1.5, 10.5);
		gfx.lineTo(graphWidth, 10.5);
		gfx.moveTo(1.5, (0.5 * (graphHeight+10)));
		gfx.lineTo(graphWidth, (0.5 * (graphHeight+10)));
		gfx.stroke();
		
		// remove the first element so we can
		// shift everything over by 1
		if(this.averages.length == 100)
			this.averages.shift();
		
		var x = 0;
		var y = 0;
		
		// draw the fps graph
		gfx.beginPath();

		for(var i = 0; i < this.averages.length; ++i)
		{
			var avg = this.averages[i];
			x = (i * (graphWidth / 100)) + 1.5;
			y = MoMath.round(Math.min(1.0, avg / 60.0) * maxBarHeight) + 0.5;

			gfx.lineTo(x, (maxBarHeight - y) + 10);
		}
		
		
		gfx.lineTo(graphWidth, (maxBarHeight - y) + 10);
		gfx.lineTo(graphWidth, graphHeight);
		gfx.lineTo(1.5, graphHeight);
		gfx.closePath();

		// the graph should be rendered a red color if it's below
		// 30fps, otherwise render it green
		if(clock.getAverageFPS() < 30)
			gfx.fillStyle = "rgba(255, 0, 0, 0.5)";
		else
			gfx.fillStyle = "rgba(0, 255, 0, 0.5)";
			
		gfx.fill();
		
		// draw the fps labels
		gfx.font = "10px courier";
		
		var avgStr = "FPS: " + MoMath.toPrecision(clock.getAverageFPS(), 0) + ",";
		var avgWidth = gfx.measureText(avgStr).width;
		var bestStr = "Max: " + MoMath.toPrecision(clock.getBestFPS(), 0) + ",";
		var bestWidth = gfx.measureText(bestStr).width;
		var worstStr = "Min: " + MoMath.toPrecision(clock.getWorstFPS(), 0);
		var worstWidth = gfx.measureText(worstStr).width;
		var textX = 0;
		var textY = graphHeight + 12;
		
		gfx.fillStyle = "white";
		gfx.fillText(avgStr, textX, textY);
		
		textX += avgWidth + 6;
		gfx.fillText(bestStr, textX, textY);
		
		textX += bestWidth + 6;
		gfx.fillText(worstStr, textX, textY);
		
		// draw the time labels
		var timeElapsedStr = "Time: " + MoMath.toPrecision(clock.getElapsedTime(), 0) + ",";
		var timeElapsedWidth = gfx.measureText(timeElapsedStr).width;
		var timeWorstStr = "Max: " + MoMath.toPrecision(clock.getWorstTime(), 0) + ",";
		var timeWorstWidth = gfx.measureText(timeWorstStr).width;
		var timeBestStr = "Min: " + MoMath.toPrecision(clock.getBestTime(), 0);
		var timeBestWidth = gfx.measureText(timeBestStr).width;

		textX = 0;
		textY += 12;
		
		gfx.fillText(timeElapsedStr, textX, textY);
		
		textX += timeElapsedWidth + 6;
		gfx.fillText(timeWorstStr, textX, textY);
		
		textX += timeWorstWidth + 6;
		gfx.fillText(timeBestStr, textX, textY);
		
		gfx.restore();
		
		this.averages.push(clock.getAverageFPS());
	}
});


//=====================================================================
//= MoImage.js
//=====================================================================

MoImage = Class.create(MoDrawable, {
	initialize : function($super, name, source, sourceRect, enableSourceTiling) {
		$super(name);
		
		this.autoLoad = true;
		this.keepAspectRatio = false;
		this.source = null;
		this.sourceLoaded = false;
		this.changed = false;
		
		if(!MoValueOrDefault(enableSourceTiling, false))
			this.keepAspectRatio = null;

		this.addEventHandler(MoEvent.PRE_INIT, this.handlePreInitEvent.d(this));
			
		this.setSourceRect(MoValueOrDefault(sourceRect, MoRectangle.Empty()));
		this.setEnableSourceTiling(MoValueOrDefault(enableSourceTiling, false));
		this.setSource(source);
	},
	
	initializeAnimatablePropertiesCore : function($super) {
		$super();
		
		this.enableAnimatableProperty("enableSourceTiling", this.getEnableSourceTiling, this.setEnableSourceTiling, MoPropertyOptions.AffectsLayout);
		this.enableAnimatableProperty("sourceRect", this.getSourceRect, this.setSourceRect, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},
	
	getAutoLoad : function() {
		return this.autoLoad;
	},
	
	setAutoLoad : function(value) {
		if(this.autoLoad != value)
		{
			this.autoLoad = value;
			this.changed = true;
			
			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	},

	getKeepAspectRatio : function() {
		return this.keepAspectRatio;
	},

	setKeepAspectRatio : function(value) {
		if(this.keepAspectRatio != value)
		{
			this.keepAspectRatio = value;

			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getEnableSourceTiling : function() {
		return this.getPropertyValue("enableSourceTiling");
	},
	
	setEnableSourceTiling : function(value) {
		if(value && this.getKeepAspectRatio() == null)
			this.setKeepAspectRatio(false);
	
		this.setPropertyValue("enableSourceTiling", value);
	},
	
	getSourceRect : function() {
		return this.getPropertyValue("sourceRect");
	},

	setSourceRect : function(value) {
		this.setPropertyValue("sourceRect", value);
	},
	
	getSource : function() {
		return this.source;
	},

	setSource : function(source) {
		if(this.source != source)
		{
			this.source = source;
			this.sourceLoaded = false;
			this.changed = true;
			
			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getActualSourceSize : function() {
		var rect = this.getSourceRect();

		if(rect.isEmpty())
			return this.source.getSize();

		return rect.size();
	},
	
	load : function() {
		this.sourceLoaded = false;
		this.changed = false;

		if(this.source != null)
		{
			this.source.addEventHandler(MoSourceEvent.READY, this.handleSourceReadyEvent.d(this));
			this.source.load();
			
			this.requestLayout();
			this.requestMeasure();
		}
	},

	commitProperties : function($super) {
		$super();
		
		this.loadIfNeeded();
	},

	measure : function($super) {
		$super();
		
		if(!this.sourceLoaded)
			return;

		var imageSize = this.getActualSourceSize();
		var keepAspectRatio = (this.keepAspectRatio || this.keepAspectRatio == null);
		var measuredWidth = imageSize.width;
		var measuredHeight = imageSize.height;

		if(keepAspectRatio)
		{
			var exactWidth = this.getExactWidth();
			var exactHeight = this.getExactHeight();
			var percentWidth = this.getPercentWidth();
			var percentHeight = this.getPercentHeight();
			var width = this.getWidth();
			var height = this.getHeight();
			
			// only exact width
			if(!isNaN(exactWidth) && isNaN(exactHeight) && isNaN(percentHeight))
				measuredHeight = exactWidth / measuredWidth * measuredHeight;
			
			// only exact height
			else if(!isNaN(exactHeight) && isNaN(exactWidth) && isNaN(percentWidth))
				measuredWidth = exactHeight / measuredHeight * measuredWidth;
			
			// only percent width
			else if(!isNaN(percentWidth) && isNaN(exactHeight) && isNaN(percentHeight) && width > 0)
				measuredHeight = width / measuredWidth * measuredHeight;
			
			// only percent height
			else if(!isNaN(percentHeight) && isNaN(exactWidth) && isNaN(percentWidth) && height > 0)
				measuredWidth = height / measuredHeight * measuredWidth;
		}
		
		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		this.loadIfNeeded();
		
		if(!this.sourceLoaded)
			return;
		
		var drawWidth = unscaledWidth;
		var drawHeight = unscaledHeight;
		var keepAspectRatio = (this.keepAspectRatio || this.keepAspectRatio == null);
		
		if(keepAspectRatio)
		{
			var imageSize = this.getActualSourceSize();
			var imageAspectRatio = imageSize.width / imageSize.height;
			var aspectRatio = unscaledWidth / unscaledHeight;
			
			if(imageAspectRatio > aspectRatio)
				drawHeight = unscaledWidth / imageAspectRatio;
			else
				drawWidth = unscaledHeight * imageAspectRatio;
			
			// re-measure if we have either a percentage width or height and our aspect ratios are
			// not the same, we do this so that the percentage can have a chance to be calculated
			// by our parent layout container
			if((!isNaN(this.getPercentWidth()) && isNaN(this.getPercentHeight()) && isNaN(this.getExactHeight())) ||
			   (!isNaN(this.getPercentHeight()) && isNaN(this.getPercentWidth()) && isNaN(this.getExactWidth())))
			{
				if(aspectRatio != imageAspectRatio)
				{
					this.requestMeasure();
					return;
				}
			}
		}

		this.graphics.clear();
		this.graphics.beginPath();

		var sourceRect = this.getSourceRect();
		var tiled = this.getEnableSourceTiling();

		if(sourceRect.isEmpty())
			this.graphics.drawImage(this.source, 0, 0, drawWidth, drawHeight, tiled);
		else
			this.graphics.drawImageComplex(this.source, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, 0, 0, drawWidth, drawHeight, tiled);
	},
	
	loadIfNeeded : function() {
		if(this.changed)
		{
			this.changed = false;

			if(this.autoLoad)
				this.load();
		}
	},

	raiseLoadedEvent : function() {
		this.dispatchEvent(new MoLoadEvent(MoLoadEvent.SUCCESS));
	},
	
	handlePreInitEvent : function(e) {
		this.loadIfNeeded();
	},
	
	handleSourceReadyEvent : function(e) {
		this.source.removeEventHandler(MoSourceEvent.READY, this.handleSourceReadyEvent.d(this));
		this.sourceLoaded = true;
		
		this.requestMeasure();
		this.requestLayout();
		this.raiseLoadedEvent();
	}
});

Object.extend(MoImage, {
	/******************************************************************************
	 *
	 * Creates a new MoImage instance from any valid source. The source can be any
	 * of the following values:
	 *    - Url (String)
	 *    - Any type of MoImageSource
	 *    - An HTMLCanvasElement or HTMLVideoElement
	 *
	 * @param		name				The name of the new MoImage instance.
	 * @param		source				Any valid image source, see above.
	 * @optional	sourceRect			A MoRectangle that defines the rectangular
	 *                                  region within the source that should be
	 *                                  drawn.
	 * @optional	enableSourceTiling	True to enable tiling of the image source,
	 *                                  otherwise false.
	 *
	 ******************************************************************************/
	create : function(name, source, sourceRect, enableSourceTiling) {
	
		// TODO : need to throw an error here
		if(name == null || source == null)
			return null;

		var actualSource = null;

		// source is already an image source
		if(source instanceof MoImageSource)
			actualSource = source;
		// source is an HTMLCanvasElement
		else if(source instanceof HTMLCanvasElement)
			actualSource = new MoCanvasSource(source);
		// source is an HTMLVideoElement
		else if(source instanceof HTMLVideoElement)
			actualSource = new MoVideoSource(source);
		// just try it as a url string
		else
			actualSource = new MoTextureSource(source.toString(), false);

		return new MoImage(name, actualSource, sourceRect, enableSourceTiling);
	}
});



//=====================================================================
//= MoControl.js
//=====================================================================

MoControl = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		this.background = null;
		this.foreground = null;
		this.borderBrush = null;
		this.borderThickness = 0;
		this.pen = null; // cached pen for strokes
	},

	getBackground : function() {
		return this.background;
	},

	setBackground : function(value) {
		if(MoAreNotEqual(this.background, value))
		{
			this.background = value;
			this.requestLayout();
		}
	},

	getForeground : function() {
		return this.foreground;
	},
	
	setForeground : function(value) {
		if(MoAreNotEqual(this.foreground, value))
		{
			this.foreground = value;
			this.requestLayout();
		}
	},

	getBorderBrush : function() {
		return this.borderBrush;
	},

	setBorderBrush : function(value) {
		if(MoAreNotEqual(this.borderBrush, value))
		{
			this.borderBrush = value;
			
			this.invalidateProperties();
			this.requestLayout();
		}
	},

	getBorderThickness : function() {
		return this.borderThickness;
	},

	setBorderThickness : function(value) {
		if(this.borderThickness != value)
		{
			this.borderThickness = value;
			
			this.invalidateProperties();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	commitProperties : function($super) {
		$super();

		if(this.borderBrush != null && this.borderThickness > 0)
		{
			if(this.pen == null)
			{
				this.pen = new MoPen(this.borderBrush, this.borderThickness);
			}
			else
			{
				this.pen.setBrush(this.borderBrush);
				this.pen.setThickness(this.borderThickness);
			}
		}
		else
		{
			this.pen = null;
		}
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		this.graphics.clear();

		if(this.background != null || (this.borderBrush != null && this.borderThickness > 0))
		{
			var thickness = this.getBorderThickness();
			var inset = thickness * 0.5;
			
			this.graphics.drawRect(inset, inset, Math.max(0, unscaledWidth - thickness), Math.max(0, unscaledHeight - thickness));
			this.drawBackground();
			this.drawBorder();
		}
	},
	
	drawBackground : function() {
		if(this.background != null)
			this.graphics.fill(this.background);
	},
	
	drawBorder : function() {
		if(this.pen != null)
			this.graphics.stroke(this.pen);
	}
});


//=====================================================================
//= MoContentControl.js
//=====================================================================

MoContentControl = Class.create(MoControl, {
	initialize : function($super, name) {
		$super(name);
	},
	
	getChild : function() {
		if(this.getCount() > 0)
			return this.getAt(0);
		
		return null;
	},
	
	setChild : function(value) {
		this.clear();
		this.add(value);
		
		this.requestMeasure();
		this.requestParentMeasureAndLayout();
		this.invalidateProperties();
	},
	
	getHasChild : function() {
		return (this.getCount() > 0);
	},

	measure : function($super) {
		$super();
		
		var thickness = this.getBorderThickness() * 2;
		var child = this.getChild();
		
		if(child != null && child.getIsLayoutVisible())
		{
			var childMargin = child.getMargin();

			this.setMeasuredWidth(child.getExactOrMeasuredWidth() + childMargin.getLeft() + childMargin.getRight() + thickness);
			this.setMeasuredHeight(child.getExactOrMeasuredHeight() + childMargin.getTop() + childMargin.getBottom() + thickness);
		}
		else
		{
			this.setMeasuredWidth(thickness);
			this.setMeasuredHeight(thickness);
		}
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {		
		var child = this.getChild();
		
		if(child != null && child.getIsLayoutVisible())
		{
			$super(unscaledWidth, unscaledHeight);
		
			// contract the total size down to fit the border
			unscaledWidth -= (this.getBorderThickness() * 2);
			unscaledHeight -= (this.getBorderThickness() * 2);
		
			// compute initial child extents
 			var childMargin = child.getMargin();
			var childX = child.getX() + childMargin.getLeft();
			var childY = child.getY() + childMargin.getTop();
			var childWidth = child.getExactOrMeasuredWidth();
			var childHeight = child.getExactOrMeasuredHeight();
			var childRightEdge = 0;
			var childBottomEdge = 0;
			
			// if child is using percentage based sizing, then compute
			// the actual size based on our actual size
			if(!isNaN(child.getPercentWidth()))
			{
				childWidth = unscaledWidth * (child.getPercentWidth() / 100);
				childRightEdge = childX + childWidth + childMargin.getRight();
				
				// if the position of the child plus the width extends
				// beyond the right edge, then we shrink it so it fits
				// up against the right edge.
				if(childRightEdge > unscaledWidth)
					childWidth = unscaledWidth - (childX + childMargin.getRight());
			}
			
			if(!isNaN(child.getPercentHeight()))
			{
				childHeight = unscaledHeight * (child.getPercentHeight() / 100);
				childBottomEdge = childY + childHeight + childMargin.getBottom();
				
				// if the position of the child plus the height extends
				// beyond the bottom edge, then we shrink it so it fits
				// up against the bottom edge.				
				if(childBottomEdge > unscaledHeight)
					childHeight = unscaledHeight - (childY + childMargin.getBottom());
			}
			
			// recompute the far right and bottom edges incase our original sizes
			// have changed from calculating the percentages
			childRightEdge = childX + childWidth + childMargin.getRight();
			childBottomEdge = childY + childHeight + childMargin.getBottom();
			
			// align the child according to it's alignment rules and adjust for
			// our border thickness
			childX += ((unscaledWidth - childRightEdge) * child.getHorizontalAlignment()) + this.getBorderThickness();
			childY += ((unscaledHeight - childBottomEdge) * child.getVerticalAlignment()) + this.getBorderThickness();
			
			// finalize the layout and size of our child
			child.setLayoutPosition(childX, childY);
			child.setActualSize(Math.max(0, childWidth), Math.max(0, childHeight));
		}
	}
});


//=====================================================================
//= MoBorder.js
//=====================================================================

MoBorder = Class.create(MoContentControl, {
	initialize : function($super, name) {
		$super(name);

		this.cornerRadius = MoCornerRadius.fromUniform(0);
	},

	getCornerRadius : function() {
		return this.cornerRadius;
	},

	setCornerRadius : function(value) {
		if(MoAreNotEqual(this.cornerRadius, value))
		{
			this.cornerRadius = value;

			if(MoIsNull(this.cornerRadius))
				this.cornerRadius = MoCornerRadius.fromUniform(0);

			this.requestLayout();
		}
	},

	layout : function($super, unscaledWidth, unscaledHeight) {			
		$super(unscaledWidth, unscaledHeight);

		if(this.getChild() == null || this.cornerRadius.isSquare())
			return;

		var thickness = this.getBorderThickness();
		var inset = thickness * 0.5;

		this.graphics.clear();
		this.graphics.beginPath();
		this.graphics.drawRoundRectComplex(inset, inset, Math.max(0, unscaledWidth - inset), Math.max(0, unscaledHeight - inset), this.cornerRadius);
		this.drawBackground();
		this.drawBorder();
	}
});


//=====================================================================
//= MoPanel.js
//=====================================================================

MoPanel = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		this.background = null;
	},
	
	getBackground : function() {
		return this.background;
	},
	
	setBackground : function(value) {
		if(MoAreNotEqual(this.background, value))
		{
			this.background = value;
			this.requestLayout();
		}
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		this.graphics.clear();

		if(this.background != null)
		{
			this.graphics.drawRect(0, 0, unscaledWidth, unscaledHeight);
			this.graphics.fill(this.background);
		}		
	}
});


//=====================================================================
//= MoCanvas.js
//=====================================================================

MoCanvas = Class.create(MoPanel, {
	initialize : function($super, name) {
		$super(name);
	},
	
	measure : function($super) {
		$super();

		var len = this.getCount();
		var child = null;
		var maxWidth = 0;
		var maxHeight = 0;
		
		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(!child.getIsLayoutVisible())
				continue;
			
			maxWidth = Math.max(maxWidth, child.getX() + child.getExactOrMeasuredWidth());
			maxHeight = Math.max(maxHeight, child.getY() + child.getExactOrMeasuredHeight());
		}
		
		this.setMeasuredWidth(maxWidth);
		this.setMeasuredHeight(maxHeight);
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		var len = this.getCount();
		var child = null;
		var childX = 0;
		var childY = 0;
		var childWidth = 0;
		var childHeight = 0;
		var needsWidthValidation = false;
		var needsHeightValidation = false;

		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(!child.getIsLayoutVisible())
				continue;

			childX = child.getX();
			childY = child.getY();
			childWidth = child.getExactOrMeasuredWidth();
			childHeight = child.getExactOrMeasuredHeight();

			needsWidthValidation = false;
			needsHeightValidation = false;

			// first, see if we need to calculate the size from
			// a percentage value, this becomes our used value, which
			// will need to be checked once we have the computed value
			if(!isNaN(child.getPercentWidth()))
			{
				childWidth = unscaledWidth * (child.getPercentWidth() / 100);
				needsWidthValidation = true;
			}

			if(!isNaN(child.getPercentHeight()))
			{
				childHeight = unscaledHeight * (child.getPercentHeight() / 100);
				needsHeightValidation = true;
			}

			// finally, since we have the final position and size, it needs to 
			// be validated against the available size
			if(needsWidthValidation && (childX + childWidth) > unscaledWidth)
				childWidth = unscaledWidth - childX;

			if(needsHeightValidation && (childY + childHeight) > unscaledHeight)
				childHeight = unscaledHeight - childY;
			
			// update the child
			child.setLayoutPosition(childX, childY);
			child.setActualSize(childWidth, childHeight);
		}
	}
});


//=====================================================================
//= MoSprite.js
//=====================================================================

MoSprite = Class.create(MoCanvas, {
	initialize : function($super, name, animationName, textureAtlas) {
		$super(name);

		//this.sprite = new MoImage("image", textureAtlas.getTextureSource(), null, false);
		this.sprites = null;
		this.textureAtlas = textureAtlas;
		this.animation = null;
		this.animationSource = null;
		this.frameCount = 0;
		
		this.setAnimationName(animationName);
		//this.add(this.sprite);
	},

	initializeAnimatablePropertiesCore : function($super) {
		$super();

		this.enableAnimatableProperty("frame", this.getFrame, this.setFrame, MoPropertyOptions.AffectsLayout | MoPropertyOptions.AffectsMeasure);
	},
	
	getFrameCount : function() {
		return this.frameCount;
	},

	getFrame : function() {
		return this.getPropertyValue("frame");
	},

	setFrame : function(value, force) {
		force = MoValueOrDefault(force, false);
		
		if(this.setPropertyValue("frame", Math.round(value)) || force)
		{
			this.updateSpritesForFrame(this.getFrame()-1);
			// var spriteName = this.textureAtlas.getSpriteNameForFrame(this.animationName, this.getFrame()-1);
			// var spriteInfo = this.textureAtlas.getSpriteInfo(spriteName);

			// this.sprite.setX(spriteInfo.x);
			// this.sprite.setY(spriteInfo.y);
			// this.sprite.setSourceRect(spriteInfo.sourceRect);
		}
	},

	getAnimationInstance : function() {
		return this.animation;
	},
	
	getAnimationName : function() {
		return this.animationName;
	},
	
	setAnimationName : function(value) {
		if(MoIsNull(value))
			throw new Error("Sprite must have an animation.");

		if(this.animationName != value)
		{
			this.animationName = value;
			this.reset();
		}
	},
	
	getTextureAtlas : function() {
		return this.textureAtlas;
	},
	
	getRepeatCount : function() {
		return this.animation.getRepeatCount();
	},
	
	setRepeatCount : function(value) {
		this.animation.setRepeatCount(value);
	},
	
	getRepeatBehavior : function() {
		return this.animation.getRepeatBehavior();
	},
	
	setRepeatBehavior : function(value) {
		this.animation.setRepeatBehavior(value);
	},
	
	getDuration : function() {
		return this.animation.getDuration();
	},
	
	setDuration : function(value) {
		this.animation.setDuration(value);
	},
	
	getCurrentTime : function() {
		return this.animation.getCurrentTime();
	},
	
	getIsRunning : function() {
		return this.animation.getIsRunning();
	},

	play : function(name) {
		name = MoValueOrDefault(name, this.getAnimationName());

		if(name != this.getAnimationName())
		{
			//this.dispatchEvent(new MoEvent(MoEvent.CHANGE));
			//this.setAnimationName(name);
		}

		if(!this.animation.getIsRunning())
			this.animation.play();
	},
	
	pause : function() {
		this.animation.pause();
	},
	
	resume : function() {
		if(!this.animation.getIsRunning())
			this.animation.resume();
	},
	
	stop : function() {
		this.setFrame(1, true);
		this.animation.stop();
	},
	
	updateSpritesForFrame : function(frame) {

		this.sprites = this.animationSource.getSprites(frame);
	},

	reset : function() {
		if(this.animation != null)
			this.animation.stop();

		this.animationSource = this.textureAtlas.getAnimation(this.animationName);
		this.frameCount = this.animationSource.getFrameCount();
		
		this.setFrame(1, true);
		
		if(this.animation == null)
			this.animation = new MoBasicAnimation(this, "frame", this.getFrame(), this.getFrameCount());

		this.animation.setFromValue(this.getFrame());
		this.animation.setToValue(this.getFrameCount());
		this.animation.setEasingFunction(new MoLinearEase());
		this.animation.setDuration(this.animationSource.duration);
		this.animation.setRepeatBehavior(this.animationSource.repeatBehavior);
		this.animation.setRepeatCount(this.animationSource.repeat);
		this.animation.setDelay(this.animationSource.delay);
	},
	
	measure : function($super) {
		$super();

		if(MoIsNull(this.sprites))
			return;
		
		var sprite = null;
		var maxWidth = 0;
		var maxHeight = 0;
		
		for(var i = 0, len = this.sprites.length; i < len; ++i)
		{
			sprite = this.sprites[i];
			
			maxWidth = Math.max(maxWidth, sprite.x + sprite.width);
			maxHeight = Math.max(maxHeight, sprite.y + sprite.height);
		}
		
		this.setMeasuredWidth(maxWidth);
		this.setMeasuredHeight(maxHeight);
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		if(MoIsNull(this.sprites))
			return;
		
		var sprite = null;
		var mx = new MoMatrix2D();
		var textureSource = this.textureAtlas.getTextureSource();
		var gfx = this.getGraphics();
		var tv = MoVector2D.Zero();
		var localCenter = null;
		
		gfx.beginPath();
		
		for(var i = 0, len = this.sprites.length; i < len; ++i)
		{
			sprite = this.sprites[i];
			tv.x = sprite.width * 0.5;
			tv.y = sprite.height * 0.5;
			
			mx.setIdentity();
			mx.scaleAt(sprite.scaleX, sprite.scaleY, sprite.tx, sprite.ty);
			mx.rotateAt(sprite.rotation, sprite.tx, sprite.ty);
			
			localCenter = mx.transformPoint(tv);
			
			mx.translate(sprite.x - localCenter.x, sprite.y - localCenter.y);
				
			gfx.drawImageComplex(
				textureSource, 
				sprite.sourceRect.x, 
				sprite.sourceRect.y, 
				sprite.sourceRect.width, 
				sprite.sourceRect.height, 
				0, 
				0, 
				sprite.sourceRect.width, 
				sprite.sourceRect.height,
				false, mx);
				
			gfx.beginPath();
			gfx.drawCircle(sprite.tx, sprite.ty, 4);
			gfx.fill(MoSolidColorBrush.fromColorHexWithAlpha("#00ff00", 0.5));
			
			localCenter = mx.transformPoint(tv);
			
			gfx.beginPath();
			gfx.drawCircle(localCenter.x, localCenter.y, 4);
			gfx.fill(MoSolidColorBrush.fromColorHexWithAlpha("#0000ff", 0.5));
		}
	}
});



//=====================================================================
//= MoSpriteGroup.js
//=====================================================================

MoSpriteGroup = Class.create(MoCanvas, {
	initialize : function($super, name, groupName, textureAtlas) {
		$super(name);

		this.textureAtlas = textureAtlas;
		this.setGroupName(groupName);
	},
	
	getGroupName : function() {
		return this.groupName;
	},
	
	setGroupName : function(value) {
		if(MoIsNull(value))
			throw new Error("Sprite must have a group.");

		if(this.groupName != value)
		{
			this.groupName = value;
			this.reset();
		}
	},
	
	getTextureAtlas : function() {
		return this.textureAtlas;
	},
	
	getSprite : function(id) {
		return this.getByName("sprite-" + id);
	},
	
	play : function(name) {
		if(MoIsNull(name))
			this.playAll();
		else
			this.forEach("play", this.getAnimationIdForAnimationGroup(name));
	},
	
	playAll : function() {
		this.forEach("play");
	},
	
	pause : function(name) {
		if(MoIsNull(name))
			this.pauseAll();
		else
			this.forEach("pause", this.getAnimationIdForAnimationGroup(name));
	},
	
	pauseAll : function() {
		this.forEach("pause");
	},
	
	resume : function(name) {
		if(MoIsNull(name))
			this.resumeAll();
		else
			this.forEach("resume", this.getAnimationIdForAnimationGroup(name));
	},
	
	resumeAll : function() {
		this.forEach("resume");
	},
	
	stop : function(name) {
		if(MoIsNull(name))
			this.stopAll();
		else
			this.forEach("stop", this.getAnimationIdForAnimationGroup(name));
	},
	
	stopAll : function() {
		this.forEach("stop");
	},
	
	forEach : function(funcName, ids) {
		ids = MoValueOrDefault(ids, null);
		
		if(MoIsNull(ids))
		{
			var len = this.getCount();
			var child = null;
			
			for(var i = 0; i < len; ++i)
			{
				child = this.getAt(i);
				
				if(child instanceof MoSprite)
					child[funcName]();
			}
		}
		else
		{
			var len = ids.length;
			var sprite = null;
			
			for(var i = 0; i < len; ++i)
			{
				sprite = this.getSprite(ids[i]);
				sprite[funcName]();
			}
		}
	},
	
	getAnimationIdForAnimationGroup : function(name) {
		var group = this.textureAtlas.getGroupAnimations(this.groupName);
		var len = group.length;
		var names = [];

		for(var i = 0; i < len; ++i)
		{
			if(group[i].name.toLowerCase() == name.toLowerCase())
				names.push(group[i].id);
		}

		return names;
	},

	reset : function() {
		this.stopAll();
		this.clear();

		var group = this.textureAtlas.getGroupAnimations(this.groupName);
		var len = group.length;
		var sprite = null;
		var animation = null;

		for(var i = 0; i < len; ++i)
		{
			animation = group[i];
			sprite = this.textureAtlas.getSprite("sprite-" + animation.id, animation.ref);
			sprite.setX(animation.x);
			sprite.setY(animation.y);
			
			if(animation.width > 0)
				sprite.setWidth(animation.width);
			
			if(animation.height > 0)
				sprite.setHeight(animation.height);
			
			this.add(sprite);
		}
		
		this.requestMeasure();
		this.requestLayout();
	}
});



//=====================================================================
//= MoDockPanel.js
//=====================================================================

MoDock = {
	None	: 0,
	Top		: 1,
	Right	: 2,
	Bottom	: 3,
	Left	: 4
};

MoDockPanel = Class.create(MoPanel, {
	initialize : function($super, name) {
		$super(name);
		
		this.fillLastChild = true;
	},
	
	getFillLastChild : function() {
		return this.fillLastChild;
	},
	
	setFillLastChild : function(value) {
		this.fillLastChild = value;
	},
	
	measure: function($super) {
		var idx = 0;
		var count = this.getCount();
		var child = null;
		var maxWidth = 0;
		var maxHeight = 0;
		var lastWidth = 0;
		var lastHeight = 0;

		while(idx < count)
		{
			child = this.getAt(idx);
			
			if(child == null || !child.getIsLayoutVisible())
				continue;

			var dock = child.getDock();
			
			if(dock == MoDock.None)
				throw new Error("Child of MoDockPanel must have a dock value, use setDock to set the docking type.");

			switch(dock)
			{
				case MoDock.Left:
					maxHeight = Math.max(maxHeight, lastHeight + child.getExactOrMeasuredHeight());
					lastWidth += child.getExactOrMeasuredWidth();
					break;
				case MoDock.Top:
					maxWidth = Math.max(maxWidth, lastWidth + child.getExactOrMeasuredWidth());
					lastHeight += child.getExactOrMeasuredHeight();
					break;
			}
			
			idx++;
		}

		this.setMeasuredWidth(Math.max(maxWidth, lastWidth));
		this.setMeasuredHeight(Math.max(maxHeight, lastHeight));
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var count = this.getCount();
		var lastFillIdx = count - (this.fillLastChild ? 1 : 0);
		var child = null;
		var left = 0;
		var right = 0;
		var top = 0;
		var bottom = 0;
		var width = this.getExactOrMeasuredWidth();
		var height = this.getExactOrMeasuredHeight();

		for(var i = 0; i < count; ++i)
		{	
			child = this.getAt(i);
	
			if(child == null || !child.getIsLayoutVisible())
				continue;

			childWidth = child.getExactOrMeasuredWidth();
			childHeight = child.getExactOrMeasuredHeight();

			if(!isNaN(child.getPercentWidth()))
				childWidth = unscaledWidth * (child.getPercentWidth() / 100);
			
			if(!isNaN(child.getPercentHeight()))
				childHeight = unscaledHeight * (child.getPercentHeight() / 100);
			
			var rect = new MoRectangle(left, top, Math.max(0, width - (left + right)), Math.max(0, height - (top + bottom)));
			
			if(i < lastFillIdx)
			{
				var dock = child.getDock();
				
				if(dock == MoDock.None)
					throw new Error("Child of MoDockPanel must have a dock value, use setDock to set the docking type.");

				switch(dock)
				{
					case MoDock.Top:
						top += childHeight;
						rect.height = childHeight;
						break;
					case MoDock.Right:
						right += childWidth;
						rect.x = Math.max(0, width - right);
						rect.width = childWidth;
						break;
					case MoDock.Bottom:
						bottom += childHeight;
						rect.y = Math.max(0, height - bottom);
						rect.height = childHeight;
						break;
					case MoDock.Left:
						left += childWidth;
						rect.width = childWidth;
						break;
				}
			}
			
			child.setLayoutPosition(rect.x, rect.y);
			
			if(!isNaN(rect.width) && !isNaN(rect.height))
				child.setActualSize(rect.width, rect.height);
		}
	}
});


//=====================================================================
//= MoStackPanel.js
//=====================================================================

MoStackPanel = Class.create(MoPanel, {
	initialize : function($super, name) {
		$super(name);

		this.orientation = MoOrientation.Vertical;
		this.gap = 0;
	},
	
	getOrientation : function() {
		return this.orientation;
	},

	setOrientation : function(value) {
		if(this.orientation != value)
		{
			this.orientation = value;

			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},
	
	getGap : function() {
		return this.gap;
	},
	
	setGap : function(value) {
		if(this.gap != value)
		{
			this.gap = value;
			
			this.requestMeasure();
			this.requestParentMeasureAndLayout();
		}
	},
	
	measure: function($super) {
		$super();
	
		var isHorizontal = (this.getOrientation() == MoOrientation.Horizontal);
		var child = null;
		var childMargin = null;
		var maxWidth = 0;
		var maxHeight = 0;
		var actualChildCount = 0;
		
		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);

			if(!child.getIsLayoutVisible())
				continue;
				
			actualChildCount++;
			childMargin = child.getMargin();

			if(isHorizontal)
			{
				maxWidth += child.getExactOrMeasuredWidth() + childMargin.getSizeX();
				maxHeight = Math.max(maxHeight, child.getExactOrMeasuredHeight() + childMargin.getSizeY());
			}
			else
			{
				maxHeight += child.getExactOrMeasuredHeight() + childMargin.getSizeY();
				maxWidth = Math.max(maxWidth, child.getExactOrMeasuredWidth() + childMargin.getSizeX());
			}
		}
		
		if(isHorizontal)
			maxWidth += ((actualChildCount * this.gap) - this.gap);
		else
			maxHeight += ((actualChildCount * this.gap) - this.gap);
		
		this.setMeasuredWidth(maxWidth);
		this.setMeasuredHeight(maxHeight);
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var isHorizontal = (this.getOrientation() == MoOrientation.Horizontal);
		var child = null;
		var childWidth = 0;
		var childHeight = 0;
		var childX = 0;
		var childY = 0;
		var childMargin = null;
		var marginX = 0;
		var marginY = 0;

		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);

			if(!child.getIsLayoutVisible())
				continue;

			childMargin = child.getMargin();
			childWidth = child.getExactOrMeasuredWidth();
			childHeight = child.getExactOrMeasuredHeight();

			// compute the actual sizes from the percentages, if
			// they are being used
			if(!isNaN(child.getPercentWidth()))
				childWidth = unscaledWidth * (child.getPercentWidth() / 100);
		
			if(!isNaN(child.getPercentHeight()))
				childHeight = unscaledHeight * (child.getPercentHeight() / 100);
			
			
			// layout the children horizontally
			if(isHorizontal)
			{
				// calculate the vertical alignment position
				childY = ((unscaledHeight - (childHeight + childMargin.getSizeY())) * child.getVerticalAlignment());

				// update the childs layout position and actual size, with the margins
				child.setLayoutPosition(childX + childMargin.getLeft(), childY + childMargin.getTop());
				child.setActualSize(childWidth, childHeight);

				// set the start position of the next child
				childX += childWidth + childMargin.getSizeX() + this.gap;
			}

			// otherwise, layout vertically
			else
			{
				// calculate the horizontal alignment position
				childX = ((unscaledWidth - (childWidth + childMargin.getSizeX())) * child.getHorizontalAlignment());
				
				// update the childs layout position and actual size, with the margins				
				child.setLayoutPosition(childX + childMargin.getLeft(), childY + childMargin.getTop());
				child.setActualSize(childWidth, childHeight);

				// set the start position of the next child
				childY += childHeight + childMargin.getSizeY() + this.gap;
			}
		}
	}
});


//=====================================================================
//= MoWrapPanel.js
//=====================================================================

MoWrapPanel = Class.create(MoPanel, {
	initialize : function($super, name) {
		$super(name);
		
		this.itemWidth = NaN;
		this.itemHeight = NaN;
		this.horizontalGap = 0;
		this.verticalGap = 0;
		this.orientation = MoOrientation.Horizontal;
		this.actualItemWidth = NaN;
		this.actualItemHeight = NaN;
	},
	
	getOrientation : function() {
		return this.orientation;
	},
	
	setOrientation : function(value) {
		if(this.orientation != value)
		{
			this.orientation = value;
			
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getHorizontalGap : function() {
		return this.horizontalGap;
	},
	
	setHorizontalGap : function(value) {
		if(this.horizontalGap != value)
		{
			this.horizontalGap = value;
			
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getVerticalGap : function() {
		return this.verticalGap;
	},
	
	setVerticalGap : function(value) {
		if(this.verticalGap != value)
		{
			this.verticalGap = value;
			
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getItemWidth : function() {
		return this.itemWidth;
	},
	
	setItemWidth : function(value) {
		if(this.itemWidth != value)
		{
			this.itemWidth = value;
			this.requestMeasure();
		}
	},
	
	getItemHeight : function() {
		return this.itemHeight;
	},
	
	setItemHeight : function(value) {
		if(this.itemHeight != value)
		{
			this.itemHeight = value;
			this.requestMeasure();
		}
	},
	
	measure : function($super) {
		$super();
		
		// calculate the actual size of an item
		this.calculateActualItemSize();
		
		// measure at least to the actual item size
		var measuredWidth = this.actualItemWidth;
		var measuredHeight = this.actualItemHeight;
		var childCount = this.getCount();
		
		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			if(!this.getAt(i).getIsLayoutVisible())
				childCount--;
		}
		
		if(childCount > 0)
		{
			var minor = 0;
			var major = NaN;
			
			if(this.orientation == MoOrientation.Horizontal)
			{
				var exactWidth = this.getExactWidth();
				
				if(!isNaN(exactWidth))
					major = Math.floor((exactWidth + this.horizontalGap) / (this.actualItemWidth + this.horizontalGap));
			}
			else
			{
				var exactHeight = this.getExactHeight();
				
				if(!isNaN(exactHeight))
					major = Math.floor((exactHeight + this.verticalGap) / (this.actualItemHeight + this.verticalGap));
			}
			
			// we don't have an exact dimension so
			// use the square root of our child count
			if(isNaN(major))
				major = Math.ceil(Math.sqrt(childCount));
				
			// make sure we have at least one item
			if(major < 1)
				major = 1;

			minor = Math.ceil(childCount / major);

			var xAxis = (this.orientation == MoOrientation.Horizontal ? major : minor);
			var yAxis = (this.orientation == MoOrientation.Horizontal ? minor : major);
			
			measuredWidth = xAxis * this.actualItemWidth + ((xAxis - 1) * this.horizontalGap);
			measuredHeight = yAxis * this.actualItemHeight + ((yAxis - 1) * this.verticalGap);
		}

		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
	
		if(isNaN(this.actualItemWidth) || isNaN(this.actualItemHeight))
			this.calculateActualItemSize();
			
		var xPos = 0;
		var xOffset = 0;
		var yPos = 0;
		var yOffset = 0;
		var child = null;
		
		if(this.orientation == MoOrientation.Horizontal)
		{
			var xEnd = Math.ceil(unscaledWidth);
			
			for(var i = 0, len = this.getCount(); i < len; ++i)
			{
				child = this.getAt(i);
				
				if(!child.getIsLayoutVisible())
					continue;
					
				if((xPos + this.actualItemWidth) > xEnd && xPos != 0)
				{
					xPos = 0;
					yPos += this.actualItemHeight + this.verticalGap;
				}
				
				this.updateChildSize(child);
				
				xOffset = Math.floor((this.actualItemWidth - child.getWidth()) * child.getHorizontalAlignment());
				yOffset = Math.floor((this.actualItemHeight - child.getHeight()) * child.getVerticalAlignment());
				
				child.setLayoutPosition(xPos + xOffset, yPos + yOffset);
				
				xPos += (this.actualItemWidth + this.horizontalGap);
			}
		}
		else
		{
			var yEnd = Math.ceil(unscaledHeight);
			
			for(var i = 0, len = this.getCount(); i < len; ++i)
			{
				child = this.getAt(i);
				
				if(!child.getIsLayoutVisible())
					continue;
					
				if((yPos + this.actualItemHeight) > yEnd && yPos != 0)
				{
					xPos += this.actualItemWidth + this.horizontalGap;
					yPos = 0;
				}
				
				this.updateChildSize(child);
				
				xOffset = Math.floor((this.actualItemWidth - child.getWidth()) * child.getHorizontalAlignment());
				yOffset = Math.floor((this.actualItemHeight - child.getHeight()) * child.getVerticalAlignment());
				
				child.setLayoutPosition(xPos + xOffset, yPos + yOffset);
				
				yPos += (this.actualItemHeight + this.verticalGap);
			}
		}

		this.actualItemWidth = NaN;
		this.actualItemHeight = NaN;
	},
	
	updateChildSize : function(child) {
		var childWidth = child.getExactOrMeasuredWidth();
		var childExactWidth = child.getExactWidth();
		var childHeight = child.getExactOrMeasuredHeight();
		var childExactHeight = child.getExactHeight();
		
		if(isNaN(childExactWidth))
			childExactWidth = 0;
			
		if(isNaN(childExactHeight))
			childExactHeight = 0;
		
		if(!isNaN(child.getPercentWidth()))
			childWidth = Math.min(this.actualItemWidth, this.actualItemWidth * (child.getPercentWidth() / 100));
		else
		{
			if(childWidth > this.actualItemWidth)
				childWidth = (childExactWidth > this.actualItemWidth ? childExactWidth : this.actualItemWidth);
		}
		
		if(!isNaN(child.getPercentHeight()))
			childHeight = Math.min(this.actualItemHeight, this.actualItemHeight * (child.getPercentHeight() / 100));
		else
		{
			if(childHeight > this.actualItemHeight)
				childHeight = (childExactHeight > this.actualItemHeight ? childExactHeight : this.actualItemHeight);
		}
		
		child.setActualSize(childWidth, childHeight);
	},
	
	calculateActualItemSize : function() {
		var hasWidth = !isNaN(this.itemWidth);
		var hasHeight = !isNaN(this.itemHeight);
		
		// use the explicit item size
		if(hasWidth && hasHeight)
		{
			this.actualItemWidth = this.itemWidth;
			this.actualItemHeight = this.itemHeight;
			
			return;
		}
		
		// compute the max child size
		var maxWidth = 0;
		var maxHeight = 0;
		var child = null;
		
		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);
			
			if(!child.getIsLayoutVisible())
				continue;
				
			maxWidth = Math.max(maxWidth, child.getExactOrMeasuredWidth());
			maxHeight = Math.max(maxHeight, child.getExactOrMeasuredHeight());
		}
		
		// use the explicit size (if one was set) otherwise use the max size
		this.actualItemWidth = (hasWidth ? this.itemWidth : maxWidth);
		this.actualItemHeight = (hasHeight ? this.itemHeight : maxHeight);
	}
	
/* 	measure : function($super) {
		$super();
		
		var itemWidth = this.itemWidth;
		var itemHeight = this.itemHeight;
		var blockSize = new MoWrapPanel.ItemSize(this.orientation);
		var measuredSize = new MoWrapPanel.ItemSize(this.orientation);
		var containerSize = new MoWrapPanel.ItemSize(this.orientation, this.getWidth(), this.getHeight());
		var hasWidth = !isNaN(itemWidth);
		var hasHeight = !isNaN(itemHeight);
		var child = null;
		var blockCount = 0;

		for(var i = 0, len = this.getCount(); i < len; ++i)
		{
			child = this.getAt(i);

			// don't include children that are not participating
			// in layout, however, we ignore whether or not a child
			// is visible, hidden children should still take up space
			if(!child.getIsLayoutVisible())
				continue;

			var childSize = new MoWrapPanel.ItemSize(this.orientation, 
				hasWidth ? itemWidth : child.getExactOrMeasuredWidth(),
				hasHeight ? itemHeight : child.getExactOrMeasuredHeight());

			// at the end of the block
			if((blockSize.hsize + childSize.hsize) > containerSize.hsize)
			{
				// add last block to our currently measured size
				measuredSize.hsize = Math.max(blockSize.hsize, measuredSize.hsize);
				measuredSize.vsize += blockSize.vsize;
				
				// start new block
				blockSize.copyFrom(childSize);

				// the child is bigger than the container so assume
				// it will be on it's own
				if(childSize.hsize > containerSize.hsize)
				{
					// add this child to our measured size
					blockCount++;
					measuredSize.hsize = Math.max(childSize.hsize, measuredSize.hsize);
					measuredSize.vsize += childSize.vsize;
					
					// start a new block
					blockSize.orientation = this.orientation;
					blockSize.hsize = blockSize.vsize = 0;
				}
			}

			// otherwise add to the end
			else
			{
				blockSize.hsize += childSize.hsize;
				blockSize.vsize = Math.max(childSize.vsize, blockSize.vsize);
			}
		}

		// add last block to our currently measured size
		measuredSize.hsize = Math.max(blockSize.hsize, measuredSize.hsize);
		measuredSize.vsize += blockSize.vsize;
console.log(measuredSize.getWidth(), measuredSize.getHeight());
		// update final measured size
		this.setMeasuredWidth(measuredSize.getWidth());
		this.setMeasuredHeight(measuredSize.getHeight());
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var itemWidth = this.itemWidth;
		var itemHeight = this.itemHeight;
		var isHorizontal = (this.orientation == MoOrientation.Horizontal);
		var itemU = isHorizontal ? itemWidth : itemHeight;
		var blockSize = new MoWrapPanel.ItemSize(this.orientation);
		var containerSize = new MoWrapPanel.ItemSize(this.orientation, unscaledWidth, unscaledHeight);
		var hasWidth = !isNaN(itemWidth);
		var hasHeight = !isNaN(itemHeight);
		var delta = isHorizontal ? (hasWidth ? itemWidth : null) : (hasHeight ? itemHeight : null);
		var offset = 0;
		var start = 0;
		var end = 0;
		var count = this.getCount();
		var child = null;

		while(end < count)
		{
			child = this.getAt(end);
			
			// don't include children that are not participating
			// in layout
			if(!child.getIsLayoutVisible())
				return;

			var childSize = new MoWrapPanel.ItemSize(this.orientation, 
				hasWidth ? itemWidth : child.getExactOrMeasuredWidth(), 
				hasHeight ? itemHeight : child.getExactOrMeasuredHeight());

			// the end of the block as been reached
			if((blockSize.hsize + childSize.hsize) > containerSize.hsize)
			{
				// finish current block
				this.arrangeLine(start, end, delta, offset, blockSize.vsize);
				
				// move to a new block
				offset += blockSize.vsize;
				blockSize.copyFrom(childSize);
				
				// the child is bigger than the container so it
				// will consume an entire block
				if(childSize.hsize > containerSize.hsize)
				{
					// arrange full block
					this.arrangeLine(end, ++end, delta, offset, childSize.vsize);
					
					// move to a new block
					offset += childSize.vsize;
					blockSize.hsize = blockSize.vsize = 0;
					blockSize.orientation = this.orientation;
				}
				
				// update index to new block
				start = end;
			}
			
			// otherwise we add to end of current block
			else
			{
				blockSize.hsize += childSize.hsize;
				blockSize.vsize = Math.max(childSize.vsize, blockSize.vsize);
			}
			
			end++;
		}

		// make sure to update the last block if needed
		if(start < count)
			this.arrangeLine(start, count, delta, offset, blockSize.vsize);
	},
	
	arrangeLine : function(start, end, delta, offset, vsize) {
		var idx = 0;
		var isHorizontal = (this.orientation == MoOrientation.Horizontal);
		var child = null;
		
		for(var i = start; i < end; ++i)
		{
			child = this.getAt(i);

			if(child.getIsLayoutVisible())
			{
				var childSize = new MoWrapPanel.ItemSize(this.orientation, child.getExactOrMeasuredWidth(), child.getExactOrMeasuredHeight());
				var hsize = MoIsNull(delta) ? childSize.hsize : delta;

				child.setLayoutPosition((isHorizontal ? idx : offset), (isHorizontal ? offset : idx));
				child.setActualSize((isHorizontal ? hsize : vsize), (isHorizontal ? vsize : hsize));

				idx += hsize;
			}
		}
	},
	
	isValidItemSize : function(size) {
		return (isNaN(size) || (size >= 0 && !MoMath.isPositiveInfinity(size)));
	} */
});

/* MoWrapPanel.ItemSize = Class.create({
	initialize : function(orientation, width, height) {
		this.hsize = 0;
		this.vsize = 0;
		this.orientation = orientation;

		this.setWidth(MoValueOrDefault(width, 0));
		this.setHeight(MoValueOrDefault(height, 0));
	},
	
	getWidth : function() {
		return (this.orientation == MoOrientation.Horizontal ? this.hsize : this.vsize);
	},
	
	setWidth : function(value) {
		if(this.orientation == MoOrientation.Horizontal)
			this.hsize = value;
		else
			this.vsize = value;
	},
	
	getHeight : function() {
		return (this.orientation == MoOrientation.Horizontal ? this.vsize : this.hsize);
	},
	
	setHeight : function(value) {
		if(this.orientation == MoOrientation.Horizontal)
			this.vsize = value;
		else
			this.hsize = value;
	},

	copyFrom : function(value) {
		this.hsize = value.hsize;
		this.vsize = value.vsize;
		this.orientation = value.orientation;
	},
	
	toString : function() {
		return "WrapPanel.ItemSize [hsize: " + 
			this.hsize + ", vsize: " + 
			this.vsize + ", orientation: " + 
			this.orientation + ", width: " + 
			this.getWidth() + ", height: " + 
			this.getHeight() + " ]";
	}
}); */


//=====================================================================
//= MoLabel.js
//=====================================================================

MoLabel = Class.create(MoControl, {
	initialize : function($super, name) {
		$super(name);

		this.text = "";
		this.textAlign = MoTextAlignment.Left;
		this.textTrimming = MoTextTrimming.None;
		this.maxWidth = NaN;
		this.wordWrap = false;
		this.lineHeight = NaN;
		this.font = new MoFont();
		this.stroke = null;
		this.strokeThickness = 0;
		this.strokePen = null;
		this.actualTextBounds = MoRectangle.Zero();
		this.needsComposition = true;

		this.textBlock = null;
		this.textLines = [];
	},

	getText : function() {
		return this.text;
	},

	setText : function(value) {
		if(this.text != value)
		{
			this.text = MoIsNull(value) ? "" : value.replace("\r\n", "\n").replace("\r", "\n");

			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getTextAlignment : function() {
		return this.textAlign;
	},
	
	setTextAlignment : function(value) {
		if(this.textAlign != value)
		{
			this.textAlign = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getTextTrimming : function() {
		return this.textTrimming;
	},
	
	setTextTrimming : function(value) {
		if(this.textTrimming != value)
		{
			this.textTrimming = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getWordWrap : function() {
		return this.wordWrap;
	},
	
	setWordWrap : function(value) {		
		if(this.wordWrap != value)
		{
			this.wordWrap = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getLineHeight : function() {
		return this.lineHeight;
	},

	setLineHeight : function(value) {		
		if(this.lineHeight != value)
		{
			this.lineHeight = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontName : function() {
		return this.font.getFontName();
	},
	
	setFontName : function(value) {		
		if(this.font.getFontName() != value)
		{
			this.font.setFontName(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontSize : function() {
		return this.font.getFontSize();
	},
	
	setFontSize : function(value) {		
		if(this.font.getFontSize() != value)
		{
			this.font.setFontSize(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontStretch : function() {
		return this.font.getFontStretch();
	},
	
	setFontStretch : function(value) {
		if(this.font.getFontStretch() != value)
		{
			this.font.setFontStretch(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontStyle : function() {
		return this.font.getFontStyle();
	},
	
	setFontStyle : function(value) {
		if(this.font.getFontStyle() != value)
		{
			this.font.setFontStyle(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getFontWeight : function() {
		return this.font.getFontWeight();
	},
	
	setFontWeight : function(value) {
		if(this.font.getFontWeight() != value)
		{
			this.font.setFontWeight(value);
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getStroke : function() {
		return this.stroke;
	},
	
	setStroke : function(value) {
		if(MoAreNotEqual(this.stroke, value))
		{
			this.stroke = value;
			
			this.invalidateProperties();
			this.requestLayout();
		}
	},

	getStrokeThickness : function() {
		return this.strokeThickness;
	},

	setStrokeThickness : function(value) {
		if(this.strokeThickness != value)
		{
			this.strokeThickness = value;
			
			this.invalidateProperties();
			this.requestLayout();
		}
	},
	
	getMaxWidth : function() {
		return this.maxWidth;
	},
	
	setMaxWidth : function(value) {
		if(this.maxWidth != value)
		{
			this.maxWidth = value;
			
			this.invalidateText();
			this.requestMeasure();
			this.requestLayout();
		}
	},
	
	getTruncationIndicator : function() {
		return (this.textTrimming == MoTextTrimming.None ? "" : "...");
	},
	
	invalidateText : function() {
		this.needsComposition = true;
	},
	
	commitProperties : function($super) {
		$super();
		
		if(this.stroke != null)
		{
			if(this.strokePen == null)
			{
				this.strokePen = new MoPen(this.stroke, this.strokeThickness);
			}
			else
			{
				this.strokePen.setBrush(this.stroke);
				this.strokePen.setThickness(this.strokeThickness);
			}
		}
		else
		{
			this.strokePen = null;
		}
	},
	
	measure : function($super) {
		$super();
		
		var exactWidth = this.getExactWidth();
		var exactHeight = this.getExactHeight();
		
		this.generateLines(Math.max(exactWidth, this.getFontSize()), Math.max(exactHeight, this.getFontSize()));
		this.requestLayout();

		if(!isNaN(this.maxWidth) && this.actualTextBounds.right() > this.maxWidth)
			this.setMeasuredWidth(this.maxWidth);
		else
			this.setMeasuredWidth(this.actualTextBounds.right());

		this.setMeasuredHeight(this.actualTextBounds.bottom());
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		if(this.needsComposition)
			this.generateLines(unscaledWidth, unscaledHeight);
		
		this.graphics.beginPath();
		
		for(var i = 0, len = this.textLines.length; i < len; ++i)
		{
			var line = this.textLines[i];
			
			this.graphics.drawText(line.getString(this.text), line.x, line.y, this.font);
		}		
		
		if(this.getForeground() != null)
			this.graphics.fill(this.getForeground());

		if(this.strokePen != null)
			this.graphics.stroke(this.strokePen);
	},
	
	needsTruncation : function(height, width) {
		// don't exceed the maximum width (if supplied)
		if(!isNaN(this.maxWidth) && (this.actualTextBounds.right() > this.maxWidth || (!isNaN(width) && width > this.maxWidth)))
			return true;
	
		// when we are not word wrapping and the text bounds exceeds
		// our available width, truncation is needed
		if(!isNaN(width) && !this.wordWrap && this.actualTextBounds.right() > width)
			return true;

		// there is only one (or none) line or the height is indeterminate
		// so no truncation is needed
		if(this.textLines.length <= 1 || isNaN(height))
			return false;

		// finally, when the last line exceeds our height, truncation
		// is needed
		var lastLine = this.textLines[this.textLines.length-1];

		return ((lastLine.y + lastLine.height) > height);
	},
	
	truncateText : function(width, height) {
		var somethingFit = false;
		var truncLineIndex = 0;
		
		if(!this.wordWrap)
		{
			this.truncateLines(width, height, false);
			return;
		}
		
		this.truncateLines(width, height, true);
	},
	
	truncateLines : function(width, height, vertical) {
		var indicator =  this.getTruncationIndicator();
		var indicatorLines = [];
		var indicatorBounds = new MoRectangle(0, 0, width, NaN);
		var indicatorTextBlock = new MoTextBlock(indicator, this.font);

 		if(!isNaN(this.maxWidth) || isNaN(width))
			width = this.maxWidth;

		this.createLinesFromTextBlock(indicatorTextBlock, indicatorLines, indicatorBounds);
		
		var maxWidth = width - indicatorBounds.width;
		var previousLine = null;
		
		for(var i = 0, len = this.textLines.length; i < len; ++i)
		{
			var line = this.textLines[i];
			
			if(vertical)
			{
				// this line exceeds our available height
				if(!isNaN(height) && (line.y + line.height) > height)
				{
					// resize our lines down so they all fit
					this.textLines.length = i;

					// now we can just truncate the last line
					var newLine = this.textBlock.createLine(this.textLines[Math.max(this.textLines.length-2, 0)], maxWidth, this.textTrimming);
					
					// make sure the line created actually fits (just in case)
					if((newLine.x + newLine.width) <= width)
					{
						// we don't ever want the truncation indicator to come after a space
						// so we move backwards to make sure we are at a char boundary
						// (i.e. instead of "dog ..." it should be "dog...")
						while(this.text[newLine.startIndex+newLine.length-1] == " "  && newLine.length > 0)
							newLine.length--;

						// copy only what we need over to our original line
						line = this.textLines[this.textLines.length-1];
						line.width = newLine.width;
						line.height = newLine.height;
						line.length = newLine.length;
						line.truncationIndicator = indicator;
					}

					break;
				}
			}
			else
			{
				// truncate the line when it exceeds our available width
				if(!isNaN(width) && (line.x + line.width) > width)
				{
					// create a new text line to fit within our width
					var newLine = this.textBlock.createLine(previousLine, maxWidth, this.textTrimming);

					// make sure the line created actually fits (just in case)
					if((newLine.x + newLine.width) <= width)
					{
						// we don't ever want the truncation indicator to come after a space
						// so we move backwards to make sure we are at a char boundary
						// (i.e. instead of "dog ..." it should be "dog...")
						while(this.text[newLine.startIndex+newLine.length-1] == " " && newLine.length > 0)
							newLine.length--;

						// copy only what we need over to our original line
						line.width = newLine.width;
						line.height = newLine.height;
						line.length = newLine.length;
						line.truncationIndicator = indicator;

						// no need to continue
						//
						// TODO : not sure this is actually true, how to handle the case
						//        when there are multiple lines in a text block
						//        (i.e. separated with a newline) that exceed our bounds?
						//
						break;
					}
				}
			}
			
			previousLine = line;
		}
	},
	
	generateLines : function(width, height) {
		var allLinesCreated = false;
		
		// reset text bounds
		this.actualTextBounds.x = 0;
		this.actualTextBounds.y = 0;
		this.actualTextBounds.width = width;
		this.actualTextBounds.height = height;
		
		// create the lines
		allLinesCreated = this.createLines();
		
		// see if we need to truncate the text
		if(!MoStringIsNullOrEmpty(this.text) && (!allLinesCreated || this.needsTruncation(height, width)))
			this.truncateText(width, height);

		this.needsComposition = false;
	},
	
	createLines : function() {
		this.textLines.length = 0;
		this.textBlock = new MoTextBlock(this.text, this.font);

		return this.createLinesFromTextBlock(this.textBlock, this.textLines, this.actualTextBounds);
	},

	createLinesFromTextBlock : function(textBlock, textLines, bounds) {
		var innerWidth = bounds.width;
		var innerHeight = bounds.height;
		var measureWidth = isNaN(innerWidth);
		var measureHeight = isNaN(innerHeight);

		// don't have a width yet so just use the maximum width (if specified), otherwise
		// just fallback to the user's width, regardless if set or not
		if(measureWidth)
			innerWidth = (!isNaN(this.maxWidth) ? this.maxWidth : this.getWidth());

		var fontSize = this.getFontSize();
		var actualLineHeight = isNaN(this.lineHeight) ? 1.2 * fontSize : this.lineHeight;
		var maxTextWidth = 0;
		var maxLineWidth = this.wordWrap ? innerWidth : 100000;
		var totalTextHeight = 0;
		var n = 0;
		var nextTextLine = null;
		var nextY = 0;
		var textLine = null;
		var allLinesCreated = false;
		var extraLine = false;
		
		// create and calculate each line in the text block
		while(true)
		{
			nextTextLine = textBlock.createLine(textLine, maxLineWidth);
			
			// line could not be created
			if(MoIsNull(nextTextLine))
			{
				allLinesCreated = !extraLine;
				break;
			}

			// increment the vertical position
			nextY += (n == 0 ? 0 : actualLineHeight);
			
			// if we don't need to measure the height, check whether or
			// not this line has exceeded our available height and allow
			// it to be added so we can figure out how much has overflowed
			if(!measureHeight && nextY > innerHeight)
			{
				if(extraLine)
					break;

				extraLine = true;
			}
			
			textLine = nextTextLine;
			textLine.y = nextY;
			maxTextWidth = Math.max(maxTextWidth, textLine.width);
			totalTextHeight += textLine.height;

			textLines[n++] = textLine;
		}
		
		// no lines were created
		if(n == 0)
		{
			bounds.width = 0;
			bounds.height = 0;
			
			return false;
		}
		
		// update sizes
		if(measureWidth)
			innerWidth = maxTextWidth;
		
		if(measureHeight)
			innerHeight = textLine.y + textLine.height;

		innerWidth = Math.ceil(innerWidth);
		innerHeight = Math.ceil(innerHeight);
		
		// compute the alignment positions
		var offsetTop = bounds.y;
		var offsetLeft = bounds.x;
		var offsetCenter = offsetLeft + (innerWidth * 0.5);
		var offsetRight = offsetLeft + innerWidth;
		var leading = (innerHeight - totalTextHeight) / (n - 1);
		var minX = innerWidth;
		var minY = innerHeight;
		var maxX = 0;
		var maxY = 0;

		for(var i = 0; i < n; ++i)
		{
			textLine = textLines[i];
			
			switch(this.textAlign)
			{
				case MoTextAlignment.Left:
					textLine.x = offsetLeft;
					break;
				case MoTextAlignment.Center:
					textLine.x = offsetCenter - (textLine.width * 0.5);
					break;
				case MoTextAlignment.Right:
					textLine.x = offsetRight - textLine.width;
					break;
			}
			
			textLine.y += offsetTop;

			minX = Math.min(minX, textLine.x);
			minY = Math.min(minY, textLine.y);
			maxX = Math.max(maxX, textLine.x + textLine.width);
			maxY = Math.max(maxY, textLine.y + textLine.height);
		}

		// update the bounds
		bounds.x = minX;
		bounds.y = minY;
		bounds.width = maxX - minX;
		bounds.height = maxY - minY;
		
		return allLinesCreated;
	}
});

//
// TODO : put these in separate class files...
//

MoTextLine = Class.create({
	initialize : function(startIndex, length, width, height) {
		this.startIndex = startIndex;
		this.length = length;
		this.y = 0;
		this.x = 0;
		this.width = width;
		this.height = height;
		this.truncationIndicator = "";
	},
	
	getIsTruncated : function() {
		return !MoStringIsNullOrEmpty(this.truncationIndicator);
	},

	getString : function(text) {
		return text.substr(this.startIndex, this.length) + this.truncationIndicator;
	},
	
	getEndIndex : function() {
		return this.startIndex + this.length;
	}
});

MoTextBlock = Class.create({
	initialize : function(text, font) {
		this.text = text;
		this.font = font;
		this.nativeCanvas = this.getFirstAvailableNativeCanvas();
	},

	// TODO : update the use of this so that the MoFont.getStringWidth creates a new canvas
	//        for measuring, this would break if multiple display surfaces are used with fonts
	//        that are different.
	getFirstAvailableNativeCanvas : function() {
		if(MoApplication.getInstance().getDisplaySurfaceCount() > 0)
			return MoApplication.getInstance().getDisplaySurfaceAt(0).getNativeCanvas();

		return null;
	},

	createLine : function(previousLine, width, trimStyle) {
		trimStyle = MoValueOrDefault(trimStyle, MoTextTrimming.Word);
		previousLine = MoValueOrDefault(previousLine, null);
		width = MoValueOrDefault(width, 100000);
		
		// won't be able to measure anything without a native canvas
		if(MoIsNull(this.nativeCanvas))
			return null;

		var startIndex = (MoIsNull(previousLine) ? 0 : previousLine.getEndIndex());
		var widths = [];
		var ch = "";
		var line = "";
		var lineWidth = 0;
		var measuredWidth = 0;
		var measuredHeight = 0;
		var length = 0;
		var lastSpaceIndex = -1;

		if(startIndex >= this.text.length)
			return null;
		
		for(var i = startIndex, len = this.text.length; i < len; ++i)
		{
			ch = this.text[i];
			
			// skip spaces at start
			if(ch == " " && length == 0)
			{
				startIndex++;
				continue;
			}
			
			// compute the width of the line with the new character
			lineWidth = this.font.getStringWidth(this.nativeCanvas, line + ch);
			
			// stop when we've exceeded the available width
			if(lineWidth > width)
				break;

			// save the width of the line at this character so we can
			// quickly look it up later
			widths.push(lineWidth);

			// stop when we hit a newline
			if(ch == "\n")
			{
				length++;
				lastSpaceIndex = -1;
				break;
			}

			// save the last index of a space so we can
			// move back to it quickly
			if(ch == " ")
				lastSpaceIndex = i;

			line += ch;
			length++;
		}

 		// when it's not the last line (or only line) and there was a previous 
		// space character, then we need to move backward to that space so our
		// line ends on a word boundary
		if(trimStyle == MoTextTrimming.Word)
		{
			// compute the new length so we are on a space
			if((startIndex + (length-1)) < this.text.length-1 && lastSpaceIndex != -1)
				length = (lastSpaceIndex - startIndex)+1;
		}

		// update our measurements
		measuredWidth = widths[length-1];
		measuredHeight = this.font.measureString(this.text.substr(startIndex, length), null).height;

		// return a new line structure to use for rendering
		return new MoTextLine(startIndex, length, measuredWidth, measuredHeight);
	}
});


//=====================================================================
//= MoShape.js
//=====================================================================

MoShape = Class.create(MoDrawable, {
	initialize : function($super, name) {
		$super(name);
		
		/** MoBrush **/
		this.fill = null;
		
		/** MoBrush **/
		this.stroke = null;

		/** Number **/
		this.strokeThickness = 0;
		
		/** MoPenLineCap **/
		this.strokeLineCap = MoPenLineCap.Flat;
		
		/** MoPenLineJoin **/
		this.strokeLineJoin = MoPenLineJoin.Miter;
		
		/** Number **/
		this.strokeMiterLimit = 10;
		
		/** MoPenLineCap **/
		this.strokeDashCap = MoPenLineCap.Flat;
		
		/** MoDashStyle **/
		this.strokeDashStyle = MoDashStyle.Solid;
		
		this.penCache = null;
		this.strokeMetrics = new MoRectangle();
	},
	
	getFill : function() {
		return this.fill;
	},
	
	setFill : function(value) {
		if(MoAreNotEqual(this.fill, value))
		{
			this.fill = value;
			this.requestLayout();
		}
	},

	getStroke : function() {
		return this.stroke;
	},
	
	setStroke : function(value) {
		if(MoAreNotEqual(this.stroke, value))
		{
			this.stroke = value;
			this.invalidatePen();
		}
	},
	
	getStrokeThickness : function() {
		return this.strokeThickness;
	},
	
	setStrokeThickness : function(value) {
		if(this.strokeThickness != value)
		{
			this.strokeThickness = value;
			this.invalidatePen();
		}
	},
	
	getStrokeLineCap : function() {
		return this.strokeLineCap;
	},
	
	setStrokeLineCap : function(value) {
		if(this.strokeLineCap != value)
		{
			this.strokeLineCap = value;
			this.invalidatePen();
		}
	},
	
	getStrokeLineJoin : function() {
		return this.strokeLineJoin;
	},
	
	setStrokeLineJoin : function(value) {
		if(this.strokeLineJoin != value)
		{
			this.strokeLineJoin = value;
			this.invalidatePen();
		}
	},
	
	getStrokeMiterLimit : function() {
		return this.strokeMiterLimit;
	},
	
	setStrokeMiterLimit : function(value) {
		if(this.strokeMiterLimit != value)
		{
			this.strokeMiterLimit = value;
			this.invalidatePen();
		}
	},
	
	getStrokeDashCap : function() {
		return this.strokeDashCap;
	},
	
	setStrokeDashCap : function(value) {
		if(this.strokeDashCap != value)
		{
			this.strokeDashCap = value;
			this.invalidatePen();
		}
	},
	
	getStrokeDashStyle : function() {
		return this.strokeDashStyle;
	},
	
	setStrokeDashStyle : function(value) {
		if(this.strokeDashStyle != value)
		{
			this.strokeDashStyle = value;
			this.invalidatePen();
		}
	},
	
	getPen : function() {
		if(this.stroke == null || Math.abs(this.strokeThickness) == 0)
			return null;

		if(this.penCache == null)
		{
			this.penCache = new MoPen(this.getStroke(), Math.abs(this.getStrokeThickness()));
			this.penCache.setLineCap(this.getStrokeLineCap());
			this.penCache.setLineJoin(this.getStrokeLineJoin());
			this.penCache.setMiterLimit(this.getStrokeMiterLimit());
			this.penCache.setDashStyle(this.getStrokeDashStyle());
			this.penCache.setDashCap(this.getStrokeDashCap());
		}

		return this.penCache;
	},
	
	invalidatePen : function() {
		this.penCache = null;
		this.requestMeasure();
		this.requestLayout();
	},
	
	getStrokeMetrics : function() {
	
		if(this.stroke == null || this.strokeThickness == 0)
		{
			this.strokeMetrics.x = 0;
			this.strokeMetrics.y = 0;
			this.strokeMetrics.width = 0;
			this.strokeMetrics.height = 0;
		}
		else
		{
			var thickness = this.strokeThickness;
			
			this.strokeMetrics.x = thickness * 0.5;
			this.strokeMetrics.y = thickness * 0.5;
			this.strokeMetrics.width = thickness;
			this.strokeMetrics.height = thickness;
		}

		return this.strokeMetrics;
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
	
		var gfx = this.getGraphics();
		var pen = this.getPen();
		
		// reset the graphics
		gfx.clear();
		
		// draw the shape, this should be overridden
		this.draw(gfx);

		// fill and stroke
		if(this.fill != null)
			gfx.fill(this.fill);

		if(pen != null)
			gfx.stroke(pen);
	},
	
	draw : function(gfx) {
		/** override **/
	}
});

Object.extend(MoShape, {
	UseExactBounds : true,
	
	computeLineBounds : function(x1, y1, x2, y2, thickness, lineCap) {
		var bounds = MoRectangle.Zero();
		
		// vertical
		if(x1 == x2)
		{
			bounds.x = x1;
			bounds.y = Math.min(y1, y2) - (y1 < y2 && lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0) - (y1 >= y2 && lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.width = thickness;
			bounds.height = Math.abs(y2 - y1) + (lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0) + (lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0);
		}
		
		// horizontal
		else if(y1 == y2)
		{
			bounds.x = Math.min(x1, x2) - (x1 < x2 && lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0) - (x1 >= x2 && lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.y = y1 - thickness / 2;
			bounds.width = Math.abs(x2 - x1) + (lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0) + (lineCap != MoPenLineCap.Flat ? thickness * 0.5 : 0);
			bounds.height = thickness;
		}

		// diagonal
		else
		{
			var m = Math.abs((y1 - y2) / (x1 - x2));
			var dx = (MoShape.UseExactBounds ? Math.sin(Math.atan(m)) * thickness : ((m > 1.0) ? thickness : thickness * m));
			var dy = (MoShape.UseExactBounds ? Math.cos(Math.atan(m)) * thickness : ((m < 1.0) ? thickness : thickness / m));
			
			if(x1 < x2)
			{
				switch(lineCap)
				{
					case MoPenLineCap.Square:
						bounds.x = Math.min(x1, x2) - (dx + dy) * 0.5;
						break;
					case MoPenLineCap.Round:
						bounds.x = Math.min(x1, x2) - thickness * 0.5;
						break;
					case MoPenLineCap.Flat:
						bounds.x = Math.min(x1, x2) - dx * 0.5;
						break;
				}
			}
			else
			{
				switch(lineCap)
				{
					case MoPenLineCap.Square:
						bounds.x = Math.min(x1, x2) - (dx + dy) * 0.5;
						break;
					case MoPenLineCap.Round:
						bounds.x = Math.min(x1, x2) - thickness * 0.5;
						break;
					case MoPenLineCap.Flat:
						bounds.x = Math.min(x1, x2) - dx * 0.5;
						break;
				}
			}
			
			if(y1 < y2)
			{
				switch(lineCap)
				{
					case MoPenLineCap.Square:
						bounds.y = Math.min(y1, y2) - (dx + dy) * 0.5;
						break;
					case MoPenLineCap.Round:
						bounds.y = Math.min(y1, y2) - thickness * 0.5;
						break;
					case MoPenLineCap.Flat:
						bounds.y = Math.min(y1, y2) - dy * 0.5;
						break;
				}
			}
			else
			{
				switch(lineCap)
				{
					case MoPenLineCap.Square:
						bounds.y = Math.min(y1, y2) - (dx + dy) * 0.5;
						break;
					case MoPenLineCap.Round:
						bounds.y = Math.min(y1, y2) - thickness * 0.5;
						break;
					case MoPenLineCap.Flat:
						bounds.y = Math.min(y1, y2) - dy * 0.5;
						break;
				}			
			}
			
			bounds.width = Math.abs(x2 - x1);
			bounds.height = Math.abs(y2 - y1);
			
			switch(lineCap)
			{
				case MoPenLineCap.Square:
					bounds.width += (dx + dy) * 0.5;
					bounds.height += (dx + dy) * 0.5;
					break;
				case MoPenLineCap.Round:
					bounds.width += thickness * 0.5;
					bounds.height += thickness * 0.5;
					break;
				case MoPenLineCap.Flat:
					bounds.width += dx * 0.5;
					bounds.height += dy * 0.5;
					break;		
			}
			
			switch(lineCap)
			{
				case MoPenLineCap.Square:
					bounds.width += (dx + dy) * 0.5;
					bounds.height += (dx + dy) * 0.5;
					break;
				case MoPenLineCap.Round:
					bounds.width += thickness * 0.5;
					bounds.height += thickness * 0.5;
					break;
				case MoPenLineCap.Flat:
					bounds.width += dx * 0.5;
					bounds.height += dy * 0.5;
					break;		
			}

		}
		
		return bounds;
	}
});


//=====================================================================
//= MoShapeEllipse.js
//=====================================================================

MoShapeEllipse = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);
	},
	
	draw : function(gfx) {
		var strokeMetrics = this.getStrokeMetrics();
		var x = strokeMetrics.x;
		var y = strokeMetrics.y;
		var w = this.getWidth() - strokeMetrics.width;
		var h = this.getHeight() - strokeMetrics.height;
		
		gfx.drawEllipse(x, y, w, h, false);
	}
});


//=====================================================================
//= MoShapeLine.js
//=====================================================================

MoShapeLine = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);
		
		/** Number **/
		this.x1 = 0;
		
		/** Number **/
		this.y1 = 0;
		
		/** Number **/
		this.x2 = 0;
		
		/** Number **/
		this.y2 = 0;
		
		this.alwaysMeasure = true;
	},

	getX1 : function() {
		return this.x1;
	},
	
	setX1 : function(value) {
		this.x1 = value;
	},

	getY1 : function() {
		return this.y1;
	},
	
	setY1 : function(value) {
		this.y1 = value;
	},
	
	getX2 : function() {
		return this.x2;
	},
	
	setX2 : function(value) {
		this.x2 = value;
	},

	getY2 : function() {
		return this.y2;
	},

	setY2 : function(value) {
		this.y2 = value;
	},
	
	measure : function() {
		var bounds = MoShape.computeLineBounds(this.x1, this.y1, this.x2, this.y2, Math.abs(this.getStrokeThickness()), this.getStrokeLineCap());
		
		this.setUnscaledWidth(bounds.right());
		this.setUnscaledHeight(bounds.bottom());
	},
	
	draw : function(gfx) {
		gfx.beginPath();
		gfx.drawLine(this.x1, this.y1, this.x2, this.y2);
	}
});


//=====================================================================
//= MoShapePath.js
//=====================================================================

MoShapePath = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);
		
		this.segments = null;
		this.data = null;
	},
	
	getData : function() {
		return this.data;
	},
	
	setData : function(value) {
		if(this.data != value)
		{
			this.data = value;
			this.segments = new MoPathSegmentCollection(this.data);
		}
	},
	
	draw : function(gfx) {
		var strokeMetrics = this.getStrokeMetrics();
		var x = strokeMetrics.x;
		var y = strokeMetrics.y;
		var w = this.getWidth() - strokeMetrics.width;
		var h = this.getHeight() - strokeMetrics.height;
		
		gfx.drawPath(this.segments);
	}
});


//=====================================================================
//= MoShapePolygon.js
//=====================================================================

MoShapePolygon = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);

		this.points = [];
		this.cachedPoints = [];
		this.alwaysMeasure = true;
	},
	
	getPoints : function() {
		return this.points;
	},

	setPoints : function(value) {
		// just clear out the points
		if(MoIsNull(value))
		{
			this.points.length = 0;
			return;
		}
	
		this.points = value;

		this.invalidateProperties();
		this.requestMeasure();
		this.requestLayout();
	},

	// TODO : add better measurement support for calculating the bounds with stroke and miter limit, different line caps/joins, etc..

	getShapeBounds : function() {	
		var xMin = 0;
		var xMax = 0;
		var yMin = 0;
		var yMax = 0;
		var thickness = Math.abs(this.getStrokeThickness());
		var thicknessH = thickness * 0.5;
		var len = this.cachedPoints.length;
		
		if(len > 1)
		{
			xMin = xMax = this.cachedPoints[0].x;
			yMin = yMax = this.cachedPoints[0].y;
			
			for(var i = 1; i < len; ++i)
			{
				xMin = Math.min(xMin, this.cachedPoints[i].x);
				xMax = Math.max(xMax, this.cachedPoints[i].x);
				yMin = Math.min(yMin, this.cachedPoints[i].y);
				yMax = Math.max(yMax, this.cachedPoints[i].y);
			}
			
			return MoShape.computeLineBounds(xMin, yMin, xMax, yMax, thickness, this.getStrokeLineCap());
		}
		
		return MoRectangle.fromPoints(
			new MoVector2D(xMin, yMin),
			new MoVector2D(xMax, yMax));
	},
	
	commitProperties : function($super) {
		$super();
		
		this.cachedPoints.length = 0;
		
		var len = this.points.length;
		var thickness = Math.abs(this.getStrokeThickness());
		var thicknessH = thickness * 0.5;
		var pt = null;
		
		for(var i = 0; i < len; ++i)
		{
			pt = this.points[i];
			this.cachedPoints.push(new MoVector2D(pt.x + thicknessH, pt.y + thicknessH));
		}
	},

	measure : function() {
		var bounds = this.getShapeBounds();
		
		this.setUnscaledWidth(bounds.right());
		this.setUnscaledHeight(bounds.bottom());
	},
	
	draw : function(gfx) {
		gfx.drawPoly(this.cachedPoints);
	}
});


//=====================================================================
//= MoShapePolyline.js
//=====================================================================

MoShapePolyline = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);

		this.points = new Array();
		this.closePath = false;
		this.cachedPoints = null;
		this.alwaysMeasure = true;
	},
	
	getPoints : function() {
		return this.points;
	},

	setPoints : function(value) {
		if(value == null)
			return;
	
		this.points = value;
		
		this.invalidateProperties();
		this.requestMeasure();
		this.requestLayout();
	},
	
	getClosePath : function() {
		return this.closePath;
	},
	
	setClosePath : function(value) {
		if(this.closePath != value)
		{
			this.closePath = value;
			this.requestLayout();
		}
	},

	// TODO : add better measurement support for calculating the bounds with stroke and miter limit, different line caps/joins, etc..
	
	getShapeBounds : function() {	
		var xMin = 0;
		var xMax = 0;
		var yMin = 0;
		var yMax = 0;
		var thickness = Math.abs(this.getStrokeThickness());
		var thicknessH = thickness * 0.5;
		var len = this.cachedPoints.length;
		
		if(len > 1)
		{
			xMin = xMax = this.cachedPoints[0].x;
			yMin = yMax = this.cachedPoints[0].y;
			
			for(var i = 1; i < len; ++i)
			{
				xMin = Math.min(xMin, this.cachedPoints[i].x);
				xMax = Math.max(xMax, this.cachedPoints[i].x);
				yMin = Math.min(yMin, this.cachedPoints[i].y);
				yMax = Math.max(yMax, this.cachedPoints[i].y);
			}
			
			return MoShape.computeLineBounds(xMin, yMin, xMax, yMax, thickness, this.getStrokeLineCap());
		}
		
		return MoRectangle.fromPoints(
			new MoVector2D(xMin, yMin),
			new MoVector2D(xMax, yMax));
	},
	
	commitProperties : function($super) {
		$super();
		
		this.cachedPoints = [];
		
		var len = this.points.length;
		var thickness = Math.abs(this.getStrokeThickness());
		var thicknessH = thickness * 0.5;
		var pt = null;
		
		for(var i = 0; i < len; ++i)
		{
			pt = this.points[i];
			this.cachedPoints.push(new MoVector2D(pt.x + thicknessH, pt.y + thicknessH));
		}
	},

	measure : function() {
		var bounds = this.getShapeBounds();
		
		this.setUnscaledWidth(bounds.right());
		this.setUnscaledHeight(bounds.bottom());
	},
	
	draw : function(gfx) {
		gfx.drawPoly(this.cachedPoints, !this.closePath);
	}
});


//=====================================================================
//= MoShapeRectangle.js
//=====================================================================

MoShapeRectangle = Class.create(MoShape, {
	initialize : function($super, name) {
		$super(name);

		this.radius = 0;
	},
	
	getRadius : function() {
		return this.radius;
	},
	
	setRadius : function(value) {
		if(this.radius != value)
		{
			this.radius = value;
			this.requestLayout();
		}
	},
	
	draw : function(gfx) {
		var strokeMetrics = this.getStrokeMetrics();
		var x = strokeMetrics.x;
		var y = strokeMetrics.y;
		var w = this.getWidth() - strokeMetrics.width;
		var h = this.getHeight() - strokeMetrics.height;
		
		if(this.radius == 0)
			gfx.drawRect(x, y, w, h);
		else
			gfx.drawRoundRect(x, y, w, h, this.radius);
	}
});


//=====================================================================
//= MoMediaBase.js
//=====================================================================

/****************************************************************************
** Subclasses must implement the MoEventDispatcher class to provide
** support for the following events:
**  - onEnded
**  - onError
**  - onStateChange
**  - onOpened
**
****************************************************************************/

MoMediaBase = {

/**
 * @MIXIN
 *
 * SUMMARY:
 *	Base mixin for all objects that participate in media playback.
 *
 * REMARKS:
 *  This mixin must be added to a class that inherits from MoEventDispatcher
 *  otherwise events will fail to dispatch
 *
 */

	initializeMedia : function(sourceElement) {
		this.availableSources = new Array();
		this.currentSourceIndex = -1;
		this.currentSuspendRetryCount = 0;
		this.currentState = MoMediaState.Closed;
		this.sourceElement = sourceElement;
		this.autoPlayEnabled = false;
		this.loopingEnabled = false;
		this.wasStopRequested = false;
		this.isPendingPlay = false;
		this.isPendingPause = false;
		this.isPendingStop = false;
		this.isPendingSeek = false;
		this.isReady = false;
		this.naturalDuration = 0;
		this.seekPosition = 0;

		this.frameUpdateTimer = new MoTimer(MoMediaBase.FRAME_UPDATE_INTERVAL);
		this.frameUpdateTimer.addEventHandler(MoTimerEvent.TICK, this.frameUpdateTimerTick.asDelegate(this));
		
		this.initializeSourceElement();

		// MoLogEvents(this.sourceElement,
			// "loadstart", 
			// "progress", 
			// "suspend", 
			// "abort", 
			// "error", 
			// "emptied", 
			// "stalled", 
			// "loadedmetadata", 
			// "loadeddata", 
			// "canplay", 
			// "canplaythrough", 
			// "playing", 
			// "waiting",
			// "seeking",
			// "seeked",
			// "ended",
			// "durationchange",
			// "timeupdate",
			// "play",
			// "pause",
			// "ratechange",
			// "volumechange", ["networkState", "readyState"]);
	},

	getIsReady : function() {
		return this.isReady;
	},

	getIsPlaying : function() {
		return (this.getCurrentState() == MoMediaState.Playing);
	},

	getAutoPlay : function() {
		return this.autoPlayEnabled;
	},
	
	setAutoPlay : function(value) {
		this.autoPlayEnabled = value;
	},
	
	getLoop : function() {
		return this.loopingEnabled;
	},
	
	setLoop : function(value) {
		this.loopingEnabled = value;
	},
	
	getDefaultPlaybackSpeed : function() {
		return this.sourceElement.defaultPlaybackRate;
	},
	
	setDefaultPlaybackSpeed : function(value) {
		this.sourceElement.defaultPlaybackRate = value;
	},
	
	getPlaybackSpeed : function() {
		return this.sourceElement.playbackRate;
	},
	
	setPlaybackSpeed : function(value) {
		this.sourceElement.playbackRate = value;
	},
	
	getMuted : function() {
		return this.sourceElement.muted;
	},
	
	setMuted : function(value) {
		this.sourceElement.muted = value;
	},
	
	getVolume : function() {
		return this.sourceElement.volume;
	},

	setVolume : function(value) {
		this.sourceElement.volume = value;
	},

	getNaturalDuration : function() {
		return this.naturalDuration;
	},
	
	getCurrentPosition : function() {
		return this.sourceElement.currentTime;
	},

	addSource : function(source) {
		this.availableSources.push(source);
	},
	
	clearSources : function() {
		this.availableSources.clear();
		this.currentSourceIndex = -1;
	},

	getSourceAt : function(index) {
		return this.availableSources[index];
	},
	
	getSourceCount : function() {
		return this.availableSources.length;
	},

	getCurrentSource : function() {
		if(this.currentSourceIndex == -1)
			return null;
		
		return this.availableSources[this.currentSourceIndex];
	},

	getCurrentState : function() {
		return this.currentState;
	},

	setCurrentState : function(newState) {
		if(this.currentState != newState)
		{
			this.currentState = newState;
			this.raiseStateChangeEvent();
		}
	},
	
	getSourceElement : function() {
		return this.sourceElement;
	},

	initializeSourceElement : function() {
		this.initializeSourceElementImpl();
	},

	initializeSourceElementImpl : function() {
		this.sourceElement.autoplay = false;
		this.sourceElement.preload = "metadata";

		this.sourceElement.addEventListener("loadstart", this.handleLoadStartEvent.bind(this), false);
		this.sourceElement.addEventListener("loadedmetadata", this.handleLoadedMetadataEvent.bind(this), false);
		this.sourceElement.addEventListener("loadeddata", this.handleLoadedDataEvent.bind(this), false);
		this.sourceElement.addEventListener("canplay", this.handleCanPlayEvent.bind(this), false);
		this.sourceElement.addEventListener("pause", this.handlePauseEvent.bind(this), false);
		this.sourceElement.addEventListener("playing", this.handlePlayingEvent.bind(this), false);
		this.sourceElement.addEventListener("abort", this.handleAbortEvent.bind(this), false);
		this.sourceElement.addEventListener("ended", this.handleEndedEvent.bind(this), false);
		this.sourceElement.addEventListener("durationchange", this.handleDurationChangeEvent.bind(this), false);
		this.sourceElement.addEventListener("seeked", this.handleSeekedEvent.bind(this), false);
		this.sourceElement.addEventListener("suspend", this.handleSuspendEvent.bind(this), false);
		this.sourceElement.addEventListener("error", this.handleErrorEvent.bind(this), false);
	},

	play : function(loadMedia) {
		loadMedia = MoValueOrDefault(loadMedia, false);

		if(loadMedia)
			this.load();

		this.resetPendingRequests();
		this.isPendingPlay = true;
		this.processPendingRequests();
	},
	
	playImpl : function() {
		this.isPendingPlay = false;
		this.sourceElement.play();
	},

	stop : function() {
		this.resetPendingRequests();
		this.isPendingStop = true;
		this.processPendingRequests();
	},
	
	stopImpl : function() {
		this.isPendingStop = false;

		this.wasStopRequested = true;
		this.seek(0);

		// the audio is already in a paused state, so just change
		// the state to stop, no need to call pause again
		if(this.getCurrentState() == MoMediaState.Paused)
		{
			this.wasStopRequested = false;
			this.setCurrentState(MoMediaState.Stopped);
		}
		else
		{
			this.pauseImpl();
		}
	},
	
	pause : function() {	
		this.resetPendingRequests();
		this.isPendingPause = true;
		this.processPendingRequests();
	},

	pauseImpl : function() {
		this.isPendingPause = false;
		this.sourceElement.pause();
	},

	seek : function(position) {
		this.isPendingSeek = true;
		this.seekPosition = position;
		this.processPendingRequests();
	},

	seekImpl : function(position) {
		this.isPendingSeek = false;
		this.seekPosition = 0;
		this.sourceElement.currentTime = position;
		
		if(this.getCurrentState() == MoMediaState.Stopped)
			this.sourceElement.pause();
	},

	load : function() {
		if(this.availableSources.length == 0)
			return;

		// find the best source to use
		var len = this.getSourceCount();
		var source = null;
		var canPlayResult = "";
		var bestSourceIndex = -1;

		for(var i = 0; i < len; ++i)
		{
			source = this.getSourceAt(i);
			
			if(source == null)
				continue;
			
			canPlayResult = this.sourceElement.canPlayType(source.toString());
			
			// this is the best available source, no need to keep checking the remaining sources
			if(canPlayResult == "probably")
			{
				bestSourceIndex = i;
				break;
			}

			// this is a possiblity, but we still need to keep checking all the remaining 
			// sources, if we end up not finding a better source then we should only use 
			// the first "maybe"
			if(canPlayResult == "maybe" && bestSourceIndex == -1)
				bestSourceIndex = i;
		}

		// could not find a source to use
		if(bestSourceIndex == -1)
		{
			MoDebugWrite("Unable to find a compatible media source.", MoDebugLevel.Warning);
			return;
		}

		// now start loading the media source
		this.isReady = false;
		this.currentSuspendRetryCount = 0;
		this.currentSourceIndex = bestSourceIndex;
		this.sourceElement.src = this.getCurrentSource().getUrl();
		this.sourceElement.load();
	},
	
	resetPendingRequests : function() {
		this.isPendingPause = false;
		this.isPendingPlay = false;
		this.isPendingStop = false;
	},
	
	processPendingRequests : function() {
		// do not process anything if the media is not yet ready
		if(!this.isReady)
			return;
		
		// if we have a pending seek then do that first
		if(this.isPendingSeek)
			this.seekImpl(this.seekPosition);

		if(this.isPendingStop)
			this.stopImpl();
		else if(this.isPendingPause)
			this.pauseImpl();
		else if(this.isPendingPlay)
			this.playImpl();
	},

	handleErrorEvent : function(evt) {
		var errorCode = this.sourceElement.error.code;
		var errorMessage = MoMediaBase.getErrorMessageFromCode(errorCode);
		var source = this.getCurrentSource();

		MoDebugWrite("#{0} url: '#{1}', code: #{2}", MoDebugLevel.Error, errorMessage, (source == null ? "Unknown" : source.getUrl()), errorCode);

		this.dispatchEvent(new MoErrorEvent(MoErrorEvent.ERROR, errorCode, errorMessage));
	},
	
	handleSuspendEvent : function(evt) {
		// during a load the media can get suspended without receiving all of
		// it's data and thus not sending the 'canplay' event that we need to
		// get things all setup and ready, so if this happens, just try to load
		// the media again and if the retry count is exceeded then just fail
		if(!this.isReady && this.sourceElement.readyState <= this.sourceElement.HAVE_CURRENT_DATA)
		{
			if(this.currentSuspendRetryCount++ < MoMediaBase.MAX_SUSPEND_RETRY_COUNT)
				this.sourceElement.load();
		}
	},

	handleLoadStartEvent : function(evt) {
		this.setCurrentState(MoMediaState.Opening);
	},

	handleLoadedMetadataEvent : function(evt) {
		this.setCurrentState(MoMediaState.Buffering);
		this.frameReady();
	},

	handleLoadedDataEvent : function(evt) {
		this.raiseOpenedEvent();
	},

	handleCanPlayEvent : function(evt) {
		// we only want to run this if it's the first time a canplay has 
		// been fired since we've set a media source
		if(this.isReady)
			return;

		if(this.autoPlayEnabled)
			this.play();
		else
			this.setCurrentState(MoMediaState.Paused);

		this.isReady = true;
		this.frameReady();
		this.processPendingRequests();
	},

	handlePauseEvent : function(evt) {
		var newState = (this.wasStopRequested ? MoMediaState.Stopped : MoMediaState.Paused);
		
		this.wasStopRequested = false;
		this.setCurrentState(newState);
	},

	handlePlayingEvent : function(evt) {
		this.setCurrentState(MoMediaState.Playing);
		this.frameUpdateTimer.start();
	},
	
	handleSeekedEvent : function(evt) {
		// ensure that any implementors update their current frame, we
		// do this here because the update timer may or may not be running
		// and there is no harm even if it is running
		this.frameUpdate();
	},

	handleDurationChangeEvent : function(evt) {
		this.naturalDuration = this.sourceElement.duration;
	},

	handleAbortEvent : function(evt) {
		this.setCurrentState(MoMediaState.Closed);
		this.frameUpdateTimer.stop();
		
		this.dispatchEvent(new MoErrorEvent(
			MoErrorEvent.ERROR, 
			MoMediaBase.ERR_ABORTED, 
			MoMediaBase.getErrorMessageFromCode(MoMediaBase.ERR_ABORTED)));
	},

	handleEndedEvent : function(evt) {
		if(this.getLoop())
		{
			this.sourceElement.currentTime = 0;
			return;
		}

		this.frameUpdateTimer.stop();
		this.currentSuspendRetryCount = 0;
		this.setCurrentState(MoMediaState.Stopped);
		this.raiseEndedEvent();
	},
	
	frameReady : function() {
		/** override **/
	},

	frameUpdate : function() 
	{ 
		/** override **/
	},

	frameUpdateTimerTick : function(event) {
		this.frameUpdate();
	},
	
	raiseOpenedEvent : function() {
		this.dispatchEvent(new MoMediaEvent(MoMediaEvent.OPENED));
	},
	
	raiseEndedEvent : function() {
		this.dispatchEvent(new MoMediaEvent(MoMediaEvent.ENDED));
	},
	
	raiseStateChangeEvent : function() {
		this.dispatchEvent(new MoEvent(MoEvent.CHANGE));
	}
};

Object.extend(MoMediaBase, {	
	FRAME_UPDATE_INTERVAL : 50,
	MAX_SUSPEND_RETRY_COUNT : 5,
	
	ERR_ABORTED		: 1,
	ERR_NETWORK		: 2,
	ERR_DECODE		: 3,
	ERR_SRC_BAD		: 4,

	ERR_ABORTED_MSG	: "User aborted the playback.",
	ERR_NETWORK_MSG	: "Unable to read from stream, general network error.",
	ERR_DECODE_MSG	: "Unable to decode the media or a bad frame found.",
	ERR_SRC_BAD_MSG	: "Unable to find a suitable media format for playback or the media was not found.",

	getErrorMessageFromCode : function(code) {
		switch(code)
		{
			case MoMediaBase.ERR_ABORTED:
				return MoMediaBase.ERR_ABORTED_MSG;
			case MoMediaBase.ERR_NETWORK:
				return MoMediaBase.ERR_NETWORK_MSG;
			case MoMediaBase.ERR_DECODE:
				return MoMediaBase.ERR_DECODE_MSG;
			case MoMediaBase.ERR_SRC_BAD:
				return MoMediaBase.ERR_SRC_BAD_MSG;
		}

		return "An unknown error occured.";
	}
});


//=====================================================================
//= MoAudioSource.js
//=====================================================================

MoAudioSource = Class.create(MoMediaSource, {
	initialize : function($super, url, simpleType, codec) {
		$super(url, "audio/" + simpleType, codec);
	}
});


//=====================================================================
//= MoAudio.js
//=====================================================================

MoAudio = Class.create(MoNamedObject, MoMediaBase, {
	initialize : function($super, name, sourceElement) {
		$super(name);

		this.initializeMedia(MoValueOrDefault(sourceElement, document.createElement("audio")));
	}
});

Object.extend(MoAudio, {

	// TODO : need to add the audio element sources
	fromAudioElement : function(audioElement) {
		var name = (audioElement.id != null ? audioElement.id : (audioElement.name != null ? audioElement.name : ""));

		return new MoAudio(name, audioElement);
	},
	
	create : function(name, source) {
		var mgr = MoAudioManager.getInstance();

		// the source is a list of media sources so we
		// add each one
		if(source instanceof Array)
		{
			var len = source.length;

			for(var i = 0; i < len; ++i)
				mgr.addSource(name, source[i]);
		}
		else
		{
			mgr.addSource(name, source);
		}

		return mgr.getAudio(name);
	},

	play : function(name, source) {
		var audio = MoAudio.create(name, source);

		MoAudioManager.getInstance().play(name);

		return audio;
	},

	pause : function(name) {
		MoAudioManager.getInstance().pause(name);
	},

	resume : function(name) {
		MoAudioManager.getInstance().play(name);
	},

	stop : function(name) {
		MoAudioManager.getInstance().stop(name);
	},

	seek : function(name, position) {
		MoAudioManager.getInstance().seek(name, position);
	}	
	
});


//=====================================================================
//= MoAudioManager.js
//=====================================================================

MoAudioManager = Class.create({
	initialize : function() {
		this.sourceLookup = new MoDictionary();
	},
	
	addSource : function(name, audioSource) {
		var audio = null;
		
		if(!this.sourceLookup.containsKey(name))
		{
			audio = new MoAudio(name);
			audio.setAutoPlay(false);
			
			this.sourceLookup.set(name, audio);
		}

		audio = this.sourceLookup.get(name);
		audio.addSource(audioSource);
	},

	clearSources : function(name) {
		if(this.sourceLookup.containsKey(name))
		{
			var audio = this.sourceLookup.get(name);
			audio.stop();
			
			this.sourceLookup.remove(name);
		}
	},
	
	clearAll : function() {
		var keys = this.sourceLookup.getKeys();
		
		for(var i = 0; i < keys.length; i++)
			this.clearSources(keys[i]);
	},
	
	getAudio : function(name) {
		return this.sourceLookup.get(name);
	},
	
	play : function(name) {
		var audio = this.getAudio(name);
		
		if(audio != null)
		{
			if(!audio.getIsReady())
				audio.load();

			audio.play();
		}
	},
	
	playAll : function() {
		var keys = this.sourceLookup.getKeys();
		
		for(var i = 0; i < keys.length; i++)
			this.play(keys[i]);
	},
	
	pause : function(name) {
		var audio = this.getAudio(name);
		
		if(audio != null)
			audio.pause();
	},

	pauseAll : function() {
		var keys = this.sourceLookup.getKeys();
		
		for(var i = 0; i < keys.length; i++)
			this.pause(keys[i]);
	},
	
	stop : function(name) {
		var audio = this.getAudio(name);
		
		if(audio != null)
			audio.stop();
	},
	
	stopAll : function() {
		var keys = this.sourceLookup.getKeys();
		
		for(var i = 0; i < keys.length; i++)
			this.stop(keys[i]);
	},
	
	seek : function(name, position) {
		var audio = this.getAudio(name);
		
		if(audio != null)
			audio.seek(position);
	}
});

Object.extend(MoAudioManager, {
	Instance : null,
	
	getInstance : function() {
		if(MoAudioManager.Instance == null)
			MoAudioManager.Instance = new MoAudioManager();

		return MoAudioManager.Instance;
	}
});


//=====================================================================
//= MoVideo.js
//=====================================================================

MoVideo = Class.create(MoDrawable, MoMediaBase, {
	initialize : function($super, name, sourceElement) {
		$super(name);

		this.alwaysDirty = true;		
		this.addEventHandler(MoEvent.ADDED_TO_SCENE, this.handleAddedToSceneEvent.asDelegate(this));
		
		this.initializeMedia(MoValueOrDefault(sourceElement, document.createElement("video")));
		this.videoSourceCache = new MoVideoSource(this.getSourceElement());
	},
	
	close : function() {
		
	},

	getNaturalSize : function() {
		return new MoSize(this.getSourceElement().videoWidth, this.getSourceElement().videoHeight);
	},

	frameReady : function() {
		this.requestMeasure();
		this.requestLayout();
		this.raiseFrameChangeEvent();
	},

	frameUpdate : function() 
	{ 
		this.requestLayout();
		this.raiseFrameChangeEvent();
	},

	measure : function($super) {
		var naturalSize = this.getNaturalSize();
		var measuredWidth = 0;
		var measuredHeight = 0;
		var exactWidth = this.getExactWidth();
		var exactHeight = this.getExactHeight();
		
		if(isNaN(naturalSize.width))
			naturalSize.width = 0;
			
		if(isNaN(naturalSize.height))
			naturalSize.height = 0;

		measuredWidth = naturalSize.width;
		measuredHeight = naturalSize.height;
		
		if(!isNaN(exactWidth) && isNaN(exactHeight) && measuredWidth > 0)
			measuredHeight = this.getExactWidth() * measuredHeight / measuredWidth;
		else if(!isNaN(exactHeight) && isNaN(exactWidth) && measuredHeight > 0)
			measuredWidth = this.getExactHeight() * measuredWidth / measuredHeight;

		this.setMeasuredWidth(measuredWidth);
		this.setMeasuredHeight(measuredHeight);
	},
	
	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		this.graphics.clear();
		this.graphics.beginPath();
		this.graphics.drawImage(this.videoSourceCache, 0, 0, unscaledWidth, unscaledHeight);
	},
	
	handleAddedToSceneEvent : function(event) {
		this.load();
	},

	raiseFrameChangeEvent : function() {
		this.dispatchEvent(new MoVideoEvent(MoVideoEvent.FRAME_CHANGE));
	}
});

Object.extend(MoVideo, {

	// TODO : need to add the video element sources
	fromVideoElement : function(videoElement) {
		var name = (videoElement.id != null ? videoElement.id : (videoElement.name != null ? videoElement.name : ""));
		
		return new MoVideo(name, videoElement);
	}
	
});


//=====================================================================
//= MoDisplaySurface.js
//=====================================================================

MoDisplaySurface = Class.create(MoContentControl, {
	initialize : function($super, name, canvas) {
		$super(name);

		this.nativeCanvas = canvas;
		this.isRunning = true;
		this.scene = this;
		this.resizeHandlerRegistered = false;
		this.resizeWidth = true;
		this.resizeHeight = true;
		this.resizeLive = true;
		this.isPhysicsEnabled = false;
		this.physicsController = null;
		this.frameRate = 24;
		this.percentBoundsChanged = false;
		this.updatingBounds = false;
		this.inputManager = new MoInputManager(this);
		this.absoluteSourcePosition = MoVector2D.Zero();
		this.physicsWorld = null;
		this.groundEntity = null;
		this.renderTimes = [];
		this.aiEntities = [];
		this.armatures = [];
		this.originalWidth = canvas.width;
		this.originalHeight = canvas.height;
		this.fps = new MoFPSGraph();
		this.fpsDirtyRegion = new MoDirtyRegion();
		this.times = [];
		this.lastAvg = 0;
		
		this.fixedTimeAccum = 0;
		this.fixedTimeAccumRatio = 0;
		
		var width = canvas.width;
		var height = canvas.height;

		this.invalidatePositionOnScreen();
		this.setIsRoot(true);
		this.changeParentAndScene(null, this);
		this.setDepth(1);
		this.setActualSize(width, height);
		this.setPercentWidth(100);
		this.setPercentHeight(100);
		this.initializeSelf();
	},
	
	getFocusedDrawable : function() {
		return this.inputManager.getFocusTarget();
	},

	getIsPhysicsEnabled : function() {
		return this.isPhysicsEnabled;
	},

	setIsPhysicsEnabled : function(value) {
		if(this.isPhysicsEnabled != value)
		{
			this.isPhysicsEnabled = value;

			if(this.isPhysicsEnabled)
				this.setupPhysicsWorld();
			else
				this.teardownPhysicsWorld();
		}
	},
	
	getPhysicsWorld : function() {
		return this.physicsWorld;
	},

	getGroundEntity : function() {
		this.needPhysics("get ground entity");
		
		if(this.groundEntity == null)
			this.groundEntity = new MoEntity(MoEntityType.Ground, "ground", this.physicsWorld.GetGroundBody(), this.physicsController);

		return this.groundEntity;
	},
	
	togglePhysicsDebugDraw : function(key, value) {
		this.needPhysics("update debug drawing");
		this.physicsController.toggleDebugDrawing(key, value);
	},

	setX : function(value) {
		/** no-op **/
		/** cannot change x-position on the scene **/
	},

	setY : function(value) {
		/** no-op **/
		/** cannot change y-position on the scene **/
	},
	
	createArmature : function(name, x, y) {		
		return this.addArmature(new MoIK(name, x, y));
	},

	addArmature : function(armature) {
		this.armatures.push(armature);
		
		return armature;
	},

	removeArmature : function(armature) {
		this.armatures.remove(armature);
		
		return armature;
	},

	createAIEntity : function(name, objectType) {
		var entity = MoAIEntity.create(name, MoValueOrDefault(objectType, MoAIEntity));

		this.addAIEntity(entity);

		return entity;
	},
	
	addAIEntity : function(entity) {
		this.aiEntities.push(entity);
	},
	
	destroyJointEntity : function(joint) {
		this.needPhysics("destroy joint");
		this.physicsWorld.DestroyJoint(joint);
	},
	
	createDynamicEntity : function(name, descriptor, objectType, objectParams) {
		this.needPhysics("create dynamic entity");
		
		return MoEntity.createDynamic(name, MoValueOrDefault(objectType, MoEntity), objectParams, descriptor, this.physicsController);
	},
	
	createStaticEntity : function(name, descriptor, objectType, objectParams) {
		this.needPhysics("create static entity");

		return MoEntity.createStatic(name, MoValueOrDefault(objectType, MoEntity), objectParams, descriptor, this.physicsController);
	},
	
	createKinematicEntity : function(name, descriptor, objectType, objectParams) {
		this.needPhysics("create kinematic entity");

		return MoEntity.createKinematic(name, MoValueOrDefault(objectType, MoEntity), objectParams, descriptor, this.physicsController);
	},
	
	queryEntities : function(rect) {
		this.needPhysics("query entities");
		
		var aabb = new PXAABB();
		var evt = new MoEntityQueryEvent(MoEntityQueryEvent.REPORT, null, true, true);
		evt.queryRect.x = rect.x;
		evt.queryRect.y = rect.y;
		evt.queryRect.width = rect.width;
		evt.queryRect.height = rect.height;

		aabb.lowerBound = this.physicsController.convertPoint(new PXVector2D(rect.x, rect.y), false, true, false);
		aabb.upperBound = this.physicsController.convertPoint(new PXVector2D(rect.right(), rect.bottom()), false, true, false);

		this.physicsWorld.QueryAABB((function(fixture) {
			evt.entityFixture = fixture.GetUserData();
			this.dispatchEvent(evt);

			return !evt.getIsDefaultPrevented();

		}).bind(this), aabb);
	},

	rayCastEntities : function(startPoint, endPoint, type) {
		this.needPhysics("raycast entities");

		type = MoValueOrDefault(type, MoEntityRayCastType.Any);
		
		var p1 = this.physicsController.convertPoint(startPoint, false, true, false);
		var p2 = this.physicsController.convertPoint(endPoint, false, true, false);
		var evt = new MoEntityRayCastEvent(MoEntityRayCastEvent.REPORT, true, true);
		var closestMatch = null;
		
		evt.startPoint.x = startPoint.x;
		evt.startPoint.y = startPoint.y;
		evt.endPoint.x = endPoint.x;
		evt.endPoint.y = endPoint.y;

		this.physicsWorld.RayCast((function(fixture, point, normal, fraction) {

			if(type == MoEntityRayCastType.Any || (type == MoEntityRayCastType.One && (closestMatch == null || fraction < closestMatch)))
			{
				closestMatch = fraction;			
				evt.entityFixture = fixture.GetUserData();
				evt.point = this.physicsController.convertPoint(point, true, false, true);
				evt.normal = new MoVector2D(normal.x, normal.y);
				evt.distance = fraction;
			}

			if(type == MoEntityRayCastType.Any)
			{
				evt.result = (fraction === undefined ? 0 : 1);
				
				// dispatch event to handlers
				this.dispatchEvent(evt);

				// if user cancelled event, then stop reporting fixtures
				if(evt.getIsDefaultPrevented())
					return 0;
			}
			else
			{
				evt.result = (fraction === undefined ? 0 : fraction);
			}

			return evt.result;

		}).bind(this), p1, p2);

		// just send the single event with the closest match found
		if(type == MoEntityRayCastType.One && closestMatch != null)
			this.dispatchEvent(evt);
	},

	needPhysics : function(msg) {
		if(!this.getIsPhysicsEnabled())
			throw new Error("Unable to " + MoValueOrDefault(msg, "perform action") + ", this surface does not have physics enabled.");
	},

	updateAI : function(t) {
		var len = this.aiEntities.length;
		var entity = null;
		
		for(var i = 0; i < len; ++i)
		{
			entity = this.aiEntities[i];
			entity.update(t);
		}
	},

	updatePhysics : function(t) {
		if(!this.isPhysicsEnabled)
			return;
		
		var ts = 1 / 60;
		var steps = 0;

		this.physicsController.reset();
		this.fixedTimeAccum += (t / 1000);
		
		steps = Math.floor(this.fixedTimeAccum / ts);
		
		if(steps > 0)
			this.fixedTimeAccum -= steps * ts;
		
		this.fixedTimeAccumRatio = this.fixedTimeAccum / ts;
		
		steps = Math.min(steps, 5);
		
		for(var i = 0; i < steps; ++i)
		{
			this.physicsController.step(ts);
			this.physicsController.resetEntities();

			this.physicsWorld.Step(ts, 8, 1);
		}

		this.physicsWorld.ClearForces();
		this.physicsWorld.DrawDebugData();
		this.physicsController.update(this.fixedTimeAccumRatio);
	},
	
	updateOther : function(t) {
		var len = this.armatures.length;

		for(var i = 0; i < len; ++i)
			this.armatures[i].update();
	},

	setPercentWidth : function($super, value) {	
		if(this.getPercentWidth() != value)
		{
			$super(value);

			if(!this.updatingBounds)
			{
				this.percentBoundsChanged = true;
				this.invalidateProperties();
			}
		}
	},

	setPercentHeight : function($super, value) {
		if(this.getPercentHeight() != value)
		{
			$super(value);

			if(!this.updatingBounds)
			{
				this.percentBoundsChanged = true;
				this.invalidateProperties();
			}
		}
	},
	
	setUnscaledWidth : function($super, value) {
		this.invalidateProperties();

		$super(value);
	},
	
	setUnscaledHeight : function($super, value) {
		this.invalidateProperties();
		
		$super(value);
	},

	getNativeCanvas : function() {
		return this.nativeCanvas;
	},
	
	setNativeCanvas : function(value) {
		// unregister any existing native event handlers
		this.inputManager.unregisterEvents();
		
		// now update the canvas and invalidate our properties
		this.nativeCanvas = value;
		this.originalWidth = this.nativeCanvas.width;
		this.originalHeight = this.nativeCanvas.height;
		this.invalidateProperties();
		this.invalidatePositionOnScreen();
		
		// update the physics debug draw
		if(this.isPhysicsEnabled)
			this.physicsController.updateSettings();

		// need to register the input manager to get native events
		this.inputManager.registerEvents();
	},
	
	getNativeGraphicsContext : function() {
		return this.nativeCanvas.getContext("2d");
	},

	getIsRunning : function() {
		return this.isRunning;
	},

	setIsRunning : function(value) {
		this.isRunning = value;
	},

	setupPhysicsWorld : function() {
		this.physicsWorld = new PXWorld(new PXVector2D(0, 0), true);
		this.physicsWorld.SetContinuousPhysics(true);
		this.physicsWorld.SetWarmStarting(true);
		this.physicsController = new MoPhysicsController(this);
	},

	teardownPhysicsWorld : function() {
		this.physicsController.destroyEntities();

		if(this.groundEntity != null)
		{
			this.groundEntity.body = null;
			this.groundEntity.controller = null;
		}
		
		this.groundEntity = null;
		this.physicsWorld = null;
		this.physicsController = null;
		this.invalidate();
	},
	
	enablePhysics : function(enable, defaultUnit, gravity, enableDebugDraw, enableDebugInteraction) {
		this.setIsPhysicsEnabled(enable);

		if(enable)
		{
			this.physicsController.setIsDebugDrawingEnabled(enableDebugDraw);	
			this.physicsController.setIsInteractionEnabled(enableDebugInteraction);	
			this.physicsController.setGravity(new PXVector2D(gravity.x, gravity.y));
			this.physicsController.setDefaultUnit(defaultUnit);
			this.physicsController.updateSettings();
		}
	},
	
	move : function(x, y) {
		/** no-op **/
	},
	
	commitProperties : function($super) {
		$super();
		
		this.resizeWidth = isNaN(this.getExactWidth());
		this.resizeHeight = isNaN(this.getExactHeight());
		
		if(this.resizeWidth || this.resizeHeight)
		{
			this.handleResizeEvent(new MoEvent(MoEvent.RESIZED));
			
			if(!this.resizeHandlerRegistered)
			{
				MoApplication.getInstance().addEventHandler(MoEvent.RESIZED, this.handleResizeEvent.asDelegate(this));
				this.resizeHandlerRegistered = true;
			}
		}
		else
		{
			if(this.resizeHandlerRegistered)
			{
				MoApplication.getInstance().removeEventHandler(MoEvent.RESIZED, this.handleResizeEvent.asDelegate(this));
				this.resizeHandlerRegistered = false;
			}
		}
		
		if(this.percentBoundsChanged)
		{
			this.updateBounds();
			this.percentBoundsChanged = false;
		}
	},
	
	handleResizeEvent : function(event) {
		
		if(!this.percentBoundsChanged)
		{
			this.updateBounds();
			
			if(this.resizeLive)
				MoLayoutManager.getInstance().validateNow();
		}
		
		this.invalidatePositionOnScreen();
	},
	
	updateBounds : function() {
		
		var w = 0;
		var h = 0;
		
		this.updatingBounds = true;
		
		if(this.resizeWidth)
		{
			if(isNaN(this.getPercentWidth()))
			{
				w = this.nativeCanvas.width;
			}
			else
			{
				this.setPercentWidth(Math.max(Math.min(this.getPercentWidth(), 100), 0));
				
				w = this.getPercentWidth() * (this.nativeCanvas.width / 100);
			}
		}
		else
		{
			w = this.getWidth();
		}
		
		if(this.resizeHeight)
		{
			if(isNaN(this.getPercentHeight()))
			{
				h = this.nativeCanvas.height;
			}
			else
			{
				this.setPercentHeight(Math.max(Math.min(this.getPercentHeight(), 100), 0));
				
				h = this.getPercentHeight() * (this.nativeCanvas.height / 100);
			}
		}
		else
		{
			h = this.getHeight();
		}

		this.updatingBounds = false;
		
		if(w != this.getWidth() || h != this.getHeight())
		{
			this.invalidateProperties();
			this.requestMeasure();
		}
		
		this.setActualSize(w, h);
		this.requestLayout();
		
		if(!MoIsNull(this.physicsController))
			this.physicsController.updateSettings();

		//MoDirtyRegionTracker.current().add(0, 0, w, h);
	},
	
	getAbsoluteSourcePosition : function() {
		return this.absoluteSourcePosition;
	},
	
	invalidatePositionOnScreen : function() {
		var source = this.getNativeCanvas();
		var pos = MoVector2D.Zero();
		
		if(!window.isNativeHost)
		{
			while(source != null)
			{
				pos.x += source.offsetLeft;
				pos.y += source.offsetTop;
				
				source = source.offsetParent;
			}
		}
		
		this.absoluteSourcePosition = pos;
	},
	
	performRender : function() {
		this.performRenderImpl();
	},

	performRenderImpl : function() {
		var app = MoApplication.getInstance();
		var fpsX = 10;
		var fpsY = this.getHeight() - this.fps.height - 10;
		var dirtyRectTracker = MoDirtyRegionTracker.current();
		
		// TODO : need to fix this so it's a bit smarter, computing the dirty
		//        regions directly before rendering sucks but it's a quick fix
		//        for now...
		//this.updateDirtyRegions();
		
		if(app.getEnableStatsGraph())
			this.fpsDirtyRegion.grow(fpsX, fpsY, fpsX + this.fps.width, fpsY + this.fps.height);
			
		var gfx = this.nativeCanvas.getContext("2d");	
		var dirtyRegions = dirtyRectTracker.getRects();
		//var len = dirtyRegions.length;
		var dirtyRect = null;
		var showDirtyRegions = MoApplication.getInstance().getEnableDebugVisuals();
		
		//console.log("DIRTY REGION COUNT: " + dirtyRegions.length);
		
		//dirtyRectTracker.clear();
		//console.log("-----------------------");
		
		gfx.save();
		
		if(showDirtyRegions || (this.getIsPhysicsEnabled() && this.physicsController.getIsDebugDrawingEnabled()))
		{
			gfx.clearRect(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
		}
		else
		{		
			for(var i = 0, len = dirtyRegions.length; i < len; ++i)
			{
				dirtyRect = dirtyRegions[i];
				dirtyRect.clamp(0, 0, this.getWidth(), this.getHeight());

				gfx.clearRect(dirtyRect.x, dirtyRect.y, dirtyRect.width, dirtyRect.height);
			}
		}
		
		dirtyRectTracker.clear();
		
		//MoPerfMark("RENDER");
		
		// now recursively render all of our content
		this.renderRecursive(gfx);

		//MoPerfUnmark();
		
		if(this.isPhysicsEnabled)
			this.physicsController.renderDebugData(gfx);
		
		gfx.restore();

		// render the fps stats, only if enabled
		if(app.getEnableStatsGraph())
			this.fps.render(gfx, fpsX, fpsY);

		// draw the dirty regions into the debug visualizer
		if(showDirtyRegions)
			this.drawDirtyRegions(gfx, dirtyRegions);
	},

	drawDirtyRegions : function(gfx, regions) {
		if(regions == null || regions.length == 0)
			return;
			
		var r = null;
		
		gfx.save();
		gfx.beginPath();
			
		for(var i = 0; i < regions.length; ++i)
		{
			r = regions[i];

			gfx.rect(r.x, r.y, r.width, r.height);
		}

		gfx.fillStyle = "rgba(255, 0, 255, 0.25)";
		gfx.strokeStyle = "rgba(255, 0, 255, 0.85)";
		gfx.fill();
		gfx.stroke();
		gfx.restore();		
	},
	
	checkTimes : function(newTime) {
		var avg = 0;
		var len = this.times.length;
		
		if(len > 0)
		{
			for(var i = 0; i < len; ++i)
				avg += this.times[i];
				
			avg = avg / len;
		}
		
		if(this.times.length >= 10)
			this.times.shift();
		
		this.times.push(newTime);
	
		if(this.lastAvg != avg)
			this.lastAvg = avg;
	}
});

Object.extend(MoDisplaySurface, {

	fromCanvas : function(canvas) {
		if(canvas == null)
			return;

		return new MoDisplaySurface(canvas.id, canvas);
	}
});


//=====================================================================
//= MoApplication.js
//=====================================================================

MoApplication = Class.create(MoEventDispatcher, {	
	initialize : function($super) {
		$super();

		MoApplication.Instance = this;
		
		this.startTime = (window.getHighResTimer ? window.getHighResTimer() : new Date());
		this.isPaused = true;
		this.isAutoPaused = false;
		this.isFullSizeDisplaySurface = false;
		this.initialSurfaceWidth = null;
		this.initialSurfaceHeight = null;
		this.hasManagedDisplaySurface = false;
		this.hasPendingRender = false;
		this.hasLoaded = false;
		this.enableDirtyRegions = true;
		this.enableDebugVisuals = false;
		this.enableNativeGestures = true;
		this.enableDeviceOrientationEvents = false;
		this.enableDeviceMotionEvents = false;
		this.enableGamepadEvents = false;
		this.enableStatsGraph = false;
		this.enableAutoSuspendResume = true;
		this.fpsClock = new MoFPSClock();
		this.frameRate = 60;
		this.frameTimer = new MoTimer(1000 / this.frameRate);
		this.frameTimer.addEventHandler(MoTimerEvent.TICK, this.handleFrameTimerTick.asDelegate(this));
		this.mainSurfaceCanvas = null;
		this.newSurfaceCanvas = null;
		this.surfaces = [];
		this.cameras = [];
		
		MoLayoutManager.getInstance().addEventHandler(MoEvent.LAYOUT_UPDATED, this.handleLayoutManagerUpdated.asDelegate(this));
		
		window.addEventListener("blur", this.handleBlur.asDelegate(this));
		window.addEventListener("focus", this.handleFocus.asDelegate(this));
		window.addEventListener("orientationchange", this.handleSystemOrientationChangeEvent.asDelegate(this));
		window.addEventListener("load", this.handleLoad.asDelegate(this));
		window.addEventListener("unload", this.handleUnload.asDelegate(this));
		
		if(document && document.readyState == "complete")
			this.handleLoad(null);
	},
	
	getRunningTime : function() {
		if(window.getHighResTimer)
			return (window.getHighResTimer() - this.startTime);
		
		return ((new Date()) - this.startTime);
	},
	
	getFrameRate : function() {
		return this.frameRate;
	},
	
	setFrameRate : function(value) {
		if(this.frameRate != value)
		{
			this.frameRate = value;
			this.frameTimer.setInterval(1000 / this.frameRate);
		}
	},
	
	getEnableDirtyRegions : function() {
		return this.enableDirtyRegions;
	},
	
	setEnableDirtyRegions : function(value) {
		this.enableDirtyRegions = value;
	},
	
	getEnableDebugVisuals : function() {
		return this.enableDebugVisuals;
	},
	
	setEnableDebugVisuals : function(value) {
		this.enableDebugVisuals = value;
	},
	
	getEnableAutoSuspendResume : function() {
		return this.enableAutoSuspendResume;
	},
	
	setEnableAutoSuspendResume : function(value) {
		this.enableAutoSuspendResume = value;
	},
	
	getEnableStatsGraph : function() {
		return this.enableStatsGraph;
	},
	
	setEnableStatsGraph : function(value) {
		this.enableStatsGraph = value;
		
		for(var i = 0, len = this.getDisplaySurfaceCount(); i < len; ++i)
			this.getDisplaySurfaceAt(i).invalidate();
	},
	
	getEnableGamepadEvents : function() {
		return this.enableGamepadEvents;
	},
	
	setEnableGamepadEvents : function(value) {
		this.enableGamepadEvents = value;

		MoGamepad.setEnableEvents(this.enableGamepadEvents);
	},
	
	getEnableDeviceOrientationEvents : function() {
		return this.enableDeviceOrientationEvents;
	},
	
	setEnableDeviceOrientationEvents : function(value) {
		if(this.enableDeviceOrientationEvents == value)
			return;
		
		this.enableDeviceOrientationEvents = value;
		
		if(this.enableDeviceOrientationEvents)
			window.addEventListener("deviceorientation", this.handleSystemDeviceOrientationEvent.asDelegate(this));
		else
			window.removeEventListener("deviceorientation", this.handleSystemDeviceOrientationEvent.asDelegate(this));
	},
	
	getEnableDeviceMotionEvents : function() {
		return this.enableDeviceMotionEvents;
	},
	
	setEnableDeviceMotionEvents : function(value) {
		if(this.enableDeviceMotionEvents == value)
			return;
		
		this.enableDeviceMotionEvents = value;
		
		if(this.enableDeviceMotionEvents)
			window.addEventListener("devicemotion", this.handleSystemDeviceMotionEvent.asDelegate(this));
		else
			window.removeEventListener("devicemotion", this.handleSystemDeviceMotionEvent.asDelegate(this));
	},
	
	// if true then the native gestures are enabled, like
	// zooming, scrolling, etc... in the web view, the
	// default is true.
	getEnableNativeGestures : function() {
		return this.enableNativeGestures;
	},
	
	setEnableNativeGestures : function(value) {
		this.enableNativeGestures = value;
	},
	
	getOrientation : function() {
		switch(window.orientation)
		{
			case -90:
				return MoScreenOrientation.LandscapeRight;
			case 90:
				return MoScreenOrientation.LandscapeLeft;
			case 180:
				return MoScreenOrientation.PortraitUpsideDown;
		}
		
		return MoScreenOrientation.Portrait;
	},

	getBackgroundColor : function() {
		return MoColor.fromCSSColor(document.body.style.backgroundColor);
	},

	setBackgroundColor : function(color) {
		document.body.style.backgroundColor = color.toRGBAString();
	},
	
	getIsPaused : function() {
		return this.isPaused;
	},

	getSize : function() {
		return new MoSize(window.innerWidth, window.innerHeight);
	},

	getCameraCount : function() {
		return this.cameras.length;
	},
	
	getCameraAt : function(index) {
		if(index < this.cameras.length)
			return this.cameras[index];
		
		return null;
	},
	
	addCamera : function(camera) {
		if(camera != null && !this.cameras.contains(camera))
			this.cameras.push(camera);
	},
	
	removeCamera : function(camera) {
		this.cameras.remove(camera);
	},
	
	clearCameras : function() {
		this.cameras = [];
	},
	
	getDisplaySurfaceCount : function() {
		return this.surfaces.length;
	},

	getDisplaySurfaceAt : function(index) {
		if(index < this.surfaces.length)
			return this.surfaces[index];
		
		return null;
	},
	
	addDisplaySurface : function(surface) {
		if(surface != null && !this.surfaces.contains(surface))
			this.surfaces.push(surface);
	},
	
	removeDisplaySurface : function(surface) {
		this.surfaces.remove(surface);
	},
	
	clearDisplaySurfaces : function() {
		this.surfaces = [];
	},
	
	createManagedDisplaySurface : function() {
		if(!this.hasLoaded)
			throw new Error("Unable to create a managed display surface until the window has fully loaded.");

		// determine the initial size, if the initialSurface sizes are null then we must
		// need a full size display surface
		var width = this.initialSurfaceWidth || window.innerWidth;
		var height = this.initialSurfaceHeight || window.innerHeight;
		
		// create the html canvas element and add it to the document body
		this.mainSurfaceCanvas = document.createElement("canvas");
		this.mainSurfaceCanvas.id = "managed-display-surface";
		this.mainSurfaceCanvas.width = width;
		this.mainSurfaceCanvas.height = height;

		document.body.appendChild(this.mainSurfaceCanvas);
		
		// add the display surface
		this.addDisplaySurface(MoDisplaySurface.fromCanvas(this.mainSurfaceCanvas));
		
		// finally make sure the body doesn't show any scrollbars and setup
		// a resize handler, this will recreate our surfaces so things render
		// nicely
		if(this.isFullSizeDisplaySurface)
		{
			//document.body.style.overflow = "hidden";
			window.addEventListener("resize", this.handleResize.asDelegate(this));
		}
	},
	
	invalidate : function() {
		if(this.hasPendingRender)
			return;
		
		this.hasPendingRender = true;
		this.dispatchEvent(new MoEvent(MoEvent.RENDER));
	},
	
	invalidateSurfacePositions : function() {
		var len = this.getDisplaySurfaceCount();
		
		for(var i = 0; i < len; ++i)
			this.getDisplaySurfaceAt(i).invalidatePositionOnScreen();
	},
	
	handleResize : function() {
		if(!this.hasLoaded || !this.isFullSizeDisplaySurface)
			return;
		
		// we have to recreate a new native canvas surface, otherwise
		// things would just stretch out and get out of wack if we
		// just resized it
		var surface = this.getDisplaySurfaceAt(0);
		var width = window.innerWidth;
		var height = window.innerHeight;
		
		this.newSurfaceCanvas = document.createElement("canvas");
		this.newSurfaceCanvas.id = this.mainSurfaceCanvas.id;
		this.newSurfaceCanvas.width = width;
		this.newSurfaceCanvas.height = height;

		surface.setNativeCanvas(this.newSurfaceCanvas);
	},

	handleLoad : function() {
		this.hasLoaded = true;
		
		// this application is managing it's own display surface
		if(this.hasManagedDisplaySurface)
			this.createManagedDisplaySurface();

		this.resume();
		this.dispatchEvent(new MoEvent(MoEvent.APPLICATION_START));
	},
	
	handleUnload : function() {
		this.hasLoaded = false;
		this.dispatchEvent(new MoEvent(MoEvent.APPLICATION_EXIT));
	},

	handleBlur : function(event) {
		if(this.getEnableAutoSuspendResume())
		{
			this.isAutoPaused = true;
			this.pause();
		}
	},
	
	handleFocus : function(event) {
		// don't resume if the user has paused the application
		if(this.isPaused && !this.isAutoPaused)
			return;
		
		if(this.getEnableAutoSuspendResume())
		{
			this.isAutoPaused = false;
			this.resume();
		}
	},

	handleSystemOrientationChangeEvent : function(event) {
		this.dispatchEvent(new MoEvent(MoEvent.UI_ORIENTATION_CHANGE));
	},
	
	handleSystemDeviceMotionEvent : function(event) {
		this.dispatchEvent(new MoDeviceMotionEvent(MoDeviceMotionEvent.CHANGE, event.acceleration, event.interval));
	},
	
	handleSystemDeviceOrientationEvent : function(event) {
		this.dispatchEvent(new MoDeviceOrientationEvent(MoDeviceOrientationEvent.CHANGE, event.alpha, event.beta, event.gamma));
	},

	handleFrameTimerTick : function(event) {
	
		this.fpsClock.update();

        console.log(this.fpsClock.getAverageFPS());

		if(this.getIsPaused())
			return;
		
		var needsRender = this.hasPendingRender;
		var len = 0;
		var surface = null;
		var delta = event.getTickDelta();

		// clear pending flag
		this.hasPendingRender = false;
		
		// dispatch the enter event
		this.dispatchEvent(new MoFrameEvent(MoFrameEvent.ENTER, delta));
		
		// update cameras
		len = this.cameras.length;
		
		for(var i = 0; i < len; ++i)
			this.cameras[i].update(delta);
		
		// render each surface and update any active AI
		len = this.surfaces.length;
		
		for(var i = 0; i < len; ++i)
		{
			surface = this.surfaces[i];
			
			if(surface != null && surface.getIsRunning())
			{
				// update physics
				surface.updatePhysics(delta);
			
				// update AI
				surface.updateAI(delta);
				
				// update all other
				surface.updateOther(delta);

				// do the full surface render
				//    - if the stats graph is enabled then we also need to perform a full render
				//      this will handle clearing the background and redrawing so the fps graph
				//      can be overlayed on top
				if(needsRender || this.getEnableStatsGraph())
					surface.performRender();
			}
		}
		
		// notify listeners that rendering has completed
		if(needsRender)
		{
			// once we have rendered a new frame, then we can swap out
			// our native canvas surfaces, this way things look much more
			// seamless instead of flickering
			if(this.hasManagedDisplaySurface && this.isFullSizeDisplaySurface)
			{
				if(this.newSurfaceCanvas != null)
				{
					var surface = this.getDisplaySurfaceAt(0);
					
					document.body.removeChild(this.mainSurfaceCanvas);
					document.body.appendChild(this.newSurfaceCanvas);
					
					this.mainSurfaceCanvas = this.newSurfaceCanvas;
					this.newSurfaceCanvas = null;
				}
			}
		
			this.dispatchEvent(new MoEvent(MoEvent.RENDER_COMPLETE));
		}
	},

	handleLayoutManagerUpdated : function(event) {
		this.hasPendingRender = true;
	},

	pause : function() {
		this.isPaused = true;
		this.frameTimer.stop();
		this.fpsClock.suspend();
	},

	resume : function() {
		this.isPaused = false;
		this.frameTimer.start();
		this.fpsClock.resume();
	}
});

Object.extend(MoApplication, {
	Instance : null,
	
	getInstance : function() {
		return MoApplication.Instance;
	},
	
	create : function() {
		var type = MoApplication;

		// user passed in a subclass
		if(arguments.length == 1 || arguments.length == 3)
			type = arguments[0];

		var app = new type();

		if(!(app instanceof MoApplication))
			throw new Error("Application is not an instance of MoApplication, you must create a subclass of MoApplication to actually create an application.");

		app.hasManagedDisplaySurface = true;
		
		if(arguments.length <= 1)
		{
			app.isFullSizeDisplaySurface = true;
			app.initialSurfaceWidth = null;
			app.initialSurfaceHeight = null;
		}
		else if(arguments.length <= 3)
		{
			app.isFullSizeDisplaySurface = false;
			app.initialSurfaceWidth = arguments[arguments.length-2];
			app.initialSurfaceHeight = arguments[arguments.length-1];
		}

		return app;
	}
});


//=====================================================================
//= MoJoystick.js
//=====================================================================

/****************************************************************************
** TODO:
**   - add bounding box limit so the joystick base can only move within a
**     specified bounding rect
**
**   - add snap back tweening to the stick so it smoothly snaps back to 
**     the center
**
****************************************************************************/

MoJoystick = Class.create(MoDrawable, {
	initialize : function($super, name, outerRadius, innerRadius, isPinned) {
		$super(name);

		this.outerRadius = MoValueOrDefault(outerRadius, 50);
		this.innerRadius = MoValueOrDefault(innerRadius, 30);
		this.range = 0;
		this.baseX = 0;
		this.baseY = 0;
		this.stickX = 0;
		this.stickY = 0;
		this.lastParent = null;
		this.value = new MoVector2D(0, 0);
		this.angleValue = 0;
		this.isPinned = MoValueOrDefault(isPinned, false);
		this.isDown = false;
		
		this.updateRange();
		this.addEventHandler(MoEvent.PARENT_CHANGED, this.handleParentChange.asDelegate(this));
	},
	
	getOuterRadius : function() {
		return this.outerRadius;
	},
	
	setOuterRadius : function(value) {
		this.outerRadius = value;
		this.updateRange();
	},
	
	getInnerRadius : function() {
		return this.innerRadius;
	},
	
	setInnerRadius : function(value) {
		this.innerRadius = value;
		this.updateRange();
	},
	
	getIsPinned : function() {
		return this.isPinned;
	},
	
	setIsPinned : function(value) {
		this.isPinned = value;
	},

	getRange : function() {
		return this.range;
	},

	getDeltaX : function() {
		return this.stickX - this.baseX;
	},
	
	getDeltaY : function() {
		return this.stickY - this.baseY;
	},
	
	getAngleValue : function() {
		return this.angleValue;
	},
	
	getValue : function() {
		return this.value;
	},
	
	isZero : function() {
		return (this.value.x == 0 && this.value.y == 0);
	},
	
	isPointingUp : function() {
		return (this.value.y < 0);
	},
	
	isPointingDown : function() {
		return (this.value.y > 0);
	},
	
	isPointingLeft : function() {			
		return (this.value.x < 0);
	},
	
	isPointingRight : function() {
		return (this.value.x > 0);
	},

	layout : function($super, unscaledWidth, unscaledHeight) {	
		$super(unscaledWidth, unscaledHeight);

		var cx = unscaledWidth * 0.5;
		var cy = unscaledHeight * 0.5;

		this.graphics.clear();				
		this.render(this.graphics, cx, cy, this.getDeltaX() + cx, this.getDeltaY() + cy);
	},

	/** implementors should override this to provide a custom ui **/
	/*
		cx1,cy1: center of base
		cx2,cy2: center of stick
	*/
	render : function(gfx, cx1, cy1, cx2, cy2) {
		// base
		gfx.drawEllipse(cx1, cy1, this.outerRadius*2, this.outerRadius*2);
		gfx.stroke(new MoPen(MoSolidColorBrush.blue(), 1));

		// stick
		gfx.drawEllipse(cx2, cy2, this.innerRadius*2, this.innerRadius*2);
		gfx.stroke(new MoPen(MoSolidColorBrush.blue(), 1));	
	},

	updateRange : function() {
		this.range = (this.outerRadius - this.innerRadius);
		this.setWidth(this.outerRadius*2);
		this.setHeight(this.outerRadius*2);
	},

	updateValue : function() {
		var dx = this.getDeltaX();
		var dy = this.getDeltaY();
		var vx = dx / this.range;
		var vy = dy / this.range;

		if(vx != this.value.x || vy != this.value.y)
		{
			this.value.x = vx;
			this.value.y = vy;
			this.angleValue = MoMath.radiansToDegrees(Math.atan2(dy, dx));
			
			this.dispatchEvent(new MoEvent(MoEvent.CHANGE));
		}
	},
	
	handleParentChange : function(e) {
		if(!MoIsNull(this.lastParent))
		{
			this.lastParent.removeEventHandler(MoMouseEvent.MOUSE_DOWN, this.handleMouseDown.asDelegate(this));
			this.lastParent.removeEventHandler(MoMouseEvent.MOUSE_UP, this.handleMouseUp.asDelegate(this));
			this.lastParent.removeEventHandler(MoMouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUp.asDelegate(this));
			this.lastParent.removeEventHandler(MoMouseEvent.MOUSE_MOVE, this.handleMouseMove.asDelegate(this));		
		}

		this.lastParent = this.getParent();

		if(!MoIsNull(this.lastParent))
		{
			this.lastParent.addEventHandler(MoMouseEvent.MOUSE_DOWN, this.handleMouseDown.asDelegate(this));
			this.lastParent.addEventHandler(MoMouseEvent.MOUSE_UP, this.handleMouseUp.asDelegate(this));
			this.lastParent.addEventHandler(MoMouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUp.asDelegate(this));
			this.lastParent.addEventHandler(MoMouseEvent.MOUSE_MOVE, this.handleMouseMove.asDelegate(this));
		}
	},
	
	handleMouseDown : function(e) {	
		this.isDown = true;
		this.baseX = this.stickX = e.x;
		this.baseY = this.stickY = e.y;
		
		if(!this.isPinned)
		{
			this.setX(e.getLocalX() - (this.getExactOrMeasuredWidth() * 0.5));
			this.setY(e.getLocalY() - (this.getExactOrMeasuredHeight() * 0.5));
		}
		
		this.updateValue();
		this.requestLayout();
	},

	handleMouseUp : function(e) {
		this.isDown = false;
		this.baseX = this.stickX = (this.getExactOrMeasuredWidth() * 0.5);
		this.baseY = this.stickY = (this.getExactOrMeasuredHeight() * 0.5);

		this.updateValue();
		this.requestLayout();
	},

	handleMouseMove : function(e) {
		if(!this.isDown)
			return;

		var dx = e.x - this.baseX;
		var dy = e.y - this.baseY;
		var r = Math.sqrt(dx * dx + dy * dy);

		if(r > this.range)
		{
			this.stickX = this.baseX + dx / r * this.range;
			this.stickY = this.baseY + dy / r * this.range;
		}
		else
		{
			this.stickX = e.x;
			this.stickY = e.y;
		}

		this.updateValue();
		this.requestLayout();
	}
});


//=====================================================================
//= MoIK.js
//=====================================================================

MoIK = Class.create({
	initialize : function(name, x, y) {
		this.name = name;
		this.x = x;
		this.y = y;
		this.lastBone = null;
		this.bones = [];
		this.draw = null;
	},
	
	getName : function() {
		return this.name;
	},
	
	getRoot : function() {
		if(this.bones.length == 0)
			return null;
		
		return this.bones[0];
	},

	add : function(bone) {
		if(MoIsNull(bone))
			return;

		if(this.lastBone != null)
		{
			bone.prevBone = this.lastBone;
			this.lastBone.nextBone = bone;
		}

		this.bones.push(bone);
		this.lastBone = bone;
	},
	
	remove : function(bone) {
		return this.removeAt(this.bones.indexOf(bone));
	},
	
	removeAt : function(idx) {
		if(idx >= 0 && idx <= this.bones.length)
		{
			var list = this.bones.splice(idx);
			var last = null;
			
			for(var i = 0; i < this.bones.length; ++i)
			{
				if(last != null)
					last.nextBone = this.bones[i];

				this.bones[i].prevBone = last;
				last = this.bones[i];
			}
			
			return list;
		}
		
		return null;
	},
	
	clear : function() {
		this.bones.length = 0;
	},
	
	get : function(name) {
		var len = this.getCount();
		
		for(var i = 0; i < len; ++i)
		{
			if(this.bones[i].getName() == name)
				return this.bones[i];
		}
		
		return null;
	},
	
	getCount : function() {
		return this.bones.length;
	},
	
	getAt : function(idx) {
		return this.bones[idx];
	},
	
	rotate : function(angle) {
		var root = this.getRoot();
		
		if(!MoIsNull(root))
			root.setAngle(angle);
	},
	
	update : function() {
		var len = this.bones.length;
		var drawable = null;
		var angle = 0;
		var px = this.x;
		var py = this.y;

		for(var i = 0; i < len; ++i)
		{
			drawable = this.bones[i].drawable;
			angle += MoMath.degreesToRadians(this.bones[i].getAngle());
			
			if(drawable != null)
			{
				var xform = drawable.getRenderTransform();
				var offset = (MoIsNull(this.bones[i].drawablePosition) ? drawable.getCenter() : this.bones[i].drawablePosition);

				if(xform == null)
				{
					xform = new MoRotateTransform();
					drawable.setRenderTransform(xform);
				}
				
				drawable.setX(px - offset.x);
				drawable.setY(py - offset.y);

				xform.setAngle(MoMath.radiansToDegrees(angle));
				xform.setCenterX(offset.x);
				xform.setCenterY(offset.y);
			}

			px += Math.cos(angle) * this.bones[i].getLength();
			py += Math.sin(angle) * this.bones[i].getLength();
		}

		if(this.draw)
		{
			this.draw.requestLayout();
			this.draw.requestMeasure();
		}
	},

	moveTo : function(targetX, targetY) {
		var len = this.bones.length;
		var bones = [];
		var worldBones = [];
		var prevBone = null;
		var currBone = null;
		
		for(var i = 0; i <= len; ++i)
		{
			bones.push(new MoIKBoneImpl(
				(i > 0 ? this.bones[i-1].getLength() : 0), 0,
				(i < len ? MoMath.degreesToRadians(this.bones[i].getAngle()) : 0)
			));
		}

		len = bones.length;

		worldBones.push(new MoIKBoneImpl(bones[0].x, bones[0].y, bones[0].angle));
		
		for(var i = 1; i < len; ++i)
		{
			prevBone = worldBones[i-1];
			currBone = bones[i];
		
			worldBones.push(new MoIKBoneImpl(
				prevBone.x + Math.cos(prevBone.angle) * currBone.x - Math.sin(prevBone.angle) * currBone.y,
				prevBone.y + Math.sin(prevBone.angle) * currBone.x + Math.cos(prevBone.angle) * currBone.y,
				prevBone.angle + currBone.angle
			));
		}

		var endX = worldBones[len-1].x;
		var endY = worldBones[len-1].y;
		var modified = false;
		var success = false;
		var epsilon = 0.0001;
		var arcLength = 0.00001;
		
		for(var i = len-1; i >= 0; --i)
		{
			var curToEndX = endX - worldBones[i].x;
			var curToEndY = endY - worldBones[i].y;
			var curToEndMag = Math.sqrt(curToEndX*curToEndX + curToEndY*curToEndY);
			
			var curToTargetX = targetX - worldBones[i].x;
			var curToTargetY = targetY - worldBones[i].y;
			var curToTargetMag = Math.sqrt(curToTargetX*curToTargetX + curToTargetY*curToTargetY);
			
			var rotAngleC = 0;
			var rotAngleS = 0;
			var endTargetMag = (curToEndMag * curToTargetMag);
			
			if(endTargetMag <= epsilon)
			{
				rotAngleC = 1;
				rotAngleS = 0;
			}
			else
			{
				rotAngleC = (curToEndX*curToTargetX + curToEndY*curToTargetY) / endTargetMag;
				rotAngleS = (curToEndX*curToTargetY - curToEndY*curToTargetX) / endTargetMag;
			}
			
			var rotAngle = Math.acos(Math.max(-1, Math.min(1, rotAngleC)));
			
			if(rotAngleS < 0.0)
				rotAngle = -rotAngle;
				
			endX = worldBones[i].x + rotAngleC*curToEndX - rotAngleS*curToEndY;
			endY = worldBones[i].y + rotAngleS*curToEndX + rotAngleC*curToEndY;

			bones[i].angle = this.simplifyAngle(bones[i].angle + rotAngle);
			
			var endToTargetX = (targetX - endX);
			var endToTargetY = (targetY - endY);
			
			if(endToTargetX*endToTargetX + endToTargetY*endToTargetY <= 2)
			{
				success = true;
				break;
			}
			
			if(!modified && Math.abs(rotAngle)*curToEndMag > arcLength)
				modified = true;
		}

		for(var i = 0; i < this.bones.length; ++i)
			this.bones[i].setAngle(MoMath.radiansToDegrees(bones[i].angle));
	},

	simplifyAngle : function(angle) {
		angle = angle % (2.0 * Math.PI);

		if(angle < -Math.PI)
			angle += (2.0 * Math.PI);
		else if(angle > Math.PI)
			angle -= (2.0 * Math.PI);

		return angle;
	}
});	

MoIKBone = Class.create(MoEventDispatcher, MoAnimatable, {
	initialize : function($super, name, length, angle, drawable) {
		$super();
		
		this.initializeAnimatableProperties();
		
		this.name = name;
		this.setLength(length);
		this.setAngle(angle);

		this.prevBone = null;
		this.nextBone = null;
		this.drawable = MoValueOrDefault(drawable, null);
		this.drawablePosition = null;
	},
	
	initializeAnimatablePropertiesCore : function() {		
		this.enableAnimatableProperty("length", this.getLength, this.setLength, MoPropertyOptions.None);
		this.enableAnimatableProperty("angle", this.getAngle, this.setAngle, MoPropertyOptions.None);
	},
	
	getName : function() {
		return this.name;
	},
	
	setName : function(value) {
		this.name = value;
	},
	
	getDrawable : function() {
		return this.drawable;
	},

	getDrawablePosition : function() {
		return this.drawablePosition;
	},

	setDrawablePosition : function(value) {
		if(value == null)
			this.drawablePosition = null;
		else
		{
			if(this.drawablePosition == null)
				this.drawablePosition = new MoVector2D();
			
			this.drawablePosition.x = value.x;
			this.drawablePosition.y = value.y;
		}
	},

	setDrawable : function(value) {
		this.drawable = value;
	},

	getAngle : function() {
		return this.getPropertyValue("angle");
	},
	
	setAngle : function(value) {			
		this.setPropertyValue("angle", value);
	},

	getLength : function() {
		return this.getPropertyValue("length");
	},
	
	setLength : function(value) {
		this.setPropertyValue("length", value);
	},
	
	getPrevBone : function() {
		return this.prevBone;
	},

	getNextBone : function() {
		return this.nextBone;
	}
});

MoIKBoneImpl = Class.create({
	initialize : function(x, y, angle) {
		this.x = x;
		this.y = y;
		this.angle = angle;
	}
});

MoIKContainer = Class.create(MoCanvas, {
	initialize : function($super, name, surface) {
		$super(name);
		
		surface = MoValueOrDefault(surface, MoApplication.getInstance().getDisplaySurfaceAt(0));
			
		this.ik = surface.createArmature(name, 0, 0);
	},
	
	getIK : function() {
		return this.ik;
	},
	
	attach : function(bone) {
		this.ik.add(bone);
	},
	
	getBone : function(name) {
		return this.ik.get(name);
	},
	
	getBoneAt : function(idx) {
		return this.ik.getAt(idx);
	},
	
	getBoneCount : function() {
		return this.ik.getCount();
	},

	addBone : function(length, angle, drawable, anchorPoint) {
		anchorPoint = MoValueOrDefault(anchorPoint, new MoVector2D(0, drawable.getHeight() * 0.5));

		var bone = new MoIKBone(drawable.getName(), length, angle, drawable);
		bone.setDrawablePosition(anchorPoint);

		this.ik.add(bone);
		this.add(drawable);
		
		return bone;
	}
});

MoIKDraw = Class.create(MoCanvas, {
	initialize : function($super, ik) {
		$super("ikdraw");
		
		this.ik = ik;
		this.ik.draw = this;
	},
	
 	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);

		var gfx = this.getGraphics();
		var bones = this.ik.bones;
		var len = bones.length;
		var angle = 0;
		var px = 0;
		var py = 0;
		var lx = 0;
		var ly = 0;

		gfx.beginPath();
		gfx.moveTo(0, 0);

		for(var i = 0; i < len; ++i)
		{
			angle += MoMath.degreesToRadians(bones[i].getAngle());
			
			px += Math.cos(angle) * bones[i].getLength();
			py += Math.sin(angle) * bones[i].getLength();
			
			gfx.lineTo(px, py);
		}
		
		gfx.stroke(new MoPen(MoSolidColorBrush.red(), 2));
	}
});


