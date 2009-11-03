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
        
        if(unique && "isClass|global|prototype|_dontEnum|_ident|_bootstrap|init|create|ns|each|".search(new RegExp("(^|\\|)" + match + "\\|")) == -1) {
            matches.push(match);
        }
    }
    
    for(var i = 0; i < matches.length; i++) {
        DUI.load(matches[i]);
    }
    
    if(DUI.loading.length == 0) {
        DUI.loaded();
    }
}

DUI.loading = '';
DUI.actions = [];
DUI.jQueryURL = 'http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js';
DUI.moduleDir = 'src/';
DUI.scriptDir = '';

DUI.load = function(module) {
    if(typeof DUI[module] != 'undefined'
        || DUI.loading.indexOf(module + '|') > -1) {
            return;
        }
    
        var src = module.search(/\.js$/) > -1 ? module :
            (module.indexOf('/') > -1 ? DUI.scriptDir + module + '.js' :
            (module.indexOf(':') > -1 ? DUI.scriptDir + module.replace(':', '/') + '.js' :
            DUI.moduleDir + 'DUI.' + module + '.js'));
    
    DUI.loading += module + '|';
    
    var d = document, jq = d.createElement('script'), a = 'setAttribute';
    jq[a]('type', 'text/javascript');
    jq[a]('src', src);
    jq[a]('onload', 'DUI.loaded("' + module + '")');
    d.body.appendChild(jq);
}

DUI.loaded = function(module) {
    DUI.loading = DUI.loading.replace(module + '|', '');
    
    if(DUI.loading.length == 0) {
        while(DUI.actions.length > 0) {
            DUI.actions.pop().apply(DUI);
        }
    }
}

var d = document, add = 'addEventListener', att = 'attachEvent', boot = function(e) {
    e = e || window.event;
    var y = e.type, t = e.target || e.srcElement, c = t.className, m = c.match(/(?:^|\s)_(click|hover):(\S+)(?:$|\s)/), h = '';
    
    if(m && m[1] && m[2]) {
        //IE is probably going to report these event names in a shitty way
        if((m[1] == 'hover' && y == 'mouseover')
            || (m[1] == 'click' && y == 'click')) {
            
            m = m[2];
        } else return;
        
        var s1 = m.replace(':', '\\:');
        DUI([m], function() {
            $('._click\\:' + s1 + ', ._hover\\:' + s1).removeClass('_click:' + m + ' _hover:' + m);
            $(t).removeClass('booting')[y]();
        });
        
        t.className = c.replace(/_(click|hover):(\S+)/, '') + ' booting';
        
        e.preventDefault();
    }
};

var onload = function() {
    var html = 'class="' + document.body.className + '" ' + document.body.innerHTML, re = /class=(?:'|")(?:[^'"]*?)_load:([^\s"']+)(?:[^'"]*?)(?:'|")/gim, matches = [], match;
    
    while(match = re.exec(html)) {
        var unique = true;
        match = match[1] || null;
        
        for(var i = 0; i < matches.length; i++) {
            if(matches[i] == match) unique = false;
        }
        
        if(unique) matches.push(match);
    }
    
    DUI(matches, function() {
        $('[class*=_load\\:]').each(function() {
            var el = $(this), class = $.map(el.attr('class').split(' '), function(val) {
                if(val.indexOf('_load:') > -1) val = null;
                
                return val;
            }).join(' ');
            
            el.attr('class', class);
        });
    });
}

if(d[att]) {
    d[att]('onclick', boot);
    d[att]('onmouseover', boot);
    window[att]('onload', onload);
} else {
    d[add]('click', boot, false);
    d[add]('mouseover', boot, false);
    window[add]('load', onload, false);
}

})();
