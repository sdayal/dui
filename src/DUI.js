(function() {

//add Array.indexOf to a certain shitty browser we support
[].indexOf || (Array.prototype.indexOf = function(v,n){
    n = (n==null)?0:n; var m = this.length;
    for(var i = n; i < m; i++) {
        if(this[i] == v) return i;
    }
    
    return -1;
});

DUI = function(deps, action, data) {
    if(arguments.length == 1) action = deps;
    action = action && action.constructor == Function ? action : function(){};
    var str = action.toString(), re = /(DUI\.\w+)/gim, matches = [], match;
    
    DUI.actions.push(action);
    
    if(deps && deps.constructor == Array) matches = deps;
    if(typeof jQuery == 'undefined') matches.push(DUI.scriptURL + 'DUI/jquery.resumeDefault.js') && matches.push(DUI.jQueryURL) && matches.reverse();
    
    while(match = re.exec(str)) {
        var unique = true; match = match[1] || null;
        
        var internals = ['isClass','global','prototype','_dontEnum','_ident','_bootstrap','init','create','ns','each'];
        
        if(internals.indexOf(match.replace('DUI.', '')) > -1) {
            match = 'DUI.Class';
        }
        
        //replace this with Array.indexOf
        for(var i = 0; i < matches.length; i++) {
            if(matches[i] == match) unique = false;
        }
        
        if(unique) matches.push(match);
    }
    
    for(var i = 0; i < matches.length; i++) {
        DUI.load(matches[i], data);
    }
    
    if(DUI.loading.length == 0) {
        DUI.loaded();
    }
}

DUI.loading = '';
DUI.actions = [];
DUI.loadedScripts = [];
DUI.jQueryURL = 'http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.js';
DUI.scriptURL = 'http://' + window.location.hostname + '/';
DUI.maps = {};

DUI.load = function(module, data) {
    if(DUI.loading.indexOf(module + '|') > -1) return;
    
    if(DUI.loadedScripts.indexOf(module) > -1) {
        DUI.loaded(module, data);
        return;
    }
    
    //^http - url, leave intact
    //DUI. - scriptDir/DUI/(match).js
    //else - scriptDir/(match.replace(':', '/')).js
    
    //split on :, look for _foo, check if DUI.maps._foo, replace _foo with mapped value, join(':')
    var loadStr = module, parts = module.split(/:(?!\/\/)/);
    for(var i = 0; i < parts.length; i++) {
        var part = parts[i];
        if(part.indexOf('_') == 0 && DUI.maps[part]) {
            parts[i] = DUI.maps[part];
        }
    }
    module = parts.join('/');
    
    var src = module.indexOf('http') == 0 ? module :
        (module.indexOf('DUI.') > -1 ? DUI.scriptURL + 'DUI/' + module + '.js' :
        DUI.scriptURL + module + '.js');
    
    DUI.loading += loadStr + '|';
    
    var d = document, jq = d.createElement('script'), a = 'setAttribute';
    jq[a]('type', 'text/javascript');
    jq[a]('src', src);
    jq.onload = function() { DUI.loaded(loadStr, data); };
    jq.onreadystatechange = function() {
        if('loadedcomplete'.indexOf(jq.readyState) > -1) {
            DUI.loaded(loadStr, data);
        }
    }
    d.body.appendChild(jq);
}

DUI.loaded = function(module, data) {
    DUI.loading = DUI.loading.replace(module + '|', '');
    if(module) DUI.loadedScripts.push(module);
    
    if(data && module) {
        var safe = module.replace(/([:\.]{1})/g, '\\$1');
        var event = data.event;
        var el = data.target ? $(data.target) : null;
        
        if(el) el.removeClass('booting');
        
        $('._view\\:' + safe + ', ._click\\:' + safe + ', ._hover\\:' + safe + ', ._load\\:' + safe)
                .removeClass('_view:' + module + ' _click:' + module + ' _hover:' + module + ' _load:' + module);
        
        /* if(['click', 'mouseover'].indexOf(event) > -1) {
            var evt = new $.Event(event);
            evt.fromDUI = true;
            el.trigger(evt);
        } */
    }
    
    
    
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
        
        t.className = c + ' booting';
        
        DUI([m], function() {
            var evt = new $.Event(y);
            evt.fromDUI = true;
            $(t).trigger(evt);
        }, {
            event: y,
            target: t
        });
        
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
    
    DUI(matches, null, {
        event: 'load'
    });
}

var onscroll = function() {
    //todo: cross-browser math
    //todo: roll regexes throughout the file into one common object
    var height = window.innerHeight, scroll = window.scrollY, re = /class=(?:'|")(?:[^'"]*?)_view:([^\s"']+)(?:[^'"]*?)(?:'|")/gim, matches = [], el;
    
    if(document.querySelectorAll) {
        qsa = document.querySelectorAll('*[class*=_view]');
        
        for(var i = 0; i < qsa.length; i++) {
            el = qsa[i];
            
            if(height + scroll > el.offsetTop) {
                matches.push(/(?:^|\s)_view:([^\s]+)(?:\s|$)/.exec(el.className)[1]);
            }
        }
        
        
    } else {
        console.log('no');
    }
    
    if(matches.length > 0) {
        el.className = el.className + ' booting';
        
        DUI(matches, null, {
            event: 'scroll',
            target: el
        });
    }
}

if(d[att]) {
    d[att]('onclick', boot);
    d[att]('onmouseover', boot);
    d[att]('onscroll', onscroll);
    window[att]('onload', onload);
} else {
    d[add]('click', boot, false);
    d[add]('mouseover', boot, false);
    d[add]('scroll', onscroll, false);
    window[add]('load', onload, false);
}

})();
