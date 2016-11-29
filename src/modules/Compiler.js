import AST from './AST';

class Writer {
    constructor(arquitecture) {
        this.arquitecture = arquitecture;
        this.sectionMap = { data: "", text: "", codeFuns: "" }
        this.labelId = 1
        this.registers = [
            { id: "rdi", available: true, isRegister: true },
            { id: "rbx", available: true, isRegister: true },
            { id: "rcx", available: true, isRegister: true },
            { id: "rdx", available: true, isRegister: true },
            { id: "r8", available: true, isRegister: true },
            { id: "r9", available: true, isRegister: true },
            { id: "r10", available: true, isRegister: true },
            { id: "r11", available: true, isRegister: true },
            { id: "r12", available: true, isRegister: true },
            { id: "r13", available: true, isRegister: true },
            { id: "r14", available: true, isRegister: true },
            { id: "r15", available: true, isRegister: true },
        ];
        this.specialRegisters = [
            { id: "rax", available: true, isRegister: true },
            { id: "rsi", available: true, isRegister: true },
            { id: "rdx", available: true, isRegister: true },
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

    nextLabel() {
        var label = this.labelId
        this.labelId += 1
        return ".label_" + label
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
    var space = this.block.bookspace(writer, 0, varLocal)
    if (space > 0) {
        writer.writeT("sub rsp, " + space * 8)
    }
    this.block.compile(writer, varLocal)
    writer.writeT("mov rsp, rbp")
    writer.writeT("pop rbp")
    writer.writeT("ret")
}


function isNewVar(item) {
    return item.includes("N_");
}

ASTNode.prototype.bookspace = function(writer, acc, varLocal) {
    return acc;
}

Block.prototype.bookspace = function(writer, acc, varLocal) {
    return this.statements.reduce((total, s) => s.bookspace(writer, total, varLocal), acc)

    // if (Object.keys(varLocal).filter(isNewVar).length > i) {
    //     i = i + 1
    // }
}


StmtAssign.prototype.bookspace = function(writer, i, varLocal) {
    if (!varLocal[this.id] && !varLocal["N_" + this.id]) {
        varLocal["N_" + this.id] = (i + 1) * 8
        return i + 1
    }
    return i
}

StmtIfElse.prototype.bookspace = function(writer, i, varLocal) {
    var space = this.block.bookspace(writer, i, varLocal)
    return this.elseBlock.bookspace(writer, space, varLocal)
}

StmtExpresionBlock.prototype.bookspace = function(writer, space, varLocal) {
    return this.block.bookspace(writer, space, varLocal)
}

ExprVecMake.prototype.bookspace = function(writer, space, varLocal) {
    return (this.length + 1)+space
}

Block.prototype.compile = function(writer, varLocal) {
    var i = 1
    this.statements.forEach(s => {
        s.compile(writer, i, varLocal)
        console.log("Que es Stmt")
        console.log(s.constructor.name)
        console.log("Que es var local")
        console.log(varLocal)
    })
}


StmtCall.prototype.compile = function(writer, i, varLocal) {
    if (this.id == "putChar") {
        writer.writeText(`, ${writer.get('putchar')}`)
        var reg = this.expresions[0].compile(writer, i, varLocal)
        if (reg.id != "rdi") {
            writer.writeT(`mov rdi, ${reg.id}`)
        }

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
        writer.writeT("mov rax, 0")
        writer.writeT(`call ${writer.get('printf')} `)
    }

    if (this.id != "putNum" && this.id != "putChar") {
        var c = 0
        var spcreq = this.expresions.length * 8
        writer.writeT("sub rsp, " + spcreq)
        this.expresions.forEach(e => {
            var r = e.compile(writer, c, varLocal)
            writer.addRegister(r);
            c = c + 8
        })
        writer.writeT("call cuca_" + this.id)
    }
}

StmtAssign.prototype.compile = function(writer, i, varLocal) {
    var salt;
    if (varLocal["N_" + this.id]) {
        salt = `[rbp - ${varLocal["N_" + this.id]}]`
    } else {
        salt = `[rsp + ${varLocal[this.id]}]`
    }
    console.log("Veamos que pasa aqui")
    console.log("Que stament es")
    console.log(this.id)
    console.log("Que expresion es")
    console.log(this.expresion.constructor.name)
    var reg = this.expresion.compile(writer, i, varLocal);
    console.log("en que registro se guarda reg")
    console.log(reg)
    if (salt.replace(/\s/g, "") != reg.id.replace(/\s/g, "")) {
        console.log("pasa por aqui")
        writer.writeT(`mov ${salt}, ${reg.id}`)
    }
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
    writer.writeT(`mov ${reg.id}, ${this.rep()}`)
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

        if (!reg.isRegister) {
            var newReg = writer.giveRegister()
            writer.writeT(`mov ${newReg.id}, ${reg.id}`)
            reg = newReg
        }

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
        salt = `[rbp - ${varLocal["N_" + this.value]}]`
    } else {
        salt = `[rsp + ${varLocal[this.value]}]`
    }
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
    var label = writer.nextLabel()
    var fin = writer.nextLabel()
    writer.writeT(`cmp ${reg.id}, 0`)
    writer.writeT('je ' + label)
    this.block.compile(writer, varLocal)
    writer.writeT('jmp ' + fin)
    writer.writeT(label + ":")
    this.elseBlock.compile(writer, varLocal)
    writer.writeT(fin + ":")
}

var ifwhile = function(writer, c, varLocal) {
    var label = writer.nextLabel()
    var fin = writer.nextLabel()
    writer.writeT(label + ":")
    var reg = this.expresion.compile(writer, c, varLocal)
    writer.writeT(`cmp ${reg.id}, 0`)
    writer.writeT('je ' + fin)
    this.block.compile(writer, varLocal)
    if (this.constructor.name == "StmtWhile") {
        writer.writeT('jmp ' + label)
    }
    writer.writeT(fin + ":")
}

StmtIf.prototype.compile = ifwhile
StmtWhile.prototype.compile = ifwhile

StmtVecAssign.prototype.compile = function(writer, c, varLocal) {
    this.value = this.id
    var vec = this.vecVar(writer, c, varLocal)
    var reg = this.expr1.compile(writer, c, varLocal);

    if (!reg.isRegister) {
        var newReg = writer.giveRegister()
        writer.writeT(`mov ${newReg.id}, ${reg.id}`)
        reg = newReg
    }
    var req2 = this.expr2.compile(writer, c, varLocal);
    writer.writeT(`mov rax, ${reg.id}`)
    writer.writeT(`inc rax`)
    writer.writeT(`sal rax, 3`)
    writer.writeT(`add rax, ${vec.id}`)
    writer.writeT(`mov [rax], ${reg2.id}`)
    return reg;
}

ExprCall.prototype.compile = function(writer, c, varLocal) {
    var usedRegisters = _.filter(writer.registers + writer.specialRegisters, { available: false });
    usedRegisters.forEach(reg => {
        writer.writeT(`push ${reg.id}`)
        reg.available = true
    })
    var i = 0
    this.expresions.forEach(e => {
        var reg = e.compile(writer, c, varLocal)
        if (!reg.isRegister) {
            var newReg = writer.giveRegister()
            writer.writeT(`mov ${newReg.id}, ${reg.id}`)
            reg = newReg
        }

        writer.writeT(`mov [rsp + ${i}], ${reg.id}`)
        writer.addRegister(reg)
        i = i + 8
    })
    writer.writeT("call cuca_" + this.id)

    usedRegisters.forEach(reg => {
        writer.writeT(`pop ${reg.id}`)
        reg.available = false
    })
    var reg = writer.giveRegister()
    writer.writeT(`mov ${reg.id}, rax`)

    return reg;
}

var relacionales = function(writer, c, varLocal) {
    var reg1 = this.expresion.compile(writer, c, varLocal);
    var reg2 = this.secondExpresion.compile(writer, c, varLocal);

    if (!reg1.isRegister) {
        var newReg = writer.giveRegister()
        writer.writeT(`mov ${newReg.id}, ${reg1.id}`)
        reg1 = newReg
    }

    writer.writeT(`cmp ${reg1.id}, ${reg2.id}`)
    var label1 = writer.nextLabel()
    writer.writeT(this.jumpCode + " " + label1)
    writer.writeT(`mov ${reg1.id}, 0`)
    var label2 = writer.nextLabel()
    writer.writeT("jmp " + label2)
    writer.writeT(`${label1}:`)
    writer.writeT(`mov ${reg1.id}, -1`)
    writer.writeT(`${label2}:`)
    return reg1;
}


ExprEq.prototype.compile = relacionales
ExprEq.prototype.jumpCode = 'je'

ExprLt.prototype.compile = relacionales
ExprLt.prototype.jumpCode = 'jl'

ExprLe.prototype.compile = relacionales
ExprLe.prototype.jumpCode = 'jle'

ExprGe.prototype.compile = relacionales
ExprGe.prototype.jumpCode = 'jge'

ExprGt.prototype.compile = relacionales
ExprGt.prototype.jumpCode = 'jg'

ExprNe.prototype.compile = relacionales
ExprNe.prototype.jumpCode = 'jne'

StmtVecAssign.prototype.vecVar = ExprVar.prototype.compile
StmtVecAssign.prototype.compile = function(writer, c, varLocal) {
    this.value = this.id
    var vec = this.vecVar(writer, c, varLocal)
    var reg = this.expresion.compile(writer, c, varLocal);

    if (!reg.isRegister) {
        var newReg = writer.giveRegister()
        writer.writeT(`mov ${newReg.id}, ${reg.id}`)
        reg = newReg
    }
    var reg2 = this.secondExpresion.compile(writer, c, varLocal);
    writer.writeT(`mov rax, ${reg.id}`)
    writer.writeT(`inc rax`)
    writer.writeT(`sal rax, 3`)
    writer.writeT(`add rax, ${vec.id}`)
    writer.writeT(`mov [rax], ${reg2.id}`)
    return reg;
}

ExprVecMake.prototype.compile = function(writer, c, varLocal) {

    var space = (this.length + 1) * 8
    writer.writeT(`sub rsp, ${space}`)
    var reg = writer.giveRegister()
    writer.writeT(`mov ${reg.id}, rsp`)
    var i = 8
    writer.writeT(`mov qword [${reg.id}], ${this.length}`)
    this.expresions.forEach(exp => {
        var expReg = exp.compile(writer, c, varLocal)
        writer.writeT(`mov qword [${reg.id} + ${i}], ${expReg.id}`)
        writer.addRegister(expReg)
        i += 8
    })

    return reg;
}

ExprVecLength.prototype.vecVar = ExprVar.prototype.compile
ExprVecLength.prototype.compile = function(writer, c, varLocal) {
    var vec = this.vecVar(writer, c, varLocal)
    writer.writeT(`mov rax, ${vec.id}`)
    var reg = writer.giveRegister()
    writer.writeT(`mov ${reg.id}, [rax]`)
    return reg
}

ExprVecDeref.prototype.vecVar = ExprVar.prototype.compile
ExprVecDeref.prototype.compile = function(writer, c, varLocal) {
    this.value = this.id
    var vec = this.vecVar(writer, c, varLocal)

    var reg = this.expresion.compile(writer, c, varLocal);

    if (!reg.isRegister) {
        var newReg = writer.giveRegister()
        writer.writeT(`mov ${newReg.id}, ${reg.id}`)
        reg = newReg
    }

    writer.writeT(`mov rax, ${reg.id}`)
    writer.writeT(`inc rax`)
    writer.writeT(`sal rax, 3`)
    writer.writeT(`add rax, ${vec.id}`)
    writer.writeT(`mov ${reg.id}, [rax]`)
    return reg;
}

export default {}