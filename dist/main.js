"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const fase2_1 = require("./fase2");
const fase1_1 = require("./fase1");
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
        if (idx > maxVarIdx)
            maxVarIdx = idx;
    }
    const numVars = maxVarIdx;
    let funcaoObjetivo = Array(numVars).fill(0);
    variavelRegex.lastIndex = 0;
    while ((match = variavelRegex.exec(primeiraLinha)) !== null) {
        let coefStr = match[1].replace(/\s+/g, "");
        const idx = parseInt(match[2]) - 1;
        if (coefStr === "" || coefStr === "+")
            coefStr = "1";
        if (coefStr === "-")
            coefStr = "-1";
        funcaoObjetivo[idx] = parseFloat(coefStr);
    }
    if (tipoOtimizacao === "max")
        funcaoObjetivo = funcaoObjetivo.map((x) => -x);
    // 3. Montar restrições e identificar necessidade de artificiais
    const restricoes = lines.slice(1).filter((l) => l.match(/[<>=]/));
    const matriz = [];
    const vetorB = [];
    let artificiais = 0;
    let folgas = 0;
    let excessos = 0;
    let tipos = [];
    restricoes.forEach((line) => {
        const restricaoRegex = /(.*?)(<=|>=|=)\s*(-?\d*\.?\d+)/;
        const m = line.match(restricaoRegex);
        if (!m)
            return;
        const lhs = m[1];
        const op = m[2];
        const rhs = parseFloat(m[3]);
        tipos.push(op);
        const coef = Array(numVars).fill(0);
        variavelRegex.lastIndex = 0;
        let match2;
        while ((match2 = variavelRegex.exec(lhs)) !== null) {
            let coefStr = match2[1].replace(/\s+/g, "");
            const idx = parseInt(match2[2]) - 1;
            if (coefStr === "" || coefStr === "+")
                coefStr = "1";
            if (coefStr === "-")
                coefStr = "-1";
            coef[idx] = parseFloat(coefStr);
        }
        matriz.push(coef);
        vetorB.push(rhs);
    });
    // 4. Expandir matriz com folgas, excessos e artificiais
    let totalVars = numVars;
    let matrizExpandida = [];
    let nomesVars = [];
    for (let i = 1; i <= numVars; i++)
        nomesVars.push(`x${i}`);
    let folgaCount = 1, excessoCount = 1, artificialCount = 1;
    matriz.forEach((linha, i) => {
        let novaLinha = [...linha];
        if (tipos[i] === "<=") {
            novaLinha = novaLinha.concat(Array(folgas).fill(0), [1], Array(excessos).fill(0), Array(artificiais).fill(0));
            nomesVars.push(`s${folgaCount++}`);
            folgas++;
        }
        else if (tipos[i] === ">=") {
            novaLinha = novaLinha.concat(Array(folgas).fill(0), [-1], Array(excessos).fill(0), [1], Array(artificiais).fill(0));
            nomesVars.push(`e${excessoCount++}`);
            nomesVars.push(`a${artificialCount++}`);
            excessos++;
            artificiais++;
        }
        else if (tipos[i] === "=") {
            novaLinha = novaLinha.concat(Array(folgas).fill(0), Array(excessos).fill(0), [1], Array(artificiais).fill(0));
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
    }
    else {
        console.log("Problema pode ir direto para a Fase 2 (sem variáveis artificiais)");
        executarFase2(matrizExpandida, vetorB, funcaoObjetivo, nomesVars);
    }
}
// Função para executar a Fase 1 (exemplo simplificado)
function executarFase1(matriz, vetorB, funcaoObjetivo, nomesVars) {
    console.log("[FASE 1] Executando Simplex Fase 1 com variáveis artificiais...");
    // Aqui você pode integrar sua lógica de Fase 1, ou chamar o código já existente
    // Exemplo: usar a lógica já pronta de fase1.ts
    try {
        // Mostra resultados da Fase 1
        console.log("Custos Fase 1:", fase1_1.custosFase1);
        console.log("Matriz Base Fase 1:", fase1_1.matrizBase);
        console.log("Solução Básica Inicial Fase 1:", fase1_1.xB);
        // Após a Fase 1, chama a Fase 2
        executarFase2(matriz, vetorB, funcaoObjetivo, nomesVars);
    }
    catch (e) {
        console.error("Erro ao executar Fase 1:", e);
    }
}
// Função para executar a Fase 2 (chama sua implementação já pronta)
function executarFase2(matriz, vetorB, funcaoObjetivo, nomesVars) {
    console.log("[FASE 2] Executando Simplex Fase 2...");
    try {
        const resultado = (0, fase2_1.simplexFase2)();
        let valorOtimo = resultado === null || resultado === void 0 ? void 0 : resultado.valorOtimo;
        if (typeof valorOtimo === 'number' && tipoOtimizacaoGlobal === 'max') {
            valorOtimo = -valorOtimo;
        }
        console.log("Resultado Fase 2:", Object.assign(Object.assign({}, resultado), { valorOtimo }));
    }
    catch (e) {
        console.error("Erro ao executar Fase 2:", e);
    }
}
main();
