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
exports.numVars = exports.folgas = exports.vetorB = exports.MatrizA = exports.funcaoObjetivo = exports.tipoProblema = void 0;
const fs = __importStar(require("fs"));
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
        if (idx > maxVarIdx)
            maxVarIdx = idx;
    }
});
const numVars = maxVarIdx;
exports.numVars = numVars;
const primeiraLinha = lines[0];
let tipoProblema = "";
exports.tipoProblema = tipoProblema;
let funcaoObjetivo = Array(numVars).fill(0);
exports.funcaoObjetivo = funcaoObjetivo;
if (/^MIN/i.test(primeiraLinha)) {
    exports.tipoProblema = tipoProblema = "MIN";
}
else if (/^MAX/i.test(primeiraLinha)) {
    exports.tipoProblema = tipoProblema = "MAX";
}
else {
    throw new Error("Função objetivo deve começar com MIN ou MAX");
} // tem q adicionar pra multiplicar o vetor por -1 se for min
// Extrai os coeficientes da função obj
let match;
while ((match = variavelRegex.exec(primeiraLinha)) !== null) {
    let coefStr = match[1].replace(/\s+/g, "");
    const idx = parseInt(match[2]) - 1;
    if (coefStr === "" || coefStr === "+")
        coefStr = "1";
    if (coefStr === "-")
        coefStr = "-1";
    funcaoObjetivo[idx] = parseFloat(coefStr);
}
const MatrizA = []; // matriz principal
exports.MatrizA = MatrizA;
const vetorB = []; // resultado das restrictions
exports.vetorB = vetorB;
const folgas = []; // vo usar mais tarde para base completa
exports.folgas = folgas;
let folgaCount = 1;
// Processa cada linha de restrição (ignorando a objetiva)
lines.slice(1).forEach((line) => {
    if (!line)
        return;
    const restricaoMatch = line.match(restricaoRegex);
    if (!restricaoMatch)
        return;
    const lhs = restricaoMatch[1];
    const operador = restricaoMatch[2];
    const rhs = parseFloat(restricaoMatch[3]);
    const coeficientes = Array(numVars).fill(0);
    let match;
    while ((match = variavelRegex.exec(lhs)) !== null) {
        let coefStr = match[1].replace(/\s+/g, "");
        const idx = parseInt(match[2]) - 1;
        if (coefStr === "" || coefStr === "+")
            coefStr = "1";
        if (coefStr === "-")
            coefStr = "-1";
        coeficientes[idx] = parseFloat(coefStr);
    }
    MatrizA.push(coeficientes);
    vetorB.push(rhs);
    // adiciona folga conforme operador
    if (operador === "<=") {
        folgas.push(`s${folgaCount}`);
        folgaCount++;
    }
    else if (operador === ">=") {
        folgas.push(`e${folgaCount}`);
        folgaCount++;
    }
});
