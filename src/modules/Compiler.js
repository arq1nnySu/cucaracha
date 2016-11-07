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
	if(this.id == "putChar" || this.id == "putNum") return "";
	writer.write("cuca_"+this.id+":")
	this.block.compile(writer)
} 	

Block.prototype.compile = function(writer){
	this.statements.forEach(s => s.compile(writer))
	writer.writeT( "ret")
}

StmtCall.prototype.compile = function(writer){
	if(this.id == "putChar"){
		writer.writeText(`, ${writer.get('putChar')}:`)
		writer.writeT("mov rdi, "+this.expresions[0].value) 
		writer.writeT(`call ${writer.get('putChar')}`)
	}
	if(this.id == "putNum"){
		writer.writeText(`, ${writer.get('printf')}`)
		writer.writeSection("data", "lli_format_string db '% lli'")
		writer.writeT("mov rsi, "+this.expresions[0].value)
		writer.writeT("mov rdi, lli_format_string")
		writer.writeT("mov rax, 0")
		writer.writeT(`call ${writer.get('printf')} `)
	}
}

export default {}