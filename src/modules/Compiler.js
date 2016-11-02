import AST from './AST';

Program.prototype.compile = function(){

	let code = "section .text \n";
	code += "global _main \n"
	code += "extern _exit , _putchar \n"
	this.forEach(f => code += f.compile())
	code += " \n _main: \n"
	code += "call cuca_main".tab()
	code += "mov rdi, 0".tab()
	code += "ret".tab()
	return code

}

Fun.prototype.compile = function(){
	if(this.id == "putChar" || this.id == "putNum") return "";
	let code = "cuca_"+this.id + ":\n";
	code += this.block.compile().tab()
	code += "ret \n".tab()
	return code
} 	

Block.prototype.compile = function(){
	let code = ""
	this.statements.forEach(s => code += s.compile())
	return code
}

StmtCall.prototype.compile = function(){
	let code = ""
	if(this.id == "putChar"){
		code += "mov rdi , "+this.expresions[0].value + "\n"
		code += "call _putchar \n"
	}
	return code;
}

export default {}