class Location{
	constructor(first_line, last_line, first_column, last_column){
		this.first_line = first_line
		this.last_line = last_line
		this.first_column = first_column
		this.last_column = last_column
	}

	toString(){
		return JSON.stringify(this)
	}
}

class ASTNode{
	constructor(location){
		this.location = location
	}

	toString(){
		return this.constructor.name 
	}
}


//Tipos
class ASTType extends ASTNode{
	toString(){
		return this.constructor.name.replace("Type", "")
	}

	isVoid(){
		return false
	}
}

class IntType extends ASTType { }
class BoolType extends ASTType { }
class VecType extends ASTType { }
class UnitType extends ASTType { 
	isVoid(){
		return true
	}
}


class Arrays extends Array{
	constructor(value){
		super()
		if(value) this.add(value)
	}

	add(param){
		this.unshift(param)
		return this
	}

	toString(){
		return this.constructor.name
	}
}

class Program extends Arrays{	
	constructor(location){
		super()
		this.location = location

	}

	serialize(){
		return Serializer.serialize(this)
	}

	semanticize(){
		return SemanticAnalysis.semanticize(this)
	}

}

class Fun extends ASTNode{
	constructor(id, type, parameters, block, location){
		super(location)
		this.id = id
		this.type = type
		this.parameters = parameters
		this.block = block
	}

	toString(){
		return "Function"
	}

	isVoid(){
		return this.type.isVoid()
	}
}

class Block extends ASTNode{
	constructor(statements, location){
		super(location)
		this.statements = statements;
	}	
}


class Parameter extends ASTNode{
	constructor(id, type, location){
		super(location)
		this.id = id;
		this.type = type
	}
}

//Expresiones
class ExprValue extends ASTNode {
	constructor(value, location){
		super(location)
		this.value = value
	}
}


class ExprConstNum extends ExprValue{
	getType(){
		return new IntType()
	}
}
class ExprConstBool extends ExprValue{
	getType(){
		return new BoolType()
	}
}
class ExprVecLength  extends ExprValue{
	getType(){
		return new IntType()
	}
}
class ExprVar extends ExprValue{}


//Exp Unarias
class UnaryExpr extends ASTNode{
	constructor(expresion, location){
		super(location)
		this.expresion = expresion;
	}
}

class ExprNot  extends UnaryExpr{}
class StmtReturn extends UnaryExpr{}

//Exp Binarias
class BinaryExpr extends UnaryExpr{
	constructor(expresion, secExpresion, location){
		super(expresion, location)
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
	constructor(id, expr1, expr2, location){
		super(expr1, expr2, location)
		this.id = id
	}
}

//Exp Con id y expresiones
class ASTNodeIdAndExpresions extends ASTNode{
	constructor(id, expresions, location){
		super(location)
		this.id = id
		this.expresions = expresions
	}
}

class StmtCall extends ASTNodeIdAndExpresions{}
class ExprCall extends ASTNodeIdAndExpresions{}


class ExprVecMake extends ASTNode{
	constructor(expresions, location){
		super(location)
		this.expresions = expresions
	}
}

class ASTNodeIdAndExpresion extends ASTNode{
	constructor(id, expresion, location){
		super(location)
		this.id = id
		this.expresion = expresion
	}
}

class StmtAssign extends ASTNodeIdAndExpresion{
}

class ExprVecDeref extends ASTNodeIdAndExpresion{}

class StmtExpresionBlock extends ASTNode{
	constructor(expresion, block, location){
		super(location)
		this.expresion = expresion
		this.block = block
	}
}

class StmtWhile extends StmtExpresionBlock{}
class StmtIf extends StmtExpresionBlock{}
class StmtIfElse extends StmtIf{
	constructor(expresion, block, elseBlock, location){
		super(expresion, block, location)
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
window.Location = Location

export default { }