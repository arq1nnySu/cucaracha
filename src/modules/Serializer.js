import Indents from "../utils/Indents.js";

const ENTER = "\n"

class Serializer{

	serialize(program){
		return "(Program "+ ENTER + program.map(f => this.functionString(f, 1)).join(ENTER) + ENTER+")"
	}

	functionString(fun, level){
		var tab = level+1
		var rep =  "(Function "+ENTER 
		           + Indents.indent(fun.id, tab+1) + ENTER 
		           + (fun.parameters.length>0? fun.parameters.map(p => this.paramString(p, tab)).join(ENTER)+ENTER :"")
		           + this.typeString(fun.type, tab) + ENTER
		           + this.blockString(fun.block, tab) + ENTER
		           + ")"
		return Indents.indent(rep, tab)
	}

	paramString(param, level){
		return Indents.indent(param.id+":"+param.type, level+1)	
	}

	typeString(type, level){
		return Indents.indent(type.toString(), level+1)	
	}

	blockString(block, level){
		var tab = level
		var rep = "(" + block.constructor.name + ENTER 
		           + block.statements.map(s => this.statementString(s,tab)).join(ENTER) + ENTER
		           + ")"
		return Indents.indent(rep, tab+1)
	}

	statementString(statement, level){
		var sname = statement.constructor.name
		switch(sname) {
			case "StmtAssign":
				return this.assignString(statement, level)
    		case "StmtVecAssign":
    			return this.vecAssignString(statement, level)
        	case "StmtIf":
        		return this.ifString(statement, level)
        	case "StmtIfElse":
        		return this.ifElseString(statement, level)
    		case "StmtWhile":
    			return this.whileString(statement, level)
    		case "StmtReturn":
    			return this.returnString(statement, level)
        	case "StmtCall":
        		return this.callString(statement, level)
    		default:
    		   return "INVALID"
    	}
    }

    assignString(assign, level){
    	var tab = level
		var rep = "(" + assign.constructor.name + ENTER 
		           + Indents.indent(assign.id, tab+1) + "=" + this.expresionString(assign.expresion, level) + ENTER
		           + ")"
		return Indents.indent(rep, tab+1)
	}

	vecAssignString(vecAssign, level){
		var tab = level
		var rep = "(" + vecAssign.constructor.name + ENTER 
		           + Indents.indent(vecAssign.id, tab+1) + "[" + this.expresionString(vecAssign.x, level) + "] =" + this.expresionString(vecAssign.y, level) + ENTER
		           + ")"
		return Indents.indent(rep, tab+1)
	}

    callString(call, level){
		var tab = level
		var rep = "(" + call.constructor.name + ENTER
		           + Indents.indent(call.id, tab) + ENTER
		           + call.expresions.map(e => this.expresionString(e,tab)).join(ENTER) + ENTER
		           + ")"
		return Indents.indent(rep, tab)
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
    		   return "INVALID"
    	}
    }

    constString(constant, level){
    	var rep = constant.value + ENTER 
    	return Indents.indent(rep, level)
    }

    unaryString(unary, level){
    	var rep = unary.x + "\n" 
    	return Indents.indent(rep, level)
    }
}

export default new Serializer()