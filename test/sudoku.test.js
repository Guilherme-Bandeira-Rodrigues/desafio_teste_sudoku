const { test } = require("node:test");
const assert = require("node:assert/strict");
const { valido, solucoes, Sudoku } = require("../src/sudoku");
const vazio = () => Array.from({ length: 6 }, () => Array(6).fill(null));
test("solução satisfaz regras e não altera a entrada", () => {
  const g = vazio(),
    s = solucoes(g, 1)[0];
  assert.ok(valido(s));
  assert.equal(g.flat().filter((x) => x !== null).length, 0);
  assert.equal(s.length, 6);
});
test("conta soluções com limite e rejeita grade impossível", () => {
  const g = vazio();
  assert.equal(solucoes(g, 2).length, 2);
  g[0] = [0, 0, 0, null, null, null];
  assert.equal(valido(g), false);
  assert.deepEqual(solucoes(g), []);
});
test("verifica triplas, contagem, duplicação e formato", () => {
  for (const linha of [
    [1, 1, 1, null, null, null],
    [0, 0, 1, 0, 1, 0],
  ]) {
    const g = vazio();
    g[0] = linha;
    assert.equal(valido(g), false);
  }
  const g = vazio();
  g[0] = [0, 0, 1, 0, 1, 1];
  g[1] = [...g[0]];
  assert.equal(valido(g), false);
  assert.throws(() => valido([[0]]));
});
test("células fixas, cópias, edição e conclusão", () => {
  const s = solucoes(vazio(), 1)[0],
    g = s.map((l) => [...l]);
  g[0][0] = null;
  const jogo = new Sudoku(g);
  assert.throws(() => jogo.jogar(0, 1, 0));
  assert.throws(() => jogo.jogar(6, 0, 0), RangeError);
  jogo.jogar(0, 0, s[0][0]);
  assert.equal(jogo.resolvido(), true);
  jogo.obterGrade()[0][0] = null;
  assert.equal(jogo.resolvido(), true);
});
test("detecta colunas duplicadas e permite corrigir jogada inválida", () => {
  const g = vazio();
  [0, 0, 1, 0, 1, 1].forEach((v, i) => {
    g[i][0] = v;
    g[i][1] = v;
  });
  assert.equal(valido(g), false);
  const j = new Sudoku(vazio());
  j.jogar(0, 0, 1);
  j.jogar(0, 1, 1);
  j.jogar(0, 2, 1);
  assert.equal(j.valido(), false);
  j.jogar(0, 2, null);
  assert.equal(j.valido(), true);
});
