import AST from './modules/AST';
import Serializer from './modules/Serializer';
import SemanticAnalysis from './modules/SemanticAnalysis';
import Compute from './modules/Compute';
import Compiler from './modules/Compiler';
import grammar from './modules/Grammar';
import Jison from 'jison';



// console.log(grammar.grammar)
window.parser = new Jison.Parser(grammar);