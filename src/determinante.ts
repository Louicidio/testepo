import { matrizComArtificiais, matrizExp } from "./tabelaRestricoes";
import { numVars } from "./lertexiste";
import { operadores, nomesBase } from "./tabelaRestricoes";

const matrizRestricoes = matrizComArtificiais;
// matriz com nomes de variáveis 
function montarMatrizComNomes(matrizOriginal: number[][], operadores: string[], numVars: number) {
    const matriz = matrizOriginal.map((linha) => [...linha]);
    const nomesVariaveis: string[] = [];

    for (let i = 1; i <= numVars; i++) {
        nomesVariaveis.push(`x${i}`);
    }

    let folga = 1,
        excesso = 1,
        artificial = 1;

    for (let i = 0; i < operadores.length; i++) {
        if (operadores[i] === "<=") {
            nomesVariaveis.push(`s${folga++}`);
        } else if (operadores[i] === ">=") {
            nomesVariaveis.push(`e${excesso++}`);
            nomesVariaveis.push(`a${artificial++}`);
        } else if (operadores[i] === "=") {
            nomesVariaveis.push(`a${artificial++}`);
        }
    }

    return { matriz, nomesVariaveis };
}

const { matriz, nomesVariaveis } = montarMatrizComNomes(matrizRestricoes, operadores, numVars); // matriz com nomes de variáveis para leitura em outras func

const indicesBase = nomesBase.map((nome) => nomesVariaveis.indexOf(nome));

// extrair a submatriz da base
export function extrairBase(matriz: number[][], indicesBase: number[]): number[][] {
    return matriz.map((linha) => indicesBase.map((idx) => linha[idx]));
}

export function determinante(matriz: number[][]): number {
    const n = matriz.length;
    if (n === 1) return matriz[0][0];
    if (n === 2)
        return matriz[0][0] * matriz[1][1] - matriz[0][1] * matriz[1][0];

    let det = 0;
    for (let j = 0; j < n; j++) {
        const submatriz = matriz
            .slice(1)
            .map((row) => row.filter((_, col) => col !== j));
        det += (j % 2 === 0 ? 1 : -1) * matriz[0][j] * determinante(submatriz);
    }
    return det;
}

const Matrizbase = extrairBase(matrizRestricoes, indicesBase);
const det = determinante(Matrizbase);

export { matriz, nomesVariaveis, matrizRestricoes, indicesBase, Matrizbase, det };
