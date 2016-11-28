import AST from './AST';


class Writer {
    constructor(arquitecture) {
        this.arquitecture = arquitecture;
        this.sectionMap = { data: "", text: "", codeFuns: "" }
        this.registers = [
            { id: "rdi", available: true },
            { id: "rbx", available: true },
            { id: "rcx", available: true },
            { id: "rdx", available: true },
            { id: "r8", available: true },
            { id: "r9", available: true },
            { id: "r10", available: true },
            { id: "r11", available: true },
            { id: "r12", available: true },
            { id: "r13", available: true },
            { id: "r14", available: true },
            { id: "r15", available: true },
        ];
        this.specialRegisters = [
            { id: "rax", available: true },
            { id: "rsi", available: true },
            { id: "rdx", available: true },
        ]
    }

    get(value) {
        if (this.arquitecture == 'macos') {
            return "_" + value;
        }
        return value;
    }

    addSection(sectName) {
        this.sectionMap[sectName] = ""
    }

    writeSection(sectName, line) {
        if (!this.sectionMap[sectName].includes(line) || sectName == 'codeFuns') {
            this.sectionMap[sectName] = this.sectionMap[sectName] + line
        }
    }


    write(line) {
        this.writeSection("codeFuns", line + "\n")
    }
    writeText(line) {
        this.writeSection("text", line)
    }
    writeT(line) {
        this.writeSection("codeFuns", line.tab())
    }

    getSection(sectName) {
        return "section ." + sectName + "\n" + this.sectionMap[sectName]
    }

    build() {
        return this.sectionMap.data + "\n" + this.sectionMap.text + "\n" + this.sectionMap.codeFuns;
    }

    giveRegister() {
        var register = _.find(this.registers, { available: true })
        register.available = false
        return register
    }

    addRegister(register) {
        register.available = true
    }

    getSpecial(name) {
        var register = _.find(this.specialRegisters, { id: name })
        register.available = false
        return register
    }
}

Program.prototype.compile = function(arquitecture) {
    let writer = new Writer(arquitecture)
    writer.writeSection("data", "section .data \n")
    writer.writeSection("text", "section .text \n")
    writer.writeSection("text", `global ${writer.get('main')} \n`)
    writer.writeSection("text", `extern ${writer.get('exit')}`)

    this.forEach(f => f.compile(writer))
    writer.write(`${writer.get('main')}:`)
    writer.writeT("call cuca_main")
    writer.writeT("mov rdi, 0")
    writer.writeT(`ret`)
    return writer.build()
}

Fun.prototype.compile = function(writer) {
    var varLocal = {}
    var spcreq = (this.parameters.length + 1) * 8 // +1 es porque se guarda el valor de retorno

    if (this.id == "putChar" || this.id == "putNum") return "";

    writer.write("cuca_" + this.id + ":")
    writer.writeT("push rbp")
    writer.writeT("mov rbp, rsp")

    this.parameters.forEach(p => {
        varLocal[p.id] = spcreq
        spcreq = spcreq + 8
    })
    this.block.bookspace(writer, varLocal)
    this.block.compile(writer, varLocal)
}


function isNewVar(item) {
    return item.includes("N_");
}

ASTNode.prototype.bookspace = function(writer, i, varLocal) {

}

Block.prototype.bookspace = function(writer, varLocal) {
    var i = 0
    this.statements.forEach(s => {
        s.bookspace(writer, i, varLocal)
        if (Object.keys(varLocal).filter(isNewVar).length > i) {
            i = i + 1
        }
    })
    if (i > 0) {
        writer.writeT("sub rsp, " + i * 8)
    }
}

Block.prototype.compile = function(writer, varLocal) {
    var i = 1
    this.statements.forEach(s => s.compile(writer, i, varLocal))
    writer.writeT("mov rsp, rbp")
    writer.writeT("pop rbp")
    writer.writeT("ret")
}


StmtCall.prototype.compile = function(writer, i, varLocal) {
    if (this.id == "putChar") {
        writer.writeText(`, ${writer.get('putchar')}`)
        var reg = this.expresions[0].compile(writer, i, varLocal)
        writer.writeT(`mov rdi, ${reg.id}`)
        writer.writeT(`call ${writer.get('putchar')}`)
        writer.addRegister(reg)
    }
    if (this.id == "putNum") {
        writer.writeText(`, ${writer.get('printf')}`)
        writer.writeSection("data", "lli_format_string db '%lli'")
        var reg = this.expresions[0].compile(writer, i, varLocal)
        writer.writeT("mov rsi, " + reg.id)
        writer.writeT("mov rdi, lli_format_string")
        writer.addRegister(reg);
        writer.writeT(`call ${writer.get('printf')} `)
    }

    if (this.id != "putNum" && this.id != "putChar") {
        var c = 0
        var spcreq = this.expresions.length * 8
        writer.writeT("sub rsp, " + spcreq)
        this.expresions.forEach(e => {
            e.compile(writer, c, varLocal)
            c = c + 8
        })
        writer.writeT("call cuca_" + this.id)
    }
}

