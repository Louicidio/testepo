import * as fs from "fs";
import { simplexFase2 } from "./fase2";
import { custosFase1, matrizBase, xB } from "./fase1";

// Torna tipoOtimizacao acessível para as funções auxiliares
let tipoOtimizacaoGlobal = "min";

function main() {
    // 1. Ler arquivo de entrada
    const content = fs.readFileSync("./teste.txt", "utf-8");
    const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter((l) => l && !l.startsWith("//"));

    // 2. Identificar tipo de problema e variáveis
    const primeiraLinha = lines[0];
    const tipoOtimizacao = primeiraLinha.toLowerCase().startsWith("max")
        ? "max"
        : "min";
    tipoOtimizacaoGlobal = tipoOtimizacao;
    const variavelRegex = /([+-]?\s*\d*\.?\d*)\s*x(\d+)/g;
    let maxVarIdx = 0;
    let match;
    while ((match = variavelRegex.exec(primeiraLinha)) !== null) {
        const idx = parseInt(match[2]);
        if (idx > maxVarIdx) maxVarIdx = idx;
    }
    const numVars = maxVarIdx;
    let funcaoObjetivo: number[] = Array(numVars).fill(0);
    variavelRegex.lastIndex = 0;
    while ((match = variavelRegex.exec(primeiraLinha)) !== null) {
        let coefStr = match[1].replace(/\s+/g, "");
        const idx = parseInt(match[2]) - 1;
        if (coefStr === "" || coefStr === "+") coefStr = "1";
        if (coefStr === "-") coefStr = "-1";
        funcaoObjetivo[idx] = parseFloat(coefStr);
    }
    if (tipoOtimizacao === "max")
        funcaoObjetivo = funcaoObjetivo.map((x) => -x);

    // 3. Montar restrições e identificar necessidade de artificiais
    const restricoes = lines.slice(1).filter((l) => l.match(/[<>=]/));
    const matriz: number[][] = [];
    const vetorB: number[] = [];
    let artificiais = 0;
    let folgas = 0;
    let excessos = 0;
    let tipos: ("<=" | ">=" | "=")[] = [];
    restricoes.forEach((line) => {
        const restricaoRegex = /(.*?)(<=|>=|=)\s*(-?\d*\.?\d+)/;
        const m = line.match(restricaoRegex);
        if (!m) return;
        const lhs = m[1];
        const op = m[2] as "<=" | ">=" | "=";
        const rhs = parseFloat(m[3]);
        tipos.push(op);
        const coef = Array(numVars).fill(0);
        variavelRegex.lastIndex = 0;
        let match2;
        while ((match2 = variavelRegex.exec(lhs)) !== null) {
            let coefStr = match2[1].replace(/\s+/g, "");
            const idx = parseInt(match2[2]) - 1;
            if (coefStr === "" || coefStr === "+") coefStr = "1";
            if (coefStr === "-") coefStr = "-1";
            coef[idx] = parseFloat(coefStr);
        }
        matriz.push(coef);
        vetorB.push(rhs);
    });

    // 4. Expandir matriz com folgas, excessos e artificiais
    let totalVars = numVars;
    let matrizExpandida: number[][] = [];
    let nomesVars: string[] = [];
    for (let i = 1; i <= numVars; i++) nomesVars.push(`x${i}`);
    let folgaCount = 1,
        excessoCount = 1,
        artificialCount = 1;
    matriz.forEach((linha, i) => {
        let novaLinha = [...linha];
        if (tipos[i] === "<=") {
            novaLinha = novaLinha.concat(
                Array(folgas).fill(0),
                [1],
                Array(excessos).fill(0),
                Array(artificiais).fill(0)
            );
            nomesVars.push(`s${folgaCount++}`);
            folgas++;
        } else if (tipos[i] === ">=") {
            novaLinha = novaLinha.concat(
                Array(folgas).fill(0),
                [-1],
                Array(excessos).fill(0),
                [1],
                Array(artificiais).fill(0)
            );
            nomesVars.push(`e${excessoCount++}`);
            nomesVars.push(`a${artificialCount++}`);
            excessos++;
            artificiais++;
        } else if (tipos[i] === "=") {
            novaLinha = novaLinha.concat(
                Array(folgas).fill(0),
                Array(excessos).fill(0),
                [1],
                Array(artificiais).fill(0)
            );
            nomesVars.push(`a${artificialCount++}`);
            artificiais++;
        }
        matrizExpandida.push(novaLinha);
    });

    // 5. Exibir matriz expandida e variáveis
    console.log("Matriz expandida:");
    console.table(matrizExpandida);
    console.log("Variáveis:", nomesVars);
    console.log("Função objetivo:", funcaoObjetivo);
    console.log("Vetor b:", vetorB);
    // Aqui você pode seguir para a montagem das bases e execução das fases

    // 6. Verificar se precisa de Fase 1 (se há >= ou =, precisa de artificiais)
    const precisaFase1 = tipos.some((t) => t === ">=" || t === "=");
    if (precisaFase1) {
        console.log("Problema requer Fase 1 (variáveis artificiais presentes)");
        executarFase1(matrizExpandida, vetorB, funcaoObjetivo, nomesVars);
    } else {
        console.log(
            "Problema pode ir direto para a Fase 2 (sem variáveis artificiais)"
        );
        executarFase2(matrizExpandida, vetorB, funcaoObjetivo, nomesVars);
    }
}

// Função para executar a Fase 1 (exemplo simplificado)
function executarFase1(
    matriz: number[][],
    vetorB: number[],
    funcaoObjetivo: number[],
    nomesVars: string[]
) {
    console.log(
        "[FASE 1] Executando Simplex Fase 1 com variáveis artificiais..."
    );
    // Aqui você pode integrar sua lógica de Fase 1, ou chamar o código já existente
    // Exemplo: usar a lógica já pronta de fase1.ts
    try {
        // Mostra resultados da Fase 1
        console.log("Custos Fase 1:", custosFase1);
        console.log("Matriz Base Fase 1:", matrizBase);
        console.log("Solução Básica Inicial Fase 1:", xB);
        // Após a Fase 1, chama a Fase 2
        executarFase2(matriz, vetorB, funcaoObjetivo, nomesVars);
    } catch (e) {
        console.error("Erro ao executar Fase 1:", e);
    }
}

// Função para executar a Fase 2 (chama sua implementação já pronta)
function executarFase2(
    matriz: number[][],
    vetorB: number[],
    funcaoObjetivo: number[],
    nomesVars: string[]
) {
    console.log("[FASE 2] Executando Simplex Fase 2...");
    try {
        const resultado = simplexFase2();
        let valorOtimo = resultado?.valorOtimo;
        if (typeof valorOtimo === "number" && tipoOtimizacaoGlobal === "max") {
            valorOtimo = -valorOtimo;
        }
        console.log("Resultado Fase 2:", { ...resultado, valorOtimo });
    } catch (e) {
        console.error("Erro ao executar Fase 2:", e);
    }
}

main();
