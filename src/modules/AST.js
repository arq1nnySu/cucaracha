import _ from 'underscore';

class Location {
    constructor(first_line, last_line, first_column, last_column) {
        this.first_line = first_line
        this.last_line = last_line
        this.first_column = first_column
        this.last_column = last_column
    }

    toString() {
        return JSON.stringify(this)
    }
}

class ASTNode {
    constructor(location) {
        this.location = location
    }

    toString() {
        return this.constructor.name
    }

    equals(type) {
        return this.toString() == type.toString()
    }
}


//Tipos
class ASTType extends ASTNode {
    toString() {
        return this.constructor.name.replace("Type", "")
    }

    isVoid() {
        return false
    }

    isBool() {
        return false
    }

    isInt() {
        return false
    }

    isVec() {
        return false
    }

}

class IntType extends ASTType {
    isInt() {
        return true
    }
}
class BoolType extends ASTType {
    isBool() {
        return true
    }
}
class VecType extends ASTType {
    isVec() {
        return true
    }
}
class UnitType extends ASTType {
    isVoid() {
        return true
    }
}


class Arrays {
    constructor(value) {
        this.list = []
        if (value) this.add(value)
    }

    add(param) {
        this.list.unshift(param)
        return this
    }

    toString() {
        return this.constructor.name
    }

    forEach(f) {
        this.list.forEach(f)
    }
    reduce(f, base) {
        return this.list.reduce(f, base)
    }

    first() {
        return this.list[0]
    }

    last() {
        return _.last(this.list)
    }

    get length() {
        return this.list.length
    }

    get(i) {
        return this.list[i]
    }

    map(f) {
        return this.list.map(f)
    }
}

class Program extends Arrays {
    constructor(location) {
        super()
        this.location = location
        this.init()
    }

    init() {
        var typer = new UnitType()
        var typep = new IntType()
        var location = new Location(0, 0, 0, 0)
        var param = new Parameter("x", typep, location)
        var block = new Block(new Arrays(), location)
        this.add(new Fun("putChar", typer, new Arrays(param), block, location))
        this.add(new Fun("putNum", typer, new Arrays(param), block, location))

    }

    serialize() {
        return Serializer.serialize(this)
    }

    semanticize() {
        return SemanticAnalysis.semanticize(this)
    }

}

class Fun extends ASTNode {
    constructor(id, type, parameters, block, location) {
        super(location)
        this.id = id
        this.type = type
        this.parameters = parameters
        this.block = block
    }

    toString() {
        return "Function"
    }

    isVoid() {
        return this.type.isVoid()
    }
}

class Block extends ASTNode {
    constructor(statements, location) {
        super(location)
        this.statements = statements;
    }
}


class Parameter extends ASTNode {
    constructor(id, type, location) {
        super(location)
        this.id = id;
        this.type = type
    }
}

//Expresiones
class ExprValue extends ASTNode {
    constructor(value, location) {
        super(location)
        this.value = value
    }

    eval() {
        return this.value;
    }
}


class ExprConstNum extends ExprValue {
    getType() {
        return new IntType()
    }

    get isConstant() {
        return true;
    }

    eval() {
        return parseFloat(this.value);
    }
}
class ExprConstBool extends ExprValue {
    getType() {
        return new BoolType()
    }

    get isConstant() {
        return true;
    }

    eval() {
        return JSON.parse(this.value.toLowerCase());
    }

    rep() {
        return this.eval() ? "-1" : "0";
    }
}
class ExprVecLength extends ExprValue {
    getType() {
        return new IntType()
    }

    get isConstant() {
        return false;
    }
}
class ExprVar extends ExprValue {
    get isConstant() {
        return false;
    }
}


//Exp Unarias
class UnaryExpr extends ASTNode {
    constructor(expresion, location) {
        super(location)
        this.expresion = expresion;
    }
}

class ExprNot extends UnaryExpr {
    get isConstant() {
        return this.expresion.isConstant;
    }

    eval() {
        return !this.expresion.eval()
    }
}
class StmtReturn extends UnaryExpr {}

