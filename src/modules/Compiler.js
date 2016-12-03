import { ASTType, StmtExpresionBlock, UnaryExpr, ASTNodeIdAndExpresions, ExprValue, BinaryExpr, ExprConstNum, ExprAdd, ExprSub, ExprMul, ExprConstBool, Fun, Assign, Arrays, Parameter, Block, IntType, BoolType, VecType, ExprVecLength, ExprVecDeref, ExprVar, UnitType, StmtAssign, Program, StmtIf, StmtIfElse, StmtCall, ExprLt, ExprNot, ExprEq, ExprAnd, ExprOr, ExprGt, StmtVecAssign, StmtReturn, StmtWhile, ExprLe, ExprGe, ExprNe, ExprVecMake, ExprCall, ASTNodeIdAndExpresion, Location, ASTNode } from './AST';
import _ from 'underscore';


class Direction {
    constructor(id, available = false, isRegister = false, writer) {
        this.id = id
        this.available = available
        this.isRegister = isRegister
        this.writer = writer
    }

    free() {
        this.available = true
    }

    book() {
        this.available = false
    }

    toRegister() {
        if (!this.isRegister) {
            var newReg = this.writer.giveRegister()
            newReg.move(this)
            return newReg
        }
        return this;
    }

    move(other) {
        this.moveTo(other.id)
    }

    moveTo(value) {
        this.writer.writeT(`mov ${this.id}, ${value}`)
    }

    sub(other) {
        this.writer.writeT(`sub ${this.id}, ${other.id}`)
    }

    add(other) {
        this.writer.writeT(`add ${this.id}, ${other.id}`)
    }

}

