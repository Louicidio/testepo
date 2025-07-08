import * as fs from "fs";

// so o basico
const content = fs.readFileSync("./teste.txt", "utf-8");
const lines = content.split("\n").map((line) => line.trim());

// Regex oara extrair variáveis e restrições
const variavelRegex = /([+-]?\s*\d*\.?\d*)\s*x(\d+)/g;
const restricaoRegex = /(.*?)(<=|>=|=)\s*(-?\d*\.?\d+)/;

// armazena o maior x encontrado
let maxVarIdx = 0;
lines.forEach((line) => {
    let match;
    while ((match = variavelRegex.exec(line)) !== null) {
        const idx = parseInt(match[2]);
        if (idx > maxVarIdx) maxVarIdx = idx;
    }
});
const numVars = maxVarIdx;

const primeiraLinha = lines[0];
let tipoProblema = "";
let funcaoObjetivo: number[] = Array(numVars).fill(0);

if (/^MIN/i.test(primeiraLinha)) {
    tipoProblema = "MIN";
} else if (/^MAX/i.test(primeiraLinha)) {
    tipoProblema = "MAX";
} else {
    throw new Error("Função objetivo deve começar com MIN ou MAX");
} // tem q adicionar pra multiplicar o vetor por -1 se for min

// Extrai os coeficientes da função obj
let match;
while ((match = variavelRegex.exec(primeiraLinha)) !== null) {
    let coefStr = match[1].replace(/\s+/g, "");
    const idx = parseInt(match[2]) - 1;
    if (coefStr === "" || coefStr === "+") coefStr = "1";
    if (coefStr === "-") coefStr = "-1";
    funcaoObjetivo[idx] = parseFloat(coefStr);
}

const MatrizA: number[][] = []; // matriz principal
const vetorB: number[] = []; // resultado das restrictions
const folgas: string[] = []; // vo usar mais tarde para base completa

let folgaCount = 1;

// Processa cada linha de restrição (ignorando a objetiva)
lines.slice(1).forEach((line) => {
    if (!line) return;
    const restricaoMatch = line.match(restricaoRegex);
    if (!restricaoMatch) return;

    const lhs = restricaoMatch[1];
    const operador = restricaoMatch[2];
    const rhs = parseFloat(restricaoMatch[3]);
    const coeficientes = Array(numVars).fill(0);

    let match;
    while ((match = variavelRegex.exec(lhs)) !== null) {
        let coefStr = match[1].replace(/\s+/g, "");
        const idx = parseInt(match[2]) - 1;
        if (coefStr === "" || coefStr === "+") coefStr = "1";
        if (coefStr === "-") coefStr = "-1";
        coeficientes[idx] = parseFloat(coefStr);
    }

    MatrizA.push(coeficientes);
    vetorB.push(rhs);

    // adiciona folga conforme operador
    if (operador === "<=") {
        folgas.push(`s${folgaCount}`);
        folgaCount++;
    } else if (operador === ">=") {
        folgas.push(`e${folgaCount}`);
        folgaCount++;
    }
});
export { tipoProblema, funcaoObjetivo, MatrizA, vetorB, folgas, numVars };