//Exp Binarias
class BinaryExpr extends UnaryExpr {
    constructor(expresion, secExpresion, location) {
        super(expresion, location)
        this.secondExpresion = secExpresion;
    }

    get isConstant() {
        return this.expresion.isConstant && this.secondExpresion.isConstant;
    }
}

class ExprAdd extends BinaryExpr {
    eval() {
        return this.expresion.eval() + this.secondExpresion.eval();
    }
}
class ExprSub extends BinaryExpr {
    eval() {
        return this.expresion.eval() - this.secondExpresion.eval();
    }
}
class ExprNe extends BinaryExpr {
    eval() {
        return this.expresion.eval() != this.secondExpresion.eval();
    }
}
class ExprEq extends BinaryExpr {
    eval() {
        return this.expresion.eval() == this.secondExpresion.eval();
    }
}
class ExprLt extends BinaryExpr {
    eval() {
        return this.expresion.eval() <= this.secondExpresion.eval();
    }
}
class ExprGe extends BinaryExpr {
    eval() {
        return this.expresion.eval() >= this.secondExpresion.eval();
    }
}
class ExprLe extends BinaryExpr {
    eval() {
        return this.expresion.eval() < this.secondExpresion.eval();
    }
}
class ExprMul extends BinaryExpr {
    eval() {
        return this.expresion.eval() * this.secondExpresion.eval();
    }
}
class ExprOr extends BinaryExpr {
    eval() {
        return this.expresion.eval() || this.secondExpresion.eval();
    }
}
class ExprAnd extends BinaryExpr {
    eval() {
        return this.expresion.eval() && this.secondExpresion.eval();
    }
}
class ExprGt extends BinaryExpr {
    eval() {
        return this.expresion.eval() > this.secondExpresion.eval();
    }
}

class Assign extends BinaryExpr {}
class StmtVecAssign extends BinaryExpr {
    constructor(id, expr1, expr2, location) {
        super(expr1, expr2, location)
        this.id = id
    }
    getType() {
        return new VecType()
    }
}

//Exp Con id y expresiones
class ASTNodeIdAndExpresions extends ASTNode {
    constructor(id, expresions, location) {
        super(location)
        this.id = id
        this.expresions = expresions
    }
}

class StmtCall extends ASTNodeIdAndExpresions {}
class ExprCall extends ASTNodeIdAndExpresions {}


class ExprVecMake extends ASTNode {
    constructor(expresions, location) {
        super(location)
        this.expresions = expresions
    }

    get length() {
        return this.expresions.length
    }
}

class ASTNodeIdAndExpresion extends ASTNode {
    constructor(id, expresion, location) {
        super(location)
        this.id = id
        this.expresion = expresion
    }
}

class StmtAssign extends ASTNodeIdAndExpresion {}

class ExprVecDeref extends ASTNodeIdAndExpresion {}

class StmtExpresionBlock extends ASTNode {
    constructor(expresion, block, location) {
        super(location)
        this.expresion = expresion
        this.block = block
    }
}

class StmtWhile extends StmtExpresionBlock {}
class StmtIf extends StmtExpresionBlock {}
class StmtIfElse extends StmtIf {
    constructor(expresion, block, elseBlock, location) {
        super(expresion, block, location)
        this.elseBlock = elseBlock
    }
}

export default { ASTType, StmtExpresionBlock, UnaryExpr, ASTNodeIdAndExpresions, ExprValue, BinaryExpr, ExprConstNum, ExprAdd, ExprSub, ExprMul, ExprConstBool, Fun, Assign, Arrays, Parameter, Block, ExprConstBool, IntType, BoolType, VecType, ExprVecLength, ExprVecDeref, ExprVar, UnitType, StmtAssign, Program, StmtIf, StmtIfElse, StmtCall, ExprLt, ExprNot, ExprEq, ExprAnd, ExprOr, ExprGt, StmtVecAssign, StmtReturn, StmtWhile, ExprLe, ExprGe, ExprNe, ExprVecMake, ExprCall, ASTNodeIdAndExpresion, Location, ASTNode }