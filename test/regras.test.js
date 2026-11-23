const { test } = require("node:test");
const assert = require("node:assert/strict");
const { valido, solucoes, Sudoku } = require("../src/sudoku");
const vazia = () => Array.from({ length: 6 }, () => Array(6).fill(null));
test("verifica triplas verticais e excesso em coluna", () => {
  const g = vazia();
  g[0][2] = g[1][2] = g[2][2] = 0;
  assert.equal(valido(g), false);
  g[1][2] = null;
  g[3][2] = 0;
  g[5][2] = 0;
  assert.equal(valido(g), false);
});
test("rejeita dimensões e valores inválidos", () => {
  const g = vazia();
  g[0][0] = 2;
  assert.throws(() => valido(g), TypeError);
  assert.throws(() => new Sudoku([]), TypeError);
  assert.throws(() => solucoes(vazia(), 0), RangeError);
});
test("solução completa válida possui solução única", () => {
  const solucao = solucoes(vazia(), 1)[0];
  assert.deepEqual(solucoes(solucao, 2), [solucao]);
  assert.equal(new Sudoku(solucao).resolvido(), true);
});
test("pistas fixas e grade inicial são protegidas de alterações externas", () => {
  const g = vazia();
  g[0][0] = 1;
  const jogo = new Sudoku(g);
  g[0][0] = 0;
  assert.equal(jogo.obterGrade()[0][0], 1);
  assert.throws(() => jogo.jogar(0, 0, null));
  assert.throws(() => jogo.jogar(1, 1, 3));
});
