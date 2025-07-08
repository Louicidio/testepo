"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xB = exports.matrizBase = exports.custosFase1 = void 0;
exports.custosF1 = custosF1;
const determinante_1 = require("./determinante");
const determinante_2 = require("./determinante");
const inversa_1 = require("./inversa");
const lertexiste_1 = require("./lertexiste");
const multiplicar_1 = require("./multiplicar");
const fase2_1 = require("./fase2");
// vetor de custos
function custosF1(nomesVariaveis) {
    return nomesVariaveis.map((nome) => (nome.startsWith("a") ? 1 : 0));
}
const custosFase1 = custosF1(determinante_1.nomesVariaveis);
exports.custosFase1 = custosFase1;
const matrizBase = (0, determinante_1.extrairBase)(determinante_2.matrizRestricoes, determinante_2.indicesBase);
exports.matrizBase = matrizBase;
const inv = (0, inversa_1.inversa)(matrizBase);
if (!matrizBase || matrizBase.length === 0) {
    throw new Error("matrizBase está indefinida ou vazia!");
}
// calculo da função objetivo da fase 1
function solucaoBasicaInicial(matrizBase, vetorB) {
    if ((0, inversa_1.Identidade)(matrizBase)) {
        return [...vetorB];
    }
    else {
        if (!inv)
            return null;
        const xB = (0, multiplicar_1.multiplicarMatrizPorVetor)(inv, vetorB);
        return xB;
    }
}
const xB = solucaoBasicaInicial(matrizBase, lertexiste_1.vetorB);
exports.xB = xB;
if (!xB) {
    throw new Error("Não foi possível calcular a solução básica (vetor vazio)");
}
function custosReduzidos(matrizRestricoes, custosFase1, indicesBase, invBase) {
    const custosBase = indicesBase.map((idx) => custosFase1[idx]);
    const resultados = [];
    // loop para calcular o custo reduzido de cada variável não básica
    for (let j = 0; j < custosFase1.length; j++) {
        if (indicesBase.includes(j))
            continue;
        const a_j = matrizRestricoes.map((linha) => linha[j]);
        const y = (0, multiplicar_1.multiplicarMatrizPorVetor)(invBase, custosBase);
        const z_j = y.reduce((soma, val, i) => soma + val * a_j[i], 0);
        const custoReduzido = custosFase1[j] - z_j;
        resultados.push({
            variavel: determinante_1.nomesVariaveis[j],
            custoReduzido,
            indice: j,
        });
    }
    return resultados;
}
// inicio da fase1
let baseAtual = [...determinante_2.indicesBase];
let matrizBaseAtual = (0, determinante_1.extrairBase)(determinante_2.matrizRestricoes, baseAtual);
let invAtual = (0, inversa_1.inversa)(matrizBaseAtual);
let xBAtual = solucaoBasicaInicial(matrizBaseAtual, lertexiste_1.vetorB);
while (true) {
    if (!xBAtual) {
        throw new Error("Não foi possível calcular a solução básica (vetor vazio)");
    }
    const custosRed = custosReduzidos(determinante_2.matrizRestricoes, custosFase1, baseAtual, invAtual);
    const candidatos = custosRed.filter((c) => c.custoReduzido < -1e-8);
    if (candidatos.length === 0) { // solução otima
        break;
    }
    const entra = candidatos.reduce((min, c) => (c.custoReduzido < min.custoReduzido ? c : min), candidatos[0]);
    const a_j = determinante_2.matrizRestricoes.map((linha) => linha[entra.indice]);
    const direcao = (0, multiplicar_1.multiplicarMatrizPorVetor)(invAtual, a_j);
    let menorRazao = Infinity;
    let saiIdx = -1;
    for (let i = 0; i < xBAtual.length; i++) {
        if (direcao[i] > 1e-8) {
            const razao = xBAtual[i] / direcao[i];
            if (razao < menorRazao) {
                menorRazao = razao;
                saiIdx = i;
            }
        }
    }
    if (saiIdx === -1) {
        console.log("Problema ilimitado");
        break;
    }
    // pivoteamento
    baseAtual[saiIdx] = entra.indice;
    matrizBaseAtual = (0, determinante_1.extrairBase)(determinante_2.matrizRestricoes, baseAtual);
    invAtual = (0, inversa_1.inversa)(matrizBaseAtual);
    if (!invAtual) {
        throw new Error("Não foi possível calcular a inversa da nova base.");
    }
    xBAtual = (0, multiplicar_1.multiplicarMatrizPorVetor)(invAtual, lertexiste_1.vetorB);
}
// calculo do valor otimo
const valorOtimoFase1 = baseAtual
    .map((idx, i) => determinante_1.nomesVariaveis[idx].startsWith("a") ? xBAtual[i] : 0)
    .reduce((a, b) => a + b, 0);
console.log("Valor ótimo encontrado na fase 1:", valorOtimoFase1);
// prosseguir para fase 2
if (valorOtimoFase1 > 1e-8) {
    console.log("Problema original inviavel!");
}
else {
    console.log("Solução viavel encontrada! prosseguindo para a Fase 2...");
    const resultadoFase2 = (0, fase2_1.simplexFase2)();
    console.log("Resultado Fase 2:", resultadoFase2);
}
