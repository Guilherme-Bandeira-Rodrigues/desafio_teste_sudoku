# Testes de Software — Sudoku binário

## Especificação

Sudoku binário **6 × 6**, conforme o desafio. Cada célula contém 0, 1 ou `null` (vazia). Na variante adotada, cada linha e coluna completa deve conter três zeros e três uns, não pode conter três valores iguais consecutivos e não pode ser igual a outra linha ou coluna completa. Uma grade parcial não pode ultrapassar três ocorrências de um valor nem formar uma sequência proibida.

## Executar os testes

Requer Node.js 20 ou superior; sem dependências externas.

```sh
npm test
```

Os testes em JavaScript usam `node:test` e `node:assert/strict`. Cobrem formato da grade, triplas, contagens, duplicações, grades sem solução, contagem limitada de soluções, preservação da entrada, células fixas e conclusão. A saída identifica cada caso e o processo retorna erro quando uma asserção falha.

## Usar o motor

```js
const { Sudoku, solucoes } = require('./src/sudoku');
const grade = Array.from({ length: 6 }, () => Array(6).fill(null));
const jogo = new Sudoku(grade);
jogo.jogar(0, 0, 1);
console.log(jogo.valido(), solucoes(jogo.obterGrade(), 2).length);
```

`valido(grade)` verifica regras parciais e completas; `solucoes(grade, limite)` devolve até o limite de soluções sem alterar a entrada. `Sudoku` mantém pistas iniciais fixas, aceita jogadas 0, 1 ou `null`, oferece cópia da grade e informa se está válida ou resolvida. Coordenadas começam em zero. O projeto oferece um motor e uma suíte de testes, sem interface gráfica.

`gerarSolucao(rng?)` cria uma grade completa; `gerarPuzzle(rng?)` devolve `{ puzzle, solucao }`, com pelo menos uma casa vazia, pistas coerentes e solução única. A função aleatória deve retornar números em `[0, 1)` e pode ser injetada para reprodução.

## Contrato e organização dos testes

As grades precisam ter exatamente seis linhas e seis colunas preenchidas com valores 0, 1 ou `null`; estruturas incompletas ou esparsas são rejeitadas. Uma linha ou coluna parcial pode coincidir com outra parcial; duplicação só é proibida quando ambas estão completas. Uma jogada inválida por regra pode ser registrada para posterior correção; `valido()` acusa o conflito. As pistas iniciais não podem ser alteradas e `obterGrade()` devolve cópia.

O diretório `test/` contém exemplos de contrato, regras, manipulação do jogo e geração. Inclui a verificação de todas as 729 linhas parciais possíveis, respostas inválidas, solução única e propriedades das grades geradas. As asserções definem entradas, saídas e erros esperados para uma implementação independente.

## Colaborador

Guilherme-Bandeira-Rodrigues
