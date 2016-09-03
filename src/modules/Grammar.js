export default {
    "comment": "Gramática para el lenguaje Cucaracha",

    "lex": {
        "rules": [
            ["\\s+", "/* skip whitespace */"],            
            ["$", "return 'EOF'"],
            ["[0-9]+", "return 'NUMBER'"],

            ["\\(", "return 'LPAREN'"],
            ["\\)", "return 'RPAREN'"],
            ["\\[", "return 'LBRACK'"],
            ["\\]", "return 'RBRACK'"],
            ["\\{", "return 'LBRACE'"],
            ["\\}", "return 'RBRACE'"],
            ["\\,", "return 'COMMA'"],
            ["\\:=", "return 'ASSIGN'"],
            ["\\:", "return 'COLON'"],
            ["\\#", "return 'HASH'"],
            ["\\<=", "return 'LE'"], 
            ["\\>=", "return 'LE'"], 
            ["\\<", "return 'LT'"], 
            ["\\>", "return 'GT'"], 
            ["\\==", "return 'EQ'"], 
            ["\\!=", "return 'NE'"], 
            ["\\+", "return 'PLUS'"],   
            ["\\-", "return 'MINUS'"],  
            ["\\*", "return 'TIMES'"], 
            ["\\/", "return 'DIV'"],

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
        ["left", "PLUS", "MINUS"],
        ["left", "TIMES", "DIV"]
    ],

    // "start": "ALL",
    "tokens": "( ) { } [ ] :",

    "bnf": {

        "expressions": [
            ["e EOF", "return $1"],
            ["function EOF", "return $1"],
            ["lista_paramametros EOF", "return $1"],
            ["block EOF", "return $1"],  
        ],

        "function": [[ "FUNC ID ( lista_paramametros ) block", "$$ = new Func($2, '', $4, $6);" ]],

        "tipo": [[ "INT", "$$ = new IntType();" ],
                 [ "BOOL", "$$ = new BoolType();" ],
                 [ "VEC", "$$ = new VecType();" ]],


        "parametro": [[ "ID COLON tipo", "$$ = new Param($1, $3);" ]],

        "lista_no_vacia": [ [ "parametro", "$$ = new Params([$1])" ],
                            [ "parametro COMMA lista_no_vacia", "$$ = $3.add($1);" ]],

        "lista_paramametros": [ [ "ε", "$$ = new Params([]);" ], 
                                [ "lista_no_vacia", "$$ = $1;" ]],

        "block": [ ["LBRACE RBRACE", "$$ = new Block([])"] ],
        
        "e": [
            ["e PLUS e", "$$ = new Suma($1, $3)"],
            ["e MINUS e", "$$ = new Resta($1, $3)"],
            ["e TIMES e", "$$ = new Mult($1,$3)"],
            ["e DIV e", "$$ = new Div($1,$3)"],
            ["LPAREN e RPAREN", "$$ = $2"],
            // ["ID := e", "$$ = new Assign($1, $3)"],
            ["NUMBER", "$$ = new Int(yytext)"],
            ["BOOL", "$$ = new Bool(yytext)"],
            // ["ID", "$$ = yytext"],
            ["FUNC ", "$$ = new Func('dsd', 'type', [], '')"],
        ]
    }
}
