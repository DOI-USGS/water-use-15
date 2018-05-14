//Robin Osborne's Technique https://www.robinosborne.co.uk/2016/05/16/lazy-loading-images-dont-rely-on-javascript/
var lazy = [];

registerListener('load', setLazy);
registerListener('load', lazyLoad);
registerListener('scroll', lazyLoad);
registerListener('resize', lazyLoad);

function setLazy(){
    lazy = document.getElementsByClassName('lazy');
} 

function lazyLoad(){
    for(var i=0; i<lazy.length; i++){
        if(isInViewport(lazy[i])){
    			lazy[i].style.transition="opacity 2s";
    			lazy[i].style.opacity= 1;
            if (lazy[i].getAttribute('data-src')){
                //Check to see if the browser allows the picture element
                if(lazy[i].getAttribute('srcset')){
                  lazy[i].setAttribute('srcset', lazy[i].getAttribute('data-src'));
                //If not it loaded the backup image and needs to switch the src not the srcset
                }else{
                  lazy[i].src = lazy[i].getAttribute('data-src');
                }
                lazy[i].removeAttribute('data-src');
            }
        }
    }
    
    cleanLazy();
}

function cleanLazy(){
    lazy = Array.prototype.filter.call(lazy, function(l){ return l.getAttribute('data-src');});
}

function isInViewport(el){
    var rect = el.getBoundingClientRect();
    
    return (
        rect.bottom >= 0 && 
        rect.right >= 0 && 
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) && 
        rect.left <= (window.innerWidth || document.documentElement.clientWidth)
     );
}

function registerListener(event, func) {
    if (window.addEventListener) {
        window.addEventListener(event, func);
    } else {
        window.attachEvent('on' + event, func);
    }
}