class ASTNode{
	toString(){
		return this.constructor.name
	}
}


//Tipos
class ASTType extends ASTNode{
	toString(){
		return this.constructor.name.replace("Type", "")
	}
}

class IntType extends ASTType { }
class BoolType extends ASTType { }
class VecType extends ASTType { }
class UnitType extends ASTType { }


class Arrays extends Array{
	constructor(value){
		super()
		if(value) this.add(value)
	}

	add(param){
		this.unshift(param)
		return this
	}
}

class Program extends Arrays{	
	constructor(){
		super()
	}

	serialize(){
		return Serializer.serialize(this)
	}
}

class Fun{
	constructor(id, type, parameters, block){
		this.id = id
		this.type = type
		this.parameters = parameters
		this.block = block
	}
}

class Block{
	constructor(statements){
		this.statements = statements;
	}	
}


class Parameter{
	constructor(id, type){
		this.id = id;
		this.type = type
	}
}

//Expresiones
class ExprValue extends ASTNode {
	constructor(value){
		super()
		this.value = value
	}
}


class ExprConstNum extends ExprValue{}
class ExprConstBool extends ExprValue{}
class ExprVar extends ExprValue{}
class ExprVecLength  extends ExprValue{}

//Exp Unarias
class UnaryExpr extends ASTNode{
	constructor(expresion){
		super()
		this.expresion = expresion;
	}
}

class ExprNot  extends UnaryExpr{}
class StmtReturn extends UnaryExpr{}

//Exp Binarias
class BinaryExpr extends UnaryExpr{
	constructor(expresion, secExpresion){
		super(expresion)
		this.secondExpresion = secExpresion;
	}
}

class ExprAdd extends BinaryExpr{}
class ExprSub extends BinaryExpr{}
class ExprNe extends BinaryExpr{}
class ExprEq extends BinaryExpr{}
class ExprLt extends BinaryExpr{} 
class ExprGe extends BinaryExpr{} 
class ExprLe extends BinaryExpr{} 
class ExprMul extends BinaryExpr{}
class ExprOr extends BinaryExpr{}
class ExprAnd extends BinaryExpr{}
class ExprGt extends BinaryExpr{}
class Div extends BinaryExpr{}
class Assign extends BinaryExpr{}
class StmtVecAssign  extends BinaryExpr{
	constructor(id, x, y){
		super(x, y)
		this.id = id
	}
}

//Exp Con id y expresiones
class ASTNodeIdAndExpresions extends ASTNode{
	constructor(id, expresions){
		super()
		this.id = id
		this.expresions = expresions
	}
}

class StmtCall extends ASTNodeIdAndExpresions{}
class ExprCall extends ASTNodeIdAndExpresions{}


class ExprVecMake extends ASTNode{
	constructor(expresions){
		super()
		this.expresions = expresions
	}
}

class ASTNodeIdAndExpresion extends ASTNode{
	constructor(id, expresion){
		super()
		this.id = id
		this.expresion = expresion
	}
}

class StmtAssign extends ASTNodeIdAndExpresion{
}

class ExprVecDeref extends ASTNodeIdAndExpresion{}

class StmtExpresionBlock extends ASTNode{
	constructor(expresion, block){
		super()
		this.expresion = expresion
		this.block = block
	}
}

class StmtWhile extends StmtExpresionBlock{}
class StmtIf extends StmtExpresionBlock{}
class StmtIfElse extends StmtIf{
	constructor(expresion, block, elseBlock){
		super(expresion, block)
		this.elseBlock = elseBlock
	}
}


window.ASTType = ASTType
window.StmtExpresionBlock = StmtExpresionBlock
window.UnaryExpr = UnaryExpr
window.ASTNodeIdAndExpresions= ASTNodeIdAndExpresions
window.ExprValue =ExprValue
window.BinaryExpr = BinaryExpr
window.ExprConstNum = ExprConstNum
window.ExprAdd = ExprAdd
window.ExprSub = ExprSub
window.ExprMul = ExprMul
window.Div = Div
window.ExprConstBool = ExprConstBool
window.Fun = Fun
window.Assign = Assign
window.Arrays = Arrays
window.Parameter = Parameter
window.Block = Block
window.ExprConstBool = ExprConstBool
window.IntType = IntType
window.BoolType = BoolType
window.VecType = VecType
window.ExprVecLength = ExprVecLength
window.ExprVecDeref = ExprVecDeref
window.ExprVar = ExprVar
window.UnitType = UnitType
window.StmtAssign = StmtAssign
window.Program = Program
window.StmtIf = StmtIf
window.StmtIfElse = StmtIfElse
window.StmtCall = StmtCall
window.ExprLt = ExprLt
window.ExprNot = ExprNot
window.ExprEq = ExprEq
window.ExprAnd = ExprAnd
window.ExprOr = ExprOr
window.ExprGt = ExprGt
window.StmtVecAssign = StmtVecAssign
window.StmtReturn = StmtReturn
window.StmtWhile = StmtWhile
window.ExprLe = ExprLe
window.ExprGe = ExprGe
window.ExprNe = ExprNe
window.ExprVecMake = ExprVecMake
window.ExprCall = ExprCall
window.ASTNodeIdAndExpresion = ASTNodeIdAndExpresion

export default { }