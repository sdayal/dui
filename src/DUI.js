(function() {

DUI = function(deps, action) {
    if(arguments.length == 1) action = deps;
    action = action && action.constructor == Function ? action : function(){};
    var str = action.toString(), re = /(DUI\.\w+)/gim, matches = [], match;
    
    DUI.actions.push(action);
    
    if(deps && deps.constructor == Array) matches = deps;
    if(typeof jQuery == 'undefined') matches.push(DUI.jQueryURL) && matches.push(DUI.scriptURL + 'DUI/jquery.resumeDefault.js');
    
    while(match = re.exec(str)) {
        var unique = true; match = match[1] || null;
        
        if("isClass|global|prototype|_dontEnum|_ident|_bootstrap|init|create|ns|each|".search(new RegExp("(^|\\|)" + match.replace('DUI.', '') + "\\|")) > -1) {
            match = 'DUI.Class';
        }
        
        for(var i = 0; i < matches.length; i++) {
            if(matches[i] == match) unique = false;
        }
        
        if(unique) matches.push(match);
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
DUI.jQueryURL = 'http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.js';
DUI.scriptURL = 'http://' + window.location.hostname + '/~micah/DUI/src/';

DUI.load = function(module) {
    if(typeof DUI[module] != 'undefined'
        || DUI.loading.indexOf(module + '|') > -1) {
            return;
        }
        
        //^http - url, leave intact
        //DUI. - scriptDir/lib/(match).js
        //else - scriptDir/(match.replace(':', '/')).js
        
        var src = module.indexOf('http') == 0 ? module :
            (module.indexOf('DUI.') > -1 ? DUI.scriptURL + 'DUI/' + module + '.js' :
            DUI.scriptURL + module.replace(/:/g, '/') + '.js');
        
        /* var src = module.search(/\.js$/) > -1 ? module :
            (module.indexOf('/') > -1 ? DUI.scriptDir + module + '.js' :
            (module.indexOf(':') > -1 ? DUI.scriptDir + module.replace(':', '/') + '.js' :
            DUI.moduleDir + 'DUI.' + module + '.js')); */
    
    DUI.loading += module + '|';
    
    var d = document, jq = d.createElement('script'), a = 'setAttribute';
    jq[a]('type', 'text/javascript');
    jq[a]('src', src);
    //jq[a]('onload', 'DUI.loaded("' + module + '")');
    jq.onload = function() { DUI.loaded(module); };
    jq.onreadystatechange = function() {
        if('loadedcomplete'.indexOf(jq.readyState) > -1) {
            DUI.loaded(module);
        }
    }
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
    
    if(e.button == 2 || e.ctrlKey || e.metaKey) return;
    
    var y = e.type, t = e.target || e.srcElement, c = t.className, m = c.match(/(?:^|\s)_(click|hover):(\S+)(?:$|\s)/), h = '';
    
    if(m && m[1] && m[2]) {
        if((m[1] == 'hover' && y == 'mouseover')
            || (m[1] == 'click' && y == 'click')) {
            
            m = m[2];
        } else return;
        
        var s1 = m.replace(/([:\.]{1})/g, '\\$1');
        DUI([m], function() {
            $('._click\\:' + s1 + ', ._hover\\:' + s1).removeClass('_click:' + m + ' _hover:' + m);
            
            var evt = new $.Event(y);
            evt.fromDUI = true;
            $(t).removeClass('booting').trigger(evt);
        });
        
        t.className = c.replace(/_(click|hover):(\S+)/, '') + ' booting';
        
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
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
            var el = $(this), cl = $.map(el.attr('class').split(' '), function(val) {
                if(val.indexOf('_load:') > -1) val = null;
                
                return val;
            }).join(' ');
            
            el.attr('class', cl);
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
