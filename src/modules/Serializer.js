const ENTER = "\n"

var tabFunction = function(n){
	var tab = new Array(n+1).join('--')
	return tab+this.toString().split(ENTER).join(ENTER+tab)
}

String.prototype.tab = tabFunction
Number.prototype.tab = tabFunction
Boolean.prototype.tab = tabFunction

class Serializer{

	serialize(program){
		return "(Program "+ ENTER + program.map(f => this.functionString(f, 0)).join(ENTER) + ENTER+")"
	}

	functionString(fun, level){
		var rep =  "(Function "+ENTER 
		           + fun.id.tab(level+1) + ENTER 
		           + (fun.parameters.length>0? fun.parameters.map(p => this.paramString(p, level)).join(ENTER)+ENTER :"")
		           + this.typeString(fun.type, level) + ENTER
		           + this.blockString(fun.block, level) + ENTER
		           + ")"
		return rep.tab(level+1)
	}

	paramString(param, level){
		return (param.id+":"+param.type).tab(level+1)
	}

	typeString(type, level){
		return type.toString().tab(level+1)	
	}

	blockString(block, level){
		var rep = "(" + block.constructor.name + ENTER 
		           + block.statements.map(s => this.statementString(s,level)).join(ENTER) + ENTER
		           + ")"
		return rep.tab(level+1)
	}

	statementString(statement, level){
		var sname = statement.constructor.name
		switch(sname) {
			case "StmtAssign":
				return this.assignString(statement, level)
    		case "StmtVecAssign":
    			return this.vecAssignString(statement, level)
        	case "StmtIf":
        		return this.expBlockString(statement, level)
        	case "StmtIfElse":
        		return this.ifElseString(statement, level)
    		case "StmtWhile":
    			return this.expBlockString(statement, level)
    		case "StmtReturn":
    			return this.returnString(statement, level)
        	case "StmtCall":
        		return this.callString(statement, level)
    		default:
    		   return statement.toString().tab(level+1)
    	}
    }

    assignString(assign, level){
		var rep = "(" + assign.constructor.name + ENTER 
		           + assign.id.tab(level+1) + ENTER + this.expresionString(assign.expresion, level) + ENTER
		           + ")"
		return rep.tab(level+1)
	}

	vecAssignString(vecAssign, level){
		var rep = "(" + vecAssign.constructor.name + ENTER 
		           + vecAssign.id.tab(level+1) + "[" + this.expresionString(vecAssign.x, level) + "] =" + this.expresionString(vecAssign.y, level) + ENTER
		           + ")"
		return rep.tab(level+1)
	}
	
	expBlockString(exp, level){
		var tab = level
		var rep = "(" + exp.constructor.name + "(" + this.expresionString(exp.expresion, level) + ")" + ENTER
		           + this.blockString(exp.block, level)  + ENTER
		           + ")"
		return Indents.indent(rep, tab)
	}

	ifElseString(ifElsest, level){
		var tab = level
		var rep = "(" + ifElsest.constructor.name + "(" + this.expresionString(ifElsest.expresion, level) + ")" + ENTER
		           + this.blockString(ifElsest.block, level)  + ENTER
		           + this.blockString(ifElsest.elseBlock, level)  + ENTER
		           + ")"
		return Indents.indent(rep, tab)
	}

	returnString(returnst, level){
		//return block.toString(level)
	}

	callString(call, level){
		var rep = "(" + call.constructor.name + ENTER
		           + call.id.tab(level+1) + ENTER
		           + call.expresions.map(e => this.expresionString(e,level)).join(ENTER) + ENTER
		           + ")"
		return rep.tab(level+1)
	}

	expresionString(expresion, level){
		var ename = expresion.constructor.name
		switch(ename) {
			case "ExprConstNum":
				return this.constString(expresion, level)
    		case "ExprConstBool":
    			return this.constString(expresion, level)
        	case "UnaryExpr":
        		return this.unaryString(expresion, level)
        	case "BinaryExpr":
        		return this.binaryString(expresion, level)
    		case "StmtWhile":
    			return this.whileString(expresion, level)
    		case "StmtReturn":
    			return this.returnString(expresion, level)
        	case "StmtCall":
        		return this.callString(expresion, level)
    		default:
    		   return expresion.toString().tab(level+1)
    	}
    }

    constString(constant, level){
    	var rep = "("+constant.constructor.name  + ENTER  +
    				constant.value.tab(level+1) + ENTER + ")"
    	return rep.tab(level+1)
    }

    unaryString(unary, level){
    	var rep = unary.x + ENTER
    	return rep.tab(level+1)
    }
}

export default new Serializer()