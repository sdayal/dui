DUI(function() {
   DUI.ns('treq', function(url, target, data) {
       if(arguments.length < 3) {
           data = arguments[1] && arguments[1].constructor == Object ? arguments[1] : {};

           var callArgs = DUI.global('DUI.treq.caller.arguments');
           if(callArgs.length > 0 && callArgs[0].target) {
               target = callArgs[0].target;
           } else {
               throw('DUI.treq must have a selector as its second argument when used outside an event handler');
           }
       }

       $.ajax({
           url: url,
           type: 'POST',
           dataType: 'json',
           data: data,
           complete: function(xhr) {
               var json = eval('(' + xhr.responseText + ')');
               $(target).trigger(json.event, [json.data]);
           }
       });
   });
});
