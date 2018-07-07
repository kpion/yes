# "Yes" : Introduction

"Yes" - Javascript (experimental) wrapper around querySelector and querySelectorAll with the Proxy object and extending the Array class. 3KB minified.

"Yes" comes from a mispelled "Yet Another Selector" :)


I.e. the jQuery-like library (limited to selecting and manipulating elements though), based on **native DOM API**.

This is alpha stage.

Instead of doing (in vanilla javascript):

```
    document.querySelectorAll('.some-class').forEach(elem => {
        elem.setAttribute ('title', 'new title');
    });   
```

You can do:

```
    y('.some-class').setAttribute ('title', 'new title');
```

This works because the "y" object above will simply call `setAttribute` on all the matching elements. Same with properties, instead of :

```
    document.querySelectorAll('.some-class').forEach(elem => {
        elem.style.color = '#999';
    });  
```

You can do:

```
    y('.some-class').style.color = '#999';
```

This is done thanks to the [Proxy Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)  - we just 'trap' the calls/property access and pass it to the list of matching nodes.

And, thanks to the fact that "Yes" extends (inherits from) the Array class, we can do something like:

```
    //only divs:
    let filtered = y(y('.some-class').filter(elem => elem.tagName === 'DIV'));
    filtered.style.border = '10px solid #aad';
```
And of course forEach:

```
    y('.some-class').forEach(elem => {
        elem.style.textShadow ='-2px -2px 2px #bbb';
    });
```                    

See 'index.html' file.