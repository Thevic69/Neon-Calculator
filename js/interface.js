/**
 * Interface da Calculadora
 * -------------------------
 * Controla o estado da aplicação (expressão atual, modo avançado e
 * histórico), os eventos de clique e teclado, além da renderização do
 * histórico e do glossário educativo de sinais matemáticos.
 *
 * Toda a resolução matemática é delegada ao `MotorDeCalculo`
 * (arquivo motor-calculo.js), mantendo este arquivo focado apenas na
 * experiência do usuário.
 */

const CHAVE_HISTORICO_NO_NAVEGADOR = "calculadora-futurista-historico";
const CHAVE_TEMA_NO_NAVEGADOR = "calculadora-futurista-tema";
const LIMITE_DE_ITENS_NO_HISTORICO = 30;
const TEMA_PADRAO = "azul";

const TEMAS_DE_COR = {
    azul: {
        corInicio: "#3b82f6",
        corFim: "#22d3ee",
        corTextoSobreTema: "#0d1224",
        corBorda: "rgba(96, 165, 250, 0.18)",
        corBordaForte: "rgba(96, 165, 250, 0.35)",
        brilho: "0 0 20px rgba(59, 130, 246, 0.32)",
        brilhoForte: "0 0 32px rgba(59, 130, 246, 0.5)",
        fundoSuave: "rgba(59, 130, 246, 0.1)",
        fundoSuaveForte: "rgba(59, 130, 246, 0.18)",
    },
    verde: {
        corInicio: "#16a34a",
        corFim: "#4ade80",
        corTextoSobreTema: "#0c1f13",
        corBorda: "rgba(74, 222, 128, 0.18)",
        corBordaForte: "rgba(74, 222, 128, 0.35)",
        brilho: "0 0 20px rgba(74, 222, 128, 0.32)",
        brilhoForte: "0 0 32px rgba(74, 222, 128, 0.5)",
        fundoSuave: "rgba(74, 222, 128, 0.1)",
        fundoSuaveForte: "rgba(74, 222, 128, 0.18)",
    },
    vermelho: {
        corInicio: "#dc2626",
        corFim: "#f87171",
        corTextoSobreTema: "#230b0b",
        corBorda: "rgba(248, 113, 113, 0.18)",
        corBordaForte: "rgba(248, 113, 113, 0.35)",
        brilho: "0 0 20px rgba(220, 38, 38, 0.32)",
        brilhoForte: "0 0 32px rgba(220, 38, 38, 0.5)",
        fundoSuave: "rgba(248, 113, 113, 0.1)",
        fundoSuaveForte: "rgba(248, 113, 113, 0.18)",
    },
    preto: {
        corInicio: "#2b2b30",
        corFim: "#57575f",
        corTextoSobreTema: "#f5f5f7",
        corBorda: "rgba(255, 255, 255, 0.14)",
        corBordaForte: "rgba(255, 255, 255, 0.32)",
        brilho: "0 0 20px rgba(255, 255, 255, 0.16)",
        brilhoForte: "0 0 30px rgba(255, 255, 255, 0.28)",
        fundoSuave: "rgba(255, 255, 255, 0.06)",
        fundoSuaveForte: "rgba(255, 255, 255, 0.1)",
    },
};

