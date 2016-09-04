import Serializer from "./Serializer.js";


class ASTType{
	toString(){
		return this.constructor.name.replace("Type", "")
	}
}

class IntType extends ASTType { }
class BoolType extends ASTType { }
class VecType extends ASTType { }
class UnitType extends ASTType { }

class ExprConstNum{
	constructor(value){
		this.value = Number(value);
	}
}

class ExprConstBool{
	constructor(value){
		this.value = value
	}
}

class Program extends Array{	
	constructor(){
		super()
	}

	add(param){
		this.unshift(param)
		return this
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

class Parameter{
	constructor(id, type){
		this.id = id;
		this.type = type
	}
}

class Instructions{
	
	constructor(statements){
		this.statements = statements;
	}

	add(param){
		this.statements.unshift(param)
		return this
	}
}

class UnaryExpr extends ASTType{

	constructor(x){
		super()
		this.x = x;
	}
}


class BinaryExpr extends ASTType{

	constructor(x, y){
		super()
		this.x = x;
		this.y = y;
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

class ExprNot  extends UnaryExpr{}

class ExprCall extends ASTType{
	constructor(id, expressions){
		super()
		this.id = id
		this.expresions = expresion
	}
}

class ExprVecLength extends ASTType{
	constructor(id){
		super()
		this.id = id
	}
}

class ExprVar extends ASTType{
	constructor(id){
		super()
		this.id = id
	}
	
}

class ExprVecDeref extends ASTType{
	constructor(id, expresion){
		super()
		this.id = id
		this.expresion = expresion
	}
}

class ExprVecMake extends ASTType{
	constructor(expresions){
		super()
		this.expresions = expresions
	}
}

//Statements

class StmtAssign extends ASTType{
	constructor(id, expresion){
		super()
		this.id = id
		this.expresion = expresion
	}

}

class StmtVecAssign  extends BinaryExpr{
	constructor(id, x, y){
		super(x, y)
		this.id = id
	}
}

class StmtIf extends ASTType{
	constructor(expresion, block){
		super()
		this.expresion = expresion
		this.block = block
	}
}

class StmtIfElse extends StmtIf{
	constructor(expresion, block, elseBlock){
		super(expresion, block)
		this.elseBlock = elseBlock
	}
}

class StmtWhile extends ASTType{
	constructor(expresion, block){
		super()
		this.expresion = expresion
		this.block = block
	}
}

class StmtReturn extends UnaryExpr{}


class StmtCall extends ASTType{
	constructor(id, expresions){
		super()
		this.id = id
		this.expresions = expresions
	}
}

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
window.Instructions = Instructions
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

export default { }