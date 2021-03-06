Polymer({
      is: "cucaracha-editor",
      listeners: {
        "ace.editor-ready": "onAceReady",
        "ace.editor-content": "onContentChange",
      },
      properties: {
        code: String,
      },
      ready: function() {
        this.editor = this.$.ace.editor;
        this._setFatalities();
        this._subscribeToChangeEvents();
        setTimeout(function() { this.fixEditorHeight(); }.bind(this), 500);
        $(window).resize(function() { this.fixEditorHeight(); }.bind(this));

      },

      onAceReady: function() {
        this.$.ace.editor.$blockScrolling = Infinity;
      },

      onContentChange: function(content) {
        this.code = content.detail.value;
        this.editor.getSession().clearAnnotations();
      },

      runCode: function() {
        this.editor.getSession().clearAnnotations();
        const sourceCode = this.editor.getValue();
        var ast = this.parse(sourceCode)
        
        if (ast.error) {
          $("#result").html(err.message)
        }

        this.compile(ast)
        // this.interpret(ast)

        $("#result_parsed").html(ast.serialize())
        $("#result_compiled").html(ast.compile($("#arquitecture").val()))
      },

      parse: function(sourceCode) {
        try {
          return parser.parse(sourceCode)
        } catch (err) {
          this.reportError(err.hash)
          return err;
        }
      },

      compile: function(ast) {
        try{
          ast.semanticize()
        }catch(err){
          this.reportSemanticError(err)
        }
      },
      
      interpret: function(ast, initialState) {
        ast.compile()
      },

      reportError: function(err) {
        this.editor.getSession().setAnnotations([{
          row: err.loc.first_line-1,
          column: err.loc.first_column,
          text: "Error en la linea "+ (err.loc.first_line) + ". Se esperaba " +err.expected + " y se obtuvo " + err.text,
          type: 'error'
        }]);
      },

      reportSemanticError: function(err) {
        this.editor.getSession().setAnnotations([{
          row: err.loc.first_line-1,
          column: err.loc.first_column,
          text: err.message,
          type: 'warning'
        }]);
      },

      _subscribeToChangeEvents: function() {
        // this.editor.getSession().on("change", () => {
        //   alert("fasdf")
        //   this.editor.getSession().setAnnotations([]);
        // });
      },

      _setFatalities: function() {
        const ace = this.$.ace;
        ace.editor.commands.addCommand({
          name: "run-code",
          bindKey: { win: "ctrl+enter", mac: "command+enter" },
          exec: function() { this.runCode() }.bind(this)
        });
      },

      fixEditorHeight: function() {
        const lineHeight = this.editor.renderer.lineHeight;
        const availableLines = ($(document).height()) / this.editor.renderer.lineHeight;

        this.editor.setOption("minLines", availableLines);
        this.editor.setOption("maxLines", availableLines);
      }

    });