const GLOSSARIO_DE_SINAIS = [
    { simbolo: "+", nome: "Adição", descricao: "Soma dois valores, resultando na quantidade total entre eles." },
    { simbolo: "−", nome: "Subtração", descricao: "Calcula a diferença entre dois valores." },
    { simbolo: "×", nome: "Multiplicação", descricao: "Soma um valor repetidamente, de acordo com o outro valor informado." },
    { simbolo: "÷", nome: "Divisão", descricao: "Reparte um valor em partes iguais, de acordo com o divisor informado." },
    { simbolo: "%", nome: "Porcentagem", descricao: "Representa uma fração de cem; equivale a dividir o valor por 100." },
    { simbolo: "=", nome: "Igualdade", descricao: "Indica que o resultado do cálculo será exibido." },
    { simbolo: "( )", nome: "Parênteses", descricao: "Define a ordem de resolução: o que está dentro deles é calculado primeiro." },
    { simbolo: "√", nome: "Raiz quadrada", descricao: "Encontra o número que, multiplicado por si mesmo, resulta no valor informado." },
    { simbolo: "x²", nome: "Potência ao quadrado", descricao: "Multiplica o valor por ele mesmo uma vez." },
    { simbolo: "xʸ", nome: "Potenciação", descricao: "Multiplica o valor por ele mesmo tantas vezes quanto o expoente indicar." },
    { simbolo: "π", nome: "Pi", descricao: "Constante matemática (aproximadamente 3,14159), muito usada em cálculos com círculos." },
    { simbolo: "e", nome: "Número de Euler", descricao: "Constante matemática (aproximadamente 2,71828), usada em crescimento exponencial." },
    { simbolo: "n!", nome: "Fatorial", descricao: "Multiplica um número inteiro por todos os inteiros positivos menores que ele." },
    { simbolo: "1/x", nome: "Inverso", descricao: "Divide 1 pelo valor atual, retornando o seu inverso multiplicativo." },
    { simbolo: "sen · cos · tan", nome: "Funções trigonométricas", descricao: "Relacionam um ângulo, em graus, aos lados de um triângulo retângulo." },
    { simbolo: "log", nome: "Logaritmo (base 10)", descricao: "Indica a que potência 10 deve ser elevado para resultar no valor informado." },
    { simbolo: "ln", nome: "Logaritmo natural", descricao: "Indica a que potência o número de Euler deve ser elevado para resultar no valor informado." },
];

const estadoDaAplicacao = {
    expressaoAtual: "",
    modoAvancado: false,
    historico: [],
};

/* =========================================================
   FORMATAÇÃO DE NÚMEROS E EXPRESSÕES
   ========================================================= */

function formatarNumeroParaExibicao(valor) {
    if (!Number.isFinite(valor)) {
        return "Erro";
    }

    const valorArredondado = Number(valor.toPrecision(10));
    const valorAbsoluto = Math.abs(valorArredondado);

    if (valorAbsoluto !== 0 && (valorAbsoluto >= 1e12 || valorAbsoluto < 1e-9)) {
        return valorArredondado.toExponential(4).replace(".", ",");
    }

    return valorArredondado.toLocaleString("pt-BR", { maximumFractionDigits: 8 });
}

function formatarNumeroParaContinuarCalculo(valor) {
    const valorArredondado = Number(valor.toPrecision(12));

    if (Number.isInteger(valorArredondado)) {
        return String(valorArredondado);
    }

    return valorArredondado
        .toFixed(10)
        .replace(/0+$/, "")
        .replace(/\.$/, "");
}

function formatarExpressaoParaExibicao(expressaoTexto) {
    return expressaoTexto
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ")
        .replace(/\^/g, " ^ ")
        .replace(/\+/g, " + ")
        .replace(/(?<!^)-/g, " − ");
}

/* =========================================================
   REGRAS DE INSERÇÃO NA EXPRESSÃO
   ========================================================= */

function expressaoTerminaEmValor(expressaoTexto) {
    if (!expressaoTexto) {
        return false;
    }
    const ultimoCaractere = expressaoTexto[expressaoTexto.length - 1];
    return /[0-9)!]/.test(ultimoCaractere) || ultimoCaractere === "π" || ultimoCaractere === "e";
}

