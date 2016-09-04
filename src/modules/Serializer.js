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
		           + this.blockStirng(fun.block, tab) + ENTER
		           + ")"
		return Indents.indent(rep, tab)
	}

	paramString(param, level){
		return Indents.indent(param.id+":"+param.type, level+1)	
	}

	typeString(type, level){
		return Indents.indent(type.toString(), level+1)	
	}

	blockStirng(block, level){
		return block.toString(level)
	}
}

export default new Serializer()