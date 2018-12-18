var tokenizer2 = require('tokenizer2');
 
const tokenizer = {

    tokenize(input) {
        return new Promise((resolve, reject) => {
            const res = []
        
            //create a readable/writeable stream
            const token_stream = tokenizer2();
        
            //make some rules
            token_stream.addRule(/^[\s]+$/                        , 'whitespace');
            token_stream.addRule(/:([a-zA-Z0-9àâéêèìôùûç_]+):/g   , 'icon');
            token_stream.addRule(/("([^"]|"")*")/g                , 'option');
            token_stream.addRule(/anonyme/                        , 'anonyme');
            
            //write some info to the console
            token_stream.on('data', function(token){
                res.push(token)
            });
            
            var Readable = require('stream').Readable
            var s = new Readable
            s.push(input)    // the string you want
            s.push(null)      // indicates end-of-file basically - the end of the stream
            token_stream.on('end', () => resolve(res));
            s.pipe(token_stream);
        }).then((res) => res.filter(item => item.type !== "whitespace"))
    }

}

module.exports = tokenizer;

