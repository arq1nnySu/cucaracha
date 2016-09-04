import Indents from "../utils/Indents.js";

const ENTER = "\n"

class Serializer{

	serialize(program){
		return "(Program "+ ENTER + program.map(f => this.functionString(f, 0)).join(ENTER) + ENTER+")"
	}

	functionString(fun, level){
		var rep =  "(Function "+ENTER 
		           + Indents.indent(fun.id, level+1) + ENTER 
		           + (fun.parameters.length>0? fun.parameters.map(p => this.paramString(p, level)).join(ENTER)+ENTER :"")
		           + this.typeString(fun.type, level) + ENTER
		           + this.blockString(fun.block, level) + ENTER
		           + ")"
		return Indents.indent(rep, level+1)
	}

	paramString(param, level){
		return Indents.indent(param.id+":"+param.type, level+1)	
	}

	typeString(type, level){
		return Indents.indent(type.toString(), level+1)	
	}

	blockString(block, level){
		var rep = "(" + block.constructor.name + ENTER 
		           + block.statements.map(s => this.statementString(s,level)).join(ENTER) + ENTER
		           + ")"
		return Indents.indent(rep, level+1)
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
		var rep = "(" + assign.constructor.name + ENTER 
		           + Indents.indent(assign.id, level+1) + "=" + this.expresionString(assign.expresion, level) + ENTER
		           + ")"
		return Indents.indent(rep, level+1)
	}

	vecAssignString(vecAssign, level){
		var rep = "(" + vecAssign.constructor.name + ENTER 
		           + Indents.indent(vecAssign.id, level+1) + "[" + this.expresionString(vecAssign.x, level) + "] =" + this.expresionString(vecAssign.y, level) + ENTER
		           + ")"
		return Indents.indent(rep, level+1)
	}

    callString(call, level){
		var rep = "(" + call.constructor.name + ENTER
		           + Indents.indent(call.id, level+1) + ENTER
		           + call.expresions.map(e => this.expresionString(e,level)).join(ENTER) + ENTER
		           + ")"
		return Indents.indent(rep, level+1)
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
    		   return Indents.indent(expresion.toString(), level+1)
    	}
    }

    constString(constant, level){
    	var rep = constant.value + ENTER 
    	return Indents.indent(rep, level+1)
    }

    unaryString(unary, level){
    	var rep = unary.x + ENTER
    	return Indents.indent(rep, level+1)
    }
}

export default new Serializer()