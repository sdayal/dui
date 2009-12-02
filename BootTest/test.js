DUI(function() {
    var foo = DUI.Heartbeat;
    
    $('.whee').click(function(e) {
        console.log('SHIT JUST GOT REAL.');
    });
    
    $('.bootcapades').mouseover(function(e) {
        console.log('SHIT JUST GOT HOVERED.');
    });
    
    $('.out').click(function(e) {
        console.log('You won\'t see me');
        
        e.resumeDefault();
        //e.preventDefault();
    });
});
