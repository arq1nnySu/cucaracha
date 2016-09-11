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
		table[param.id] = param
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

			if(stats instanceof StmtAssign){
				if (!varLocalTable[stats.id]){
					varLocalTable[stats.id] = stats
				}else{
					var varlocal = varLocalTable[stats.id]
					var gtype = stats.expresion.getType()
					if (!gtype.equals(varlocal.type)){
						throw new SemanticError("Para la variable "+ stats.id + " se esperaba: "+ varlocal.type + " pero se obtuvo: " + gtype , stats.location)								
					} 
				}
				if (stats.expresion instanceof ExprVecLength){
					var gtype = stats.expresion.getType()
					var exp = varLocalTable[stats.expresion.value] 
					if (!exp){
						throw new SemanticError("La variable: "+ stats.expresion.value + " no esta definida", stats.location)
					}else{
						if(!gtype.equals(typeVec)){
							throw new SemanticError("Para la variable: "+ stats.expresion.value + " se esperaba: " + typeVec + " pero se obtuvo: " + gtype, stats.location)
						}
					}
				}
			}

			if(stats instanceof StmtVecAssign){
				if (!varLocalTable[stats.id]){
					var gtype = stats.expresion.getType()
					var gtypevalue = stats.secondExpresion.getType()
					if (!gtype.equals(typeInt)){
						throw new SemanticError("En la expresion [e] se esperaba: "+ typeInt + " pero se obtuvo: "+ gtype , stats.location)							
					}
					if (!gtypevalue.equals(typeInt)){
						throw new SemanticError("Los Vectores son de tipo: "+  typeInt , stats.location)							
					} 
					varLocalTable[stats.id] = stats
				}else{
					var stmtype = stats.getType() 
					if (!stmtype.equals(typeVec)){
						throw new SemanticError("Se esperaba: "+ typeVec + " pero se obtuvo: "+ exptype , stats.location)							
					}
				}
			}		
		})
	})
} 	

export default {}