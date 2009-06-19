(function($) {

/* Create our top-level namespace */
DUI = {
    //Simple check so see if the first argument passed in is a DUI Class
    isClass: function(check, type)
    {
        //false: check for dynamic, true: check for static, null: either type
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
    
    //Operate on a namespace at the global level
    global: function()
    {
        return DUI.Class.prototype.ns.apply(window, arguments);
    }
};

DUI.Class = function()
{
    //Sugar for "myClass = new DUI.Class()" usage
    return this.constructor.prototype._bootstrap.apply(this.constructor, arguments);
}

$.extend(DUI.Class.prototype, {
    _dontEnum: ['prototype', '_dontEnum', '_ident', '_bootstrap', 'init', 'create', 'ns', 'each'],
    
    _ident: {
        library: "DUI.Class",
        version: "1.0.0RC1",
        dynamic: true
    },
    
    _bootstrap: function()
    {
        //"this" needs to temporarily refer to the final class, not DUI
        var copy = function() {
            return function() {
                this.init.apply(this, arguments);
            }
        }.apply(copy);
        
        $.extend(copy.prototype, this.prototype);
        return copy.prototype.create.apply(copy, arguments);
    },
    
    init: function()
    { /* Constructor for created classes */ },
    
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
    
    ns: function()
    {
        //only copies into the object, not the prototype. you shouldn't have to instantiate to get into a namespace
        
        if(arguments.length == 0) return false;
        
        var arg = arguments[0], levels = null;
        
        //foo.ns('bar'); --> creates foo.bar if it doesn't exist and returns it
        //foo.ns('bar.baz'); --> creates foo.bar.baz if it doesn't exist and returns it
        //foo.ns('bar.baz', 'lol'); --> creates foo.bar.baz if it doesn't exist, sets it to 'lol' and returns it
        if(arg.constructor == String) {
            var passthrough = {};
            passthrough[arg] = arguments[1] ? arguments[1] : null;
            
            //return this.ns(passthrough);
            
            arg = passthrough;
        }
        
        /* foo.ns({
            bar: {
                baz: 'hai'
            }
        }); --> creates / overwrites foo.bar with the anonymous object containing baz */
        if(arg.constructor == Object) {
            var _class = this, last = this;
            
            $.each(arg, function(nsName) {
                //reset nsobj back to the top each time
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

