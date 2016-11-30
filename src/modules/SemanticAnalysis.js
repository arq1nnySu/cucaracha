import { ASTType, StmtExpresionBlock, UnaryExpr, ASTNodeIdAndExpresions, ExprValue, BinaryExpr, ExprConstNum, ExprAdd, ExprSub, ExprMul, ExprConstBool, Fun, Assign, Arrays, Parameter, Block, IntType, BoolType, VecType, ExprVecLength, ExprVecDeref, ExprVar, UnitType, StmtAssign, Program, StmtIf, StmtIfElse, StmtCall, ExprLt, ExprNot, ExprEq, ExprAnd, ExprOr, ExprGt, StmtVecAssign, StmtReturn, StmtWhile, ExprLe, ExprGe, ExprNe, ExprVecMake, ExprCall, ASTNodeIdAndExpresion, Location, ASTNode } from './AST';

class SemanticError extends Error {

    constructor(message, location) {
        super(message)
        this.message = message
        this.loc = location
    }
}

Arrays.prototype.semanticizeElements = function() {
    if (this.length > 0) {
        return this.map(element => element.semanticize())
    }
}

Program.prototype.initvarLocalTable = function(parameters) {
    var table = {}
    parameters.forEach(param => {
        table[param.id] = param.type
    })
    return table
}

Program.prototype.semanticize = function() {
    var functionTable = {}
    var typeInt = new IntType()
    var typeBool = new BoolType()
    var typeVec = new VecType()

    this.forEach(fun => {
        if (functionTable[fun.id]) {
            throw new SemanticError("La funcion " + fun.id + " ya esta definida", fun.location)
        }
        if (fun.type.serialize() == "Vec") {
            throw new SemanticError("No es valido que las funciones devuelvan de tipo: " + fun.type, fun.location)
        }
        functionTable[fun.id] = fun
    })

    var mainFunction = functionTable["main"]

    if (!mainFunction) {
        throw new SemanticError("Se tiene que definir una funcion con el nombre 'main'", this.location)
    }
    if (mainFunction.parameters.length > 0) {
        throw new SemanticError("La funcion 'main' se tiene que definir, sin parametros", functionTable["main"].location)
    }
    if (!mainFunction.isVoid()) {
        throw new SemanticError("La funcion 'main' se tiene que definir con el tipo Unit", functionTable["main"].location)
    }
    _.values(functionTable).forEach(fun => {
        var varLocalTable = this.initvarLocalTable(fun.parameters)
        fun.block.validate(varLocalTable, functionTable, fun)
    })
}

ASTNode.prototype.validate = function(varTable, functionTable) {

}

ASTNode.prototype.throwSemanticError = function(message) {
    throw new SemanticError(message, this.location)
}

ASTNode.prototype.getVar = function(name, varTable) {
    var vartype = varTable[name]

    if (!vartype) {
        this.throwSemanticError("No esta definida la variable: " + name)
    }
    return vartype
}

ASTNode.prototype.getFun = function(name, funTable) {
    var fun = funTable[name]
    if (!fun) {
        this.throwSemanticError("La function " + name + " no esta definida")
    }
    return fun
}

Block.prototype.validate = function(varTable, functionTable, fun) {
    this.statements.forEach(stats => {
        stats.validate(varTable, functionTable, fun, this)
    })
}

StmtAssign.prototype.validate = function(varTable, functionTable) {
    var expType = this.expresion.validate(varTable, functionTable)
    if (!varTable[this.id]) {
        varTable[this.id] = expType
    } else {
        var expectedType = varTable[this.id]
        if (!expType.equals(expectedType)) {
            this.throwSemanticError("Para la variable " + this.id + " se esperaba: " + expectedType + " pero se obtuvo: " + expType)
        }
    }
    return expType
}



StmtExpresionBlock.prototype.validate = function(varTable, functionTable) {
    var boolType = new BoolType()
    var expType = this.expresion.validate(varTable, functionTable)
    if (!boolType.equals(expType)) {
        this.throwSemanticError("La condicion deberia de ser: " + boolType + " pero se obtuvo: " + expType)
    }
    this.block.validate(varTable, functionTable)
}

StmtIfElse.prototype.validate = function(varTable, functionTable) {
    StmtExpresionBlock.prototype.validate.bind(this)(varTable, functionTable)
    this.elseBlock.validate(varTable, functionTable)
}

ExprAdd.prototype.validate = function(varTable, functionTable) {
    var intType = new IntType()
    var firstType = this.expresion.validate(varTable, functionTable)
    var secondType = this.secondExpresion.validate(varTable, functionTable)
    if (intType.equals(firstType) && firstType.equals(secondType)) {
        return intType
    } else {
        this.throwSemanticError(`Error de tipos: Se esperaba ${intType}:${intType} y se optuvo ${firstType}:${secondType}`)
    }

}

ExprSub.prototype.validate = ExprAdd.prototype.validate
ExprMul.prototype.validate = ExprAdd.prototype.validate

