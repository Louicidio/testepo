"use strict";
// import { MatrizA } from "./lertexiste";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matrizComArtificiais = exports.operadores = void 0;
exports.matrizExp = matrizExp;
// export function matrizExp(
//     MatrizA: number[][],
//     operadores: string[]
// ): number[][] {
//     const numRestricoes = MatrizA.length;
//     const numVarsOriginais = MatrizA[0].length;
//     // Conta quantas folgas/excessos serão adicionadas
//     const numFolgas = operadores.filter(op => op === '<=' || op === '>=').length;
//     const novaMatriz: number[][] = [];
//     let folgaAtual = 0;
//     for (let i = 0; i < numRestricoes; i++) {
//         // Copia os coeficientes das variáveis originais
//         const linha = [...MatrizA[i], ...Array(numFolgas).fill(0)];
//         if (operadores[i] === '<=') {
//             linha[numVarsOriginais + folgaAtual] = 1;
//             folgaAtual++;
//         } else if (operadores[i] === '>=') {
//             linha[numVarsOriginais + folgaAtual] = -1;
//             folgaAtual++;
//         }
//         novaMatriz.push(linha);
//     }
//     return novaMatriz;
// }
// const operadores = ['<=', '>=', '<='];
// const matrizQuadrada = matrizExp(MatrizA, operadores);
// export { matrizQuadrada, operadores };
const lertexiste_1 = require("./lertexiste");
function operadoresFiltro() {
    return lertexiste_1.folgas.map((folga) => {
        if (folga.startsWith("s"))
            return "<=";
        if (folga.startsWith("e"))
            return ">=";
        return "=";
    });
}
const operadores = operadoresFiltro();
exports.operadores = operadores;
function matrizExp(MatrizA, operadores) {
    const numRestricoes = MatrizA.length;
    const numVarsOriginais = MatrizA[0].length;
    // Conta quantas folgas e artificiais serão adicionadas
    const numFolgas = operadores.filter((op) => op === "<=").length;
    const numExcessos = operadores.filter((op) => op === ">=").length;
    const numArtificiais = operadores.filter((op) => op === ">=" || op === "=").length;
    const novaMatriz = [];
    let folgaAtual = 0;
    let excessoAtual = 0;
    let artificialAtual = 0;
    // console.log(operadores)
    for (let i = 0; i < numRestricoes; i++) {
        // Monta linha: originais + folgas + excessos + artificiais
        const linha = [
            ...MatrizA[i],
            ...Array(numFolgas).fill(0),
            ...Array(numExcessos).fill(0),
            ...Array(numArtificiais).fill(0),
        ];
        if (operadores[i] === "<=") {
            linha[numVarsOriginais + folgaAtual] = 1;
            folgaAtual++;
        }
        else if (operadores[i] === ">=") {
            linha[numVarsOriginais + numFolgas + excessoAtual] = -1; // excesso
            linha[numVarsOriginais + numFolgas + numExcessos + artificialAtual] = 1; // artificial
            excessoAtual++;
            artificialAtual++;
        }
        else if (operadores[i] === "=") {
            linha[numVarsOriginais + numFolgas + numExcessos + artificialAtual] = 1; // artificial
            artificialAtual++;
        }
        novaMatriz.push(linha);
    }
    return novaMatriz;
}
const matrizComArtificiais = matrizExp(lertexiste_1.MatrizA, operadores);
exports.matrizComArtificiais = matrizComArtificiais;
matrizComArtificiais.forEach((row, index) => {
    //funcionou vamo kraio
    console.log(`[${row.join(" ")}]`);
});
