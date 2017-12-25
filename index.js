const R  = require('ramda');
const fs = require('fs');

const scanner = require('./src/Scanner');
const tokenize = require('./src/Tokenizer');

const INPUT_PATH = './in';
const ENCODING   = 'utf8';
const ENDOFLINE  = '\r\n';

const input       = fs.readFileSync(INPUT_PATH, { encoding: ENCODING });
const inputStream = input.split(ENDOFLINE);

const tokens = tokenize(scanner(inputStream));

let index = 0;

function descent(obj, next) {
    let last = R.reverse(next)[next.length - 1]
    
    if (obj.type === 'Identifier') {
        Object.assign(obj, { right: last.value })
    }
    
    if (obj.type === 'CallIdentifier') {
        Object.assign(obj, { right: last.value })
    }
    
    
    if (obj.type === 'Operator') {
        Object.assign(obj, { operator: obj.value })
    }
    
    last && Object.assign(obj, { right: last });

    next.length > 0 && descent(last, R.tail(next));

    return obj;
}

function getType(nodes) {
    if (nodes[0].type === 'Identifier' && 
        nodes[1].type === 'Operator' && 
        nodes[1].value === '=') 
    {
        return 'VariableDeclaration';
    }

    if (nodes[0].type === 'CallIdentifier' && 
        nodes[1].type === 'Identifier' && 
        nodes[2].type === 'L_Paren' &&
        nodes[3].type === 'Identifier') 
        {
            return 'FunctionDeclaration';
        }
}

let expr = [];
let heap = [];

let i = 0;

while (i < R.length(tokens)) {
    let line = tokens[i];
    let k = 0;
    
    for (let j = 0; j < R.length(line); j++) {
        let prev    = line[R.dec(j)] || line[j];
        let current = line[j];
        let next    = line[R.inc(j)] || line[j];

        if (current.type === 'Identifier' && 
            prev.type !== 'CallIdentifier' && 
            prev.type !== 'L_Paren' && 
            next.type !== 'R_Paren') {
            
            if (next.value === '=') {
                Object.assign(current, { type: 'VariableDeclaration' })
                //expr.push('var');
            }


            expr.push(current);

            if (next.type === 'Operator') {
                expr.push(next);
            }
        }

        else {
            if (current.type !== 'Operator' && current.type !== 'EOL') {
                if (current.type === 'CallIdentifier' && next.type === 'Identifier') {
                    Object.assign(next, { type: 'FunctionDeclaration' })
                    expr.push(next);
                }

                if ( current.type === 'L_Paren' && next.type === 'Identifier' ) {
                    Object.assign(current, { type: 'ArgumentsList' })
                    expr.push(current);
                    Object.assign(next, { type: 'ArgumentsItem' })
                    expr.push(next);
                }

                if ( current.type === 'Identifier' && next.type === 'R_Paren' ) {
                    Object.assign(current, { type: 'ArgumentsItem' })
                    expr.push(current);
                    Object.assign(next, { type: 'ArgumentsList' })
                    expr.push(next);
                }

                if (current.type === 'ArrowStatement') {
                    Object.assign(current, { type: 'BlockStatement' })
                    expr.push(current)
                }

                if (current.type === 'ReturnStatement') {
                    expr.push(current)
                }
            }
            if (current.type === 'EOL') {
                expr.push(current);
                let ast = rDescent(k, expr);
                console.dir(ast)
                console.dir('-----------')
                expr = [];
                break;
            }
        }
    }

    ++i;
}


function rDescent(pos, nodes) {
    let parent = nodes[Math.abs(pos - 1)];
    let node   = nodes[pos];
    let next   = nodes[Math.abs(pos + 1)];

    
    if (node.type !== 'FunctionDeclaration') {
        Object.assign(node, { next });
    }
    
    if (pos < nodes.length - 1) {
        rDescent(++pos, nodes);
        
        if (node.type === 'FunctionDeclaration') {
            walk(Object.assign(node, { arguments: [], body: [] }), next)
        }
        
        return node;
    }

}

function walk(curr, next) {
    if (next && next.hasOwnProperty('next') ) {
        if (curr) {
            let prop = R.dissoc('next', R.prop('next', next));
            
            if (prop.type === 'ArgumentsItem') {
                Object.assign(curr, {
                    arguments: [
                        ...curr.arguments,
                        prop
                    ]
                });
            }
    
            else {
                if (prop.type !== 'ArgumentsList') {
                    if (prop.type === 'BlockStatement') {
                        Object.assign(curr, {
                            body: [
                                ...curr.body,
                                R.prop('next', next).next
                            ]
                        });
                    }
    
                    else {
                        if (prop.type === 'ReturnStatement') {
                            Object.assign(curr, {
                                body: [
                                    ...curr.body,
                                    R.prop('next', next)
                                ]
                            });
                        }
                    }
                }
            }
    
            curr && walk(curr.next, next.next);
            return curr;
        }
    }

}

