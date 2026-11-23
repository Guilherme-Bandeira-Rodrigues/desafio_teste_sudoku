"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  valido,
  solucoes,
  gerarSolucao,
  gerarPuzzle,
} = require("../src/sudoku");
function rng(s) {
  return () => ((s = (s * 48271) % 2147483647) - 1) / 2147483646;
}
for (const seed of [1, 2, 3, 7, 31, 137, 2026, 8721])
  test(`solução gerada na semente ${seed} respeita as três regras`, () => {
    const g = gerarSolucao(rng(seed));
    assert.equal(g.length, 6);
    assert.ok(g.every((l) => l.length === 6 && !l.includes(null)));
    for (const l of [
      ...g,
      ...Array.from({ length: 6 }, (_, i) => g.map((x) => x[i])),
    ]) {
      assert.equal(l.filter((x) => x === 0).length, 3);
      assert.equal(l.filter((x) => x === 1).length, 3);
      for (let i = 0; i < 4; i++)
        assert.equal(l[i] === l[i + 1] && l[i] === l[i + 2], false);
    }
    assert.equal(new Set(g.map(JSON.stringify)).size, 6);
    assert.equal(
      new Set(
        Array.from({ length: 6 }, (_, i) => JSON.stringify(g.map((l) => l[i]))),
      ).size,
      6,
    );
    assert.equal(valido(g), true);
  });
test("mesma semente gera mesma solução e sementes diferentes variam o resultado", () => {
  assert.deepEqual(gerarSolucao(rng(123)), gerarSolucao(rng(123)));
  const grades = [1, 2, 3, 4, 5].map((s) =>
    JSON.stringify(gerarSolucao(rng(s))),
  );
  assert.ok(new Set(grades).size > 1);
});
for (const n of [0, 0.999999999])
  test(`gerador com rng constante ${n} produz solução válida`, () => {
    const g = gerarSolucao(() => n);
    assert.equal(valido(g), true);
    assert.ok(!g.flat().includes(null));
  });
for (const seed of [1, 13, 29])
  test(`puzzle ${seed} possui pistas consistentes e solução única`, () => {
    const { puzzle, solucao } = gerarPuzzle(rng(seed));
    assert.equal(valido(puzzle), true);
    assert.equal(valido(solucao), true);
    assert.ok(puzzle.flat().includes(null));
    assert.ok(!solucao.flat().includes(null));
    for (let l = 0; l < 6; l++)
      for (let c = 0; c < 6; c++)
        if (puzzle[l][c] !== null) assert.equal(puzzle[l][c], solucao[l][c]);
    assert.deepEqual(solucoes(puzzle, 2), [solucao]);
    const copia = solucao[0][0];
    puzzle[0][0] = 9;
    assert.equal(solucao[0][0], copia);
  });
test("geração de puzzle é reproduzível com a mesma semente", () => {
  assert.deepEqual(gerarPuzzle(rng(43)), gerarPuzzle(rng(43)));
});
test("nenhuma pista pode ser retirada sem perder unicidade", () => {
  const { puzzle } = gerarPuzzle(rng(59));
  for (let l = 0; l < 6; l++)
    for (let c = 0; c < 6; c++)
      if (puzzle[l][c] !== null) {
        const copia = puzzle.map((x) => [...x]);
        copia[l][c] = null;
        assert.equal(solucoes(copia, 2).length, 2, `pista (${l},${c})`);
      }
});
for (const v of [null, 5, "aleatorio"])
  test(`gerador rejeita rng não funcional: ${v}`, () =>
    assert.throws(() => gerarSolucao(v), TypeError));
for (const n of [-0.1, 1, NaN, Infinity, "0"])
  test(`gerador rejeita saída inválida do rng: ${n}`, () =>
    assert.throws(() => gerarSolucao(() => n), RangeError));
