import AST from './AST';

class SemanticError extends Error{

	constructor(message, location){
		super(message)
		this.message = message
		this.loc = location
	}
}

Arrays.prototype.semanticizeElements = function(){
	if (this.length >0){
		return this.map(element => element.semanticize())
	}
}

Program.prototype.initTable = function(){ 
	var typer = new UnitType().toString()
	var typep = new IntType().toString()
	var location = new Location(0,0,0,0)
	var param = new Parameter("x", typep, location)
	var block = new Block([], location)
	var char = new Fun("putChar", typer, [param], block, location)
	var num = new Fun("putNum", typer, [param], block, location)
	return {char, num}
}
Program.prototype.semanticize = function(){
	
	var functionTable = this.initTable()

	this.forEach(fun =>{
		if(functionTable[fun.id]){
			throw new SemanticError("La funcion "+ fun.id + " ya esta definida", fun.location)
		}
		if(fun.type.serialize() == "Vec"){
			throw new SemanticError("No es valido que las funciones devuelvan de tipo: "+ fun.type , fun.location)	
		}
		functionTable[fun.id] = fun
	})
	if (!functionTable.hasOwnProperty("main")){
		throw new SemanticError("Se tiene que definir una funcion con el nombre 'main'", this.location)
	}
	if(functionTable["main"].parameters.length>0){
		throw new SemanticError("La funcion 'main' se tiene que definir, sin parametros", functionTable["main"].location)
	}
	if(functionTable["main"].type.serialize() != "Unit"){
		throw new SemanticError("La funcion 'main' se tiene que definir con el tipo Unit", functionTable["main"].location)	
	}
} 	

Fun.prototype.semanticize = function(){
	return this.semanticizeFun()
}

Fun.prototype.semanticizeFun = function(){
	var id = this.id.toString()
	var params = this.parameters.semanticizeElements()
	return { id : { "parameters" : params, 
					"localvar": this.block.semanticizeBlock(params),
					"rtype": this.type.serialize()}} 
}

Parameter.prototype.semanticize = function(){
	var id = this.id.toString()
	return { id : this.type.serialize()}
}

ASTType.prototype.serialize = function(){
	return this.toString()
}

Block.prototype.semanticizeBlock = function(params){
	 return params
}

export default {}