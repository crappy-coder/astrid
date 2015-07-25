/****************************************************************************
** CONFIDENTIAL. DO NOT DISTRIBUTE.
** MoEnjin Client SDK (MochicaDebugWeb)
**
** Copyright (C) 2010-2012 Justin Thomas
** All rights reserved.
**
**
** Commercial Usage
** Licensees holding valid commercial licenses may use this file in accordance with the Commercial
** Software License Agreement provided with the Software or, alternatively, in accordance with the
** terms contained in a written agreement between you and Justin Thomas (Sweaky Media).
**
**
** Contact: Justin Thomas (justin@sweaky.com)
**
****************************************************************************/


/****************************************************************************
** mo-prototype.js
****************************************************************************/

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
				value.toString = method.toString.bind(method);
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

	functs(this.tmxData, layerInfo, tileset));
	}
});

/****************************************************************************
** MoParallaxCanvas.js
****************************************************************************/

MoParallaxCanvas = Class.create(MoCanvas, {
	initialize : function($super, name) {
		$super(name);
		
		this.speed = 0;
		this.limits = MoVector2D.NotSet();
		this.computedLimits = null;
		this.position = MoVector2D.Zero();

		this.addEventHandler(MoCollectionEvent.ITEM_ADDED, this.handleItemAddRemoveEvent.asDelegate(this));
		this.addEventHandler(MoCollectionEvent.ITEM_REMOVED, this.handleItemAddRemoveEvent.asDelegate(this));
		
		MoApplication.getInstance().addEventHandler(MoFrameEvent.ENTER, this.handleFrameTickEvent.asDelegate(this));
	},

	getSpeed : function() {
		return this.speed;
	},

	setSpeed : function(value) {
		this.speed = value;
	},

	getLimits : function() {
		return this.limits;
	},

	setLimits : function(value) {
		this.limits = value;
	},

	moveUp : function(by) {
		this.move(0, by);
	},

	moveDown : function(by) {
		this.move(0, -by);
	},
	
	moveLeft : function(by) {
		this.move(by, 0);
	},
	
	moveRight : function(by) {
		this.move(-by, 0);
	},
	
	move : function(byX, byY) {
		var x = byX * this.speed;
		var y = byY * this.speed;
		var computedLimits = this.computeLimits();
		var lx = computedLimits.x;
		var ly = computedLimits.y;

		this.position.x += x;
		this.position.y += y;

		if(Math.abs(this.position.x) > lx && !MoMath.isInfinity(lx))
			this.position.x -= x;
		
		if(Math.abs(this.position.y) > ly && !MoMath.isInfinity(ly))
			this.position.y -= y;		
	},

	computeLimits : function() {
		if(this.computedLimits != null)
			return this.computedLimits;

		var len = this.getCount();
		var child = null;
		var ignoreX = false;
		var ignoreY = false;
		var x = this.limits.x;
		var y = this.limits.y;
		
		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			var dx = 0;
			var dy = 0;
			
			if(!(child instanceof MoParallaxCanvasLayer))
				continue;
			
			if(!MoMath.isInfinity(child.limits.x))
				dx = child.limits.x;

			if(MoMath.isInfinity(child.limits.y))
				dy = child.limits.y;

			x = Math.max((MoMath.isInfinity(x) ? 0 : x), dx);
			y = Math.max((MoMath.isInfinity(y) ? 0 : y), dy);
		}

		if(ignoreX)
			x = MoPositiveInfinity;

		if(ignoreY)
			y = MoPositiveInfinity;

		this.computedLimits = new MoVector2D(x, y);

		return this.computedLimits;
	},

	invalidateLimits : function() {
		this.computedLimits = null;
	},

	handleItemAddRemoveEvent : function(event) {
		this.invalidateLimits();
	},
	
	handleFrameTickEvent : function(event) {
		var t = event.getDeltaTime();
		var childWidth = 0;
		var childHeight = 0;
		var width = this.getWidth();
		var height = this.getHeight();
		var tx = 0;
		var ty = 0;
		var lx = 0;
		var ly = 0;
		var len = this.getCount();
		var child = null;
		var hasLimitX = !MoMath.isInfinity(this.limits.x);
		var hasLimitY = !MoMath.isInfinity(this.limits.y);

		for(var i = 0; i < len; ++i)
		{
			child = this.getAt(i);

			if(!(child instanceof MoParallaxCanvasLayer))
				return;

			childWidth = child.getWidth();
			childHeight = child.getHeight();

			tx = this.position.x;
			ty = this.position.y;
			lx = child.limits.x;
			ly = child.limits.y;

			if(MoMath.isInfinity(lx) && hasLimitX)
				lx = this.limits.x;

			if(MoMath.isInfinity(ly) && hasLimitY)
				ly = this.limits.y;

			if(Math.abs(tx) > lx && !MoMath.isInfinity(lx))
				tx = (tx < 0 ? -lx : lx);

			if(Math.abs(ty) > ly && !MoMath.isInfinity(ly))
				ty = (ty < 0 ? -ly : ly);

			tx = (width * 0.5) + (tx * child.ratio) + child.offset.x;
			ty = (height * 0.5) + (ty * child.ratio) + child.offset.y;

			child.setX(tx - (width * 0.5));
			child.setY(ty - (height * 0.5));
		}
	}
});

