import AST from './modules/AST';
import grammar from './modules/Grammar';
import Jison from 'jison';


// console.log(grammar.grammar)
var parser = new Jison.Parser(grammar);

$("#parser").click(function(){
	try{
		var exp = parser.parse(window.editor.getValue())
		$("#result").html(exp.toString())
	}catch(err){
		$("#result").html(err.message)
	}
})
