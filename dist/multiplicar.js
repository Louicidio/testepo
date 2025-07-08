"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiplicarMatrizPorVetor = multiplicarMatrizPorVetor;
exports.multiplicarMatrizes = multiplicarMatrizes;
function multiplicarMatrizPorVetor(matriz, vetor) {
    return matriz.map((linha) => linha.reduce((soma, val, j) => soma + val * vetor[j], 0));
}
function multiplicarMatrizes(A, B) {
    const m = A.length;
    const n = A[0].length;
    const p = B[0].length;
    const resultado = Array.from({ length: m }, () => Array(p).fill(0));
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < p; j++) {
            for (let k = 0; k < n; k++) {
                resultado[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return resultado;
}
