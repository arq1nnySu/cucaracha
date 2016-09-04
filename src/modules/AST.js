import Indents from "../utils/Indents.js";

class ASTType{
	toString(n){
		return Indents.indent(this.constructor.name.replace("Type", ""), n, 2)   
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

	eval(){
		return this.value
	}

	toString(){
		return this.value
	}	
}

class ExprConstBool{
	constructor(value){
		this.value = value
	}

	toString(){
		return this.value
	}
}

class Program extends Array
{	constructor(){
		super()
	}

	add(param){
		this.unshift(param)
		return this
	}

	toString(){
		return "(Program \n" + 
		           this.map(f => f.toString(1)).join("\n") + "\n)"
	}
}

class Fun{
	constructor(id, type, parameters, block){
		this.id = id
		this.type = type
		this.parameters = parameters
		this.block = block
	}



	toStringParams(tab){
		if (this.parameters.length != 0){ 
			return Indents.indent(this.parameters, tab, 2) + "\n"
		}
		return ""
	}

	toString(n){
		var tab = n+1
		var rep = "(Function \n" 
		           + Indents.indent(this.id, tab, 2) + "\n" 
		           + this.toStringParams(tab+1) 
		           + this.type.toString(tab) + "\n" 
		           + this.block.toString(tab) + "\n" 
		           + ")"
		return Indents.indent(rep, tab)
	}
}

class Block{
	constructor(statements){
		this.statements = statements;
	}

	toString(n){
		var tab = n
		var rep = "(" + this.constructor.name + "\n" 
		           + this.statements.map(s => s.toString(tab)).join("\n") 
		           + "\n)"
		return Indents.indent(rep, tab)
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

	eval(){
		return ""
	}
}

class Parameter{
	constructor(id, type){
		this.id = id;
		this.type = type
	}

	toString(){
		return this.id+":"+this.type
	}
}

class Instructions{
	
	constructor(statements){
		this.statements = statements;
	}

	toString(){
		return "Instructions("+this.statements.join(" ")+")"
	}

	add(param){
		this.statements.unshift(param)
		return this
	}

	eval(){
		return ""
	}
}

class UnaryExpr extends ASTType{

	constructor(x){
		super()
		this.x = x;
	}
	
	eval(){
		return this
	}

	toString(){
		return this.constructor.name + "(" + this.x+")"
	}
}


class BinaryExpr extends ASTType{

	constructor(x, y){
		super()
		this.x = x;
		this.y = y;
		// this.operator = operator
	}
	
	eval(){
		// return eval(this.x.eval() + this.operator + this.y.eval())
		return this
	}

	toString(){
		return this.constructor.name + "(" + this.x+", " + this.y+")"
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
	
	toString(){
		return this.id+".length"
	}

}
class ExprVar extends ASTType{
	constructor(id){
		super()
		this.id = id
	}
	
	toString(n){
		var tab = n
		var rep = "(" + this.constructor.name + "\n"   
		           + Indents.indent(this.id, tab, 2) + "\n"
		           + ")"
		return Indents.indent(rep, tab)
	}
}
class ExprVecDeref extends ASTType{
	constructor(id, expresion){
		super()
		this.id = id
		this.expresion = expresion
	}
	
	toString(){
		return this.id+"["+this.expresion+"]"
	}
}

class ExprVecMake extends ASTType{
	constructor(expresion){
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

	toString(){
		return this.constructor.name + "(" + this.id + "= " + this.expresion + ")" 
	}
}

class StmtVecAssign  extends BinaryExpr{
	constructor(id, x, y){
		super(x, y)
		this.id = id
	}

	toString(){
		return this.constructor.name + "(" + this.id + "[" + this.x + "]= " + this.y + ")" 
	}
}

class StmtIf extends ASTType{
	constructor(expresion, block){
		super()
		this.expresion = expresion
		this.block = block
	}

	toString(){
		return this.constructor.name + "((" + this.expresion + ") { " + this.block + " })" 
	}
}

class StmtIfElse extends StmtIf{
	constructor(expresion, block, elseBlock){
		super(expresion, block)
		this.elseBlock = elseBlock
	}

	toString(){
		return this.constructor.name + "((" + this.expresion + ") { " + this.block + "} {" + this.elseBlock + "})"
	}
}

class StmtWhile extends ASTType{
	constructor(expresion, block){
		super()
		this.expresion = expresion
		this.block = block
	}

	toString(){
		return this.constructor.name + "((" + this.expresion + ") {" + this.block + "})"
	}
}

class StmtReturn extends UnaryExpr{}


class StmtCall extends ASTType{
	constructor(id, expresions){
		super()
		this.id = id
		this.expresions = expresions
	}

	toString(n){
		var tab = n
		var rep = "(" + this.constructor.name + "\n" 
		           + Indents.indent(this.id, tab, 2) + "\n"
		           + this.expresions.map(s => s.toString(tab)).join("\n")
		           + "\n)"
		return Indents.indent(rep, tab)
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

export default { }