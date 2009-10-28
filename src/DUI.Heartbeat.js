//this will overrwrite the other DUI.action... fuck
//we need to call this one before the other one
//like make a sequence of actions that fire IN ORDER. order is important.
DUI(['Class'], function() {
    DUI.ns('Heartbeat', new DUI.Class({
        init: function(delay, callback) {
            this.interval = setInterval(callback, delay);
        },
        
        kill: function() {
            clearInterval(this.interval);
            delete this;
        }
    }));
});
