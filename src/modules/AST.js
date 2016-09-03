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

class Func{
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
		return this.statements
	}

	eval(){
		return ""
	}
}

class Param{
	constructor(name){
		this.name = name;
	}

	toString(){
		return this.name
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
window.Func = Func
window.Assign = Assign
window.Params = Params
window.Param = Param
window.Block = Block

export default { Int, Arithmetic, Sum, Resta, Mult, Div, Bool, Id, Func, Assign}