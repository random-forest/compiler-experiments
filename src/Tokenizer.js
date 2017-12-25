const R = require('ramda');

const WORD      = /\w+/;
const DIGIT     = /^\d|\d\.\d$/;
const STRING    = /^\'\w+\'$/;
const EOL       = ';';
const DEFINE    = 'define';
const RETURN    = 'return';
const ARROW     = '->';
const L_PAREN   = /\[/;
const R_PAREN   = /\]/;

// ---------------------------- Types -----------------------------------
const IDENTIFIER      = 'Identifier';
const CALLIDENTIFIER  = 'CallIdentifier';
const RETURNSTATEMENT = 'ReturnStatement';
const OPERATOR        = 'Operator';
const ARROWSTATEMENT  = 'ArrowStatement';

module.exports = function ( array ) {
    let index  = 0;
    let carret = 0;
    let expr   = [];
    let result = [];

    while (index < R.length(array)) {
        let node = array[index];
        let {value, line, char} = node;
        let obj = {
            line,
            char
        };

        if ( value !== EOL ) {

            if (WORD.test(value)) {
                if ( value === DEFINE ) {
                    Object.assign(obj, { type: CALLIDENTIFIER, value });
                } 
                
                else {
                    if ( value === RETURN ) {
                        Object.assign(obj, { type: RETURNSTATEMENT, value });
                    }

                    else {
                        Object.assign(obj, { type: IDENTIFIER, value });
                    }
                }
                
            }
            
            // if (DIGIT.test(value)) {
            //     Object.assign(obj, { type: 'NUMBER', value });
            // }

            // if (STRING.test(value)) {
            //     Object.assign(obj, { type: 'STRING', value });
            // }

            if (/[\+|\-|\=|\*|\/]/.test(value)) {
                let parent = R.head(R.filter( n => n.type === IDENTIFIER, expr));

                if (!/\-\>/.test(value)) {
                    Object.assign(obj, { type: OPERATOR, value });
                }

            }

            if (/[\[|\]]/.test(value)) {
                if ( L_PAREN.test(value) ) {
                    Object.assign(obj, { type: 'L_Paren', value });
                }

                else {
                    Object.assign(obj, { type: 'R_Paren', value });
                }
            }

            if ( value == ARROW ) {
                Object.assign(obj, { type: ARROWSTATEMENT, value });
            }
            
            if (obj.hasOwnProperty('type')) {
                expr.push(obj);
            }
        } else {
            Object.assign(obj, { type: 'EOL', value });
            expr.push(obj);

            result.push(expr);
            expr = [];
        }

        ++index;
    }

    return result;
}