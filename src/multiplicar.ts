export function multiplicarMatrizPorVetor(matriz: number[][], vetor: number[]): number[] {
    return matriz.map((linha) =>
        linha.reduce((soma, val, j) => soma + val * vetor[j], 0)
    );
}

export function multiplicarMatrizes(A: number[][], B: number[][]): number[][] {
    const m = A.length;
    const n = A[0].length;
    const p = B[0].length;
    const resultado: number[][] = Array.from({ length: m }, () => Array(p).fill(0));

    for (let i = 0; i < m; i++) {
        for (let j = 0; j < p; j++) {
            for (let k = 0; k < n; k++) {
                resultado[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return resultado;
}