ExprAnd.prototype.validate = function(varTable, functionTable) {
    var boolType = new BoolType()
    var firstType = this.expresion.validate(varTable, functionTable)
    var secondType = this.secondExpresion.validate(varTable, functionTable)
    if (boolType.equals(firstType) && firstType.equals(secondType)) {
        return boolType
    } else {
        this.throwSemanticError(`Error de tipos: Se esperaba ${boolType}:${boolType} y se optuvo ${firstType}:${secondType}`)
    }
}

ExprOr.prototype.validate = ExprAnd.prototype.validate

ExprNot.prototype.validate = function(varTable, functionTable) {
    var boolType = new BoolType()
    var unaryType = this.expresion.validate(varTable, functionTable)
    if (boolType.equals(unaryType)) {
        return boolType
    } else {
        this.throwSemanticError(`Error de tipos: Se esperaba ${boolType} y se optuvo ${unaryType}`)
    }
}


ExprEq.prototype.validate = function(varTable, functionTable) {
    var boolType = new BoolType()
    var intType = new IntType()
    var firstType = this.expresion.validate(varTable, functionTable)
    var secondType = this.secondExpresion.validate(varTable, functionTable)
    if (intType.equals(firstType) && firstType.equals(secondType)) {
        return boolType
    } else {
        this.throwSemanticError(`Error de tipos: Se esperaba ${intType}:${intType} y se optuvo ${firstType}:${secondType}`)
    }
}

ExprLt.prototype.validate = ExprEq.prototype.validate
ExprGe.prototype.validate = ExprEq.prototype.validate
ExprLe.prototype.validate = ExprEq.prototype.validate
ExprGt.prototype.validate = ExprEq.prototype.validate
ExprNe.prototype.validate = ExprEq.prototype.validate

StmtVecAssign.prototype.validate = function(varTable, functionTable) {
    var vecType = new VecType()
    var intType = new IntType()
    var varType = varTable[this.id]

    var expType = this.expresion.validate(varTable, functionTable)
    var secondType = this.secondExpresion.validate(varTable, functionTable)
    if (!varType) {
        this.throwSemanticError("No esta definida la variable: " + this.id)
    }
    if (!vecType.equals(varType)) {
        this.throwSemanticError("Para la variable: " + this.id + " se esperaba: " + vecType + " pero se obtuvo: " + varType)
    }
    if (!(intType.equals(expType) && expType.equals(secondType))) {
        throw new SemanticError("Error de tipos", this.location)
    }

    return vecType
}

ExprVecLength.prototype.validate = function(varTable, functionTable) {
    var vecType = new VecType()
    var vartype = this.getVar(this.value, varTable)

    if (!vecType.equals(vartype)) {
        this.throwSemanticError("Para la variable: " + this.value + " se esperaba: " + vecType + " pero se obtuvo: " + vartype)
    }
    return new IntType()
}

ExprVecMake.prototype.validate = function(varTable, functionTable) {
    var intType = new IntType()
    this.expresions.forEach(exp => {
        var expType = exp.validate(varTable, functionTable)
        if (!intType.equals(expType)) {
            this.throwSemanticError("Se esperaba: " + intType + " pero se obtuvo: " + expType)
        }
    })
    return new VecType()
}

ExprVecDeref.prototype.validate = function(varTable, functionTable) {
    var vecType = new VecType()
    var intType = new IntType()
    var varType = this.getVar(this.id, varTable)
    var expType = this.expresion.validate(varTable, functionTable)

    if (!vecType.equals(varType)) {
        this.throwSemanticError("Para la variable: " + this.id + " Se esperaba: " + vecType + " pero se obtuvo: " + varType)
    }
    if (!intType.equals(expType)) {
        this.throwSemanticError("Se esperaba: " + intType + " pero se obtuvo: " + expType)
    }
    return intType
}

ExprValue.prototype.validate = function(varTable, functionTable) {
    return this.getType()
}

ExprVar.prototype.validate = function(varTable, functionTable) {
    return this.getVar(this.value, varTable)
}

ExprCall.prototype.validate = function(varTable, functionTable) {
    var fun = this.getFun(this.id, functionTable)

    if (fun.parameters.length != this.expresions.length) {
        this.throwSemanticError("La cantidad de parámetros es incorrecto se esperaban " + fun.parameters.length + " y se obtuvieron " + this.expresions.length)
    }

    for (var i = 0; i < fun.parameters.length; i++) {
        var expresion = this.expresions.get(i)
        var expType = expresion.validate(varTable, functionTable)
        var parameter = fun.parameters.get(i)
        if (!expType.equals(parameter.type)) {
            this.throwSemanticError("El tipo del parametro es incorrecto se esperaba " + parameter.type + " y se obtuvo " + expType)
        }
    }

    return fun.type
}

StmtCall.prototype.validate = ExprCall.prototype.validate

StmtReturn.prototype.validate = function(varTable, functionTable, fun, block) {
    var expType = this.expresion.validate(varTable, functionTable)
    if (!expType.equals(fun.type)) {
        this.throwSemanticError("Tipo de retorno inválido se esperaba: " + fun.type + " pero se obtuvo: " + expType)
    }

    var lastStmt = block.statements.last()

    if (!lastStmt.equals(this) || (lastStmt.location.first_line != this.location.first_line)) {
        this.throwSemanticError("El return va al final del bloque")
    }

}

export default {}