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
            // [":=", "return ':='"],
            ["\\*", "return '*'"],
            ["\\/", "return '/'"],
            ["-", "return '-'"],
            ["\\+", "return '+'"],
            ["!", "return '!'"],
            ["\\{", "return '{'"],
            ["\\}", "return '}'"],
            ["\\(", "return '('"],
            ["\\)", "return ')'"],
            ["\\{", "return '{'"],
            ["\\}", "return '}'"],
            ["\\,", "return 'COMMA'"],
            ["\\:", "return 'COLON'"],
            ["True", "return 'TRUE'"],
            ["False", "return 'FALSE'"],
            ["Bool", "return 'BOOL'"],
            ["Int", "return 'INT'"],
            ["Vec", "return 'VEC'"],
            ["function", "return 'FUNC'"],
            ["[a-zA-Z][ a-zA-Z0-9]*", "return 'ID'"],
            ["^$", "return 'ε'"],
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

    // "start": "ALL",

    "bnf": {

        "expressions": [
            ["e EOF", "return $1"],
            ["function EOF", "return $1"],
            ["lista_paramametros EOF", "return $1"],
            ["block EOF", "return $1"],  
        ],

        "function": [[ "FUNC ID lista_paramametros", "$$ = new Func($2, '', $3, {});" ]],

        "tipo": [[ "INT", "$$ = new IntType();" ],
                 [ "BOOL", "$$ = new BoolType();" ],
                 [ "VEC", "$$ = new VecType();" ]],


        "parametro": [[ "ID COLON tipo", "$$ = new Param($1, $3);" ]],

        "lista_no_vacia": [ [ "parametro", "$$ = new Params([$1])" ],
                            [ "parametro COMMA lista_no_vacia", "$$ = $3.add($1);" ]],

        "lista_paramametros": [ [ "ε", "$$ = new Params([]);" ], 
                                [ "lista_no_vacia", "$$ = $1;" ]],


        "block": [ ["{ }", "$$ = new Block([])"] ],
        
        "e": [
            
            ["e ^ e", "$$ = Math.pow($1, $3)"],
            ["e !", "$$ = (function(n) {if(n==0) return 1; return arguments.callee(n-1) * n})($1)"],
            ["e %", "$$ = $1/100"],
            ["- e", "$$ = -$2", { "prec": "UMINUS" }],
            ["E", "$$ = Math.E"],
            ["PI", "$$ = Math.PI"],
            //
            //["e + e", "$$ = new Suma($1, $3)"],
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
