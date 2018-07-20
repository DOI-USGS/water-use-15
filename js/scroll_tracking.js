var scrolledTo = {
      'national-pie': false,
      'national-static-pie': false,
      'rank-states-interactive': false,
      'data-collection': false,
      'references': false,
      'related-items': false
};

window.onload = function() {
  window.addEventListener('scroll', function (event) {
	
    function scrollEventTrigger(id) {
      gtag('event', 'scroll' , {
          'event_category': 'scroll',
          'event_label': 'scrolled to ' + id,
          'sessionId': analytics.sessionId,
          'timestamp': analytics.getTimestamp()
      });
    }
    
    var pageIds = Object.getOwnPropertyNames(scrolledTo);
    
    var i;
    for (i = 0; i < pageIds.length; i++) {
      
      var currentId = pageIds[i];
      var currentElement = document.getElementById(currentId);
      
      if(isPastViewport(currentElement) && !scrolledTo[currentId]) {
  		  scrollEventTrigger(currentId);
  		  scrolledTo[currentId] = true;
  	  }
      
    }
    
  });

};

var isPastViewport = function ( elem ) {
  // true if the bottom of the element is in or above the view 
  //    (you scrolled by)
  
  // false if the bottom of the element is below the current view 
  //    (you haven't scrolled this far yet)
  
    var distance = elem.getBoundingClientRect();
    return (
        distance.bottom <= (window.innerHeight || 
              document.documentElement.clientHeight)
    );
};
