//eh, have no time for this, something's wrong with the context
class Logger{
    
    constructor (containerEl, replaceOrig = true){
        this.container = containerEl;
        this.oldLog = null;
        if(replaceOrig){
           this.oldLog = console.log;
           console.log = () => this.apply(this,arguments);
        }
    }
    
    log(){
       
        if(this.oldLog){
            this.oldLog.apply(this, arguments)
            //this.origLog(...arguments);
        }else{
            //console.log(...arguments);
        }
        let args = Array.from(arguments);
        args.forEach(arg => {
            let str = 'Logger: failed getting string out of arg';//default value
            try{
                str = JSON.stringify(arg);
            }catch(error){
                
            };
            let itemEl = document.createElement("p"); 
            itemEl.textContent = (str);
            this.container.appendChild(itemEl);
        });
    }
}
