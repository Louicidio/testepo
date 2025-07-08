import { nomesVariaveis, matrizRestricoes, indicesBase } from "./determinante";
import { funcaoObjetivo, vetorB } from "./lertexiste";
import { extrairBase } from "./determinante";
import { inversa } from "./inversa";
import { multiplicarMatrizPorVetor } from "./multiplicar";

// Remove variáveis artificiais da base e da matriz
function removerArtificiais(nomes: string[], matriz: number[][]) {
    const indicesArtificiais = nomes
        .map((nome, i) => (nome.startsWith("a") ? i : -1))
        .filter((i) => i !== -1);
    const novosNomes = nomes.filter((_, i) => !indicesArtificiais.includes(i));
    const novaMatriz = matriz.map((linha) =>
        linha.filter((_, i) => !indicesArtificiais.includes(i))
    );
    return { novosNomes, novaMatriz };
}

// Monta custos da função objetivo original
function custosF2(nomes: string[]): number[] {
    return nomes.map((nome, i) => {
        if (nome.startsWith("x"))
            return funcaoObjetivo[parseInt(nome.slice(1)) - 1] || 0;
        return 0;
    });
}

export function simplexFase2() {
    // Remove artificiais
    const { novosNomes, novaMatriz } = removerArtificiais(
        nomesVariaveis,
        matrizRestricoes
    );
    // Atualiza base
    let baseAtual = indicesBase.filter(
        (idx) => !nomesVariaveis[idx].startsWith("a")
    );
    // Verifica se a base tem o tamanho correto
    if (baseAtual.length !== novaMatriz.length) {
        throw new Error(
            "Após remover as artificiais, a base ficou incompleta ou degenerada. Não é possível montar uma base viável para a Fase 2."
        );
    }
    let matrizBaseAtual = extrairBase(novaMatriz, baseAtual);
    let invAtual = inversa(matrizBaseAtual);
    if (!invAtual) {
        throw new Error(
            "A matriz base ficou singular (não invertível) na Fase 2."
        );
    }
    let xBAtual = multiplicarMatrizPorVetor(invAtual, vetorB);
    const custosFase2 = custosF2(novosNomes);

    function custosReduzidosF2(
        matriz: number[][],
        custos: number[],
        base: number[],
        invBase: number[][]
    ) {
        const custosBase = base.map((idx) => custos[idx]);
        const resultados: {
            variavel: string;
            custoReduzido: number;
            indice: number;
        }[] = [];
        for (let j = 0; j < custos.length; j++) {
            if (base.includes(j)) continue;
            const a_j = matriz.map((linha) => linha[j]);
            const y = multiplicarMatrizPorVetor(invBase, custosBase);
            const z_j = y.reduce((soma, val, i) => soma + val * a_j[i], 0);
            const custoReduzido = custos[j] - z_j;
            resultados.push({
                variavel: novosNomes[j],
                custoReduzido,
                indice: j,
            });
        }
        return resultados;
    }

    while (true) {
        if (!xBAtual)
            throw new Error(
                "Não foi possível calcular a solução básica (vetor vazio)"
            );
        const custosRed = custosReduzidosF2(
            novaMatriz,
            custosFase2,
            baseAtual,
            invAtual!
        );
        const candidatos = custosRed.filter((c) => c.custoReduzido < -1e-8);
        if (candidatos.length === 0) break; // ótimo
        const entra = candidatos.reduce(
            (min, c) => (c.custoReduzido < min.custoReduzido ? c : min),
            candidatos[0]
        );
        const a_j = novaMatriz.map((linha) => linha[entra.indice]);
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
            console.log("Problema ilimitado na Fase 2");
            break;
        }
        baseAtual[saiIdx] = entra.indice;
        matrizBaseAtual = extrairBase(novaMatriz, baseAtual);
        invAtual = inversa(matrizBaseAtual);
        if (!invAtual) {
            throw new Error(
                "A matriz base ficou singular (não invertível) durante o pivoteamento na Fase 2."
            );
        }
        xBAtual = multiplicarMatrizPorVetor(invAtual, vetorB);
    }
    // Valor ótimo
    const valorOtimo = baseAtual
        .map((idx, i) => custosFase2[idx] * xBAtual[i])
        .reduce((a, b) => a + b, 0);
    console.log("Valor ótimo Fase 2:", valorOtimo);
    return { valorOtimo, base: baseAtual, xB: xBAtual, nomes: novosNomes };
}

// Para testar: simplexFase2();