StmtAssign.prototype.bookspace = function(writer, i, varLocal) {
    if (!varLocal[this.id]) {
        varLocal["N_" + this.id] = (i + 1) * 8
    }
}

StmtAssign.prototype.compile = function(writer, i, varLocal) {
    var salt;
    if (varLocal["N_" + this.id]) {
        salt = varLocal["N_" + this.id]
    } else {
        salt = varLocal[this.id]
    }
    var reg = this.expresion.compile(writer, i, varLocal);
    salt = `[rbp -  ${salt}]`
    writer.writeT(`mov ${salt}, ${reg.id}`)
    return { id: salt }
}

ExprConstNum.prototype.compile = function(writer) {
    var reg = writer.giveRegister();
    writer.writeT(`mov ${reg.id}, ${this.value}`)
    return reg;
}

ExprConstBool.prototype.compile = function(writer, i) {
    var value = "0"
    if (this.value) {
        value = "-1"
    }

    var reg = writer.giveRegister();
    writer.writeT(`mov ${reg.id}, ${value}`)
    return reg;
}

let aritmeticos = function(writer, c, varLocal) {
    var reg
    if (this.isConstant) {
        reg = writer.giveRegister();
        writer.writeT(`mov ${reg.id}, ${this.eval()}`)
        writer.addRegister(reg);
    } else {
        reg = this.expresion.compile(writer, c, varLocal);
        var reg2 = this.secondExpresion.compile(writer, c, varLocal);
        this.binaryCompile(writer, reg, reg2);
        writer.addRegister(reg2);
    }
    return reg
}

ExprAdd.prototype.compile = aritmeticos
ExprAdd.prototype.binaryCompile = function(writer, reg1, reg2) {
    writer.writeT(`add ${reg1.id}, ${reg2.id}`)
}

ExprSub.prototype.compile = aritmeticos
ExprSub.prototype.binaryCompile = function(writer, reg1, reg2) {
    writer.writeT(`sub ${reg1.id}, ${reg2.id}`)
}

ExprMul.prototype.compile = aritmeticos
ExprMul.prototype.binaryCompile = function(writer, reg1, reg2) {
    var rax = writer.getSpecial("rax")

    writer.writeT(`mov ${rax.id}, ${reg1.id}`)
    writer.writeT(`imul ${reg2.id}`)
    writer.writeT(`mov ${reg1.id}, ${rax.id}`)
    writer.addRegister(rax);
}

ExprOr.prototype.compile = function(writer, c, varLocal) {
    var reg1 = this.expresion.compile(writer, c, varLocal);
    var reg2 = this.secondExpresion.compile(writer, c, varLocal);
    writer.writeT(`or ${reg1.id}, ${reg2.id}`)
    writer.addRegister(reg2);
    return reg1;
}

ExprAnd.prototype.compile = function(writer, c, varLocal) {
    var reg1 = this.expresion.compile(writer, c, varLocal);
    var reg2 = this.secondExpresion.compile(writer, c, varLocal);
    writer.writeT(`and ${reg1.id}, ${reg2.id}`)
    writer.addRegister(reg2);
    return reg1;
}

ExprNot.prototype.compile = function(writer, c, varLocal) {
    var reg = this.expresion.compile(writer, c, varLocal);
    writer.writeT(`not ${reg.id}`)
    return reg;
}

ExprVar.prototype.compile = function(writer, c, varLocal) {
    var salt;
    if (varLocal["N_" + this.value]) {
        salt = varLocal["N_" + this.value]
    } else {
        salt = varLocal[this.value]
    }
    salt = `[rbp -  ${salt}]`
    return { id: salt }
}

StmtReturn.prototype.compile = function(writer, c, varLocal) {
    var reg
    if (this.expresion.isConstant) {
        reg = { id: this.expresion.eval() }
    } else {
        reg = this.expresion.compile(writer, c, varLocal);
    }

    writer.writeT(`mov rax, ${reg.id}`)
    writer.addRegister(reg)
}

StmtIfElse.prototype.compile = function(writer, c, varLocal) {
	 var reg = this.expresion.compile(writer, c, varLocal)
	 writer.writeT(`cmp ${reg.id}, 0`)
	 writer.writeT('je . label_else')
	 this.block.compile(writer, varLocal)
	 writer.writeT('jmp . label_fin')
	 writer.writeT('.label_else')
	 this.elseBlock.compile(writer, varLocal)
	 writer.writeT('.label_fin')
}

ExprCall.prototype.compile = function(writer, c, varLocal) {
    var usedRegisters = _.filter(writer.registers + writer.specialRegisters, { available: false });
    usedRegisters.forEach(reg => writer.writeT(`push ${reg.id}`))

    var spcreq = this.expresions.length * 8
    writer.writeT("sub rsp, " + spcreq)
    this.expresions.forEach(e => {
        e.compile(writer, c, varLocal)
        c = c + 8
    })
    writer.writeT("call cuca_" + this.id)

    usedRegisters.forEach(reg => writer.writeT(`pop ${reg.id}`))
    var reg = writer.giveRegister()
    writer.writeT(`mov ${reg.id}, rax`)

    return reg;
}

export default {}