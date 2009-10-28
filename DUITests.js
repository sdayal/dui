DUI(['http://yui.yahooapis.com/3.0.0b1/build/yui/yui-min.js'], function() {

YUI({ useBrowserConsole: false }).use('console', 'test', function(Y) {
    var suite = new Y.Test.Suite({
        name: "DUI",
        
        setUp: function() {
            this.dyn = new DUI.Class({
                init: function(arg) {
                    this.quux = arg;
                },
                foo: 1,
                bar: function(){},
                baz: null
            });
            
            this.stat = new DUI.Class({
                foo: 1,
                bar: function(){},
                baz: null
            }, true);
        },
        
        tearDown: function() {
            delete this.dyn;
            delete this.stat;
        }
    });
    
    suite.add(new Y.Test.Case({
        name: "Create Dynamic Class",
        
        testConstructor: function() {
            var c = new suite.dyn(4);
            Y.Assert.areSame(4, c.quux, "Constructor should set member 'quux' to 4");
        },
        
        testNumericalMember: function() {
            Y.Assert.areSame(1, suite.dyn.prototype.foo, "Member 'foo' should be 1");
        },
        
        testFunctionMember: function() {
            Y.Assert.isTypeOf('function', suite.dyn.prototype.bar, "Member 'bar' should be a Function");
        },
        
        testNullMember: function() {
            Y.Assert.areSame(null, suite.dyn.prototype.baz, "Member 'baz' should be null");
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: "Create Static Class",
        
        testNumericalMember: function() {
            Y.Assert.areSame(1, suite.stat.foo, "Member 'foo' should be 1");
        },
        
        testFunctionMember: function() {
            Y.Assert.isTypeOf('function', suite.stat.bar, "Member 'bar' should be a Function");
        },
        
        testNullMember: function() {
            Y.Assert.areSame(null, suite.stat.baz, "Member 'baz' should be null");
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: "Utils: DUI.isClass",
        
        testDynNoFlag: function() {
            Y.Assert.isTrue(DUI.isClass(suite.dyn), "DUI.isClass -> Dynamic class -> No flag");
        },
        
        testDynDynFlag: function() {
            Y.Assert.isTrue(DUI.isClass(suite.dyn, false), "DUI.isClass -> Dynamic class -> Dynamic flag");
        },
        
        testDynStatFlag: function() {
            Y.Assert.isFalse(DUI.isClass(suite.dyn, true), "DUI.isClass -> Dynamic class -> Static flag");
        },
        
        testStatNoFlag: function() {
            Y.Assert.isTrue(DUI.isClass(suite.stat), "DUI.isClass -> Static class -> No flag");
        },
        
        testStatStatFlag: function() {
            Y.Assert.isTrue(DUI.isClass(suite.stat, true), "DUI.isClass -> Static class -> Static flag");
        },
        
        testStatDynFlag: function() {
            Y.Assert.isFalse(DUI.isClass(suite.stat, false), "DUI.isClass -> Static class -> Dynamic flag");
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: "Utils: DUI.global",
        
        setUp: function() {
            globalTestObj = {
                foo: {
                    bar: 'bananas'
                }
            };
            
            this.scopedTestObj = {
                baz: {
                    quux: 'nanners'
                }
            };
        },
        
        tearDown: function() {
            delete globalTestObj;
            delete this.scopedTestObj;
        },
        
        testUndefinedGlobal: function() {
            Y.Assert.isUndefined(DUI.global('hntdnthdy.tshdxbwmxbxy.nhtdgip'), "DUI.global -> Undefined NS === undefined");
        },
        
        testGetGlobal: function() {
            Y.Assert.areSame('bananas', DUI.global('globalTestObj.foo.bar'), "DUI.global -> Get property of global object");
        },
        
        testGetScopedGlobal: function() {
            Y.Assert.areSame('nanners', DUI.global(['scopedTestObj.baz.quux', this]), "DUI.global -> Get property of scoped object");
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: "DUI iterators",
        
        _should: {
            error: {
                testEachError: new Error('DUI.Class.each must be called with a function as its first argument.')
            }
        },
        
        setUp: function() {
            this.eachClass = new DUI.Class({
                foo: 1,
                bar: 2,
                baz: 3,
            }, true);
            
            this.dontEnumClass = new DUI.Class({
                foo: 1,
                bar: 2,
                baz: 3,
                dontEnum: ['bar']
            }, true);
        },
        
        tearDown: function() {
            delete this.eachClass;
            delete this.dontEnumClass;
        },
        
        testEach: function() {
            var result = '';
            
            this.eachClass.each(function(key, value) {
                result += key + value;
            });
            
            Y.Assert.areSame('foo1bar2baz3', result, "DUI each should call its arg on every iterable member of a class");
        },
        
        testEachError: function() {
            this.eachClass.each();
        },
        
        testDontEnum: function() {
            var result = '';
            
            this.dontEnumClass.each(function(key) {
                result += key;
            });
            
            Y.Assert.areSame('foobaz', result, "DUI each should omit key 'bar' passed into donEnum");
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: "DUI namespaces",
        
        setUp: function() {
            this.nsClass = new DUI.Class(true);
        },
        
        tearDown: function() {
            delete this.nsClass;
        },
        
        testUndefinedNamespace: function() {
            Y.Assert.isUndefined(this.nsClass.ns('foo'), "Undefined namespace should return undefined");
        },
        
        testTopLevelNamespace: function() {
            this.nsClass.ns('foo', 1);
            
            Y.Assert.areSame(1, this.nsClass.ns('foo'), "Set a top level namespace and return it.");
            
            delete this.nsClass.foo;
        },
        
        testDeepNamespace: function() {
            this.nsClass.ns('foo.bar', 1);
            
            Y.Assert.areSame(1, this.nsClass.ns('foo.bar'), "Set a second level namespace and return it.");
            
            Y.Assert.isTrue(DUI.isClass(this.nsClass.ns('foo')), "Check to make sure a top level namespace was created to hold the nested one.");
            
            delete this.nsClass.foo;
        },
        
        testObjectNamespace: function() {
            this.nsClass.ns({
                foo: 1,
                bar: 2,
                baz: 3
            });
            
            Y.Assert.areSame(1, this.nsClass.ns('foo'), "Prop 'foo' should be 1");
            Y.Assert.areSame(2, this.nsClass.ns('bar'), "Prop 'bar' should be 2");
            Y.Assert.areSame(3, this.nsClass.ns('baz'), "Prop 'baz' should be 3");
            
            delete this.nsClass.foo;
            delete this.nsClass.bar;
            delete this.nsClass.baz;
        }
    }));
    
    suite.add(new Y.Test.Case({
        name: "DUI create",
        
        setUp: function() {
            this.createClass = new DUI.Class(true);
            
            this.createClass.create('foo', {
                bar: 1
            }, true);
        },
        
        tearDown: function() {
            delete this.createClass;
        },
        
        testNestedClass: function() {
            Y.Assert.areSame(1, this.createClass.foo.bar, "Nested class foo's prop bar should be 1");
        }
    }));
    
    var console = new Y.Console({
        newestOnTop: false,
    }).render();
    
    Y.Test.Runner.add(suite);
    Y.Test.Runner.run();
});

});