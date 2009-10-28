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
