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
			stats.validate(varLocalTable)	
		})
	})
} 	

ASTNode.prototype.validate = function(varTable){
	
}

StmtAssign.prototype.validate = function(varTable){
	var expType = this.expresion.validate(varTable)
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

ExprAdd.prototype.validate = function(varTable){
	var intType = new IntType()
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return intType	
	}else{
		throw new SemanticError("Error de tipos" , this.location)
	}
	 
}

ExprSub.prototype.validate = function(varTable){
	var intType = new IntType()
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return intType	
	}else{
		throw new SemanticError("Error de tipos" , this.location)
	}
}

ExprMul.prototype.validate = function(varTable){
	var intType = new IntType()
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return intType	
	}else{
		throw new SemanticError("Error de tipos" , this.location)
	}
	 
}

ExprAnd.prototype.validate = function(varTable){
	var boolType = new BoolType() 
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(boolType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}
}

ExprOr.prototype.validate = function(varTable){
	var boolType = new BoolType() 
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(boolType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}
}

ExprNot.prototype.validate = function(varTable){
	var boolType = new BoolType()
	var unaryType = this.expresion.validate(varTable) 
	if(boolType.equals(unaryType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)
	}
}


ExprEq.prototype.validate = function(varTable){
	var boolType = new BoolType()
	var intType = new IntType() 
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}
}

ExprLt.prototype.validate = function(varTable){
	var boolType = new BoolType()
	var intType = new IntType() 
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}
}


ExprGe.prototype.validate = function(varTable){
	var boolType = new BoolType()
	var intType = new IntType() 
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}
}


ExprLe.prototype.validate = function(varTable){
	var boolType = new BoolType()
	var intType = new IntType()  
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}
}

ExprGt.prototype.validate = function(varTable){
	var boolType = new BoolType()
	var intType = new IntType()  
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}	
}

ExprNe.prototype.validate = function(varTable){
	var boolType = new BoolType()
	var intType = new IntType()  
	var firstType = this.expresion.validate(varTable)
	var secondType = this.secondExpresion.validate(varTable)
	if(intType.equals(firstType) && firstType.equals(secondType)){
		return boolType
	}else{
		throw new SemanticError("Error de tipos" , this.location)	
	}	
}

StmtVecAssign.prototype.validate = function(varTable){
	var vecType = new VecType()
	var intType = new IntType()
	var varType = varTable[this.id]

	var expType = this.expresion.validate()
	var secondType = this.secondExpresion.validate()
	if(!varType){
		throw new SemanticError("No esta definida la variable: "+ this.id , this.location)
	}
	if(!vecType.equals(varType)){
		throw new SemanticError("Para la variable: "+ this.id + " se esperaba: " + vecType + " pero se obtuvo: " + varType, this.location)
	}
	if(!(intType.equals(expType) && expType.equals(secondType))){ 
		throw new SemanticError("Error de tipos" , this.location)	
	}

	return vecType
		
	
}

ExprVecLength.prototype.validate = function(varTable){
	var vecType = new VecType()
	var varType = varTable[this.value]
	
	if(!varType){
		throw new SemanticError("No esta definida la variable: "+ this.value , this.location)
	}
	if(!vecType.equals(varType)){
		throw new SemanticError("Para la variable: "+ this.value + " se esperaba: " + vecType + " pero se obtuvo: " + varType, this.location)
	}
	return new IntType()
}

ExprVecMake.prototype.validate = function(varTable){
	var intType = new IntType()
	this.expresions.forEach(exp => {
		var expType = exp.validate(varTable) 
		if(!intType.equals(expType)){
			throw new SemanticError("Se esperaba: " + intType + " pero se obtuvo: " + expType, this.location)	
		}
	})
	return new VecType() 
}

ExprVecDeref.prototype.validate = function(varTable){
	var vecType = new VecType()
	var intType = new IntType()
	var varType = varTable[this.id]
	var expType = this.expresion.validate(varTable)

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

ExprValue.prototype.validate = function(varTable){
	return this.getType()
}

ExprVar.prototype.validate = function(varTable){
	var vartype = varTable[this.value]
	
	if(!vartype){
		throw new SemanticError("No esta definida la variable: " + this.value , this.location)
	}
	return vartype
}

export default {}