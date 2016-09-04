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
				this.assignString(statement, level)
				break;
    		case "StmtVecAssign":
        		this.vecAssignString(statement, level)
        		break;
        	case "StmtIf":
        		this.ifString(statement, level)
        		break;
        	case "StmtIfElse":
				this.ifElseString(statement, level)
				break;
    		case "StmtWhile":
        		this.whileString(statement, level)
        		break;
    		case "StmtReturn":
        		this.returnString(statement, level)
        		break;
        	case "StmtCall":
        		this.callString(statement, level)
				break;
    		default:
    		   // ?
    	}
    }

    assignString(assign, leve){
		//return block.toString(level)
	}

	vecAssignString(vecAssign, level){
		//return block.toString(level)
	}

	ifString(if, level){
		//return block.toString(level)
	}

	ifElseString(ifElse, level){
		//return block.toString(level)
	}

	whileString(while, level){
		//return block.toString(level)
	}

	returnString(return, level){
		//return block.toString(level)
	}

	callString(call, level){
		var tab = level
		var rep = "(" + call.constructor.name + ENTER
		           + Indents.indent(call.id, tab) + ENTER
		           + call.expresions.map(s => s.toString(tab)).join(ENTER) + ENTER
		           + ")"
		return Indents.indent(rep, tab)
	}

}

export default new Serializer()