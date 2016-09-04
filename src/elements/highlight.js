ace.define("ace/lib/cucaracha-highlight",["require","exports","module"], function(require, exports, module) {
"use strict";

var oop = ace.require("ace/lib/oop");
var DocCommentHighlightRules = ace.require("ace/mode/doc_comment_highlight_rules").DocCommentHighlightRules;
var TextHighlightRules = ace.require("ace/mode/text_highlight_rules").TextHighlightRules;

var CucarachaHighlightRules = function() {

    var keywords = (
    "Bool|Int|Vec|True|False|and|else|fun|if|not|or|return|while"
    );

    var buildinConstants = (
        "False|True"
    );


    var keywordMapper = this.createKeywordMapper({
        "keyword": keywords,
        "constant.language": buildinConstants
    }, "identifier");

    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : "\\/\\/.*$"
            },
            {
                token : "comment",
                regex : "\\-\\-.*$"
            },
            {
                token : "comment", // multi line comment
                regex : "\\/\\*",
                next : "comment"
            }, {

                token : "string", // single line
                regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]'
            }, {
                token : "string", // single line
                regex : "['](?:(?:\\\\.)|(?:[^'\\\\]))*?[']"
            }, {
                token : "constant.numeric", // hex
                regex : /0(?:[xX][0-9a-fA-F][0-9a-fA-F_]*|[bB][01][01_]*)[LlSsDdFfYy]?\b/
            }, {
                token : "constant.numeric", // float
                regex : /[+-]?\d[\d_]*(?:(?:\.[\d_]*)?(?:[eE][+-]?[\d_]+)?)?[LlSsDdFfYy]?\b/
            }, {
                token : "constant.language.boolean",
                regex : "(?:True|False)\\b"
            }, {
                token : "keyword.operator",
                regex : ":=|\\.\\.|,|;|\\|\\||\\/\\/|\\+|\\-|\\^|\\*|>|<|>=|=>|==|&&|#"
            }, {
                token : keywordMapper,
                // TODO: Unicode escape sequences
                // TODO: Unicode identifiers
                regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
            }, {
                token : "lparen",
                regex : "[[({]"
            }, {
                token : "rparen",
                regex : "[\\])}]"
            }, {
                token : "text",
                regex : "\\s+"
            }
        ],
        "comment" : [
            {
                token : "comment", // closing comment
                regex : ".*?\\*\\/",
                next : "start"
            }, {
                token : "comment", // comment spanning whole line
                regex : ".+"
            }
        ]
    };

    this.embedRules(DocCommentHighlightRules, "doc-",
        [ DocCommentHighlightRules.getEndRule("start") ]);
};

oop.inherits(CucarachaHighlightRules, TextHighlightRules);

exports.CucarachaHighlightRules = CucarachaHighlightRules;
});
