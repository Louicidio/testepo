import { MatrizA, folgas } from "./lertexiste";

function operadoresFiltro(): string[] {
    return folgas.map((folga) => {
        if (folga.startsWith("s")) return "<=";
        if (folga.startsWith("e")) return ">=";
        return "=";
    });
}
const operadores = operadoresFiltro();

export function matrizExp(MatrizA: number[][], operadores: string[]): number[][] {
    const numRestricoes = MatrizA.length;
    const numVarsOriginais = MatrizA[0].length;
    
    // Conta quantas folgas e artificiais serão adicionadas
    const numFolgas = operadores.filter((op) => op === "<=").length;
    const numExcessos = operadores.filter((op) => op === ">=").length;
    const numArtificiais = operadores.filter(
        (op) => op === ">=" || op === "="
    ).length;
    const novaMatriz: number[][] = [];
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
        } else if (operadores[i] === ">=") {
            linha[numVarsOriginais + numFolgas + excessoAtual] = -1; // excesso
            linha[
                numVarsOriginais + numFolgas + numExcessos + artificialAtual
            ] = 1; // artificial excesso
            excessoAtual++;
            artificialAtual++;
        } else if (operadores[i] === "=") {
            linha[
                numVarsOriginais + numFolgas + numExcessos + artificialAtual
            ] = 1; // artificial
            artificialAtual++;
        }
        novaMatriz.push(linha);
    }
    return novaMatriz;
}

const matrizComArtificiais = matrizExp(MatrizA, operadores); // matriz com folgas, excessos e artificiais


function montarNomesVariaveis(numVarsOriginais: number, operadores: string[]) {
    const nomes: string[] = [];
    // Variáveis originais
    for (let i = 1; i <= numVarsOriginais; i++) nomes.push(`x${i}`);
    
    let folga = 1, excesso = 1, artificial = 1;
    // Para cada restrição, adicione as variáveis extras na ordem em que aparecem nas colunas
    operadores.forEach(op => {
        if (op === "<=") nomes.push(`s${folga++}`);
    });
    operadores.forEach(op => {
        if (op === ">=") nomes.push(`e${excesso++}`);
    });
    operadores.forEach(op => {
        if (op === ">=" || op === "=") nomes.push(`a${artificial++}`);
    });
    return nomes;
}

const numVarsOriginais = MatrizA[0].length;
const nomesVariaveis = montarNomesVariaveis(numVarsOriginais, operadores);

// converte em indices para usar na base
function nomesParaIndicesBase(folgas: string[], nomesVariaveis: string[]): number[] {
    return folgas.map(nome => nomesVariaveis.indexOf(nome)).filter(idx => idx !== -1);
}
const indicesBase = nomesParaIndicesBase(folgas, nomesVariaveis);
// console.log("Indices das variáveis básicas:", indicesBase);

// Função para gerar nomes das bases completas (agr com as artificiais)
function nomesBasesCompletos(operadores: string[], folgas: string[]): string[] {
    let nomesBase: string[] = [];
    let folgaIdx = 0;
    let artificialCount = 1;
    
    for (let i = 0; i < operadores.length; i++) {
        if (operadores[i] === "<=") {
            nomesBase.push(folgas[folgaIdx++]); 
        } else if (operadores[i] === ">=" || operadores[i] === "=") {
            nomesBase.push(`a${artificialCount++}`); 
            folgaIdx++; 
        }
    }
    return nomesBase;
}
const nomesBase = nomesBasesCompletos(operadores, folgas);
// console.log(nomesBase);

export { operadores, matrizComArtificiais, nomesBase };