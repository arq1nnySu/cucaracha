import AST from './AST';


class Writer {
	constructor(arquitecture){
		this.arquitecture = arquitecture;
		this.sectionMap = {data:"", text:"",codeFuns:""}
	}

	get(value){
		if(this.arquitecture == 'macos'){
			return "_"+value;
		}
		return value;
	}

	addSection(sectName){
		this.sectionMap[sectName] = "" 
	}

	writeSection(sectName, line){
		this.sectionMap[sectName] = this.sectionMap[sectName] + line
	}


	write(line){
		this.writeSection("codeFuns", line+"\n")
	}
	writeText(line){
		if (!this.sectionMap["text"].includes(line)){
			this.writeSection("text", line)	
		}
	}
	writeT(line){
		this.writeSection("codeFuns", line.tab())
	}

	getSection(sectName){
		return "section ." + sectName + "\n" + this.sectionMap[sectName]
	}

	build(){
		return this.sectionMap.data+"\n"+this.sectionMap.text+"\n"+this.sectionMap.codeFuns;
	}
}

Program.prototype.compile = function(arquitecture){
	let writer = new Writer(arquitecture) 
	writer.writeSection("data", "section .data \n")
	writer.writeSection("text", "section .text \n")
	writer.writeSection("text", `global ${writer.get('main')} \n`)
	writer.writeSection("text", `extern ${writer.get('exit')}`)
	//_putchar
	this.forEach(f => f.compile(writer))
	writer.write(`${writer.get('main')}:`)
	writer.writeT( "call cuca_main")
	writer.writeT( "mov rdi, 0")
	writer.writeT( `call ${writer.get('exit')}`)
	return writer.build()
}

Fun.prototype.compile = function(writer){
	var varLocal = {}
	var spcreq = (this.parameters.length+1) * 8 // +1 es porque se guarda el valor de retorno
	
	if(this.id == "putChar" || this.id == "putNum") return "";
	writer.write("cuca_"+this.id+":")
	writer.writeT("push rbp")
	writer.writeT("mov rbp, rsp")
	this.parameters.forEach(p => {
		varLocal[p.id] = spcreq
		spcreq = spcreq+8 
		})
	this.block.compile(writer, varLocal)
} 	


function isNewVar(item) {
  return item.includes("N_");
}

Block.prototype.compile = function(writer, varLocal){
	var i=1
	this.statements.forEach(s => { s.compile(writer, i, varLocal)
		if ( Object.keys(varLocal).filter(isNewVar).length >= i){
			i=i+1
		}})
	writer.writeT("mov rsp, rbp")
	writer.writeT("pop rbp")
	writer.writeT( "ret")
}

StmtCall.prototype.compile = function(writer, i, varLocal){
	if(this.id == "putChar"){
		writer.writeText(`, ${writer.get('putchar')}`)
		if (varLocal == {}) {
			writer.writeT("mov rdi, "+this.expresions[0].value) 	
		}
		else{
			if(varLocal["N_"+this.expresions[0].value]){
				writer.writeT("mov rdi, [rbp - "+varLocal["N_"+this.expresions[0].value]+"]")
			}else{
				writer.writeT("mov rdi, [rbp + "+varLocal[this.expresions[0].value]+"]")
			}
		}
		writer.writeT(`call ${writer.get('putchar')}`)
	}
	if(this.id == "putNum"){
		writer.writeText(`, ${writer.get('printf')}`)
		writer.writeSection("data", "lli_format_string db '% lli'")
		writer.writeT("mov rsi, "+this.expresions[0].value)
		writer.writeT("mov rdi, lli_format_string")
		writer.writeT("mov rax, 0")
		writer.writeT(`call ${writer.get('printf')} `)
	}

	if(this.id !="putNum" && this.id !="putChar"){
      var c=0
      var spcreq = this.expresions.length * 8 
      writer.writeT("sub rsp, "+spcreq)
      this.expresions.forEach(e => { e.compile(writer,c) 
      c=c+8 })
      writer.writeT("call cuca_"+this.id)
    }
}

StmtAssign.prototype.compile = function(writer, i, varLocal){
	if(!varLocal[this.id]){
		writer.writeT("sub rsp, "+i*8)
		writer.writeT("mov rdi, "+this.expresion.value)
		writer.writeT("mov [rbp - "+i*8+"], rdi")
		varLocal["N_"+this.id] = i*8		
	}else{
		writer.writeT("mov rdi, "+this.expresion.value)
		writer.writeT("mov [rbp + "+varLocal[this.id]+"], rdi")
	}
}

ExprConstNum.prototype.compile = function(writer, c){
	writer.writeT("mov rdi, "+this.value)
	writer.writeT("mov [rsp + "+c+"], rdi")
}

export default {}