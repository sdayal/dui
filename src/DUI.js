(function() {

DUI = function(deps, action) {
    if(arguments.length == 1) action = deps;
    action = action && action.constructor == Function ? action : function(){};
    var str = action.toString(), re = /DUI\.(\w+)/gim, matches = [], match;
    
    DUI.actions.push(action);
    
    if(deps && deps.constructor == Array) matches = deps;
    if(typeof jQuery == 'undefined') matches.push(DUI.jQueryURL);
    
    while(match = re.exec(str)) {
        var unique = true; match = match[1] || null;
        
        for(var i = 0; i < matches.length; i++) {
            if(matches[i] == match) unique = false;
        }
        
        if(unique && "isClass|global|prototype|_dontEnum|_ident|_bootstrap|init|create|ns|each|".indexOf(match + '|') == -1) {
            matches.push(match);
        }
    }
    
    for(var i = 0; i < matches.length; i++) {
        DUI.load(matches[i]);
    }
    
    if(DUI.loading.length == 0) {
        console.log('premature actionation');
        
        DUI.loaded();
    }
}

DUI.loading = '';
DUI.actions = [];
DUI.jQueryURL = 'http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js';

DUI.loaded = function(module) {
    DUI.loading = DUI.loading.replace(module + '|', '');
    
    if(DUI.loading.length == 0) {
        console.log('GO!');
        
        while(DUI.actions.length > 0) {
            DUI.actions.pop().apply(DUI);
        }
    } else {
        console.log('waiting for: ', DUI.loading);
    }
}

DUI.load = function(module) {
    if(typeof DUI[module] != 'undefined'
        || DUI.loading.indexOf(module + '|') > -1) {
            return;
        }
    
    var src = module.search(/\.js$/) > -1 ? module : 'src/DUI.' + module + '.js';
    
    DUI.loading += module + '|';
    
    var d = document, jq = d.createElement('script'), a = 'setAttribute';
    jq[a]('type', 'text/javascript');
    jq[a]('src', src);
    jq[a]('onload', 'DUI.loaded("' + module + '")');
    d.body.appendChild(jq);
}

var d = document, add = d.addEventListener, att = d.attachEvent, boot = function(e) {
    e = e || window.event;
    var t = e.target || e.srcElement;
    
    if(t.className.search(/(^|\s)boot($|\s)/) > -1) {
        console.log('booting');
    }
};

if(att) {
    att('onclick', boot);
} else {
    add('click', boot, false);
}

})();