class Writer {
    constructor(arquitecture) {
        this.arquitecture = arquitecture;
        this.sectionMap = { data: "", text: "", codeFuns: "" }
        this.labelId = 1
        this.registers = [
            new Direction("rdi", true, true, this),
            new Direction("rbx", true, true, this),
            new Direction("rcx", true, true, this),
            new Direction("rdx", true, true, this),
            new Direction("r8", true, true, this),
            new Direction("r9", true, true, this),
            new Direction("r10", true, true, this),
            new Direction("r11", true, true, this),
            new Direction("r12", true, true, this),
            new Direction("r13", true, true, this),
            new Direction("r14", true, true, this),
            new Direction("r15", true, true, this),
        ];
        this.specialRegisters = [
            new Direction("rax", true, true, this),
            new Direction("rsi", true, true, this),
            new Direction("rdx", true, true, this),
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
        var register = this.registers.find(r => r.available)
        register.book()
        return register
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
    if (this.id == "putChar" || this.id == "putNum") return "";

    writer.write("cuca_" + this.id + ":")
    writer.writeT("push rbp")
    writer.writeT("mov rbp, rsp")


    var space = this.block.bookspace(writer, 0, varLocal)
    if (space > 0) {
        writer.writeT("sub rsp, " + space * 8)
    }
    var parametersSpace = this.parameters.reduce((total, p) => total + p.parameterSpace(), 1)
    var spcreq = (parametersSpace + 1) * 8 // +1 es porque se guarda el valor de retorno
    this.parameters.forEach(p => {
        varLocal[p.id] = spcreq
        spcreq = spcreq + 8
    })
    this.block.compile(writer, varLocal)
    writer.writeT("mov rsp, rbp")
    writer.writeT("pop rbp")
    writer.writeT("ret")
}



ASTNode.prototype.bookspace = function(writer, acc, varLocal) {
    return acc;
}

Block.prototype.bookspace = function(writer, acc, varLocal) {
    return this.statements.reduce((total, s) => s.bookspace(writer, total, varLocal), acc)
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
    return (this.length + 1) + space
}

Block.prototype.compile = function(writer, varLocal) {
    var i = 1
    this.statements.forEach(s => {
        s.compile(writer, i, varLocal)
    })
}


StmtCall.prototype.compile = function(writer, i, varLocal) {
    if (this.id == "putChar") {
        writer.writeText(`, ${writer.get('putchar')}`)
        var reg = this.expresions.first().compile(writer, i, varLocal)
        if (reg.id != "rdi") {
            writer.writeT(`mov rdi, ${reg.id}`)
        }

        writer.writeT(`call ${writer.get('putchar')}`)
        reg.free()
    }
    if (this.id == "putNum") {
        writer.writeText(`, ${writer.get('printf')}`)
        writer.writeSection("data", "lli_format_string db '%lli'")
        var reg = this.expresions.first().compile(writer, i, varLocal)
        writer.writeT("mov rsi, " + reg.id)
        writer.writeT("mov rdi, lli_format_string")
        reg.free();
        writer.writeT("mov rax, 0")
        writer.writeT(`call ${writer.get('printf')} `)
    }

    if (this.id != "putNum" && this.id != "putChar") {
        this.compileCall(writer, i, varLocal)
    }
}

StmtAssign.prototype.compile = function(writer, i, varLocal) {
    var salt;
    if (varLocal[this.id]) {
        salt = `[rbp + ${varLocal[this.id]}]`
    } else {
        salt = `[rbp - ${varLocal["N_" + this.id]}]`
    }
    var reg = this.expresion.compile(writer, i, varLocal).toRegister();

    if (salt.replace(/\s/g, "") != reg.id.replace(/\s/g, "")) {
        writer.writeT(`mov ${salt}, ${reg.id}`)
    }
    reg.free()
    return new Direction(salt, false, false, writer)
}

ExprConstNum.prototype.compile = function(writer) {
    var reg = writer.giveRegister();
    reg.moveTo(this.value)
    return reg;
}

ExprConstBool.prototype.compile = function(writer, i) {
    var reg = writer.giveRegister();
    reg.moveTo(this.rep())
    return reg;
}

let aritmeticos = function(writer, c, varLocal) {
    var reg
    if (this.isConstant) {
        reg = writer.giveRegister();
        reg.moveTo(this.eval())
        reg.free();
    } else {
        reg = this.expresion.compile(writer, c, varLocal).toRegister();
        var reg2 = this.secondExpresion.compile(writer, c, varLocal);

        this.binaryCompile(writer, reg, reg2);
        reg2.free();
    }
    return reg
}

ExprAdd.prototype.compile = aritmeticos
ExprAdd.prototype.binaryCompile = function(writer, reg1, reg2) {
    reg1.add(reg2)
}

ExprSub.prototype.compile = aritmeticos
ExprSub.prototype.binaryCompile = function(writer, reg1, reg2) {
    reg1.sub(reg2)
}

ExprMul.prototype.compile = aritmeticos
ExprMul.prototype.binaryCompile = function(writer, reg1, reg2) {
    var rax = writer.getSpecial("rax")
    rax.move(reg1)
    writer.writeT(`imul ${reg2.toRegister().id}`)
    reg1.move(rax)
    rax.free();
}

ExprOr.prototype.compile = function(writer, c, varLocal) {
    var reg1 = this.expresion.compile(writer, c, varLocal).toRegister();
    var reg2 = this.secondExpresion.compile(writer, c, varLocal);

    writer.writeT(`or ${reg1.id}, ${reg2.id}`)
    reg2.free();
    return reg1;
}

ExprAnd.prototype.compile = function(writer, c, varLocal) {
    var reg1 = this.expresion.compile(writer, c, varLocal).toRegister();
    var reg2 = this.secondExpresion.compile(writer, c, varLocal);

    writer.writeT(`and ${reg1.id}, ${reg2.id}`)
    reg2.free();
    return reg1;
}

ExprNot.prototype.compile = function(writer, c, varLocal) {
    var reg = this.expresion.compile(writer, c, varLocal).toRegister();
    writer.writeT(`not ${reg.id}`)
    return reg;
}

ASTNode.prototype.parameterSpace = () => 0
ExprVar.prototype.parameterSpace = function() {
    return this.validate().isVec() ? 1 : 0
}

function isNewVar(item) {
    return item.includes("N_");
}

ExprVar.prototype.compile = function(writer, c, varLocal) {
    var salt;


    if (varLocal[this.value]) {
        salt = `[rbp + ${varLocal[this.value]}]`
    } else {
        if (varLocal["N_" + this.value]) {
            salt = `[rbp - ${varLocal["N_" + this.value]}]`
        }
    }
    return new Direction(salt, false, false, writer)
}

StmtReturn.prototype.compile = function(writer, c, varLocal) {
    var reg
    if (this.expresion.isConstant) {
        reg = { id: this.expresion.eval() }
    } else {
        reg = this.expresion.compile(writer, c, varLocal);
    }

    writer.writeT(`mov rax, ${reg.id}`)
    reg.free()
}


StmtIfElse.prototype.compile = function(writer, c, varLocal) {
    var reg = this.expresion.compile(writer, c, varLocal).toRegister()
    var label = writer.nextLabel()
    var fin = writer.nextLabel()

    writer.writeT(`cmp ${reg.id}, 0`)
    reg.free()
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
    var reg = this.expresion.compile(writer, c, varLocal).toRegister()

    writer.writeT(`cmp ${reg.id}, 0`)
    reg.free()
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
    var reg = this.expr1.compile(writer, c, varLocal).toRegister()
    var req2 = this.expr2.compile(writer, c, varLocal);

    writer.writeT(`mov rax, ${reg.id}`)
    writer.writeT(`inc rax`)
    writer.writeT(`sal rax, 3`)
    writer.writeT(`add rax, ${vec.id}`)
    writer.writeT(`mov [rax], ${reg2.id}`)
    reg2.free()
    return reg;
}

var compileCall = function(writer, c, varLocal) {
    var usedRegisters = _.filter(writer.registers.concat(writer.specialRegisters), { available: false });
    usedRegisters.forEach(reg => {
        writer.writeT(`push ${reg.id}`)
        reg.free()
    })

    var regs = this.expresions.map(e => e.compile(writer, c, varLocal).toRegister())
    var i = 0

    var spcreq = this.expresions.length * 8
    writer.writeT("sub rsp, " + spcreq)

    regs.forEach(reg => {
        writer.writeT(`mov [rsp + ${i}], ${reg.id}`)
        i = i + 8
    })

    writer.writeT("call cuca_" + this.id)
    writer.writeT("add rsp, " + spcreq)

    usedRegisters.reverse().forEach(reg => {
        writer.writeT(`pop ${reg.id}`)
        reg.book()
    })
}
ExprCall.prototype.compileCall = compileCall
StmtCall.prototype.compileCall = compileCall
ExprCall.prototype.compile = function(writer, c, varLocal) {
    var usedRegisters = this.compileCall(writer, c, varLocal)
    var reg = writer.giveRegister()
    writer.writeT(`mov ${reg.id}, rax`)

    return reg;
}

var relacionales = function(writer, c, varLocal) {
    var reg1 = this.expresion.compile(writer, c, varLocal).toRegister();
    var reg2 = this.secondExpresion.compile(writer, c, varLocal);

    writer.writeT(`cmp ${reg1.id}, ${reg2.id}`)
    var label1 = writer.nextLabel()
    writer.writeT(this.jumpCode + " " + label1)
    writer.writeT(`mov ${reg1.id}, 0`)
    var label2 = writer.nextLabel()
    writer.writeT("jmp " + label2)
    writer.writeT(`${label1}:`)
    writer.writeT(`mov ${reg1.id}, -1`)
    writer.writeT(`${label2}:`)
    reg2.free()
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
    var reg = this.expresion.compile(writer, c, varLocal).toRegister();
    var reg2 = this.secondExpresion.compile(writer, c, varLocal);

    writer.writeT(`mov rax, ${reg.id}`)
    writer.writeT(`inc rax`)
    writer.writeT(`sal rax, 3`)
    writer.writeT(`add rax, ${vec.id}`)
    writer.writeT(`mov [rax], ${reg2.id}`)
    reg2.free()
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
        expReg.free()
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

    var reg = this.expresion.compile(writer, c, varLocal).toRegister();

    writer.writeT(`mov rax, ${reg.id}`)
    writer.writeT(`inc rax`)
    writer.writeT(`sal rax, 3`)
    writer.writeT(`add rax, ${vec.id}`)
    writer.writeT(`mov ${reg.id}, [rax]`)
    return reg;
}

export default {}