/****************************************************************************
** MoParallaxCanvasLayer.js
****************************************************************************/

MoParallaxCanvasLayer = Class.create(MoCanvas, {
	initialize : function($super, name) {
		$super(name);

		this.ratio = 0;
		this.offset = MoVector2D.Zero();
		this.limits = MoVector2D.NotSet();
	},

	getRatio : function() {
		return this.ratio;
	},

	setRatio : function(value) {
		this.ratio = value;
	},

	getOffset : function() {
		return this.offset;
	},

	setOffset : function(value) {
		this.offset = value;
	},

	getLimits : function() {
		return this.limits;
	},

	setLimits : function(value) {
		this.limits = value;

		// invalidate the parent limits so it
		// can re-compute if needed
		var parent = this.getParent();

		// make sure it is a parallax instance
		if(!MoIsNull(parent) && (parent instanceof MoParallaxCanvas))
			parent.invalidateLimits();
	}
});

/****************************************************************************
** MoViewportCanvas.js
****************************************************************************/

MoViewportCanvas = Class.create(MoCanvas, {
	initialize : function($super, name) {
		$super(name);

		this.viewportContent = new MoCanvas(name + "_content");
		this.viewportContent.setPercentWidth(100);
		this.viewportContent.setPercentHeight(100);
		this.isPanning = false;
		this.originX = 0;
		this.originY = 0;
		this.autoPan = true;

		this.setIsHitTestChildrenEnabled(false);
		this.add(this.viewportContent);

		this.addEventHandler(MoMouseEvent.MOUSE_DOWN, this.handleMouseDownEvent.asDelegate(this));
		this.addEventHandler(MoMouseEvent.MOUSE_UP, this.handleMouseUpEvent.asDelegate(this));
		this.addEventHandler(MoMouseEvent.MOUSE_UP_OUTSIDE, this.handleMouseUpOutsideEvent.asDelegate(this));
		this.addEventHandler(MoMouseEvent.MOUSE_LEAVE, this.handleMouseLeaveEvent.asDelegate(this));
		this.addEventHandler(MoMouseEvent.MOUSE_MOVE, this.handleMouseMoveEvent.asDelegate(this));
	},
	
	addContent : function(content) {
		this.viewportContent.add(content);
	},
	
	addContentAt : function(content, idx) {
		this.viewportContent.addAt(content, idx);
	},
	
	removeContent : function(content) {
		return this.viewportContent.remove(content);
	},
	
	removeContentAt : function(idx) {
		return this.viewportContent.removeAt(idx);
	},
	
	removeContentByName : function(name) {
		return this.viewportContent.removeByName(name);
	},
	
	getContentAt : function(idx) {
		return this.viewportContent.getAt(idx);
	},
	
	getContentByName : function(name) {
		return this.viewportContent.getByName(name);
	},
	
	indexOfContent : function(content) {
		return this.viewportContent.indexOf(content);
	},
	
	clearContent : function() {
		this.viewportContent.clear();
	},
	
	isContentEmpty : function() {
		return this.viewportContent.isEmpty();
	},
	
	contentExists : function(content) {
		return this.viewportContent.exists(content);
	},
	
	getContentCount : function() {
		return this.viewportContent.getCount();
	},

	getAutoPan : function() {
		return this.autoPan;
	},

	setAutoPan : function(value) {
		this.autoPan = value;
	},

	getContent : function() {
		return this.viewportContent;
	},

	setContentOffset : function(x, y) {
		this.viewportContent.setX(x);
		this.viewportContent.setY(y);
	},

	getContentOffset : function() {
		return new MoVector2D(this.viewportContent.getX(), this.viewportContent.getY());
	},
	
	handleMouseDownEvent : function(event) {
		if(!this.getAutoPan())
			return;

		var offset = this.getContentOffset();

		this.isPanning = true;
		this.originX = event.x - offset.x;
		this.originY = event.y - offset.y;
	},

	handleMouseUpEvent : function(event) {
		this.isPanning = false;
	},
	
	handleMouseUpOutsideEvent : function(event) {
		this.isPanning = false;
	},
	
	handleMouseLeaveEvent : function(event) {
		this.isPanning = false;
	},

	handleMouseMoveEvent : function(event) {
		if(this.getAutoPan() && this.isPanning)
		{
			var x = event.x - this.originX;
			var y = event.y - this.originY;

			this.setContentOffset(x, y);
		}
	}
});

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

