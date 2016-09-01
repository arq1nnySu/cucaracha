import AST from './modules/AST';
import grammar from './modules/Grammar';
import Jison from 'jison';


// console.log(grammar.grammar)
var parser = new Jison.Parser(grammar);

$("#parser").click(function(){
	$("#result").html(parser.parse($("#input").val()).toString())
})
