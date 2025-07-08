"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Identidade = Identidade;
exports.inversa = inversa;
const determinante_1 = require("./determinante");
const matriz = determinante_1.Matrizbase;
const inversaMatriz = inversa(matriz);
function Identidade(matriz) {
    const n = matriz.length;
    for (let i = 0; i < n; i++) {
        if (matriz[i].length !== n) {
            return false;
        }
        for (let j = 0; j < n; j++) {
            if ((i === j && matriz[i][j] !== 1) ||
                (i !== j && matriz[i][j] !== 0)) {
                return false;
            }
        }
    }
    return true;
}
if (!determinante_1.Matrizbase || determinante_1.Matrizbase.length === 0) {
    throw new Error("Matrizbase está indefinida ou vazia!");
}
function inversa(matriz) {
    const n = matriz.length;
    if (Identidade(matriz)) {
        // console.log("matriz já é identidade, não precisa inverter.");
        return matriz.map((row) => [...row]);
    }
    // matriz + identidade
    const M = matriz.map((row, i) => [
        ...row,
        ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
    ]);
    // grande metodo de gauss
    for (let i = 0; i < n; i++) {
        // procura maior numero pra ser o pivo
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
                maxRow = k;
            }
        }
        // troca de linhas
        if (i !== maxRow) {
            [M[i], M[maxRow]] = [M[maxRow], M[i]];
        }
        // tratamento de erro
        if (Math.abs(M[i][i]) < 1e-12)
            return null;
        // Normaliza a linha do pivo para 1
        const piv = M[i][i];
        for (let j = 0; j < 2 * n; j++) {
            M[i][j] /= piv;
        }
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const fator = M[k][i];
                for (let j = 0; j < 2 * n; j++) {
                    M[k][j] -= fator * M[i][j];
                }
            }
        }
    }
    return M.map((row) => row.slice(n)); // extrai a parte da identidade
}
// console.log();
// inversaMatriz?.forEach(linha => console.log(linha));
