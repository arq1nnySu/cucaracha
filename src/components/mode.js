ace.define("ace/mode/cucaracha",["require","exports","module"], function(require, exports, module) {
"use strict";
var oop = ace.require("ace/lib/oop");
var JavaScriptMode = ace.require("ace/mode/javascript").Mode;
var CucarachaHighlightRules = ace.require("ace/lib/cucaracha-highlight").CucarachaHighlightRules;

var Mode = function() {
    JavaScriptMode.call(this);
    this.HighlightRules = CucarachaHighlightRules;
};
oop.inherits(Mode, JavaScriptMode);

(function() {
    
    this.createWorker = function(session) {
        return null;
    };

    this.$id = "ace/mode/cucaracha";
}).call(Mode.prototype);

exports.Mode = Mode;
});