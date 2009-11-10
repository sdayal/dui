DUI(function() {
    $.Event.prototype.resumeDefault = function() {
        var el = $(this.target), nn = el.attr('nodeName'), href = el.attr('href');
        
        if(!this.fromDUI) return;
        
        if(nn == 'A' && href) {
            document.location = href;
        }
    }
});
