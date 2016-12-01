import fs from 'fs';
import path from 'path';
import _ from 'underscore';
import AST from '../src/modules/AST';
import Serializer from '../src/modules/Serializer';
import SemanticAnalysis from '../src/modules/SemanticAnalysis';
import Compiler from '../src/modules/Compiler';
import { grammar, stringToken } from '../src/modules/Grammar';
import Jison from 'jison';
import shell from 'shelljs/global';
import chalk from 'chalk';

_(global).extend(AST)
_(global).extend({ stringToken: stringToken })


let parser = new Jison.Parser(grammar);
let arq = process.argv[2] || "linux";

Number.prototype.pad = function(size) {
    var s = this + "";
    while (s.length < size) s = "0" + s;
    return s;
}

let files = _.range(55);

files.forEach(n => {
    let file = "test" + n.pad(2)
    console.log(`leyendo el test ${file}`);
    try {
        fs.readFile(path.join(__dirname, '', `inputs/${file}.input`), 'utf8', function(err, sourceCode) {
            if (err) {
                return console.log(chalk.red(err));
            }
            console.log(`parseando el test ${file}`);
            let ast = parser.parse(sourceCode)

            console.log(`compilando el test ${file}`);
            ast.semanticize();
            let asm = ast.compile(arq)

            console.log(`guardando el asembler del test ${file}`);
            fs.writeFile(path.join(__dirname, '..', `dist/${file}.asm`), asm, function(err) {
                if (err) {
                    return console.log(chalk.red(err));
                }

                console.log(chalk.blue(`ejecutando el test ${file}`));
                let scritSufix = arq == "macos" ? "_mac" : "";
                exec(`sh run_asm${scritSufix}.sh ${file}`)
                console.log(chalk.green(`El test ${file} termino de ejecutar`));
            });
        });
    } catch (err) {
        console.log(chalk.red(err))
    }
})