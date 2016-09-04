String.prototype.tab = function(n){
	var tab = new Array(n+1).join('--')
	return tab+this.split("\n").join("\n"+tab)
}

const ENTER = "\n"

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
		           + assign.id.tab(level+1) + "=" + this.expresionString(assign.expresion, level) + ENTER
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
		var rep = "(" + exp.constructor.name + "(" + this.expresionString(exp.expresion, level) + ")" + ENTER
		           + this.blockString(exp.block, level)  + ENTER
		           + ")"
		return rep.tab(level+1)
	}

	ifElseString(ifElsest, level){
		var rep = "(" + ifElsest.constructor.name + "(" + this.expresionString(ifElsest.expresion, level) + ")" + ENTER
		           + this.blockString(ifElsest.block, level)  + ENTER
		           + this.blockString(ifElsest.elseBlock, level)  + ENTER
		           + ")"
		return rep.tab(level+1)
	}

	returnString(returnst, level){
		var rep = "(" + returnst.constructor.name + ENTER
					  + this.expresionString(returnst.x, level) + ENTER
					  + ")" 
		return rep.tab(level+1)
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
			case "ExprVar":
				return this.expVarString(expresion, level)
			case "ExprConstNum":
				return this.constString(expresion, level)
    		case "ExprConstBool":
    			return this.constString(expresion, level)
        	case "ExprVecMake":
        		return this.expVecMakeString(expresion, level)
			case "ExprVecLength":
        		return "INVALID"
        	case "ExprVecDeref":
        		return this.expVecDerefString(expresion, level)
        	case "ExprCall":
        		return this.expCallString(expresion, level)
        	case "ExprAnd":
        		return this.binaryExpString(expresion, level)
        	case "ExprOr":
        		return this.binaryExpString(expresion, level)
        	case "ExprNot":
        		return this.notExpString(expresion, level)
        	case "ExprLe":
        		return this.binaryExpString(expresion, level)
        	case "ExprGe":
        		return this.binaryExpString(expresion, level)
        	case "ExprLt":
        		return this.binaryExpString(expresion, level)
        	case "ExprGt":
        		return this.binaryExpString(expresion, level)
        	case "ExprEq":
        		return this.binaryExpString(expresion, level)
    		case "ExprNe":
    			return this.binaryExpString(expresion, level)
    		case "ExprAdd":
    			return this.binaryExpString(expresion, level)
        	case "ExprSub":
        		return this.binaryExpString(expresion, level)
        	case "ExprMul":	
        		return this.binaryExpString(expresion, level)
    		default:
    		   return expresion.toString().tab(level+1)
    	}
    }

    constString(constant, level){
    	var rep = constant.value + ENTER 
    	return rep.tab(level+1)
    }

    unaryString(unary, level){
    	var rep = unary.x + ENTER
    	return rep.tab(level+1)
    }

    expVarString(expVar, level){
    	var rep = "(" + expVar.constructor.name + ENTER
    			   + expVar.id.tab(level+1) + ENTER
    			   + ")"
    	return rep.tab(level+1)	
    }

    expVecDerefString(expVecD, level){
    	var rep = "(" + expVecD.constructor.name + ENTER
    				+ expVecD.id.tab(level+1) + ENTER
    				+ this.expresionString(expVecD.expresion, level) + ENTER
    				+ ")"	
    	return rep.tab(level+1)
    }

    binaryExpString(binary, level){
    	var rep = "(" + binary.constructor.name + ENTER
    				+ this.expresionString(binary.x, level) + ENTER
    				+ this.expresionString(binary.y, level) + ENTER
    				+ ")"	
    	return rep.tab(level+1)
    }

    notExpString(nots, level){
    	var rep = "(" + nots.constructor.name + ENTER
    				+ this.expresionString(nots.x, level) + ENTER
    				+ ")"	
    	return rep.tab(level+1)	
    }

    expVecMakeString(expVecMake, level){
    	var rep = "(" + expVecMake.constructor.name + ENTER
    				+ "[" + expVecMake.expresions.map(s => this.expresionString(s,level)).join(ENTER) + "]" + ENTER
    				+ ")"	
    	return rep.tab(level+1)	
    }

    expCallString(expCall, level){
    	var rep = "(" + expCall.constructor.name + ENTER
    				+ expCall.id.tab(level+1) + ENTER 
    				+ expCall.expresions.map(s => this.expresionString(s,level)).join(ENTER) + ENTER
    				+ ")"	
    	return rep.tab(level+1)	
    }
}

export default new Serializer()