function textoIniciaValor(textoNovo) {
    const primeiroCaractere = textoNovo[0];
    return /[0-9(]/.test(primeiroCaractere) || /[a-zA-Z√π]/.test(primeiroCaractere);
}

function expressaoTerminaEmValorFechado(expressaoTexto) {
    // Diferente de "expressaoTerminaEmValor", aqui um dígito NÃO conta como
    // "valor fechado": dígitos em sequência devem apenas formar um número
    // maior (ex.: "2" seguido de "0" deve virar "20", não "2*0").
    if (!expressaoTexto) {
        return false;
    }
    const ultimoCaractere = expressaoTexto[expressaoTexto.length - 1];
    return ultimoCaractere === ")" || ultimoCaractere === "!" || ultimoCaractere === "π" || ultimoCaractere === "e";
}

function inserirDigito(digito) {
    let expressaoAtualizada = estadoDaAplicacao.expressaoAtual;

    if (expressaoTerminaEmValorFechado(expressaoAtualizada)) {
        expressaoAtualizada += "*";
    }

    expressaoAtualizada += digito;
    definirExpressaoAtual(expressaoAtualizada);
}

function inserirNaExpressao(textoNovo) {
    let expressaoAtualizada = estadoDaAplicacao.expressaoAtual;

    if (expressaoTerminaEmValor(expressaoAtualizada) && textoIniciaValor(textoNovo)) {
        expressaoAtualizada += "*";
    }

    expressaoAtualizada += textoNovo;
    definirExpressaoAtual(expressaoAtualizada);
}

function inserirPontoDecimal() {
    const segmentoNumericoAtual = estadoDaAplicacao.expressaoAtual.match(/(\d+\.?\d*)$/);

    if (segmentoNumericoAtual && segmentoNumericoAtual[0].includes(".")) {
        return;
    }

    if (!segmentoNumericoAtual) {
        inserirNaExpressao("0.");
        return;
    }

    definirExpressaoAtual(estadoDaAplicacao.expressaoAtual + ".");
}

function inserirOperador(simboloOperador) {
    const expressaoAtual = estadoDaAplicacao.expressaoAtual;

    if (expressaoAtual.length === 0) {
        if (simboloOperador === "-") {
            definirExpressaoAtual("-");
        }
        return;
    }

    const ultimoCaractere = expressaoAtual[expressaoAtual.length - 1];
    const ultimoCaractereEhOperador = /[+\-*/^]/.test(ultimoCaractere);

    if (ultimoCaractereEhOperador) {
        definirExpressaoAtual(expressaoAtual.slice(0, -1) + simboloOperador);
        return;
    }

    definirExpressaoAtual(expressaoAtual + simboloOperador);
}

function inserirFechamentoDeParenteses() {
    const expressaoAtual = estadoDaAplicacao.expressaoAtual;
    const quantidadeDeAbertura = (expressaoAtual.match(/\(/g) || []).length;
    const quantidadeDeFechamento = (expressaoAtual.match(/\)/g) || []).length;

    if (quantidadeDeAbertura <= quantidadeDeFechamento) {
        return;
    }

    if (!expressaoTerminaEmValor(expressaoAtual)) {
        return;
    }

    definirExpressaoAtual(expressaoAtual + ")");
}

function inserirFatorial() {
    const expressaoAtual = estadoDaAplicacao.expressaoAtual;

    if (expressaoAtual.length === 0) {
        return;
    }

    const ultimoCaractere = expressaoAtual[expressaoAtual.length - 1];
    if (!/[0-9)]/.test(ultimoCaractere)) {
        return;
    }

    definirExpressaoAtual(expressaoAtual + "!");
}

function aplicarPorcentagem() {
    const correspondenciaNumero = estadoDaAplicacao.expressaoAtual.match(/(\d+\.?\d*)$/);

    if (!correspondenciaNumero) {
        return;
    }

    const numeroEncontrado = correspondenciaNumero[0];
    const posicaoDeInicio = estadoDaAplicacao.expressaoAtual.length - numeroEncontrado.length;
    const valorConvertido = parseFloat(numeroEncontrado) / 100;

    const novaExpressao =
        estadoDaAplicacao.expressaoAtual.slice(0, posicaoDeInicio) + String(valorConvertido);

    definirExpressaoAtual(novaExpressao);
}

function alternarSinalDoUltimoNumero() {
    const correspondenciaNumero = estadoDaAplicacao.expressaoAtual.match(/(-?\d+\.?\d*)$/);

    if (!correspondenciaNumero) {
        return;
    }

    const numeroEncontrado = correspondenciaNumero[0];
    const posicaoDeInicio = estadoDaAplicacao.expressaoAtual.length - numeroEncontrado.length;
    const numeroComSinalInvertido = numeroEncontrado.startsWith("-")
        ? numeroEncontrado.slice(1)
        : "-" + numeroEncontrado;

    const novaExpressao =
        estadoDaAplicacao.expressaoAtual.slice(0, posicaoDeInicio) + numeroComSinalInvertido;

    definirExpressaoAtual(novaExpressao);
}

