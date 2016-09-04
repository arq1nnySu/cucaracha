export default {
    "comment": "Gramática para el lenguaje Cucaracha",

    "lex": {
        "rules": [
            ["\\s+", "/* skip whitespace */"],
            ["\\--*$", "COMMENT"],
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
            ["\\>=", "return 'GE'"], 
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
        ["left", "TIMES", "DIV"],
        ["left", "PLUS", "MINUS"],
        ["nonassoc", "LE", "GE", "LT", "GT", "EQ", "NE"],
        ["left", "NOT"],
        ["left", "AND", "OR"] 
    ],

    "tokens": "BOOL, INT, VEC, TRUE, FALSE, AND, ELSE, FUN, IF, NOT, OR, RETURN, WHILE",

    "bnf": {

        "expressions": [
            ["programa EOF", "return $1"]
        ],

        "programa": [ [ "", "$$ = new Program();" ],
                      [ "function programa", "$$ = $2.add($1);" ]],

        "function": [[ "FUN ID LPAREN lista_paramametros RPAREN bloque", "$$ = new Fun($2, new UnitType(), $4, $6);" ],
                     [ "FUN ID LPAREN lista_paramametros RPAREN COLON tipo bloque", "$$ = new Fun($2, $7, $4, $8);" ]],


        "tipo": [[ "INT", "$$ = new IntType();" ],
                 [ "BOOL", "$$ = new BoolType();" ],
                 [ "VEC", "$$ = new VecType();" ]],
        
        "instruccion" : [["ID ASSIGN expresion", "$$ = new StmtAssign($1, $3);"],
                         ["ID LBRACK expresion RBRACK ASSIGN expresion", "$$ = new StmtVecAssign($1, $3, $6);"],
                         ["IF expresion bloque", "$$ = new StmtIf($2, $3);"],
                         ["IF expresion bloque ELSE bloque", "$$ = new StmtIfElse($2, $3, $5);"],
                         ["WHILE expresion bloque", "$$ = new StmtWhile($2, $3);"],
                         ["RETURN expresion", "$$ = new StmtReturn($2);"],
                         ["ID LPAREN lista_expresiones RPAREN", "$$ = new StmtCall($1, $3);"]],

        "lista_instrucciones" : [[ "", "$$ = new Arrays();" ],
                                 [ "instruccion lista_instrucciones", "$$ = $2.add($1);" ]],

        "parametro": [[ "ID COLON tipo", "$$ = new Parameter($1, $3);" ]],

        "lista_no_vacia": [ [ "parametro", "$$ = new Arrays($1)" ],
                            [ "parametro COMMA lista_no_vacia", "$$ = $3.add($1);" ]],

        "lista_paramametros": [ [ "", "$$ = new Arrays();" ], 
                                [ "lista_no_vacia", "$$ = $1;" ]],

        "bloque": [ ["LBRACE lista_instrucciones RBRACE", "$$ = new Block($2)"] ],


        "lista_expresiones_no_vacia": [ [ "expresion", "$$ = new Arrays($1)" ],
                            [ "expresion COMMA lista_expresiones_no_vacia", "$$ = $3.add($1);" ]],

        "lista_expresiones": [ [ "", "$$ = new Arrays();" ], 
                                [ "lista_expresiones_no_vacia", "$$ = $1;" ]],

        "expresion": [  ["expresion_logica", "$$ = $1"], ],

        "expresion_atomica": [  ["ID", "$$ = new ExprVar($1)"],
                                ["NUM", "$$ = new ExprConstNum(yytext)"],
                                ["TRUE", "$$ = new ExprConstBool(true)"],
                                ["FALSE", "$$ = new ExprConstBool(false)"],
                                ["LBRACK lista_expresiones RBRACK", "$$ = new ExprVecLength($2)"],
                                ["HASH ID", "$$ = new ExprVecLength($2)"],
                                ["ID LBRACK expresion RBRACK", "$$ = new ExprVecDeref($1, $3)"],
                                ["ID LPAREN lista_expresiones RPAREN", "$$ = new ExprVecDeref($1, $3)"],
                                ["LPAREN expresion RPAREN", "$$ = $2"] ],

        "expresion_multiplicativa": [ ["expresion_multiplicativa TIMES expresion_atomica", "$$ = new ExprMul($1,$3)"],
                                      ["expresion_atomica", "$$ = $1"] ],

        "expresion_aditiva": [ ["expresion_aditiva PLUS expresion_multiplicativa", "$$ = new ExprAdd($1,$3)"],
                               ["expresion_aditiva MINUS expresion_multiplicativa", "$$ = new ExprSub($1,$3)"],
                               ["expresion_multiplicativa", "$$ = $1"] ],

        "expresion_relacional": [   ["expresion_aditiva LE expresion_aditiva", "$$ = new ExprLe($1,$3)"],
                                    ["expresion_aditiva GE expresion_aditiva", "$$ = new ExprGe($1,$3)"],
                                    ["expresion_aditiva LT expresion_aditiva", "$$ = new ExprLt($1,$3)"],
                                    ["expresion_aditiva GT expresion_aditiva", "$$ = new ExprGt($1,$3)"],
                                    ["expresion_aditiva EQ expresion_aditiva", "$$ = new ExprEq($1,$3)"],
                                    ["expresion_aditiva NE expresion_aditiva", "$$ = new ExprNe($1,$3)"],
                                    ["expresion_aditiva", "$$ = $1"] ],

        "expresion_logica_atomica": [ ["NOT expresion_logica_atomica", "$$ = new ExprNot($2)"],
                                      ["expresion_relacional", "$$ = $1"] ],

        "expresion_logica": [ ["expresion_logica AND expresion_logica_atomica", "$$ = new ExprAnd($1, $3)"],
                                ["expresion_logica OR expresion_logica_atomica", "$$ = new ExprOr($1, $3)"],
                                ["expresion_logica_atomica ", "$$ = $1"], ],

    }
}
