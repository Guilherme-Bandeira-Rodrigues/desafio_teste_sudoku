"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { N, valido, solucoes, Sudoku } = require("../src/sudoku");

const resolvida = [
  [0, 0, 1, 0, 1, 1],
  [0, 0, 1, 1, 0, 1],
  [1, 1, 0, 0, 1, 0],
  [0, 1, 0, 0, 1, 1],
  [1, 0, 1, 1, 0, 0],
  [1, 1, 0, 1, 0, 0],
];
const copia = (g) => g.map((l) => [...l]);
const vazio = () => Array.from({ length: 6 }, () => Array(6).fill(null));

test("contrato: tamanho 6, solução conhecida válida e completa", () => {
  assert.equal(N, 6);
  assert.equal(valido(resolvida), true);
  assert.equal(new Sudoku(resolvida).resolvido(), true);
});
for (const [nome, grid] of [
  ["não é matriz", null],
  ["linha ausente", Array(5).fill(Array(6).fill(null))],
  ["linha excedente", Array(7).fill(Array(6).fill(null))],
  ["coluna ausente", Array.from({ length: 6 }, () => Array(5).fill(null))],
  [
    "linha não é vetor",
    [null, ...Array.from({ length: 5 }, () => Array(6).fill(null))],
  ],
  [
    "linha esparsa",
    (() => {
      const g = vazio();
      delete g[0][0];
      return g;
    })(),
  ],
  [
    "matriz esparsa",
    (() => {
      const g = vazio();
      delete g[0];
      return g;
    })(),
  ],
  ...[2, -1, true, false, "0", undefined, NaN].map((v) => [
    `valor ${String(v)}`,
    (() => {
      const g = vazio();
      g[2][3] = v;
      return g;
    })(),
  ]),
]) {
  test(`formato inválido: ${nome}`, () => {
    assert.throws(() => valido(grid), TypeError);
    assert.throws(() => solucoes(grid), TypeError);
    assert.throws(() => new Sudoku(grid), TypeError);
  });
}
for (const eixo of ["linha", "coluna"])
  for (const valor of [0, 1])
    for (const inicio of [0, 1, 2, 3]) {
      test(`proíbe três ${valor} consecutivos em ${eixo}, início ${inicio}`, () => {
        const g = vazio();
        for (let i = inicio; i < inicio + 3; i++)
          eixo === "linha" ? (g[2][i] = valor) : (g[i][2] = valor);
        assert.equal(valido(g), false);
      });
    }
for (const eixo of ["linha", "coluna"])
  for (const valor of [0, 1]) {
    test(`proíbe quatro ${valor} não consecutivos em ${eixo}`, () => {
      const g = vazio();
      for (const i of [0, 1, 3, 4])
        eixo === "linha" ? (g[0][i] = valor) : (g[i][0] = valor);
      assert.equal(valido(g), false);
    });
  }
test("duas linhas parciais iguais são permitidas, completas iguais são proibidas", () => {
  const g = vazio();
  g[0] = [0, 0, 1, null, null, null];
  g[1] = [0, 0, 1, null, null, null];
  assert.equal(valido(g), true);
  g[0] = [0, 0, 1, 0, 1, 1];
  g[1] = [...g[0]];
  assert.equal(valido(g), false);
});
test("duas colunas parciais iguais são permitidas, completas iguais são proibidas", () => {
  const g = vazio();
  for (let i = 0; i < 3; i++) g[i][0] = g[i][1] = [0, 0, 1][i];
  assert.equal(valido(g), true);
  [0, 0, 1, 0, 1, 1].forEach((x, i) => (g[i][0] = g[i][1] = x));
  assert.equal(valido(g), false);
});
test("complementar todos os valores e transpor preserva validade", () => {
  const complemento = resolvida.map((l) => l.map((v) => 1 - v));
  const transposta = resolvida.map((_, i) => resolvida.map((l) => l[i]));
  assert.equal(valido(complemento), true);
  assert.equal(valido(transposta), true);
});
test("todas as 729 linhas parciais seguem as restrições locais de quantidade e sequência", () => {
  for (let codigo = 0; codigo < 729; codigo++) {
    let x = codigo;
    const linha = [];
    for (let i = 0; i < 6; i++) {
      linha.push([null, 0, 1][x % 3]);
      x = Math.floor(x / 3);
    }
    const esperada =
      [0, 1].every((v) => linha.filter((y) => y === v).length <= 3) &&
      !linha.some(
        (v, i) =>
          i >= 2 && v !== null && v === linha[i - 1] && v === linha[i - 2],
      );
    const g = vazio();
    g[0] = linha;
    assert.equal(valido(g), esperada, JSON.stringify(linha));
  }
});
test("resolver respeita pistas, não altera entrada e devolve solução independente", () => {
  const g = copia(resolvida);
  g[0][0] = null;
  g[5][5] = null;
  const antes = copia(g);
  const r = solucoes(g, 2);
  assert.deepEqual(r, [resolvida]);
  assert.deepEqual(g, antes);
  r[0][0][0] = 9;
  assert.deepEqual(g, antes);
});
test("solver retorna zero para contradição e limita a quantidade de soluções", () => {
  const g = vazio();
  g[0][0] = g[0][1] = g[0][2] = 1;
  assert.deepEqual(solucoes(g, 3), []);
  const alternativas = solucoes(vazio(), 3);
  assert.equal(alternativas.length, 3);
  assert.equal(new Set(alternativas.map(JSON.stringify)).size, 3);
  alternativas.forEach((s) => assert.equal(valido(s), true));
});
for (const limite of [0, -1, 1.5, NaN, "2", null])
  test(`limite inválido ${String(limite)}`, () => {
    assert.throws(() => solucoes(vazio(), limite), RangeError);
  });
for (const [l, c] of [
  [-1, 0],
  [6, 0],
  [0, -1],
  [0, 6],
  [1.1, 0],
  [0, NaN],
  ["0", 0],
])
  test(`jogada fora dos limites: ${l},${c}`, () => {
    const j = new Sudoku(vazio());
    assert.throws(() => j.jogar(l, c, 0), RangeError);
  });
test("jogadas 0 e 1 podem ser substituídas ou apagadas; fixas não", () => {
  const g = vazio();
  g[0][0] = 1;
  const j = new Sudoku(g);
  assert.throws(() => j.jogar(0, 0, 1));
  assert.throws(() => j.jogar(0, 0, null));
  j.jogar(0, 1, 0);
  j.jogar(0, 1, 1);
  assert.equal(j.obterGrade()[0][1], 1);
  j.jogar(0, 1, null);
  assert.equal(j.obterGrade()[0][1], null);
  assert.equal(j.resolvido(), false);
});