/****************************************************************************
** MoTMXLayer.js
****************************************************************************/

MoTMXLayer = Class.create({
	initialize : function() {
		this.name = "";
		this.opacity = 1;
		this.visible = true;
		this.tiles = new Array();
	},
	
	getName : function() {
		return this.name;
	},
	
	getOpacity : function() {
		return this.opacity;
	},
	
	getVisible : function() {
		return this.visible;
	},
	
	getTiles : function() {
		return this.tiles;
	}
});

/****************************************************************************
** MoTMXObject.js
****************************************************************************/

MoTMXObject = Class.create({
	initialize : function() {
		this.name = "";
		this.type = "";
		this.x = 0;
		this.y = 0;
		this.width = 0;
		this.height = 0;
		this.gid = 0;
		this.properties = null;
	},
	
	getName : function() {
		return this.name;
	},
	
	getType : function() {
		return this.type;
	},
	
	getX : function() {
		return this.x;
	},
	
	getY : function() {
		return this.y;
	},
	
	getWidth : function() {
		return this.width;
	},
	
	getHeight : function() {
		return this.height;
	},
	
	getGID: function() {
		return this.gid;
	},
	
	getProperties : function() {
		return this.properties;
	}
});

/****************************************************************************
** MoTMXObjectGroup.js
****************************************************************************/

MoTMXObjectGroup = Class.create({
	initialize : function() {
		this.name = "";
		this.objects = new Array();
	},
	
	getName : function() {
		return this.name;
	},
	
	getObjects : function() {
		return this.objects;
	}
});

/****************************************************************************
** MoTMXTileSet.js
****************************************************************************/

MoTMXTileSet = Class.create({
	initialize : function() {
		this.firstGid = 0;
		this.name = "";
		this.tileWidth = 0;
		this.tileHeight = 0;
		this.spacing = 0;
		this.margin = 0;
		this.imageSource = null;
	},
	
	getFirstGID : function() {
		return this.firstGid;
	},
	
	getName : function() {
		return this.name;
	},
	
	getTileWidth : function() {
		return this.tileWidth;
	},
	
	getTileHeight : function() {
		return this.tileHeight;
	},
	
	getSpacing : function() {
		return this.spacing;
	},
	
	getMargin : function() {
		return this.margin;
	},
	
	getImageSource : function() {
		return this.imageSource;
	}
});

/****************************************************************************
** MoTMXTileMap.js
****************************************************************************/

MoTMXTileMap = Class.create(MoEventDispatcher, {
	initialize : function($super) {
		$super();
		
		this.tileSets = new Array();
		this.objectGroups = new Array();
		this.layers = new Array();
		this.properties = null;
		this.filePath = "";
		this.basePath = "";
		this.orientation = "";
		this.version = "";
		this.width = 0;
		this.height = 0;
		this.tileWidth = 0;
		this.tileHeight = 0;
	},
	
	getTileSets : function() {
		return this.tileSets;
	},
	
	getObjectGroups : function() {
		return this.objectGroups;
	},
	
	getLayers : function() {
		return this.layers;
	},
	
	getProperties : function() {
		return this.properties;
	},
	
	getFilePath : function() {
		return this.filePath;
	},
	
	getOrientation : function() {
		return this.orientation;
	},
	
	getVersion : function() {
		return this.version;
	},
	
	getWidth : function() {
		return this.width;
	},
	
	getHeight : function() {
		return this.height;
	},
	
	getTileWidth : function() {
		return this.tileWidth;
	},
	
	getTileHeight : function() {
		return this.tileHeight;
	},
	
	getPixelWidth : function() {
		return this.getWidth() * this.getTileWidth();
	},
	
	getPixelHeight : function() {
		return this.getHeight() * this.getTileHeight();
	},
	
	getLayerTileSet : function(layer) {
		var tileset = null;
		var len = this.tileSets.length;
		
		for(var i = len-1; i >= 0; i--)
		{
			tileset = this.tileSets[i];

			for(var x = 0; x < this.width; x++)
			{
				for(var y = 0; y < this.height; y++)
				{
					var idx = x + this.width * y;
					var id = layer.getTiles()[idx];
					
					if(id != 0)
					{
						if(id >= tileset.getFirstGID())
							return tileset;
					}
				}
			}
		}

		return null;
	}
});

