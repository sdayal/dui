/**
 * DUI: The Digg User Interface Library
 *
 * Copyright (c) 2008-2009, Digg, Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice, 
 *   this list of conditions and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, 
 *   this list of conditions and the following disclaimer in the documentation 
 *   and/or other materials provided with the distribution.
 * - Neither the name of the Digg, Inc. nor the names of its contributors 
 *   may be used to endorse or promote products derived from this software 
 *   without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" 
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE 
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE 
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE 
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR 
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF 
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) 
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE 
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @module DUI
 * @author Micah Snyder <micah@digg.com>
 * @description The Digg User Interface Library
 * @version 1.0.0
 * @link http://code.google.com/p/digg
 *
 */

(function($) {

/* Create our top-level namespace */
DUI = {
    /**
     * @function isClass Check so see if the first argument passed in is a DUI Class
     * @param {mixed} check Object to check for classiness.
     * @param {optional Boolean} type Look for a specific type of class. False: dynamic, true: static, (default) null: either type
     */
    isClass: function(check, type)
    {
        type = type || null;
        
        try {
            if(check._ident.library == 'DUI.Class') {
                if(type == null
                || (type == false && check._ident.dynamic)
                || (type == true && !check._ident.dynamic)) {
                    return true;
                }
            }
        } catch(noIdentUhOh) {}
        
        return false;
    },
    
    /**
     * @function global Operate on a global namespace
     * @see DUI.Class.prototype.ns
     */
    global: function()
    {
        return DUI.Class.prototype.ns.apply(window, arguments);
    }
};

/**
 * @class DUI.Class Class creation and management for use with jQuery.
 */
DUI.Class = function()
{
    return this.constructor.prototype._bootstrap.apply(this.constructor, arguments);
}

$.extend(DUI.Class.prototype, {
    /**
     * @var {Array} _dontEnum Internal array of keys to omit when looking through a class' properties. Once the real DontEnum bit is writable we won't have to deal with this.
     */
    _dontEnum: ['prototype', '_dontEnum', '_ident', '_bootstrap', 'init', 'create', 'ns', 'each'],
    
    /**
     * @var {Object} _ident Internal properties that describe this class
     */
    _ident: {
        library: "DUI.Class",
        version: "1.0.0",
        dynamic: true
    },
    
    /**
     * @function _bootstrap Return a new class by passing the 'create' method through into a new function.
     * @see DUI.Class.prototype.create
     */
    _bootstrap: function()
    {
        var copy = function() {
            return function() {
                this.init.apply(this, arguments);
            }
        }.apply(copy);
        
        $.extend(copy.prototype, this.prototype);
        return copy.prototype.create.apply(copy, arguments);
    },
    
    /**
     * @function init Constructor for created classes. Unused by DUI.Class itself.
     */
    init: function()
    {},
    
    /**
     * @function create Make a class from DUI.Class' prototype. Do work son, do work.
     * Usage 1: new DUI.Class(methods, static);
     * Usage 2: MyClass.create('MySubClass', methods, static);
     * @param {optional String} name Class name for sub-class in Usage 2.
     * @param {optional Object} methods Any number of objects can be passed in as arguments to be added to the class upon creation
     * @param {optional Boolean} static If the last argument is Boolean, it will be treated as the static flag. Defaults to false (dynamic)
     */
    create: function()
    {
        //For clarity, let's get rid of an instance of "this" in the code
        var _class = this;
        
        //Get the last argument...
        var s = Array.prototype.slice.apply(arguments).reverse()[0] || null;
        //...and check to see if it's boolean: false (default) = dynamic class, true = static class
        s = s !== null && s.constructor == Boolean ? s : false;
        
        //Static: extend the Object, Dynamic: extend the prototype
        var extendee = s ? _class : _class.prototype;
        
        //Foo.create('Bar', {}) usage
        if(arguments.length > 0 && arguments[0].constructor == String) {
            var args = Array.prototype.slice.call(arguments);
            var name = args.shift();
            _class[name] = _class.create.apply(_class, args);
            
            return _class[name];
        }
        
        //Change the ident for static classes
        if(s) _class.prototype._ident.dynamic = false;
        
        //This is where it gets weird: Copy helpers in from the proto
        $.each(['_dontEnum', '_ident', 'create', 'ns', 'each'], function() {
            _class[this] = _class.prototype[this];
        });
        
        //Loop through arguments. If they're the right type, tack them on
        $.each(arguments, function() {
            var arg = this;
            
            //Either we're passing in an object full of methods, or an existing class
            if(arg.constructor == Object || DUI.isClass(arg)) {
                //If arg is a dynamic class, pull from its prototype
                var payload = DUI.isClass(arg, false) ? arg.prototype : arg;
                
                /* Here we're going per-property instead of doing $.extend(extendee, this) so that
                 * we overwrite each property instead of the whole namespace. */
                $.each(payload, function(i) {
                    //Special case! If 'dontEnum' is passed in as an array, add its contents to DUI.Class._dontEnum
                    if(i == 'dontEnum' && this.constructor == Array) {
                        extendee._dontEnum = $.merge(extendee._dontEnum, this);
                    }
                    
                    //Add the current property to our class
                    extendee[i] = this;
                });
            }
        });
        
        return _class;
    },
    
    /**
     * @function ns Make a namespace within a class
     * Usage 1: MyClass.ns('foo.bar');
     * Usage 2: MyClass.ns('foo.bar', 'baz');
     * @param {String} name Period separated list of namespaces to nest. MyClass.ns('foo.bar') makes MyClass['foo']['bar'].
     * @param {optional mixed} value Set the contents of the deepest specified namespace to this value.
     *
     * Usage 3: MyClass.ns({ foo: 1, bar: 2 });
     * @param {Object} contents List of name: value pairs to create. Note that 'foo.bar' syntax does not recurse.
     */
    ns: function()
    {
        if(arguments.length == 0) return false;
        
        var arg = arguments[0], levels = null;
        
        if(arg.constructor == String) {
            var passthrough = {};
            passthrough[arg] = arguments[1] ? arguments[1] : null;
            
            arg = passthrough;
        }
        
        if(arg.constructor == Object) {
            var _class = this, last = this;
            
            $.each(arg, function(nsName) {
                //Reset nsobj back to the top each time
                var nsobj = _class;
                var levels = nsName.split('.');
                
                $.each(levels, function(i) {
                    //When adding a namespace check to see if there's a value being passed in for it
                    if(i == levels.length - 1 && arg[nsName]) {
                        nsobj[this] = arg[nsName];
                        
                    //...if not, check to see if the ns doesn't already exist in our class
                    } else if(typeof nsobj[this] == 'undefined') {
                        //...and make it a new static class
                        nsobj[this] = new DUI.Class(true);
                    }
                    
                    //Move one level deeper for the next iteration
                    last = nsobj = nsobj[this];
                });
            });
            
            return last;
        }
    },
    
    /**
     * @function each Iterate through a Class' user-defined properties
     * @param {Function} iter Iterator function that takes two optional arguments: key and value
     * @see jQuery.each
     */
    each: function(iter)
    {
        if(!$.isFunction(iter)) {
            throw new Error('DUI.Class.each must be called with a function as its first argument.');
        }
        
        var _class = this;
        
        //$.each tweaks out on Functions. See: http://dev.jquery.com/ticket/2827
        /* $.each(this, function(key) {
            if($.inArray(key, _class._dontEnum) != -1) return;
            
            iter.apply(this, [key, this]);
        }); */
        
        for(var key in _class) {
            if($.inArray(key, _class._dontEnum) == -1) {
                var val = _class[key];
                iter.apply(val, [key, val]);
            }
        }
    }
});

DUI = new DUI.Class(DUI, true);

})(jQuery);