function envolverExpressaoComPotenciaDoisPontos() {
    if (estadoDaAplicacao.expressaoAtual.length === 0) {
        return;
    }
    definirExpressaoAtual(`(${estadoDaAplicacao.expressaoAtual})^2`);
}

function envolverExpressaoComInverso() {
    if (estadoDaAplicacao.expressaoAtual.length === 0) {
        return;
    }
    definirExpressaoAtual(`1/(${estadoDaAplicacao.expressaoAtual})`);
}

function apagarUltimoCaractere() {
    definirExpressaoAtual(estadoDaAplicacao.expressaoAtual.slice(0, -1));
}

function limparExpressao() {
    definirExpressaoAtual("");
}

/* =========================================================
   ATUALIZAÇÃO DO VISOR (EXPRESSÃO E PRÉVIA DO RESULTADO)
   ========================================================= */

function definirExpressaoAtual(novaExpressao) {
    estadoDaAplicacao.expressaoAtual = novaExpressao;

    const visorExpressao = document.getElementById("visor-expressao");
    visorExpressao.textContent = formatarExpressaoParaExibicao(novaExpressao);

    atualizarPreviaDoResultado();
}

function atualizarPreviaDoResultado() {
    const visorPrevia = document.getElementById("visor-previa");

    if (estadoDaAplicacao.expressaoAtual.length === 0) {
        visorPrevia.textContent = "0";
        visorPrevia.classList.remove("visor-previa-erro");
        return;
    }

    try {
        const resultado = MotorDeCalculo.avaliarExpressao(estadoDaAplicacao.expressaoAtual);
        visorPrevia.textContent = formatarNumeroParaExibicao(resultado);
        visorPrevia.classList.remove("visor-previa-erro");
    } catch (erro) {
        visorPrevia.textContent = "···";
        visorPrevia.classList.remove("visor-previa-erro");
    }
}

function calcularResultadoFinal() {
    const visorPrevia = document.getElementById("visor-previa");

    try {
        const resultado = MotorDeCalculo.avaliarExpressao(estadoDaAplicacao.expressaoAtual);

        adicionarCalculoAoHistorico(estadoDaAplicacao.expressaoAtual, resultado);
        definirExpressaoAtual(formatarNumeroParaContinuarCalculo(resultado));
    } catch (erro) {
        visorPrevia.textContent = erro.message;
        visorPrevia.classList.add("visor-previa-erro");
    }
}

/* =========================================================
   HISTÓRICO DE CÁLCULOS
   ========================================================= */

function carregarHistoricoDoNavegador() {
    const dadosSalvos = localStorage.getItem(CHAVE_HISTORICO_NO_NAVEGADOR);
    estadoDaAplicacao.historico = dadosSalvos ? JSON.parse(dadosSalvos) : [];
}

function salvarHistoricoNoNavegador() {
    localStorage.setItem(
        CHAVE_HISTORICO_NO_NAVEGADOR,
        JSON.stringify(estadoDaAplicacao.historico)
    );
}

function adicionarCalculoAoHistorico(expressaoOriginal, resultadoNumerico) {
    const novoRegistro = {
        expressaoExibicao: formatarExpressaoParaExibicao(expressaoOriginal),
        resultadoExibicao: formatarNumeroParaExibicao(resultadoNumerico),
        resultadoNumerico: resultadoNumerico,
    };

    estadoDaAplicacao.historico.unshift(novoRegistro);

    if (estadoDaAplicacao.historico.length > LIMITE_DE_ITENS_NO_HISTORICO) {
        estadoDaAplicacao.historico.pop();
    }

    salvarHistoricoNoNavegador();
    renderizarHistorico();
}

function limparHistoricoCompleto() {
    estadoDaAplicacao.historico = [];
    salvarHistoricoNoNavegador();
    renderizarHistorico();
}