Object.extend(MoTMXTileMap, {
	TYPE_ORTHOGONAL : "orthogonal",
	TYPE_ISOMETRIC : "isometric",
	TYPE_HEXAGONAL : "hexagonal",

	load : function(tmxXmlFilePath, readyCallback) {
		var request = MoCreateHttpRequestObject();

		if(MoIsNull(request))
		{
			MoDebugWrite("Unable to create XMLHttpRequest object.", MoDebugLevel.Error);
			return;
		}

		var tmx = new MoTMXTileMap();
		tmx.filePath = tmxXmlFilePath;
		tmx.basePath = tmxXmlFilePath.substring(0, tmxXmlFilePath.lastIndexOf("/")+1);

		request.onreadystatechange = function() {
			
			if(request.readyState == 4)
			{
				if(request.status == 200 || request.status == 304)
				{
					var xml = request.responseXML;
					var mapNode = xml.documentElement;
					var attr = null;

					// parse the map attributes
					for(var i = 0; i < mapNode.attributes.length; i++)
					{
						attr = mapNode.attributes[i];
			
						switch(attr.localName)
						{
							case "version":
								tmx.version = attr.value;
								break;
							case "orientation":
								tmx.orientation = attr.value;
								break;
							case "width":
								tmx.width = parseInt(attr.value);
								break;
							case "height":
								tmx.height = parseInt(attr.value);
								break;
							case "tilewidth":
								tmx.tileWidth = parseInt(attr.value);
								break;
							case "tileheight":
								tmx.tileHeight = parseInt(attr.value);
								break;
						}
					}
		
					// now parse the child nodes
					for(var i = 0; i < mapNode.childNodes.length; i++)
					{
						var node = mapNode.childNodes[i];
			
						switch(node.localName)
						{
							case "tileset":
								tmx.tileSets.push(MoTMXTileMap.parseTileset(node, tmx.basePath));
								break;
							case "layer":
								tmx.layers.push(MoTMXTileMap.parseLayer(node));
								break;
							case "objectgroup":
								tmx.objectGroups.push(MoTMXTileMap.parseObjectGroup(node));
								break;
							case "properties":
								tmx.properties = MoTMXTileMap.parseProperties(node);
								break;
						}
					}

					if(!MoIsNull(readyCallback))
						readyCallback(tmx);
				}
				else
				{
					MoDebugWrite("Unable to load tmx map from url: #{0}, reason=#{1}, responseCode=#{2}", MoDebugLevel.Error, tmxXmlFilePath, request.statusText, request.status);
				}
			}
		};

		request.open("GET", tmxXmlFilePath, true);
		request.send(null);
	},

	parseMapXml : function() {

	},
	
	parseTileset : function(node, basePath) {
	
		var set = new MoTMXTileSet();
	
		for(var i = 0; i < node.attributes.length; i++)
		{
			var attr = node.attributes[i];
		
			switch(attr.localName)
			{
				case "firstgid":
					set.firstGid = parseInt(attr.value);
					break;
				case "name":
					set.name = attr.value;
					break;
				case "tilewidth":
					set.tileWidth = parseInt(attr.value);
					break;
				case "tileheight":
					set.tileHeight = parseInt(attr.value);
					break;
				case "spacing":
					set.spacing = parseInt(attr.value);
					break;
				case "margin":
					set.margin = parseInt(attr.value);
					break;
			}
		}
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			var n = node.childNodes[i];
			
			if(n.localName == "image")
			{
				var attr = MoTMXTileMap.getAttributeByName(n, "source");
				
				if(attr != null)
					set.imageSource = basePath + attr.value;
				
				break;
			}
		}
		
		return set;
	},
	
	parseLayer : function(node) {
		var layer = new MoTMXLayer();
	
		for(var i = 0; i < node.attributes.length; i++)
		{
			var attr = node.attributes[i];
		
			switch(attr.localName)
			{
				case "name":
					layer.name = attr.value;
					break;
				case "opacity":
					layer.opacity = Number(attr.value);
					break;
				case "visible":
					layer.visible = (parseInt(attr.value) == 1 ? true : false);
					break;
			}
		}
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			var n = node.childNodes[i];
			
			if(n.localName == "data")
				MoTMXTileMap.parseTileData(n, layer);
		}

		return layer;
	},
	
	parseTileData : function(node, layer) {
		var attr = MoTMXTileMap.getAttributeByName(node, "encoding");
		
		if(attr.value != "csv")
			return;
		
		var tiles = node.textContent.split(",");
		
		if(tiles != null)
		{
			for(var i = 0; i < tiles.length; i++)
			{
				layer.tiles.push(parseInt(tiles[i]));
			}
		}
	},
	
	parseObjectGroup : function(node) {
		var group = new MoTMXObjectGroup();
		
		var attr = MoTMXTileMap.getAttributeByName(node, "encoding");
		
		if(attr != null)
			group.name = attr.value;
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			var n = node.childNodes[i];
			
			if(n.localName == "object")
				group.objects.push(MoTMXTileMap.parseObject(n));
		}
		
		return group;
	},
	
	parseObject : function(node) {
		var obj = new MoTMXObject();
	
		for(var i = 0; i < node.attributes.length; i++)
		{
			var attr = node.attributes[i];
		
			switch(attr.localName)
			{
				case "name":
					obj.name = attr.value;
					break;
				case "type":
					obj.type = attr.value;
					break;
				case "x":
					obj.x = parseInt(attr.value);
					break;
				case "y":
					obj.y = parseInt(attr.value);
					break;
				case "width":
					obj.width = parseInt(attr.value);
					break;
				case "height":
					obj.height = parseInt(attr.value);
					break;
				case "gid":
					obj.gid = parseInt(attr.value);
					break;
			}
		}
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			if(node.childNodes[i].localName == "properties")
				obj.properties = MoTMXTileMap.parseProperties(node.childNodes[i]);
		}
		
		return obj;
	},
	
	parseProperties : function(node) {
		var props = new MoDictionary();
		
		for(var i = 0; i < node.childNodes.length; i++)
		{
			if(node.childNodes[i].localName == "property")
			{
				var nameAttr = MoTMXTileMap.getAttributeByName(node.childNodes[i], "name");
				var valueAttr = MoTMXTileMap.getAttributeByName(node.childNodes[i], "name");
				
				props.set(nameAttr.value, valueAttr.value);
			}
		}
		
		return props;
	},
	
	getAttributeByName : function(node, name) {
		for(var i = 0; i < node.attributes.length; i++)
		{
			var attr = node.attributes[i];
			
			if(attr.localName == name)
				return attr;
		}
		
		return null;
	}
});

