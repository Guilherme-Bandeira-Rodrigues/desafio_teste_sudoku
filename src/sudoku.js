"use strict";
const N = 6;
function validarFormato(g) {
  if (
    !Array.isArray(g) ||
    g.length !== N ||
    Array.from({ length: N }, (_, i) => i in g).some((x) => !x) ||
    g.some(
      (l) =>
        !Array.isArray(l) ||
        l.length !== N ||
        Array.from({ length: N }, (_, i) => i in l).some((x) => !x) ||
        l.some((v) => v !== null && v !== 0 && v !== 1),
    )
  )
    throw new TypeError("Grade deve ser 6 x 6 com 0, 1 ou null");
}
function valido(g) {
  validarFormato(g);
  const linhas = [
    ...g,
    ...Array.from({ length: N }, (_, c) => g.map((l) => l[c])),
  ];
  for (const l of linhas) {
    if ([0, 1].some((v) => l.filter((x) => x === v).length > 3)) return false;
    if (
      l.some((v, i) => v !== null && i >= 2 && v === l[i - 1] && v === l[i - 2])
    )
      return false;
  }
  for (const grupo of [linhas.slice(0, N), linhas.slice(N)]) {
    const completas = grupo
      .filter((l) => !l.includes(null))
      .map((l) => l.join(""));
    if (new Set(completas).size !== completas.length) return false;
  }
  return true;
}
function solucoes(g, limite = 2) {
  validarFormato(g);
  if (!Number.isInteger(limite) || limite < 1)
    throw new RangeError("Limite inválido");
  const tab = g.map((l) => [...l]);
  const encontradas = [];
  function busca() {
    if (!valido(tab) || encontradas.length >= limite) return;
    const i = tab.flat().indexOf(null);
    if (i < 0) {
      encontradas.push(tab.map((l) => [...l]));
      return;
    }
    const l = Math.floor(i / N),
      c = i % N;
    for (const v of [0, 1]) {
      tab[l][c] = v;
      busca();
    }
    tab[l][c] = null;
  }
  busca();
  return encontradas;
}
function embaralhar(lista, rng) {
  const r = [...lista];
  for (let i = r.length - 1; i > 0; i--) {
    const n = rng();
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n >= 1)
      throw new RangeError("rng deve retornar número entre 0 (inclusive) e 1");
    const j = Math.floor(n * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
function gerarSolucao(rng = Math.random) {
  if (typeof rng !== "function") throw new TypeError("rng deve ser função");
  const grade = Array.from({ length: N }, () => Array(N).fill(null));
  function preencher(indice) {
    if (indice === N * N) return true;
    const l = Math.floor(indice / N),
      c = indice % N;
    for (const v of embaralhar([0, 1], rng)) {
      grade[l][c] = v;
      if (valido(grade) && preencher(indice + 1)) return true;
    }
    grade[l][c] = null;
    return false;
  }
  if (!preencher(0)) throw new Error("Não foi possível gerar solução");
  return grade;
}
function gerarPuzzle(rng = Math.random) {
  const solucao = gerarSolucao(rng);
  const puzzle = solucao.map((l) => [...l]);
  for (const indice of embaralhar(
    Array.from({ length: N * N }, (_, i) => i),
    rng,
  )) {
    const l = Math.floor(indice / N),
      c = indice % N,
      anterior = puzzle[l][c];
    puzzle[l][c] = null;
    if (solucoes(puzzle, 2).length !== 1) puzzle[l][c] = anterior;
  }
  return { puzzle, solucao };
}
class Sudoku {
  constructor(inicial) {
    validarFormato(inicial);
    if (!valido(inicial)) throw new Error("Grade inicial inválida");
    this.grade = inicial.map((l) => [...l]);
    this.fixas = inicial.map((l) => l.map((v) => v !== null));
  }
  jogar(l, c, v) {
    if (
      !Number.isInteger(l) ||
      !Number.isInteger(c) ||
      l < 0 ||
      l >= N ||
      c < 0 ||
      c >= N
    )
      throw new RangeError("Coordenada inválida");
    if (![0, 1, null].includes(v) || this.fixas[l][c])
      throw new Error("Jogada inválida");
    this.grade[l][c] = v;
  }
  obterGrade() {
    return this.grade.map((l) => [...l]);
  }
  valido() {
    return valido(this.grade);
  }
  resolvido() {
    return this.valido() && this.grade.every((l) => !l.includes(null));
  }
}
module.exports = { N, valido, solucoes, gerarSolucao, gerarPuzzle, Sudoku };
