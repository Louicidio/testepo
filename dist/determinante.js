"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.det = exports.Matrizbase = exports.indicesBase = exports.matrizRestricoes = exports.nomesVariaveis = exports.matriz = void 0;
exports.extrairBase = extrairBase;
exports.determinante = determinante;
const tabelaRestricoes_1 = require("./tabelaRestricoes");
const lertexiste_1 = require("./lertexiste");
const tabelaRestricoes_2 = require("./tabelaRestricoes");
const matrizRestricoes = tabelaRestricoes_1.matrizComArtificiais;
exports.matrizRestricoes = matrizRestricoes;
// matriz com nomes de variáveis 
function montarMatrizComNomes(matrizOriginal, operadores, numVars) {
    const matriz = matrizOriginal.map((linha) => [...linha]);
    const nomesVariaveis = [];
    for (let i = 1; i <= numVars; i++) {
        nomesVariaveis.push(`x${i}`);
    }
    let folga = 1, excesso = 1, artificial = 1;
    for (let i = 0; i < operadores.length; i++) {
        if (operadores[i] === "<=") {
            nomesVariaveis.push(`s${folga++}`);
        }
        else if (operadores[i] === ">=") {
            nomesVariaveis.push(`e${excesso++}`);
            nomesVariaveis.push(`a${artificial++}`);
        }
        else if (operadores[i] === "=") {
            nomesVariaveis.push(`a${artificial++}`);
        }
    }
    return { matriz, nomesVariaveis };
}
const { matriz, nomesVariaveis } = montarMatrizComNomes(matrizRestricoes, tabelaRestricoes_2.operadores, lertexiste_1.numVars); // matriz com nomes de variáveis para leitura em outras func
exports.matriz = matriz;
exports.nomesVariaveis = nomesVariaveis;
const indicesBase = tabelaRestricoes_2.nomesBase.map((nome) => nomesVariaveis.indexOf(nome));
exports.indicesBase = indicesBase;
// extrair a submatriz da base
function extrairBase(matriz, indicesBase) {
    return matriz.map((linha) => indicesBase.map((idx) => linha[idx]));
}
function determinante(matriz) {
    const n = matriz.length;
    if (n === 1)
        return matriz[0][0];
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
exports.Matrizbase = Matrizbase;
const det = determinante(Matrizbase);
exports.det = det;