function renderizarHistorico() {
    const listaDeHistorico = document.getElementById("lista-historico");
    listaDeHistorico.innerHTML = "";

    if (estadoDaAplicacao.historico.length === 0) {
        const itemVazio = document.createElement("li");
        itemVazio.className = "historico-vazio";
        itemVazio.textContent = "Nenhum cálculo ainda";
        listaDeHistorico.appendChild(itemVazio);
        return;
    }

    estadoDaAplicacao.historico.forEach((registro, indice) => {
        const item = document.createElement("li");
        item.className = "historico-item";
        item.dataset.indice = String(indice);
        item.innerHTML = `
            <span class="historico-expressao">${registro.expressaoExibicao}</span>
            <span class="historico-resultado">= ${registro.resultadoExibicao}</span>
        `;
        listaDeHistorico.appendChild(item);
    });
}

function reutilizarResultadoDoHistorico(indice) {
    const registro = estadoDaAplicacao.historico[indice];
    if (!registro) {
        return;
    }
    definirExpressaoAtual(formatarNumeroParaContinuarCalculo(registro.resultadoNumerico));
}

/* =========================================================
   GLOSSÁRIO EDUCATIVO DE SINAIS
   ========================================================= */

function renderizarGlossarioDeSinais() {
    const listaDeGlossario = document.getElementById("lista-glossario");

    GLOSSARIO_DE_SINAIS.forEach((item) => {
        const elementoItem = document.createElement("li");
        elementoItem.className = "glossario-item";
        elementoItem.innerHTML = `
            <span class="glossario-simbolo">${item.simbolo}</span>
            <span class="glossario-texto">
                <strong>${item.nome}</strong>
                <span>${item.descricao}</span>
            </span>
        `;
        listaDeGlossario.appendChild(elementoItem);
    });
}

/* =========================================================
   SELETOR DE CORES DO TEMA
   ========================================================= */

function aplicarTemaDeCor(nomeDoTema) {
    const temaEscolhido = TEMAS_DE_COR[nomeDoTema] || TEMAS_DE_COR[TEMA_PADRAO];
    const nomeValido = TEMAS_DE_COR[nomeDoTema] ? nomeDoTema : TEMA_PADRAO;
    const propriedadesDoDocumento = document.documentElement.style;

    propriedadesDoDocumento.setProperty("--cor-tema-inicio", temaEscolhido.corInicio);
    propriedadesDoDocumento.setProperty("--cor-tema-fim", temaEscolhido.corFim);
    propriedadesDoDocumento.setProperty("--cor-texto-sobre-tema", temaEscolhido.corTextoSobreTema);
    propriedadesDoDocumento.setProperty("--cor-borda-cartao", temaEscolhido.corBorda);
    propriedadesDoDocumento.setProperty("--cor-borda-cartao-forte", temaEscolhido.corBordaForte);
    propriedadesDoDocumento.setProperty("--brilho-tema", temaEscolhido.brilho);
    propriedadesDoDocumento.setProperty("--brilho-tema-forte", temaEscolhido.brilhoForte);
    propriedadesDoDocumento.setProperty("--cor-tema-fundo-suave", temaEscolhido.fundoSuave);
    propriedadesDoDocumento.setProperty("--cor-tema-fundo-suave-forte", temaEscolhido.fundoSuaveForte);

    document.querySelectorAll(".tema-opcao").forEach((botao) => {
        botao.classList.toggle("tema-ativo", botao.dataset.tema === nomeValido);
    });

    localStorage.setItem(CHAVE_TEMA_NO_NAVEGADOR, nomeValido);
}

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem(CHAVE_TEMA_NO_NAVEGADOR);
    aplicarTemaDeCor(temaSalvo || TEMA_PADRAO);
}

function configurarSeletorDeTema() {
    document.querySelectorAll(".tema-opcao").forEach((botao) => {
        botao.addEventListener("click", () => {
            aplicarTemaDeCor(botao.dataset.tema);
        });
    });
}

/* =========================================================
   ALTERNÂNCIA ENTRE MODO BÁSICO E AVANÇADO
   ========================================================= */

function alternarModoDaCalculadora(modoSelecionado) {
    estadoDaAplicacao.modoAvancado = modoSelecionado === "avancado";

    document
        .getElementById("grade-botoes-avancado")
        .classList.toggle("grade-visivel", estadoDaAplicacao.modoAvancado);

    document.querySelectorAll(".alternador-opcao").forEach((botao) => {
        botao.classList.toggle("alternador-ativo", botao.dataset.modo === modoSelecionado);
    });
}

