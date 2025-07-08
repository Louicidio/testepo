import { MatrizA, vetorB, funcaoObjetivo, tipoProblema } from "./lertexiste";
import {
    matrizComArtificiais,
    matrizExp,
    operadores,
} from "./tabelaRestricoes";

const matrizExpandida = matrizExp(MatrizA, operadores);

// Monta a tabela inicial do Simplex
function montarTabelaSimplex(matriz: number[][], vetorB: number[], funcaoObjetivo: number[]) {
    const tabela = matriz.map((linha, i) => [...linha, vetorB[i]]);

    // preenche tudo
    const numVariaveis = matriz[0].length;
    let linhaZ = Array(numVariaveis).fill(0);
    for (let i = 0; i < funcaoObjetivo.length; i++) {
        linhaZ[i] =
            tipoProblema === "MIN" ? -funcaoObjetivo[i] : funcaoObjetivo[i];
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

montarTabelaSimplex(matrizExpandida, vetorB, funcaoObjetivo);

export { matrizComArtificiais, matrizExpandida };

export function tabelaSimplex() {
    const { tabela, linhaZ } = montarTabelaSimplex(
        matrizExpandida,
        vetorB,
        funcaoObjetivo
    );
    return { tabela, linhaZ };
}
