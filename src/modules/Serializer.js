import AST from './AST';

const ENTER = "\n"

var tabFunction = function(){
	var tab = new Array(2).join('  ')
	return tab+this.toString().trim().split(ENTER).join(ENTER+tab)+ENTER
}

String.prototype.tab = tabFunction
Number.prototype.tab = tabFunction
Boolean.prototype.tab = tabFunction

Arrays.prototype.serializeElements = function(){
	if(this.length > 0){
		return this.map(element => element.serialize()).join("")		
	}
	return ""
	
}

Program.prototype.serialize = function(){
	return "(" + this + ENTER + this.serializeElements() +")"
} 

Fun.prototype.serialize = function(){
	var rep = "(" + this + ENTER 
	   + this.id.tab()
	   + this.type.serialize()
	   + this.parameters.serializeElements()
	   + this.block.serialize()
	   + ")"
	return rep.tab()
}

Parameter.prototype.serialize = function(){
	var rep = "(" + this + ENTER 
	           + this.id.tab()
	           + this.type.serialize()
	           + ")"
	return rep.tab()
}

ASTType.prototype.serialize = function(){
	return this.toString().tab()
}

Block.prototype.serialize = function(){
	var rep = "(" + this  + ENTER 
	           + this.statements.serializeElements()
	           + ")"
	return rep.tab()
}

ASTNodeIdAndExpresion.prototype.serialize = function(){
	var rep = "(" + this + ENTER 
	           + this.id.tab() 
	           + this.expresion.serialize()
	           + ")"
	return rep.tab()
}

StmtVecAssign.prototype.serialize = function(){
	var rep = "(" + this + ENTER 
	           + this.id.tab()
	           + this.expresion.serialize() 
	           + this.secondExpresion.serialize() 
	           + ")"
	return rep.tab()
}

StmtExpresionBlock.prototype.serialize = function(){
	var rep = "(" + this +  ENTER 
		   + this.expresion.serialize() 
           + this.block.serialize()
           + ")"
	return rep.tab() 
}

StmtIfElse.prototype.serialize = function(){
	var rep = "(" + this + ENTER 
			   + this.expresion.serialize()
	           + this.block.serialize()
	           + this.elseBlock.serialize()
	           + ")"
	return rep.tab()
}

UnaryExpr.prototype.serialize = function(){
	var rep = "(" + this + ENTER
				  + this.expresion.serialize()
			+ ")" 
	return rep.tab()
}

ASTNodeIdAndExpresions.prototype.serialize = function(){
	var rep = "(" + this + ENTER
	           + this.id.tab()
	           + this.expresions.serializeElements()
	           + ")"
	return rep.tab() 
}

ExprValue.prototype.serialize = function(){
	var rep = "(" + this + ENTER
			   + this.value.tab()
			   + ")"
	return rep.tab()
}

ExprVecMake.prototype.serialize = function(){
	var rep = "(" + this + ENTER
				+ this.expresions.serializeElements()
				+ ")"	
	return rep.tab()
}

BinaryExpr.prototype.serialize = function(){
	var rep = "(" + this + ENTER
			+ this.expresion.serialize()
			+ this.secondExpresion.serialize()
			+ ")"	
	return rep.tab()
}

export default {}