/* =========================================================
   MANIPULAÇÃO CENTRAL DE CLIQUES NOS BOTÕES
   ========================================================= */

function processarAcaoDoBotao(acao, valor) {
    switch (acao) {
        case "numero":
            inserirDigito(valor);
            break;
        case "ponto":
            inserirPontoDecimal();
            break;
        case "operador":
            inserirOperador(valor);
            break;
        case "abrirParenteses":
            inserirNaExpressao("(");
            break;
        case "fecharParenteses":
            inserirFechamentoDeParenteses();
            break;
        case "funcao":
        case "constante":
            inserirNaExpressao(valor);
            break;
        case "quadrado":
            envolverExpressaoComPotenciaDoisPontos();
            break;
        case "inverso":
            envolverExpressaoComInverso();
            break;
        case "fatorial":
            inserirFatorial();
            break;
        case "porcentagem":
            aplicarPorcentagem();
            break;
        case "trocarSinal":
            alternarSinalDoUltimoNumero();
            break;
        case "apagar":
            apagarUltimoCaractere();
            break;
        case "limpar":
            limparExpressao();
            break;
        case "igual":
            calcularResultadoFinal();
            break;
        default:
            break;
    }
}

function configurarBotoesDaCalculadora() {
    const containerDeBotoes = document.querySelector(".layout-principal");

    containerDeBotoes.addEventListener("click", (evento) => {
        const botaoClicado = evento.target.closest("[data-acao]");
        if (!botaoClicado) {
            return;
        }

        processarAcaoDoBotao(botaoClicado.dataset.acao, botaoClicado.dataset.valor);
    });
}

function configurarAlternadorDeModo() {
    document.querySelectorAll(".alternador-opcao").forEach((botao) => {
        botao.addEventListener("click", () => {
            alternarModoDaCalculadora(botao.dataset.modo);
        });
    });
}

function configurarBotaoDeLimparHistorico() {
    document
        .getElementById("botao-limpar-historico")
        .addEventListener("click", limparHistoricoCompleto);
}

function configurarCliqueNoHistorico() {
    document.getElementById("lista-historico").addEventListener("click", (evento) => {
        const itemClicado = evento.target.closest(".historico-item");
        if (!itemClicado) {
            return;
        }
        reutilizarResultadoDoHistorico(Number(itemClicado.dataset.indice));
    });
}

/* =========================================================
   ATALHOS DE TECLADO
   ========================================================= */

function configurarAtalhosDeTeclado() {
    const teclasDeOperador = { "+": "+", "-": "-", "*": "*", "/": "/", "^": "^" };

    document.addEventListener("keydown", (evento) => {
        if (/[0-9]/.test(evento.key)) {
            inserirDigito(evento.key);
            return;
        }

        if (evento.key === ".") {
            inserirPontoDecimal();
            return;
        }

        if (teclasDeOperador[evento.key]) {
            inserirOperador(teclasDeOperador[evento.key]);
            return;
        }

        if (evento.key === "(") {
            inserirNaExpressao("(");
            return;
        }

        if (evento.key === ")") {
            inserirFechamentoDeParenteses();
            return;
        }

        if (evento.key === "Enter" || evento.key === "=") {
            evento.preventDefault();
            calcularResultadoFinal();
            return;
        }

        if (evento.key === "Backspace") {
            apagarUltimoCaractere();
            return;
        }

        if (evento.key === "Escape") {
            limparExpressao();
        }
    });
}

/* =========================================================
   INICIALIZAÇÃO GERAL DA APLICAÇÃO
   ========================================================= */

function inicializarAplicacao() {
    carregarTemaSalvo();
    carregarHistoricoDoNavegador();
    renderizarHistorico();
    renderizarGlossarioDeSinais();

    definirExpressaoAtual("");

    configurarSeletorDeTema();
    configurarBotoesDaCalculadora();
    configurarAlternadorDeModo();
    configurarBotaoDeLimparHistorico();
    configurarCliqueNoHistorico();
    configurarAtalhosDeTeclado();
}

document.addEventListener("DOMContentLoaded", inicializarAplicacao);
