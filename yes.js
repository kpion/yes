(function (window) {
    Utils = {
        ///////////////////////////////////////
        //internal:
        /*
         * 
         * returns /sets a value in a object.subobject etc by given "path", like here:
         objPath ({a: {b: {c: 'hello'}}, ['a', 'b', 'c']};
         will return 'hello'.
         if keyChain is empty, the obj itself will be returned.
         */
        objPath(obj, keyChain, newVal = undefined) {
            let cur = obj;
            if (typeof newVal !== 'undefined') {
                let prev = cur;
                keyChain.forEach((key, index) => {
                    prev = cur[key];
                    if (index === (keyChain.length - 1)) {
                        cur[key] = newVal;
                    }
                    cur = cur[key];

                });
                return  prev;
            }

            keyChain.forEach((key, index) => {
                cur = cur[key];

            });
            return cur;
        }

    };
    /*
     * 
     * new in 0.00001 - extends Array. seems to work, but... later. 
     */
    class Yes extends Array{

        constructor(selector, context = null, workingWithPropertyChain = null) {
            super();
            this.length = 0;
            this.nodes = [];
            this.context = context || document;
            this.workingWithPropertyChain = workingWithPropertyChain;
            let dbgInstantiationMethod = 'unknown';//debug purposes only

            if (typeof selector === 'string' && selector !== '') {
                dbgInstantiationMethod = 'string';
                this.nodes = Array.from(this.context.querySelectorAll(selector));
                //super.push(...Array.from(this.context.querySelectorAll(selector)));
                //console.log(this);
            } else if (selector instanceof HTMLElement) {
                dbgInstantiationMethod = 'HTMLElement';
                this.nodes = [selector];
            } else if (selector instanceof NodeList || selector instanceof HTMLCollection || selector instanceof Array) {
                dbgInstantiationMethod = 'NodeList or HTMLCollection or Array';
                this.nodes = Array.from(selector);
                //this.nodes = Array.from(selector); 
            } else if (selector instanceof Yes) {
                //copying to ourselves
                Object.assign(this, selector);
            }

            //This is so we can access the object with [index]: (@todo: since we're trapping the 'get', then maybe there isnumber(prop)... return node[prop] would be fine?)
            //@todo that is stupid, we shouldn't have .nodes at all.
            //if(0)
            if (this.nodes.length) {
                this.length = this.nodes.length;
                for (var i = 0; i < this.nodes.length; i++) {
                    this[i] = this.nodes[i];
                }
            }
            console.log(`Yes class instantiated (method: ${dbgInstantiationMethod} )`);
            if (workingWithPropertyChain) {
                console.log('   instantiated with workingWithPropertyChain: ', workingWithPropertyChain);
            }
            console.log('   nodes:', this.nodes);
            
        }

        //methods:
        
        //exceptionally - only to return 'this', so we can do chaining.
        /*forEach(elem) {
            //this.nodes.forEach(elem);
            super.forEach(elem);
            return this;
        };*/

        //traps:	

        //target here is *we* - the Yes instance (this), and prop is (string) property being called, 
        //- a property or method
        //receiver is 'this' proxied, as in "Proxy(this)";
        get(target, prop, receiver) {
            //console.log('is same:',this === target);//true.
            console.log('::get called, for prop: ', prop);
            //console.log('  receiver:' ,receiver);
            //console.log('  target:' ,target);
            console.log('  with target.workingWithPropertyChain:', target.workingWithPropertyChain);

            let propNameChain = target.workingWithPropertyChain ? target.workingWithPropertyChain : [];
            propNameChain.push(prop);
            console.log('  propNameChain:', propNameChain);
            
            
            //first - is it maybe our own thing? This could be [0] - first element, or .forEach or
            //.filter or any other Array method (from wich we inherit).
            if (typeof target[prop] !== 'undefined') {
                console.log(`  mode: ${prop} is defined in ourselves`);
                
                //tests: (testing if prop is string is only to just *not* check e.g. [1])
                //if(false)
                if(typeof prop === 'string' && typeof target[prop] === 'function'){
                    return function (...args) {
                        let retVal = target[prop](...args);
                        /*if(typeof retVal === 'undefined'){
                            return retVal;
                        }*/
                        console.log('    our own function retval:',retVal);
                        return retVal;
                    };
                }
                //not a function, probably an index, like [0]
                return target[prop];//works fine, but e.g.  .forEach, .filter or .map wasn't wrapped around Yes, so trying this:
            }

            //there is nothing todo, lets return ourselves to enable chaining: 
            if (target.nodes.length === 0) {
                console.log('   nodes array empty, returning ourselves');
                return receiver;
            }

            //lets get the type of the property name in NODES. Can be simple string (like .id, .className), object (style), or function (getAttribute)
            let nodesPropertyType = null;

            //lets also collect those with type = object, this is to handle .style.color = 'red';//here we'll catch the situation where 'style' is an object
            let nodesWithPropertyAsObject = [];

            target.forEach((elem) => {
                //let type = typeof elem[prop];//{string}
                let type = typeof Utils.objPath(elem, propNameChain);
                console.log('  elem[prop] type: ', type);
                if (nodesPropertyType !== null && nodesPropertyType !== type) {
                    //@todo: not really sure what to do about this situation:
                    console.error(`  property ${prop} type varies across nodes!`);
                }
                nodesPropertyType = type;
                if (type === 'object') {
                    nodesWithPropertyAsObject.push(elem);
                }
            });

            console.log(`  property (${prop}) seems to be of type ${nodesPropertyType}, therefore:`);

            //e.g. .style, or .classList : 
            if (nodesPropertyType === 'object') {
                console.log(`  mode: ${prop} seems to be an object, returning new Yes instance with the nodes having it`);
                //this used to work with 2 levels of props:
                //return yes(nodesWithPropertyAsObject, target.context, prop);
                return yes(nodesWithPropertyAsObject, target.context, propNameChain);

            }
            //it has to be a function call, like .setAttribute(...)  but also .getAttribute()  
            if (nodesPropertyType === 'function') {
                console.log(`  mode: ${prop} seems to be a function, therefore we return a function:`);
                return function (...args) {

                    console.log('  called function returned by "yes" object,  args:', args);
                    let retVal;//undefined for start
                    target.forEach((elem) => {
                        //ehhh we need those, because we need the context in which we call a function.
                        //hence we'll later use .call
                        let elemProp = Utils.objPath(elem, propNameChain);
                        let elemPrevProp = Utils.objPath(elem, propNameChain.slice(0, propNameChain.length - 1));
                        retVal = elemProp.call(elemPrevProp, ...args);
                    });

                    if (typeof retVal !== 'undefined') {
                        console.log('   retval:', retVal);
                        return retVal;
                    }
                    //trying to allow chaining... seems it's working.
                    return receiver;
                };
            }
            ;

            console.log(`  mode: ${prop} seems to be a string or number or... something else, nvm. We'll return the first node thing `);
            let firstElem = target.nodes[0];
            return Utils.objPath(firstElem, propNameChain);
        }

        /*
         this catches .style = 'blah'; But not .style.color = 'blah', this is why we do the magic in 'get' above, with nodesWithPropertyAsObject
         */
        set(target, prop, value) {
            //console.log('is same:',this === target);//true.
            console.log('::set called, for prop:', prop, 'val:', value);
            console.log('  target.workingWitProperty:', target.workingWitProperty);

            let propNameChain = target.workingWithPropertyChain ? target.workingWithPropertyChain : [];
            propNameChain.push(prop);
            console.log('  propNameChain:', propNameChain);

            target.forEach((elem) => {
                let type = typeof elem[prop];
                console.log('  elem type:', type);
                console.log('  elem val: ', elem[prop]);
                //if (type !== 'function')
                {
                    Utils.objPath(elem, propNameChain, value);
                }
            });

        }
    }

    /////////
    //End of class Yes definition

    function yes(selector, context = null, workingWitProperty = null) {
        let yInstance = new Yes(selector, context, workingWitProperty);
        return new Proxy(yInstance, yInstance);
    }

    //
    Yes.fn = Yes.prototype;
    window.yes = yes;


})(window);
