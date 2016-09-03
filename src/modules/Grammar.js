export default {
    "comment": "Gramática para el lenguaje Cucaracha",

    "lex": {
        "rules": [
            ["\\s+", "/* skip whitespace */"],            
            ["$", "return 'EOF'"],
            ["[0-9]+", "return 'NUM'"],

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
            ["and", "return 'AND'"],
            ["else", "return 'ELSE'"],
            ["fun", "return 'FUN'"],
            ["if", "return 'IF'"],
            ["not", "return 'NOT'"],
            ["or", "return 'OR'"],
            ["return", "return 'RETURN'"],
            ["while", "return 'WHILE'"],

            ["True", "return 'TRUE'"],
            ["False", "return 'FALSE'"],
            ["Bool", "return 'BOOL'"],
            ["Int", "return 'INT'"],
            ["Vec", "return 'VEC'"],
            
            ["[a-zA-Z][ a-zA-Z0-9]*", "return 'ID'"],
            ["^$", "return 'ε'"],
        ]
    },

    "operators": [
        ["left", "PLUS", "MINUS"],
        ["left", "TIMES", "DIV"],
        ["left", "AND", "OR"]
    ],

    "tokens": "( ) { } [ ] :",

    "bnf": {

        "expressions": [
            ["function ", "return $1"],
            ["block", "return $1"],  
            ["lista_expresiones EOF", "return $1"]
        ],

        "function": [[ "FUN ID LPAREN lista_paramametros RPAREN block", "$$ = new Fun($2, new VoidType(), $4, $6);" ],
                     [ "FUN ID LPAREN lista_paramametros RPAREN COLON tipo block", "$$ = new Fun($2, $7, $4, $8);" ]],

        "tipo": [[ "INT", "$$ = new IntType();" ],
                 [ "BOOL", "$$ = new BoolType();" ],
                 [ "VEC", "$$ = new VecType();" ]],


        "parametro": [[ "ID COLON tipo", "$$ = new Param($1, $3);" ]],

        "lista_no_vacia": [ [ "parametro", "$$ = new Params([$1])" ],
                            [ "parametro COMMA lista_no_vacia", "$$ = $3.add($1);" ]],

        "lista_paramametros": [ [ "", "$$ = new Params([]);" ], 
                                [ "lista_no_vacia", "$$ = $1;" ]],

        "block": [ ["LBRACE RBRACE", "$$ = new Block([])"] ],


        "lista_expresiones_no_vacia": [ [ "expresion", "$$ = new Params([$1])" ],
                            [ "expresion COMMA lista_expresiones_no_vacia", "$$ = $3.add($1);" ]],

        "lista_expresiones": [ [ "", "$$ = new Params([]);" ], 
                                [ "lista_expresiones_no_vacia", "$$ = $1;" ]],

        "expresion": [  ["expresion_logica", "$$ = $1"], ],

        "expresion_atomica": [  ["ID", "$$ = new ExprVar($1)"],
                                ["NUM", "$$ = new Int(yytext)"],
                                ["TRUE", "$$ = new Bool(true)"],
                                ["False", "$$ = new Bool(false)"],
                                ["LBRACK lista_expresiones RBRACK", "$$ = new ExprVecLength($2)"],
                                ["HASH ID", "$$ = new ExprVecLength($2)"],
                                ["ID LBRACK expresion RBRACK", "$$ = new ExprVecDeref($1, $3)"],
                                ["ID LPAREN lista_expresiones RPAREN", "$$ = new ExprVecDeref($1, $3)"],
                                ["LPAREN expresion RPAREN", "$$ = $2"] ],

        "expresion_multiplicativa": [ ["expresion_multiplicativa TIMES expresion_atomica", "$$ = new Mult($1,$3)"],
                                      ["expresion_atomica", "$$ = $1"] ],

        "expresion_aditiva": [ ["expresion_aditiva PLUS expresion_multiplicativa", "$$ = new Plus($1,$3)"],
                               ["expresion_aditiva MINUS expresion_multiplicativa", "$$ = new Minus($1,$3)"],
                               ["expresion_multiplicativa", "$$ = $1"] ],

        "expresion_relacional": [   ["expresion_aditiva LE expresion_aditiva", "$$ = new Plus($1,$3)"],
                                    ["expresion_aditiva GE expresion_aditiva", "$$ = new Minus($1,$3)"],
                                    ["expresion_aditiva LT expresion_aditiva", "$$ = new Minus($1,$3)"],
                                    ["expresion_aditiva GT expresion_aditiva", "$$ = new Minus($1,$3)"],
                                    ["expresion_aditiva EQ expresion_aditiva", "$$ = new Minus($1,$3)"],
                                    ["expresion_aditiva NE expresion_aditiva", "$$ = new Minus($1,$3)"],
                                    ["expresion_aditiva", "$$ = $1"] ],

        "expresion_logica_atomica": [ ["NOT expresion_logica_atomica", "$$ = $2"],
                                      ["expresion_relacional", "$$ = $1"] ],

        "expresion_logica": [ ["expresion_logica AND expresion_logica_atomica", "$$ = $2"],
                                ["expresion_logica OR expresion_logica_atomica", "$$ = $2"],
                                ["expresion_logica_atomica ", "$$ = $1"], ],

    }
}
