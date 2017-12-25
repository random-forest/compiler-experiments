const R = require('ramda');

module.exports = function ( inputStream ) {
    let lineIndex = 0;
    let result = [];
    
    while ( lineIndex < R.length(inputStream) ) {
        let line = inputStream[lineIndex].split(' ');
        
        R.map( node => {
            let nodeIndex = R.indexOf(node, line);
            
            if ( R.indexOf(';', node) !== -1 ) {
                result.push({
                    line: R.inc(lineIndex),
                    char: R.inc(nodeIndex),
                    value: R.head(node.split(';'))
                });

                result.push({
                    line: R.inc(lineIndex),
                    char: R.inc(nodeIndex),
                    value: ';'
                });
            } else {
                if ( R.indexOf('[', node) !== -1 ) {
                    result.push({
                        line: R.inc(lineIndex),
                        char: R.inc(nodeIndex),
                        value: '['
                    });

                    result.push({
                        line: R.inc(lineIndex),
                        char: R.inc(nodeIndex),
                        value: node.split('[').pop()
                    });

                }

                else if ( R.indexOf(']', node) !== -1 ) {
                    result.push({
                        line: R.inc(lineIndex),
                        char: R.inc(nodeIndex),
                        value: R.head(node.split(']'))
                    });

                    result.push({
                        line: R.inc(lineIndex),
                        char: R.inc(nodeIndex),
                        value: ']'
                    });
                }

                else {
                    result.push({
                        line: R.inc(lineIndex),
                        char: nodeIndex,
                        value: node
                    });
                }

            }

        }, line);
    
        ++lineIndex;
    }
    //console.log(result)
    return result;
}