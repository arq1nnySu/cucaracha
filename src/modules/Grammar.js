export default {
    "comment": "Gramática para el lenguaje Cucaracha",

    "lex": {
        "rules": [
            ["\\s+", "/* skip whitespace */"],
            
            
            ["\\^", "return '^'"],
            ["!", "return '!'"],
            ["%", "return '%'"],
            ["PI\\b", "return 'PI'"],
            ["E\\b", "return 'E'"],
            ["$", "return 'EOF'"],
            //
            ["[0-9]+", "return 'NUMBER'"],
            ["[ a-zA-Z][ a-zA-Z0-9]*", "return 'ID'"],
            // [":=", "return ':='"],
            ["\\*", "return '*'"],
            ["\\/", "return '/'"],
            ["-", "return '-'"],
            ["\\+", "return '+'"],
            ["!", "return '!'"],
            ["\\(", "return '('"],
            ["\\)", "return ')'"],
            ["True|False", "return 'BOOL'"],
            ["function ID", "return 'FUNC'"],
        ]
    },

    "operators": [
        ["left", "+", "-"],
        ["left", "*", "/"],
        ["left", "^"],
        ["right", "!"],
        ["right", "%"],
        ["left", "UMINUS"]
    ],

    "bnf": {
        "expressions": [
            ["e EOF", "return $1"]
        ],

        "e": [
            
            ["e ^ e", "$$ = Math.pow($1, $3)"],
            ["e !", "$$ = (function(n) {if(n==0) return 1; return arguments.callee(n-1) * n})($1)"],
            ["e %", "$$ = $1/100"],
            ["- e", "$$ = -$2", { "prec": "UMINUS" }],
            ["E", "$$ = Math.E"],
            ["PI", "$$ = Math.PI"],
            //
            ["e + e", "$$ = new Suma($1, $3)"],
            ["e - e", "$$ = new Resta($1, $3)"],
            ["e * e", "$$ = new Mult($1,$3)"],
            ["e / e", "$$ = new Div($1,$3)"],
            ["( e )", "$$ = $2"],
            // ["ID := e", "$$ = new Assign($1, $3)"],
            ["NUMBER", "$$ = new Int(yytext)"],
            ["BOOL", "$$ = new Bool(yytext)"],
            // ["ID", "$$ = yytext"],
            ["FUNC ", "$$ = new Func('dsd', 'type', [], '')"],
        ]
    }
}
