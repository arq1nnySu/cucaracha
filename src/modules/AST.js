class ASTType{
	toString(){
		return this.constructor.name + " "   
	}
}

class IntType extends ASTType {}
class BoolType extends ASTType {}
class VecType extends ASTType {}
class VoidType extends ASTType {}

class Int{
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

class Id{
	constructor(value){
		this.value = value;
	}

	toString(){
		return this.value
	}	
}

class Type{
	constructor(name){
		this.name = name;
	}

	equals(aType){
		return this.name == aType.name
	}

	toString(){
		return this.name
	}
}

class Bool extends Type {
	constructor(name){
		super(name);
	}
}

class Program{
	constructor(functions){
		this.functions = functions;
	}

	toString(){
		return this.functions.join(', ')
	}
}

class Fun{
	constructor(name, type, parameters, block){
		this.name = name
		this.type = type
		this.parameters = parameters
		this.block = block
	}

	toString(){
		return this.name + "(" + this.parameters +") :" 
			+ this.type +"" + this.block
	}
}

class Block{
	constructor(statements){
		this.statements = statements;
	}

	toString(){
		return "Block (" +this.statements.join(', ') + " )"
	}
}

class Params{
	constructor(statements){
		this.statements = statements;
	}

	toString(){
		return "Params("+this.statements.join(", ")+")"
	}

	add(param){
		this.statements.unshift(param)
		return this
	}

	eval(){
		return ""
	}
}

class Param{
	constructor(name, type){
		this.name = name;
		this.type = type
	}

	toString(){
		return this.name+":"+this.type
	}
}


class Arithmetic{

	constructor(x, y, operator){
		this.x = x;
		this.y = y;
		this.operator = operator
	}
	
	eval(){
		return eval(this.x.eval() + this.operator + this.y.eval())
	}

	toString(){
		return this.constructor.name + "(" + this.x+", " + this.y+")"
	}
}

class Sum extends Arithmetic{
	constructor(x, y){
		super(x, y, "+")
	}
}

class Resta extends Arithmetic{
	constructor(x, y){
		super(x, y, "-")
	}
}

class Mult extends Arithmetic{
	constructor(x, y){
		super(x, y, "*")
	}
}
class Div extends Arithmetic{
	constructor(x, y){
		super(x, y, "/")
	}
}

class Assign extends Arithmetic{
	constructor(x, y){
		super(x, y, ":=")
	}
}

window.Int = Int
window.Suma = Sum
window.Resta = Resta
window.Mult = Mult
window.Div = Div
window.Bool = Bool
window.Bool = Id
window.Fun = Fun
window.Assign = Assign
window.Params = Params
window.Param = Param
window.Block = Block
window.IntType = IntType
window.BoolType = BoolType
window.VecType = VecType
window.VoidType = VoidType

export default { }