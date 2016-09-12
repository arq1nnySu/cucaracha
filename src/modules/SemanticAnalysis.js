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

Program.prototype.initvarLocalTable = function(parameters){ 
	var table = {}
	parameters.forEach(param => {
		table[param.id] = param.type
	})
	return table
}

Program.prototype.initTable = function(){ 
	var typer = new UnitType()
	var typep = new IntType()
	var location = new Location(0,0,0,0)
	var param = new Parameter("x", typep, location)
	var block = new Block([], location)
	var char = new Fun("putChar", typer, [param], block, location)
	var num = new Fun("putNum", typer, [param], block, location)
	return {char, num}
}

Program.prototype.semanticize = function(){
	var functionTable = this.initTable()
	var typeInt = new IntType()
	var typeBool = new BoolType()
	var typeVec = new VecType()

	this.forEach(fun =>{
		if(functionTable[fun.id]){
			throw new SemanticError("La funcion "+ fun.id + " ya esta definida", fun.location)
		}
		if(fun.type.serialize() == "Vec"){
			throw new SemanticError("No es valido que las funciones devuelvan de tipo: "+ fun.type , fun.location)	
		}
		functionTable[fun.id] = fun
	})

	var mainFunction = functionTable["main"]

	if (!mainFunction){
		throw new SemanticError("Se tiene que definir una funcion con el nombre 'main'", this.location)
	}
	if(mainFunction.parameters.length>0){
		throw new SemanticError("La funcion 'main' se tiene que definir, sin parametros", functionTable["main"].location)
	}
	if(!mainFunction.isVoid()){
		throw new SemanticError("La funcion 'main' se tiene que definir con el tipo Unit", functionTable["main"].location)	
	}
	_.values(functionTable).forEach(fun => {
		var varLocalTable = this.initvarLocalTable(fun.parameters)
		fun.block.statements.forEach(stats => {
			stats.validate(varLocalTable, functionTable)
		})
	})
} 	

ASTNode.prototype.validate = function(varTable, functionTable){

}

StmtAssign.prototype.validate = function(varTable, functionTable){
	var expType = this.expresion.validate(varTable, functionTable)
	if (!varTable[this.id]){
		varTable[this.id] = expType
	}else{
		var expectedType = varTable[this.id]
		if ( !expType.equals(expectedType)){
			throw new SemanticError("Para la variable "+ this.id + " se esperaba: "+ expectedType + " pero se obtuvo: " + expType , this.location)							
		} 
	}
	return expType
}

ExprAdd.prototype.validate = function(varTable, functionTable){
	var intType = new IntType()
	var firstType = this.expresion.validate(varTable, functionTable)
	var secondType = this.secondExpresion.validate(varTable, functionTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return intType	
	}else{
		throw new SemanticError("Error de tipos" , this.location)
	}
	 
}

ExprSub.prototype.validate = ExprAdd.prototype.validate
ExprMul.prototype.validate = ExprAdd.prototype.validate

ExprAnd.prototype.validate = function(varTable, functionTable){
	var boolType = new BoolType() 
	var firstType = this.expresion.validate(varTable, functionTable)
	var secondType = this.secondExpresion.validate(varTable, functionTable)
	if(boolType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}
}

ExprOr.prototype.validate = ExprAnd.prototype.validate

ExprNot.prototype.validate = function(varTable, functionTable){
	var boolType = new BoolType()
	var unaryType = this.expresion.validate(varTable, functionTable) 
	if(boolType.equals(unaryType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)
	}
}


ExprEq.prototype.validate = function(varTable, functionTable){
	var boolType = new BoolType()
	var intType = new IntType() 
	var firstType = this.expresion.validate(varTable, functionTable)
	var secondType = this.secondExpresion.validate(varTable, functionTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}
}

ExprLt.prototype.validate = ExprEq.prototype.validate
ExprGe.prototype.validate = ExprEq.prototype.validate
ExprLe.prototype.validate = ExprEq.prototype.validate
ExprGt.prototype.validate = ExprEq.prototype.validate
ExprNe.prototype.validate = ExprEq.prototype.validate

StmtVecAssign.prototype.validate = function(varTable, functionTable){
	if (!varTable[this.id]){
		varTable[this.id] = this
	}else{
		var varlocal = varTable[this.id]
		var gtype = this.expresion.getType()
		var gtypevalue = this.secondExpresion.getType() 
		if (!gtype.equals(typeInt)){
			throw new SemanticError("En la expresion [e] se esperaba: "+ typeInt + " pero se obtuvo: "+ gtype , this.location)							
		}
		if (!gtypevalue.equals(typeInt)){
			throw new SemanticError("Los Vectores son de tipo: "+  typeInt , this.location)							
		} 
	}
}

ExprVecLength.prototype.validate = function(varTable, functionTable){
	var vecType = new VecType()
	var vartype = varTable[this.value]
	
	if(!vartype){
		throw new SemanticError("No esta definida la variable: "+ this.value , this.location)
	}
	if(!vecType.equals(vartype)){
		throw new SemanticError("Para la variable: "+ this.value + " se esperaba: " + vecType + " pero se obtuvo: " + vartype, this.location)
	}
	return new IntType()
}

ExprVecMake.prototype.validate = function(varTable, functionTable){
	var intType = new IntType()
	this.expresions.forEach(exp => {
		var expType = exp.validate(varTable, functionTable) 
		if(!intType.equals(expType)){
			throw new SemanticError("Se esperaba: " + intType + " pero se obtuvo: " + expType, this.location)	
		}
	})
	return new VecType() 
}

ExprVecDeref.validate = function(varTable, functionTable){
	var vecType = new VecType()
	var intType = new IntType()
	var varType = varTable[this.id]
	var expType = this.expresion.validate(varTable, functionTable)

	if(!varType){
		throw new SemanticError("No esta definida la variable: "+ this.id , this.location)
	}
	if(!vecType.equals(varType)){
		throw new SemanticError("Para la variable: " + this.id + " Se esperaba: " + vecType + " pero se obtuvo: " + varType, this.location)	
	}
	if(!intType.equals(expType)){
		throw new SemanticError("Se esperaba: " + intType + " pero se obtuvo: " + expType, this.location)		
	}

}

ExprValue.prototype.validate = function(varTable, functionTable){
	return this.getType()
}

ExprVar.prototype.validate = function(varTable, functionTable){
	var vartype = varTable[this.value]
	
	if(!vartype){
		throw new SemanticError("No esta definida la variable: " + this.value , this.location)
	}
	return vartype
}

ExprCall.prototype.validate = function(varTable, functionTable){
	var fun = functionTable[this.id]
	if(!fun){
		throw new SemanticError("La function "+ this.id + " no esta definida" , this.location)
	}

	if(fun.parameters.length != this.expresions.length){
		throw new SemanticError("La cantidad de parámetros es incorrecto se esperaban " + fun.parameters.length + " y se obtuvieron " + this.expresions.length, this.location)	
	}

	for (var i = 0; i < fun.parameters.length; i++) {
		var expresion = this.expresions[i]
		var expType = expresion.validate(varTable, functionTable)
		var parameter = fun.parameters[i]
		if(!expType.equals(parameter.type) ){
			throw new SemanticError("El tipo del parametro es incorrecto se esperaba " + parameter.type + " y se obtuvo " + expType, expresion.location)			
		}
	}

	return fun.type
}

StmtCall.prototype.validate = ExprCall.prototype.validate

export default {}