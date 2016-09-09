window.stringToekn = function(yytext) {
    switch (yytext) {
        case 'fun':
            return 'FUN'
        case 'if':
            return 'IF'
        case 'else':
            return 'ELSE'
        case 'return':
            return 'RETURN'
        case 'while':
            return 'WHILE'
        case 'and':
            return 'AND'
        case 'or':
            return 'OR'
        case 'not':
            return 'NOT'
        case 'True':
            return 'TRUE'
        case 'False':
            return 'FALSE'
        case 'Bool':
            return 'BOOL'
        case 'Int':
            return 'INT'
        case 'Vec':
            return 'VEC'
        case 'and':
            return 'AND'
        default:
            return 'ID'
    }
}

export default {
    "comment": "Gramática para el lenguaje Cucaracha",

    "lex": {
        "rules": [
            ["\\s+", "/* skip whitespace */"],
            ["//[/ a-zA-Z0-9]*", "/* skip comment */"],
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
            ["[a-zA-Z][a-zA-Z0-9]*", "return stringToekn(yytext)"],
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

        "programa": [ [ "", "$$ = new Program(new Location(@1.first_line , @1.last_line, @1.first_column, @1.last_column));" ],
                      [ "declaracion_funcion programa", "$$ = $2.add($1);" ]],

        "declaracion_funcion": [[ "funcion", "$$ = $1;" ],
                                 [ "procedimiento", "$$ = $1;" ]],

        "funcion": [[ "FUN ID LPAREN lista_paramametros RPAREN COLON tipo bloque", "$$ = new Fun($2, $7, $4, $8, new Location(@1.first_line , @8.last_line, @1.first_column, @8.last_column));" ]],


        "procedimiento": [[ "FUN ID LPAREN lista_paramametros RPAREN bloque", "$$ = new Fun($2, new UnitType(), $4, $6, new Location(@1.first_line , @6.last_line, @1.first_column, @6.last_column));" ]],


        "tipo": [[ "INT", "$$ = new IntType();" ],
                 [ "BOOL", "$$ = new BoolType();" ],
                 [ "VEC", "$$ = new VecType();" ]],
        
        "instruccion" : [["ID ASSIGN expresion", "$$ = new StmtAssign($1, $3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column));"],
                         ["ID LBRACK expresion RBRACK ASSIGN expresion", "$$ = new StmtVecAssign($1, $3, $6, new Location(@1.first_line , @6.last_line, @1.first_column, @6.last_column));"],
                         ["IF expresion bloque", "$$ = new StmtIf($2, $3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column));"],
                         ["IF expresion bloque ELSE bloque", "$$ = new StmtIfElse($2, $3, $5, new Location(@1.first_line , @5.last_line, @1.first_column, @5.last_column));"],
                         ["WHILE expresion bloque", "$$ = new StmtWhile($2, $3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column));"],
                         ["RETURN expresion", "$$ = new StmtReturn($2, new Location(@1.first_line , @2.last_line, @1.first_column, @2.last_column));"],
                         ["ID LPAREN lista_expresiones RPAREN", "$$ = new StmtCall($1, $3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column));"]],

        "lista_instrucciones" : [[ "", "$$ = new Arrays();" ],
                                 [ "instruccion lista_instrucciones", "$$ = $2.add($1);" ]],

        "parametro": [[ "ID COLON tipo", "$$ = new Parameter($1, $3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column));" ]],

        "lista_no_vacia": [ [ "parametro", "$$ = new Arrays($1)" ],
                            [ "parametro COMMA lista_no_vacia", "$$ = $3.add($1);" ]],

        "lista_paramametros": [ [ "", "$$ = new Arrays();" ], 
                                [ "lista_no_vacia", "$$ = $1;" ]],

        "bloque": [ ["LBRACE lista_instrucciones RBRACE", "$$ = new Block($2, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"] ],


        "lista_expresiones_no_vacia": [ [ "expresion", "$$ = new Arrays($1)" ],
                            [ "expresion COMMA lista_expresiones_no_vacia", "$$ = $3.add($1);" ]],

        "lista_expresiones": [ [ "", "$$ = new Arrays();" ], 
                                [ "lista_expresiones_no_vacia", "$$ = $1;" ]],

        "expresion": [  ["expresion_logica", "$$ = $1"], ],

        "expresion_atomica": [  ["ID", "$$ = new ExprVar($1, new Location(@1.first_line , @1.last_line, @1.first_column, @1.last_column))"],
                                ["NUM", "$$ = new ExprConstNum(yytext, new Location(@1.first_line , @1.last_line, @1.first_column, @1.last_column))"],
                                ["TRUE", "$$ = new ExprConstBool('True', new Location(@1.first_line , @1.last_line, @1.first_column, @1.last_column))"],
                                ["FALSE", "$$ = new ExprConstBool('False', new Location(@1.first_line , @1.last_line, @1.first_column, @1.last_column))"],
                                ["LBRACK lista_expresiones RBRACK", "$$ = new ExprVecMake($2, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                ["HASH ID", "$$ = new ExprVecLength($2, new Location(@1.first_line , @2.last_line, @1.first_column, @2.last_column))"],
                                ["ID LBRACK expresion RBRACK", "$$ = new ExprVecDeref($1, $3, new Location(@1.first_line , @4.last_line, @1.first_column, @4.last_column))"],
                                ["ID LPAREN lista_expresiones RPAREN", "$$ = new ExprCall($1, $3, new Location(@1.first_line , @4.last_line, @1.first_column, @4.last_column))"],
                                ["LPAREN expresion RPAREN", "$$ = $2"] ],

        "expresion_multiplicativa": [ ["expresion_multiplicativa TIMES expresion_atomica", "$$ = new ExprMul($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                      ["expresion_atomica", "$$ = $1"] ],

        "expresion_aditiva": [ ["expresion_aditiva PLUS expresion_multiplicativa", "$$ = new ExprAdd($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                               ["expresion_aditiva MINUS expresion_multiplicativa", "$$ = new ExprSub($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                               ["expresion_multiplicativa", "$$ = $1"] ],

        "expresion_relacional": [   ["expresion_aditiva LE expresion_aditiva", "$$ = new ExprLe($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                    ["expresion_aditiva GE expresion_aditiva", "$$ = new ExprGe($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                    ["expresion_aditiva LT expresion_aditiva", "$$ = new ExprLt($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                    ["expresion_aditiva GT expresion_aditiva", "$$ = new ExprGt($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                    ["expresion_aditiva EQ expresion_aditiva", "$$ = new ExprEq($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                    ["expresion_aditiva NE expresion_aditiva", "$$ = new ExprNe($1,$3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                    ["expresion_aditiva", "$$ = $1"] ],

        "expresion_logica_atomica": [ ["NOT expresion_logica_atomica", "$$ = new ExprNot($2, new Location(@1.first_line , @2.last_line, @1.first_column, @2.last_column))"],
                                      ["expresion_relacional", "$$ = $1"] ],

        "expresion_logica": [ ["expresion_logica AND expresion_logica_atomica", "$$ = new ExprAnd($1, $3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                ["expresion_logica OR expresion_logica_atomica", "$$ = new ExprOr($1, $3, new Location(@1.first_line , @3.last_line, @1.first_column, @3.last_column))"],
                                ["expresion_logica_atomica ", "$$ = $1"], ],

    }
}
