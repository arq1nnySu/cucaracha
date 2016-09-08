import AST from './AST';

Arrays.prototype.semanticizeElements = function(){
	if (this.length >0){
		return this.map(element => element.semanticize())
	}
}

Program.prototype.semanticize = function(){
	return this.semanticizeElements() 
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