import { extrairBase, nomesVariaveis } from "./determinante";
import { matrizRestricoes, indicesBase } from "./determinante";
import { Identidade, inversa } from "./inversa";
import { vetorB } from "./lertexiste";
import { multiplicarMatrizPorVetor, multiplicarMatrizes } from "./multiplicar";
import { simplexFase2 } from "./fase2";

// vetor de custos
export function custosF1(nomesVariaveis: string[]): number[] {
    return nomesVariaveis.map((nome) => (nome.startsWith("a") ? 1 : 0));
}

const custosFase1 = custosF1(nomesVariaveis);
const matrizBase = extrairBase(matrizRestricoes, indicesBase);
const inv = inversa(matrizBase);

if (!matrizBase || matrizBase.length === 0) {
    throw new Error("matrizBase está indefinida ou vazia!");
}

// calculo da função objetivo da fase 1
function solucaoBasicaInicial(matrizBase: number[][], vetorB: number[]): number[] | null {
    if (Identidade(matrizBase)) {
        return [...vetorB];
    } else {
        if (!inv) return null;

        const xB = multiplicarMatrizPorVetor(inv, vetorB);
        return xB;
    }
}

const xB = solucaoBasicaInicial(matrizBase, vetorB);
if (!xB) {
    throw new Error("Não foi possível calcular a solução básica (vetor vazio)");
}

// console.log("Solução básica inicial:", xB); // sinto que esse resultado ta errado, testar dps com alguem

export { custosFase1, matrizBase, xB };

function custosReduzidos(matrizRestricoes: number[][], custosFase1: number[], indicesBase: number[], invBase: number[][]): { variavel: string; custoReduzido: number; indice: number }[] {
    const custosBase = indicesBase.map((idx) => custosFase1[idx]);
    const resultados: {
        variavel: string;
        custoReduzido: number;
        indice: number;
    }[] = [];
    // loop para calcular o custo reduzido de cada variável não básica
    for (let j = 0; j < custosFase1.length; j++) {
        if (indicesBase.includes(j)) continue;

        const a_j = matrizRestricoes.map((linha) => linha[j]);
       
        const y = multiplicarMatrizPorVetor(invBase, custosBase);
        
        const z_j = y.reduce((soma, val, i) => soma + val * a_j[i], 0);
        const custoReduzido = custosFase1[j] - z_j;
        resultados.push({
            variavel: nomesVariaveis[j],
            custoReduzido,
            indice: j,
        });
    }
    return resultados;
}

// inicio da fase1
let baseAtual = [...indicesBase];
let matrizBaseAtual = extrairBase(matrizRestricoes, baseAtual);
let invAtual = inversa(matrizBaseAtual);
let xBAtual = solucaoBasicaInicial(matrizBaseAtual, vetorB);

while (true) {
    if (!xBAtual) {
        throw new Error("Não foi possível calcular a solução básica (vetor vazio)");
    }

    const custosRed = custosReduzidos(
        matrizRestricoes,
        custosFase1,
        baseAtual,
        invAtual!
    );

    const candidatos = custosRed.filter((c) => c.custoReduzido < -1e-8);
    if (candidatos.length === 0) { // solução otima
        break; 
    }

    const entra = candidatos.reduce(
        (min, c) => (c.custoReduzido < min.custoReduzido ? c : min),
        candidatos[0]
    );

    const a_j = matrizRestricoes.map((linha) => linha[entra.indice]);
    const direcao = multiplicarMatrizPorVetor(invAtual!, a_j);

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
    matrizBaseAtual = extrairBase(matrizRestricoes, baseAtual);
    invAtual = inversa(matrizBaseAtual);

    if (!invAtual) {
        throw new Error("Não foi possível calcular a inversa da nova base.");
    }
    xBAtual = multiplicarMatrizPorVetor(invAtual, vetorB);
}

// calculo do valor otimo

const valorOtimoFase1 = baseAtual
    .map((idx, i) => nomesVariaveis[idx].startsWith("a") ? xBAtual[i] : 0)
    .reduce((a, b) => a + b, 0);

console.log("Valor ótimo encontrado na fase 1:", valorOtimoFase1);

// prosseguir para fase 2
if (valorOtimoFase1 > 1e-8) {
    console.log("Problema original inviavel!");
} else {
    console.log("Solução viavel encontrada! prosseguindo para a Fase 2...");
    const resultadoFase2 = simplexFase2();
    console.log("Resultado Fase 2:", resultadoFase2);
}