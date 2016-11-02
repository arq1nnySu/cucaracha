import AST from './AST';

Program.prototype.compute = function(){ 
	var mainFunction = _.find(this, { 'id': "main" });

	mainFunction.compute({})
}

Fun.prototype.compute = function(context, parameters){
	switch(this.id){
		case "putChar":
			console.log( String.fromCharCode(_.head(this.parameters)))
			break;
		case "putNum":
			console.log(_.head(this.parameters))
			break;
		default:
			this.block.compute(context, parameters)
			break;

	}
}

Block.prototype.compute = function(context, parameters){
	this.statements.forEach( s=> s.compute(context, parameters))
}

StmtCall.prototype.compute = function(context, parameters){
	context[this.id].compute(context, this.expresions.map(exp=> exp.compute(context, parameters)))
}

ExprValue.prototype.compute = function(context, parameters){
	return this.value
} 