/****************************************************************************
** MoTMXTileMapLayerCanvas.js
****************************************************************************/

MoTMXTileMapLayerTile = Class.create({
	initialize : function(tileId, tileRect, tilePosition) {
		this.tileId = tileId;
		this.tileRect = tileRect;
		this.tilePosition = tilePosition;
	}
});

MoTMXTileMapLayerCanvas = Class.create(MoCanvas, {
	initialize : function($super, mapInfo, layerInfo, tilesetInfo) {
		$super(layerInfo.getName());

		this.mapInfo = mapInfo;
		this.layerInfo = layerInfo;
		this.tilesetInfo = tilesetInfo;
		this.tiles = new Array();
		this.texture = MoTextureSource.fromFile(this.getTileSet().getImageSource());
		this.hasTiles = false;
		
		this.setIsHitTestVisible(false);
		this.setAlpha(layerInfo.getOpacity());
		this.initializeTiles();
	},
	
	getTileSet : function() {
		return this.tilesetInfo;
	},

	getLayer : function() {
		return this.layerInfo;
	},
	
	initializeTiles : function() {

		this.setWidth(this.mapInfo.getPixelWidth());
		this.setHeight(this.mapInfo.getPixelHeight());

		if(this.texture.getIsSourceReady())
		{
			var layer = this.getLayer();
			var tileset = this.getTileSet();

			this.tiles.clear();
		
			for(var x = 0; x < this.mapInfo.getWidth(); x++)
			{
				for(var y = 0; y < this.mapInfo.getHeight(); y++)
				{
					var idx = x + this.mapInfo.getWidth() * y;
					var tileId = layer.getTiles()[idx];
					
					if(tileId == 0)
						continue;

					var tileRect = this.getTileRect(tileId);
					var tilePosition = this.getTilePixelPosition(x, y);

					this.tiles.push(new MoTMXTileMapLayerTile(tileId, tileRect, tilePosition));
				}
			}

			this.texture.removeEventHandler(MoSourceEvent.READY, this.handleTextureSourceReadyEvent.asDelegate(this));
			this.hasTiles = true;
			this.requestLayout();
		}
		else
		{		
			this.texture.addEventHandler(MoSourceEvent.READY, this.handleTextureSourceReadyEvent.asDelegate(this));
		}
	},

	handleTextureSourceReadyEvent : function(event) {
		if(!this.hasTiles)
			this.initializeTiles();
	},

	getTileRect : function(tileId) {
		var tileset = this.getTileSet();
		var rect = new MoRectangle(0, 0, tileset.getTileWidth(), tileset.getTileHeight());
		var rowWidth = Math.floor((this.texture.getWidth() - (tileset.getMargin() * 2) + tileset.getSpacing()) / (tileset.getTileWidth() + tileset.getSpacing()));
		var adjustedTileId = tileId - tileset.getFirstGID();

		rect.x = Math.floor(adjustedTileId % rowWidth) * (tileset.getTileWidth() + tileset.getSpacing()) + tileset.getMargin();
		rect.y = Math.floor(adjustedTileId / rowWidth) * (tileset.getTileHeight() + tileset.getSpacing()) + tileset.getMargin();

		return rect;
	},

	getTilePixelPosition : function(col, row) {
		var pos = new MoVector2D.Zero();
		var width = this.mapInfo.getWidth();
		var height = this.mapInfo.getHeight();
		var tileWidth = this.mapInfo.getTileWidth();
		var tileHeight = this.mapInfo.getTileHeight();

		switch(this.mapInfo.getOrientation())
		{
			case MoTMXTileMap.TYPE_ORTHOGONAL:
				pos.x = col * tileWidth;
				pos.y = row * tileHeight;
				break;
			case MoTMXTileMap.TYPE_ISOMETRIC:
				pos.x = (col - row) * tileWidth / 2 + (height * tileWidth / 2);
				pos.y = (col + row) * tileHeight / 2;
				break;
			case MoTMXTileMap.TYPE_HEXAGONAL:
				pos.x = col * tileWidth * 0.75;
				pos.y = row * tileHeight + ((col % 2) == 1 ? tileHeight * 0.5 : 0);
				break;
		}

		return pos;
	},

	layout : function($super, unscaledWidth, unscaledHeight) {
		$super(unscaledWidth, unscaledHeight);
		
		if(!this.hasTiles)
			return;

		var gfx = this.getGraphics();
		var len = this.tiles.length;
		var tile = null;
		
		for(var i = 0; i < len; i++)
		{
			tile = this.tiles[i];

			gfx.drawImageComplex(
				this.texture, 
				tile.tileRect.x,
				tile.tileRect.y,
				tile.tileRect.width,
				tile.tileRect.height,
				tile.tilePosition.x,
				tile.tilePosition.y,
				tile.tileRect.width,
				tile.tileRect.height);
		}
	}
});

/****************************************************************************
** MoTMXTileMapCanvas.js
****************************************************************************/

MoTMXTileMapCanvas = Class.create(MoCanvas, {
	initialize : function($super, name, mapData) {
		$super(name);
		
		this.tmxData = MoValueOrDefault(mapData, null);
		this.setIsHitTestVisible(false);
	},
	
	getMapData : function() {
		return this.tmxData;
	},

	setMapData : function(value) {
		this.tmxData = value;
		this.reset();
	},
	
	reset : function() {
		this.clear();

		if(MoIsNull(this.tmxData))
			return;

		this.setWidth(this.tmxData.getPixelWidth());
		this.setHeight(this.tmxData.getPixelHeight());

		var len = this.tmxData.getLayers().length;
		var layer = null;
		
		for(var i = 0; i < len; i++)
		{
			layer = this.tmxData.getLayers()[i];

			if(layer.getVisible())
				this.addLayer(layer);
		}
	},

	addLayer : function(layerInfo) {
		var tileset = this.tmxData.getLayerTileSet(layerInfo)
		
		if(tileset == null)
			return;
		