"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matrizExpandida = exports.matrizComArtificiais = void 0;
exports.tabelaSimplex = tabelaSimplex;
const lertexiste_1 = require("./lertexiste");
const tabelaRestricoes_1 = require("./tabelaRestricoes");
Object.defineProperty(exports, "matrizComArtificiais", { enumerable: true, get: function () { return tabelaRestricoes_1.matrizComArtificiais; } });
const matrizExpandida = (0, tabelaRestricoes_1.matrizExp)(lertexiste_1.MatrizA, tabelaRestricoes_1.operadores);
exports.matrizExpandida = matrizExpandida;
// Monta a tabela inicial do Simplex
function montarTabelaSimplex(matriz, vetorB, funcaoObjetivo) {
    const tabela = matriz.map((linha, i) => [...linha, vetorB[i]]);
    // preenche tudo
    const numVariaveis = matriz[0].length;
    let linhaZ = Array(numVariaveis).fill(0);
    for (let i = 0; i < funcaoObjetivo.length; i++) {
        linhaZ[i] =
            lertexiste_1.tipoProblema === "MIN" ? -funcaoObjetivo[i] : funcaoObjetivo[i];
    }
    linhaZ.push(0); // preenche função objetiva
    // console.log("Tabela inicial do Simplex:");
    // tabela.forEach((linha, i) => {
    //     console.log(`Restrição ${i + 1}: [${linha.join(" ")}]`);
    // });
    // console.log(`Função objetivo (Z): [${linhaZ.join(" ")}]`);
    console.log();
    // console.log(tabela); //tabela com base e variáveis
    return { tabela, linhaZ };
}
montarTabelaSimplex(matrizExpandida, lertexiste_1.vetorB, lertexiste_1.funcaoObjetivo);
function tabelaSimplex() {
    const { tabela, linhaZ } = montarTabelaSimplex(matrizExpandida, lertexiste_1.vetorB, lertexiste_1.funcaoObjetivo);
    return { tabela, linhaZ };
}
