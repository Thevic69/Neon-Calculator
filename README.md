# Calculadora Neon

Calculadora web com interface inspirada em painéis automotivos futuristas, desenvolvida com HTML, CSS e JavaScript puro, sem frameworks ou bibliotecas externas. Além de calcular, o projeto ensina o significado de cada sinal matemático, oferece um modo avançado com funções científicas, prévia de resultado em tempo real, seletor de cores de tema e histórico persistente de cálculos.

## Funcionalidades

- **Modo básico**: as quatro operações, porcentagem, troca de sinal e ponto decimal.
- **Modo avançado**: funções científicas — potência, raiz quadrada, fatorial, inverso, seno, cosseno, tangente, logaritmo (base 10 e natural), potências de 10 e de *e*, além das constantes π e *e*.
- **Seletor de cores do tema**: quatro opções de cor (Verde, Vermelho, Preto e Azul), exibidas acima do alternador de modo Básico/Avançado, que alteram instantaneamente os destaques visuais da interface. A escolha é salva no navegador e mantida em futuras visitas.
- **Prévia do resultado em tempo real**: enquanto a expressão é digitada, o resultado é calculado e exibido continuamente, antes mesmo de confirmar com "=".
- **Glossário de sinais**: painel explicando, em linguagem simples, o que cada símbolo matemático significa e para que serve.
- **Histórico de cálculos**: mantém os cálculos anteriores, salvos no navegador, com a opção de reutilizar um resultado anterior com um clique ou limpar todo o histórico.
- **Atalhos de teclado**: números, operadores, ponto, parênteses, `Enter` (igual), `Backspace` (apagar) e `Esc` (limpar).

## Design da interface

A interface segue uma estética automotiva futurista, com:

- fundo em gradiente azul-marinho e roxo escuro, com brilhos ambientes suaves ao fundo;
- cartões modulares com cantos arredondados e efeito de vidro fosco (*glassmorphism*);
- tipografia minimalista, combinando a fonte `Orbitron` (títulos, com apelo tecnológico) e `Inter` (textos, para boa legibilidade);
- detalhes em gradiente lilás/rosa neon nos botões de operação, no botão de igual e nos destaques visuais;
- ícones lineares e minimalistas (em SVG) para as ações de apagar histórico e para o ícone da marca.

## Como o seletor de cores funciona

A cor do tema é controlada inteiramente por variáveis CSS (`--cor-tema-inicio`, `--cor-tema-fim`, entre outras), definidas em `css/estilo.css`. Ao clicar em uma das quatro opções de cor, o arquivo `js/interface.js` atualiza essas variáveis diretamente no elemento raiz da página através de `document.documentElement.style.setProperty(...)`.

Como todos os elementos coloridos da interface (gradientes, brilhos, bordas dos cartões, ícones) são construídos a partir dessas variáveis, a troca de tema é refletida instantaneamente em toda a aplicação, sem a necessidade de recarregar a página. A cor escolhida é salva no `localStorage` do navegador e restaurada automaticamente em visitas futuras.

As definições de cada tema (Verde, Vermelho, Preto e Azul) ficam centralizadas no objeto `TEMAS_DE_COR`, em `js/interface.js`, o que facilita ajustar tons existentes ou adicionar novas opções de cor no futuro.

## Como o motor de cálculo funciona

Diferente de calculadoras simples que utilizam `eval()` para resolver expressões — o que é considerado uma prática insegura — este projeto implementa um motor de cálculo próprio, em três etapas clássicas de interpretação de linguagens:

1. **Tokenização**: transforma o texto digitado em uma sequência de símbolos reconhecíveis (números, operadores, funções, constantes, parênteses).
2. **Conversão para notação pós-fixa**: reorganiza esses símbolos utilizando o algoritmo *Shunting Yard*, respeitando a precedência e a associatividade de cada operador (por exemplo, `2^3^2` é resolvido corretamente como `2^(3^2)`).
3. **Avaliação**: percorre a notação pós-fixa calculando o resultado final, com tratamento de erros como divisão por zero, raiz de número negativo ou logaritmo de valor não positivo.

Esse motor está isolado no arquivo `js/motor-calculo.js`, sem nenhuma dependência da interface, o que facilita testá-lo e reutilizá-lo de forma independente.

## Observação sobre armazenamento

O histórico de cálculos é salvo no `localStorage` do navegador, o que significa que ele permanece disponível apenas no dispositivo e navegador utilizados, sem envio de dados a nenhum servidor.

## Estrutura do projeto

```
.
├── index.html              # Estrutura HTML da aplicação
├── css/
│   └── estilo.css          # Estilização visual (layout, cores, responsividade)
├── js/
│   ├── motor-calculo.js    # Motor de cálculo: tokenização, conversão e avaliação de expressões
│   └── interface.js        # Lógica de interface: estado, eventos, histórico e glossário
└── README.md                # Documentação do projeto
```

## Organização do código

O projeto separa claramente duas responsabilidades:

- **`motor-calculo.js`**: puramente matemático, não manipula nenhum elemento da página. Expõe apenas a função `avaliarExpressao`, através do objeto global `MotorDeCalculo`.
- **`interface.js`**: cuida de tudo que é visual e interativo — captura cliques e teclas, atualiza o visor, mantém o histórico e o glossário — delegando toda a matemática ao motor de cálculo.

Essa separação torna o código mais fácil de ler, testar e manter, já que cada arquivo tem uma única responsabilidade clara.

## Como executar

Nenhuma instalação é necessária. Basta abrir o arquivo `index.html` diretamente no navegador:

```bash
# Após extrair o projeto (ou clonar o repositório)
cd calculadora-elegante
```

Em seguida, abra `index.html` com um duplo clique, ou utilize uma extensão como o **Live Server** (VS Code) para uma experiência de desenvolvimento com recarregamento automático.

> A fonte `Orbitron` é carregada do Google Fonts e requer conexão com a internet. Caso o dispositivo esteja offline, a interface funciona normalmente, utilizando a fonte alternativa definida no CSS.

## Personalização

- **Cores e visual**: ajustáveis nas variáveis definidas em `:root`, no início do arquivo `css/estilo.css`.
- **Cores do tema (Verde, Vermelho, Preto, Azul)**: editáveis no objeto `TEMAS_DE_COR`, em `js/interface.js`. Também é possível adicionar novas cores nesse mesmo objeto e um novo botão correspondente em `index.html`.
- **Quantidade de itens no histórico**: controlada pela constante `LIMITE_DE_ITENS_NO_HISTORICO`, em `js/interface.js`.
- **Textos do glossário**: editáveis na lista `GLOSSARIO_DE_SINAIS`, também em `js/interface.js`.

## Licença

Este projeto está licenciado sob os termos da licença MIT.
