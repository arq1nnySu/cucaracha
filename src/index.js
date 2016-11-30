import { ASTType, StmtExpresionBlock, UnaryExpr, ASTNodeIdAndExpresions, ExprValue, BinaryExpr, ExprConstNum, ExprAdd, ExprSub, ExprMul, ExprConstBool, Fun, Assign, Arrays, Parameter, Block, IntType, BoolType, VecType, ExprVecLength, ExprVecDeref, ExprVar, UnitType, StmtAssign, Program, StmtIf, StmtIfElse, StmtCall, ExprLt, ExprNot, ExprEq, ExprAnd, ExprOr, ExprGt, StmtVecAssign, StmtReturn, StmtWhile, ExprLe, ExprGe, ExprNe, ExprVecMake, ExprCall, ASTNodeIdAndExpresion, Location, ASTNode } from './modules/AST';
import Serializer from './modules/Serializer';
import SemanticAnalysis from './modules/SemanticAnalysis';
import Compute from './modules/Compute';
import Compiler from './modules/Compiler';
import { grammar, stringToken } from './modules/Grammar';
import Jison from 'jison';



// console.log(grammar.grammar)
window.stringToken = stringToken
window.ASTType = ASTType
window.StmtExpresionBlock = StmtExpresionBlock
window.UnaryExpr = UnaryExpr
window.ASTNodeIdAndExpresions = ASTNodeIdAndExpresions
window.ExprValue = ExprValue
window.BinaryExpr = BinaryExpr
window.ExprConstNum = ExprConstNum
window.ExprAdd = ExprAdd
window.ExprSub = ExprSub
window.ExprMul = ExprMul
window.ExprConstBool = ExprConstBool
window.Fun = Fun
window.Assign = Assign
window.Arrays = Arrays
window.Parameter = Parameter
window.Block = Block
window.ExprConstBool = ExprConstBool
window.IntType = IntType
window.BoolType = BoolType
window.VecType = VecType
window.ExprVecLength = ExprVecLength
window.ExprVecDeref = ExprVecDeref
window.ExprVar = ExprVar
window.UnitType = UnitType
window.StmtAssign = StmtAssign
window.Program = Program
window.StmtIf = StmtIf
window.StmtIfElse = StmtIfElse
window.StmtCall = StmtCall
window.ExprLt = ExprLt
window.ExprNot = ExprNot
window.ExprEq = ExprEq
window.ExprAnd = ExprAnd
window.ExprOr = ExprOr
window.ExprGt = ExprGt
window.StmtVecAssign = StmtVecAssign
window.StmtReturn = StmtReturn
window.StmtWhile = StmtWhile
window.ExprLe = ExprLe
window.ExprGe = ExprGe
window.ExprNe = ExprNe
window.ExprVecMake = ExprVecMake
window.ExprCall = ExprCall
window.ASTNodeIdAndExpresion = ASTNodeIdAndExpresion
window.Location = Location
window.ASTNode = ASTNode

window.parser = new Jison.Parser(grammar);