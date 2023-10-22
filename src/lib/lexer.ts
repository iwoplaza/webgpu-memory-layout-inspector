import Tokenizr from 'tokenizr';

export const lexer = new Tokenizr();

lexer.rule(/struct/, (ctx) => {
	ctx.accept('struct');
});

lexer.rule(/const/, (ctx) => {
	ctx.accept('const');
});

lexer.rule(/let/, (ctx) => {
	ctx.accept('let');
});

lexer.rule(/{/, (ctx) => {
	ctx.accept('brace_open');
});

lexer.rule(/}/, (ctx) => {
	ctx.accept('brace_close');
});

lexer.rule(/</, (ctx) => {
	ctx.accept('lt');
});

lexer.rule(/>/, (ctx) => {
	ctx.accept('gt');
});

lexer.rule(/=/, (ctx) => {
	ctx.accept('eq');
});

lexer.rule(/:/, (ctx) => {
	ctx.accept('colon');
});

lexer.rule(/,/, (ctx) => {
	ctx.accept('comma');
});

lexer.rule(/;/, (ctx) => {
	ctx.accept('semi');
});

lexer.rule(/[a-zA-Z_][a-zA-Z0-9_-]*/, (ctx) => {
	ctx.accept('id');
});

lexer.rule(/[+-]?[0-9]+/, (ctx, match) => {
	ctx.accept('number', parseInt(match[0]));
});

lexer.rule(/"((?:\\"|[^\r\n])*)"/, (ctx, match) => {
	ctx.accept('string', match[1].replace(/\\"/g, '"'));
});

// comments
lexer.rule(/\/\/[^\r\n]*\r?\n/, (ctx) => {
	ctx.accept('comment');
});

// whitespace
lexer.rule(/[ \t\r\n]+/, (ctx) => {
	ctx.ignore();
});

// unknown char catch while developing
lexer.rule(/./, (ctx) => {
	ctx.accept('unknown');
});
