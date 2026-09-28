/**
 * Motor de Cálculo
 * -----------------
 * Responsável por interpretar e resolver expressões matemáticas digitadas
 * pelo usuário, sem recorrer a `eval` ou `Function` (evitando riscos de
 * segurança e mantendo controle total sobre o que é aceito).
 *
 * O processo segue três etapas clássicas de interpretação de expressões:
 *   1. Tokenização   -> transforma o texto em uma lista de símbolos (tokens)
 *   2. Conversão      -> reorganiza os tokens da notação infixa para a
 *                        notação pós-fixa (algoritmo Shunting Yard)
 *   3. Avaliação      -> percorre a notação pós-fixa calculando o resultado
 *
 * Este arquivo expõe apenas a função `avaliarExpressao`, através do
 * objeto global `MotorDeCalculo`, para ser utilizada pela interface.
 */

(function () {

    const OPERADORES_BINARIOS = {
        "+": { precedencia: 1, associatividade: "esquerda" },
        "-": { precedencia: 1, associatividade: "esquerda" },
        "*": { precedencia: 2, associatividade: "esquerda" },
        "/": { precedencia: 2, associatividade: "esquerda" },
        "^": { precedencia: 4, associatividade: "direita" },
    };

    const PRECEDENCIA_OPERADOR_UNARIO = 3;

    const NOMES_DE_FUNCOES = ["sen", "cos", "tan", "log", "ln"];

    const CONSTANTES = {
        "π": Math.PI,
        "e": Math.E,
    };

    /* =========================================================
       ETAPA 1: TOKENIZAÇÃO
       ========================================================= */

    function tokenizarExpressao(expressaoTexto) {
        const tokens = [];
        let posicaoAtual = 0;

        function obterUltimoToken() {
            return tokens.length > 0 ? tokens[tokens.length - 1] : null;
        }

        function ehPosicaoValidaParaOperadorUnario() {
            const ultimoToken = obterUltimoToken();
            if (!ultimoToken) {
                return true;
            }
            return (
                ultimoToken.tipo === "operador" ||
                ultimoToken.tipo === "operadorUnario" ||
                ultimoToken.tipo === "abrirParenteses"
            );
        }

        while (posicaoAtual < expressaoTexto.length) {
            const caractereAtual = expressaoTexto[posicaoAtual];

            if (/\s/.test(caractereAtual)) {
                posicaoAtual += 1;
                continue;
            }

            if (/[0-9.]/.test(caractereAtual)) {
                const trechoRestante = expressaoTexto.slice(posicaoAtual);
                const correspondenciaNumero = trechoRestante.match(/^\d+(\.\d+)?/);

                if (!correspondenciaNumero) {
                    throw new Error("Número inválido na expressão.");
                }

                tokens.push({ tipo: "numero", valor: correspondenciaNumero[0] });
                posicaoAtual += correspondenciaNumero[0].length;
                continue;
            }

            if (caractereAtual === "√") {
                tokens.push({ tipo: "funcao", valor: "sqrt" });
                posicaoAtual += 1;
                continue;
            }

            if (caractereAtual === "π") {
                tokens.push({ tipo: "constante", valor: "π" });
                posicaoAtual += 1;
                continue;
            }

            if (/[a-zA-Z]/.test(caractereAtual)) {
                const nomeDeFuncaoEncontrado = NOMES_DE_FUNCOES.find((nome) =>
                    expressaoTexto.startsWith(nome, posicaoAtual)
                );

                if (nomeDeFuncaoEncontrado) {
                    tokens.push({ tipo: "funcao", valor: nomeDeFuncaoEncontrado });
                    posicaoAtual += nomeDeFuncaoEncontrado.length;
                    continue;
                }

                if (caractereAtual === "e") {
                    tokens.push({ tipo: "constante", valor: "e" });
                    posicaoAtual += 1;
                    continue;
                }

                throw new Error(`Símbolo não reconhecido: "${caractereAtual}".`);
            }

            if (caractereAtual === "(") {
                tokens.push({ tipo: "abrirParenteses", valor: "(" });
                posicaoAtual += 1;
                continue;
            }

            if (caractereAtual === ")") {
                tokens.push({ tipo: "fecharParenteses", valor: ")" });
                posicaoAtual += 1;
                continue;
            }

            if (caractereAtual === "!") {
                tokens.push({ tipo: "fatorial", valor: "!" });
                posicaoAtual += 1;
                continue;
            }

            if (caractereAtual === "-" && ehPosicaoValidaParaOperadorUnario()) {
                tokens.push({ tipo: "operadorUnario", valor: "-" });
                posicaoAtual += 1;
                continue;
            }

            if (Object.prototype.hasOwnProperty.call(OPERADORES_BINARIOS, caractereAtual)) {
                tokens.push({ tipo: "operador", valor: caractereAtual });
                posicaoAtual += 1;
                continue;
            }

            throw new Error(`Símbolo não reconhecido: "${caractereAtual}".`);
        }

        return tokens;
    }

    /* =========================================================
       ETAPA 2: CONVERSÃO PARA NOTAÇÃO PÓS-FIXA (SHUNTING YARD)
       ========================================================= */

    function obterInformacoesDeOperador(token) {
        if (token.tipo === "operadorUnario") {
            return { precedencia: PRECEDENCIA_OPERADOR_UNARIO, associatividade: "direita" };
        }
        return OPERADORES_BINARIOS[token.valor];
    }

    function deveDesempilharAntesDeEmpilhar(tokenNoTopoDaPilha, tokenAtual) {
        if (
            tokenNoTopoDaPilha.tipo === "abrirParenteses" ||
            tokenNoTopoDaPilha.tipo === "funcao"
        ) {
            return false;
        }

        const informacoesTopo = obterInformacoesDeOperador(tokenNoTopoDaPilha);
        const informacoesAtual = obterInformacoesDeOperador(tokenAtual);

        if (informacoesAtual.associatividade === "esquerda") {
            return informacoesTopo.precedencia >= informacoesAtual.precedencia;
        }
        return informacoesTopo.precedencia > informacoesAtual.precedencia;
    }

    function converterParaNotacaoPosFixa(tokens) {
        const saida = [];
        const pilhaDeOperadores = [];

        tokens.forEach((token) => {
            if (token.tipo === "numero" || token.tipo === "constante") {
                saida.push(token);
                return;
            }

            if (token.tipo === "fatorial") {
                saida.push(token);
                return;
            }

            if (token.tipo === "funcao") {
                pilhaDeOperadores.push(token);
                return;
            }

            if (token.tipo === "operadorUnario") {
                // O operador unário ainda não tem seu operando (que vem a
                // seguir), então ele apenas aguarda na pilha, sem disparar
                // o desempilhamento por precedência dos operadores binários.
                pilhaDeOperadores.push(token);
                return;
            }

            if (token.tipo === "operador") {
                while (
                    pilhaDeOperadores.length > 0 &&
                    deveDesempilharAntesDeEmpilhar(
                        pilhaDeOperadores[pilhaDeOperadores.length - 1],
                        token
                    )
                ) {
                    saida.push(pilhaDeOperadores.pop());
                }
                pilhaDeOperadores.push(token);
                return;
            }

            if (token.tipo === "abrirParenteses") {
                pilhaDeOperadores.push(token);
                return;
            }

            if (token.tipo === "fecharParenteses") {
                while (
                    pilhaDeOperadores.length > 0 &&
                    pilhaDeOperadores[pilhaDeOperadores.length - 1].tipo !== "abrirParenteses"
                ) {
                    saida.push(pilhaDeOperadores.pop());
                }

                if (pilhaDeOperadores.length === 0) {
                    throw new Error("Parênteses desbalanceados.");
                }

                pilhaDeOperadores.pop();

                const novoTopo = pilhaDeOperadores[pilhaDeOperadores.length - 1];
                if (novoTopo && novoTopo.tipo === "funcao") {
                    saida.push(pilhaDeOperadores.pop());
                }
            }
        });

        while (pilhaDeOperadores.length > 0) {
            const operadorRestante = pilhaDeOperadores.pop();
            if (operadorRestante.tipo === "abrirParenteses") {
                throw new Error("Parênteses desbalanceados.");
            }
            saida.push(operadorRestante);
        }

        return saida;
    }

    /* =========================================================
       ETAPA 3: AVALIAÇÃO DA NOTAÇÃO PÓS-FIXA
       ========================================================= */

    function aplicarOperadorBinario(simboloOperador, operandoEsquerdo, operandoDireito) {
        switch (simboloOperador) {
            case "+":
                return operandoEsquerdo + operandoDireito;
            case "-":
                return operandoEsquerdo - operandoDireito;
            case "*":
                return operandoEsquerdo * operandoDireito;
            case "/":
                if (operandoDireito === 0) {
                    throw new Error("Não é possível dividir por zero.");
                }
                return operandoEsquerdo / operandoDireito;
            case "^":
                return Math.pow(operandoEsquerdo, operandoDireito);
            default:
                throw new Error(`Operador desconhecido: "${simboloOperador}".`);
        }
    }

    function converterGrausParaRadianos(valorEmGraus) {
        return (valorEmGraus * Math.PI) / 180;
    }

    function aplicarFuncao(nomeDaFuncao, operando) {
        switch (nomeDaFuncao) {
            case "sen":
                return Math.sin(converterGrausParaRadianos(operando));
            case "cos":
                return Math.cos(converterGrausParaRadianos(operando));
            case "tan":
                return Math.tan(converterGrausParaRadianos(operando));
            case "log":
                if (operando <= 0) {
                    throw new Error("O logaritmo exige um valor maior que zero.");
                }
                return Math.log10(operando);
            case "ln":
                if (operando <= 0) {
                    throw new Error("O logaritmo natural exige um valor maior que zero.");
                }
                return Math.log(operando);
            case "sqrt":
                if (operando < 0) {
                    throw new Error("Não é possível calcular a raiz de um número negativo.");
                }
                return Math.sqrt(operando);
            default:
                throw new Error(`Função desconhecida: "${nomeDaFuncao}".`);
        }
    }

    function calcularFatorial(valor) {
        if (!Number.isInteger(valor) || valor < 0) {
            throw new Error("O fatorial exige um número inteiro não negativo.");
        }
        if (valor > 170) {
            throw new Error("Valor muito grande para calcular o fatorial.");
        }

        let resultado = 1;
        for (let fator = 2; fator <= valor; fator += 1) {
            resultado *= fator;
        }
        return resultado;
    }

    function avaliarNotacaoPosFixa(tokensPosFixos) {
        const pilhaDeValores = [];

        tokensPosFixos.forEach((token) => {
            if (token.tipo === "numero") {
                pilhaDeValores.push(parseFloat(token.valor));
                return;
            }

            if (token.tipo === "constante") {
                pilhaDeValores.push(CONSTANTES[token.valor]);
                return;
            }

            if (token.tipo === "operador") {
                const operandoDireito = pilhaDeValores.pop();
                const operandoEsquerdo = pilhaDeValores.pop();

                if (operandoEsquerdo === undefined || operandoDireito === undefined) {
                    throw new Error("Expressão incompleta.");
                }

                pilhaDeValores.push(
                    aplicarOperadorBinario(token.valor, operandoEsquerdo, operandoDireito)
                );
                return;
            }

            if (token.tipo === "operadorUnario") {
                const operando = pilhaDeValores.pop();
                if (operando === undefined) {
                    throw new Error("Expressão incompleta.");
                }
                pilhaDeValores.push(-operando);
                return;
            }

            if (token.tipo === "funcao") {
                const operando = pilhaDeValores.pop();
                if (operando === undefined) {
                    throw new Error("Expressão incompleta.");
                }
                pilhaDeValores.push(aplicarFuncao(token.valor, operando));
                return;
            }

            if (token.tipo === "fatorial") {
                const operando = pilhaDeValores.pop();
                if (operando === undefined) {
                    throw new Error("Expressão incompleta.");
                }
                pilhaDeValores.push(calcularFatorial(operando));
            }
        });

        if (pilhaDeValores.length !== 1) {
            throw new Error("Expressão inválida.");
        }

        return pilhaDeValores[0];
    }

    /* =========================================================
       FUNÇÃO AUXILIAR: BALANCEAMENTO AUTOMÁTICO DE PARÊNTESES
       ========================================================= */

    function balancearParenteses(expressaoTexto) {
        const quantidadeDeAbertura = (expressaoTexto.match(/\(/g) || []).length;
        const quantidadeDeFechamento = (expressaoTexto.match(/\)/g) || []).length;
        const parentesesFaltantes = quantidadeDeAbertura - quantidadeDeFechamento;

        if (parentesesFaltantes <= 0) {
            return expressaoTexto;
        }

        return expressaoTexto + ")".repeat(parentesesFaltantes);
    }

    /* =========================================================
       FUNÇÃO PRINCIPAL EXPOSTA PARA A INTERFACE
       ========================================================= */

    function avaliarExpressao(expressaoTexto) {
        if (!expressaoTexto || expressaoTexto.trim().length === 0) {
            throw new Error("Digite uma expressão para calcular.");
        }

        const expressaoBalanceada = balancearParenteses(expressaoTexto);
        const tokens = tokenizarExpressao(expressaoBalanceada);
        const notacaoPosFixa = converterParaNotacaoPosFixa(tokens);
        const resultado = avaliarNotacaoPosFixa(notacaoPosFixa);

        if (!Number.isFinite(resultado)) {
            throw new Error("O resultado não é um número válido.");
        }

        return resultado;
    }

    window.MotorDeCalculo = { avaliarExpressao };

})();
