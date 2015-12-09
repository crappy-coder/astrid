import Utils from "./Utils"

(function () {

    //--------------------------------------------------------------------------
    //  Array Extensions
    //--------------------------------------------------------------------------
    Array.prototype.contains = Array.prototype.contains || function (item) {
        return !!(~this.indexOf(item));
    };

    Array.prototype.remove = Array.prototype.remove || function (item) {
        for (var i = this.length - 1; i >= 0; i--) {
            if (this[i] == item) {
                this.removeAt(i);
            }
        }
    };

    Array.prototype.removeAt = Array.prototype.removeAt || function (index) {
        if(index >= 0 && index < this.length)
            this.splice(index, 1);
    };

    //--------------------------------------------------------------------------
    //  Function Extensions
    //--------------------------------------------------------------------------

    Function.prototype.findEventHandler$ = Function.prototype.findEventHandler$ || function (context) {

        // no handler table has been created yet to search
        if (!this.eventHandlerTable) {
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

    Function.prototype.createEventHandler$ = Function.prototype.createEventHandler$ || function (context, handler) {
        // if there is no event handler table for this function instance
        // create one, this is done at the instance level so we do not
        // generate huge tables instead of using Function.prototype.eventHandlerTable
        // which would be a single instance for all functions
        if (!this.eventHandlerTable) {
            this.eventHandlerTable = [];
        }

        this.eventHandlerTable.push({context: context, handler: handler});

        return handler;
    };

    Function.prototype.asDelegate = Function.prototype.asDelegate || function (context) {
        // if no context then just return ourself
        if (!context) {
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
    Function.prototype.d = Function.prototype.d || Function.prototype.asDelegate;

    //--------------------------------------------------------------------------
    //  String Extensions
    //--------------------------------------------------------------------------

    /**
     *  Formats a given string in a similar way as printf.
     */
    String.format = String.format || function (formatString) {
        if (arguments.length === 0) {
            return formatString;
        }

        return Utils.format.apply(this, arguments);
    };

    String.prototype.contains = String.prototype.contains || function (value) {
        return !!(~this.indexOf(value));
    };

    window.performance = window.performance || {
        now: function () {
            return Date.now() - this.offset;
        },
        offset: Date.now()
    };
})();
