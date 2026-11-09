// Sorteia um numero de 1 ate o numero de faces do dado
function rolarDado(faces) {
    return Math.floor(Math.random() * faces) + 1;
}

// Últimas rolagens, da mais nova para a mais antiga
const historicoRolagens = [];

// Acrescenta uma linha no topo do histórico (guarda só as 8 últimas)
function adicionarAoHistorico(texto) {
    historicoRolagens.unshift(texto);
    if (historicoRolagens.length > 8) historicoRolagens.pop();

    const lista = document.getElementById("historico");
    lista.innerHTML = "";

    historicoRolagens.forEach((linha) => {
        const item = document.createElement("li");
        item.textContent = linha;
        lista.appendChild(item);
    });
}

// Mostra o resultado grande, o detalhe e registra no histórico
function mostrarResultado(total, detalhe) {
    document.getElementById("resultado").textContent = total;
    document.getElementById("detalhe").textContent = detalhe;
    adicionarAoHistorico(`${detalhe} = ${total}`);
}

// Rola vários grupos de dados, como 1d10 + 2d12
function rolarVarios(grupos, bonus, rotulo) {
    let total = 0;
    const partes = [];

    grupos.forEach(({ faces, quantidade }) => {
        const resultados = [];
    for (let i = 0; i < quantidade; i++) {
        resultados.push(rolarDado(faces));
    }

    // Ordena do maior para o menor
    resultados.sort((a, b) => b - a);

    total += resultados.reduce((soma, n) => soma + n, 0);

     // Com muitos dados, a lista inteira fica longa demais: mostra só o total
    const lista = quantidade > 10 ? "" : ` [${resultados.join(", ")}]`;
    partes.push(`${quantidade}d${faces}${lista}`);
});

    const textoBonus = bonus !== 0 ? " " + formatarBonus(bonus) : "";
    const prefixo = rotulo ? rotulo + ": " : "";

    mostrarResultado(total + bonus, prefixo + partes.join(" + ") + textoBonus);
}

// Rola um tipo de dado só (Modo rápido, atributos e perícias)
function rolar(faces, quantidade, bonus, rotulo) {
    rolarVarios([{ faces, quantidade }], bonus, rotulo);
}

// Lê a quantidade de dados do campo (entre 1 e 100)
function lerQuantidade() {
    const quantidade = Math.floor(Number(document.getElementById("qtd-dados").value));
    return Math.min(100, Math.max(1, quantidade || 1));
}

// Lê o bônus do campo (vazio vale 0)
function lerBonus() {
    return Number(document.getElementById("bonus-dado").value) || 0;
}

// Liga cada botão de dado a rolagem e mostra o resultado na tela
const botoes = document.querySelectorAll("#dados button[data-faces]");

botoes.forEach((botao) => {
    botao.addEventListener("click", () => {
        const faces = Number(botao.dataset.faces);
        rolar(faces, lerQuantidade(), lerBonus(), "");
    });
});

// Lista dos atributos e o valor inicial de cada um
const ATRIBUTOS = ["Força", "Destreza", "Constituição", "Inteligência", "Sabedoria", "Carisma"]
const valores = {};
const modificadores = {};
ATRIBUTOS.forEach((nome) => {
    valores[nome] = 1;
    modificadores[nome] = 0;
});

// Coloca o sinal na frente do numero: 2 vira "+2", -1 continua "-1"
function formatarBonus(numero) {
    return numero >= 0 ? "+" + numero : String(numero);
}

// Cria os cards dos atributos na tela
function desenharAtributos() {
    const lista = document.getElementById("lista-atributos");
    lista.innerHTML = ""; // Limpa antes de desenhar novamente

ATRIBUTOS.forEach((nome) => {
    const card = document.createElement("div");
    card.className = "atributo";
    card.innerHTML = `
        <div>${nome}</div>
        <span class="a-valor" title="Dois cliques para editar">${valores[nome]}</span>
        <div class="a-mod">Mod:
            <span class="a-mod-valor" title="Dois cliques para editar">${formatarBonus(modificadores[nome])}</span>
        </div>
        <button>Rolar D20</button>
    `;

    // Dois cliques no valor do atributo: edita
    tornarEditavel(card.querySelector(".a-valor"), "number", () => valores[nome], (valor) => {
        valores[nome] = Number(valor) || 0;
    }, desenharAtributos);

    // Dois cliques no modificador: edita
    tornarEditavel(card.querySelector(".a-mod-valor"), "number", () => modificadores[nome], (valor) => {
        modificadores[nome] = Number(valor) || 0;
    }, desenharAtributos);

    // Rola um d20 somando o modificador e mostra o resultado
    card.querySelector("button").addEventListener("click", () => {
        rolar(20, 1, modificadores[nome], nome);
    });
        lista.appendChild(card);
    });
}

desenharAtributos();

// Dados atuais de vida e mana do personagem
const recursos = {
    vidaAtual: 20,
    vidaMax: 20,
    manaAtual: 10,
    manaMax: 10,
};

// Converte atual/máximo em porcentagem, entre 0 e 100
function porcentagem(atual, max) {
    if (max <= 0) return 0;
    return Math.min(100, Math.max(0, (atual / max) * 100));
}

// Atualizar uma barra: largura e cor (normal ou baixa)
function atualizarBarra(idBarra, atual, max, corNormal, corBaixa) {
    const barra = document.getElementById(idBarra);
    const pct = porcentagem(atual, max);

    barra.style.width = pct + "%";

        if (pct <= 25) {
        // barra baixa
        barra.style.background = corBaixa;
    }   else {
        // barra normal
        barra.style.background = corNormal;
    }
}

// Atualiza as barras e os campos de acordo com os dados
function atualizarBarras() {
    atualizarBarra("barra-vida", recursos.vidaAtual, recursos.vidaMax, "#e74c3c", "#7b0000");
    atualizarBarra("barra-mana", recursos.manaAtual, recursos.manaMax, "#3498db", "#1f5f99");

    document.getElementById("Vida-atual").value = recursos.vidaAtual;
    document.getElementById("Vida-max").value = recursos.vidaMax;
    document.getElementById("Mana-atual").value = recursos.manaAtual;
    document.getElementById("Mana-max").value = recursos.manaMax;
}

// Liga cada campo editável ao dado correspondente em "recursos"
const campos = {
    "Vida-atual": "vidaAtual",
    "Vida-max": "vidaMax",
    "Mana-atual": "manaAtual",
    "Mana-max": "manaMax",
};

// Garante que a vida e mana nunca passem do maximo
function limitarAoMaximo() {
    recursos.vidaAtual = Math.min(recursos.vidaAtual, recursos.vidaMax);
    recursos.manaAtual = Math.min(recursos.manaAtual, recursos.manaMax);
}

Object.keys(campos).forEach((id) => {
    document.getElementById(id).addEventListener("change", (evento) => {
        const valor = Number(evento.target.value) || 0;

        // O maximo precisa ser pelo menos 1; o valor atual pode ser negativo
        recursos[campos[id]] = id.includes("max") ? Math.max(1, valor) : valor;

        limitarAoMaximo();
        atualizarBarras();
        salvarFicha();
    });
});

// Aplica perda ou recuperação na vida/mana
function aplicarValor(tipo) { 
    const quantidade = Math.abs(Number(document.getElementById("quantidade").value));
    if (!quantidade) return;

    const alvo = document.getElementById("alvo").value;
    const atual = alvo + "Atual";
    const max = alvo + "Max";

    // Guarda o valor de antes para comparar depois
    const valorAntes = recursos[atual];

    if (tipo === "perder") {
        recursos[atual] = recursos[atual] - quantidade;
    } else {
        recursos[atual] = Math.min(recursos[max], recursos[atual] + quantidade);
    }

    // Efeito para a vida, e apenas se o valor realmente mudar
    if (alvo === "vida" && recursos[atual] !== valorAntes) {
        if (tipo === "perder") {
            efeitoDano();
        } else {
            efeitoCura();
        }
    }

    document.getElementById("quantidade").value = "";
    atualizarBarras();
}

document.getElementById("btn-dano").addEventListener("click", () => aplicarValor("perder"));
document.getElementById("btn-cura").addEventListener("click", () => aplicarValor("recuperar"));

atualizarBarras();

// Elementos usados pelos efeitos
const fotoWrapper = document.getElementById("foto-wrapper");
const fotoImg = document.getElementById("foto");
const areaEfeitos = document.getElementById("efeitos");

// Imagem padrão quando não há foto escolhida
const FOTO_PADRAO = "imagens/padrao.jpg";
fotoImg.src = FOTO_PADRAO;

// Quando o usuário seleciona uma imagem, mostra ela na foto
document.getElementById("input-foto").addEventListener("change", (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
        fotoImg.src = leitor.result;
        fotoPersonalizada = leitor.result;
        salvarFicha();
    };
    leitor.readAsDataURL(arquivo);
});

// Dano: Liga a classe "dano" por um instante (vermelho e tremor)
function efeitoDano() {
    tocarSom(somDano);
    fotoWrapper.classList.remove("dano", "cura");
    void fotoWrapper.offsetWidth; // Força o navegador a reiniciar a animação
    fotoWrapper.classList.add("dano");
    setTimeout(() => fotoWrapper.classList.remove("dano"), 800);
}

// Cura: liga a classe "cura" e cria símbolos de saúde que sobem
function efeitoCura() {
    tocarSom(somCura);
    fotoWrapper.classList.remove("dano", "cura");
    void fotoWrapper.offsetWidth;
    fotoWrapper.classList.add("cura");
    setTimeout(() => fotoWrapper.classList.remove("cura"), 1200);

    const simbolos = ["💚", "➕"];
    const quantidade = 5;
    const espaco = 85 / quantidade;

    for (let i = 0; i < quantidade; i++) {
        const span = document.createElement("span");
        span.className = "simbolo";
        span.textContent = simbolos[Math.floor(Math.random() * simbolos.length)];
        span.style.left = i * espaco + Math.random() * (espaco / 4) + "%";
        span.style.bottom = 15 + (i % 2) * 20 + "%";
        span.style.animationDelay = Math.random() * 0.15 + "s";
        areaEfeitos.appendChild(span);
        setTimeout(() => span.remove(), 2500); // Apaga os simbolos depois de sumirem
    }
}

// Dado personalizado: rola com o numero de lados digitado
document.getElementById("btn-custom").addEventListener("click", () => {
    const faces = Math.floor(Number(document.getElementById("faces-custom").value));

    // Ignora campo vazio ou menos de 2 lados
    if (!faces || faces < 2) return;

    rolar(faces, lerQuantidade(), lerBonus(), "");
});

// Lista de perícias: cada uma é um objeto com nome e bonus
const pericias = [];

// Ao dar dois cliques no texto, troca por um campo editável
function tornarEditavel(elemento, tipo, obterValor, salvar, redesenhar) {
    elemento.addEventListener("dblclick", () => {
        const campo = document.createElement("input");
        campo.type = tipo;
        campo.className = elemento.className;
        campo.value = obterValor();

        elemento.replaceWith(campo);
        campo.focus();
        campo.select();

        // Evitar salvar duas vezes (Enter e sair do campo disparam juntos)
        let finalizado = false;
        function terminar(confirmar) {
            if (finalizado) return;
            finalizado = true;
            if (confirmar) salvar(campo.value);
            salvarFicha();
            redesenhar();
        }

        campo.addEventListener("blur", () => terminar(true));
        campo.addEventListener("keydown", (evento) => {
            if (evento.key === "Enter") terminar(true);
            if (evento.key === "Escape") terminar(false);
        });
    });
}

// Cria na tela uma linha para cada perícia da lista
function desenharPericias() {
    const lista = document.getElementById("lista-pericias");
    lista.innerHTML = "";

    pericias.forEach((pericia, indice) => {
        const item = document.createElement("li");
        item.className = "pericia";
        item.innerHTML = `
            <span class="p-nome" title="Dois clique para editar"></span>
            <span class="p-bonus" title="Dois cliques para editar">${formatarBonus(pericia.bonus)}</span>
            <button class="rolar">Rolar D20</button>
            <button class="remover">X</button>
        `;

        // O nome entra como texto puro, para não ser lido como HTML
        const textoNome = item.querySelector(".p-nome");
        textoNome.textContent = pericia.nome;

        // Dois cliques no nome: edita (Não aceita nome vazio)
        tornarEditavel(textoNome, "text", () => pericia.nome, (valor) => {
            const novoNome = valor.trim();
            if (novoNome !== "") pericia.nome = novoNome;
        }, desenharPericias);

        // Dois cliques no bônus: edita
        tornarEditavel(item.querySelector(".p-bonus"), "number", () => pericia.bonus, (valor) => {
            pericia.bonus = Number(valor) || 0;
        }, desenharPericias);

        // Rola um D20 somando o bonus da perícia
        item.querySelector(".rolar").addEventListener("click", () => {
            rolar(20, 1, pericia.bonus, pericia.nome);
        });

        // Remove a perícia da lista e redesenha
        item.querySelector(".remover").addEventListener("click", () => {
            pericias.splice(indice, 1);
            salvarFicha();
            desenharPericias();
        });

        tornarEditavel(textoNome, "text", () => pericia.nome, (valor) => {
            const novoNome = valor.trim();
            if (novoNome !== "") pericia.nome = novoNome;
        }, desenharPericias);

        tornarEditavel(item.querySelector(".p-bonus"), "number", () => pericia.bonus, (valor) => {
            pericia.bonus = Number(valor) || 0;
        }, desenharPericias);

        lista.appendChild(item);
    });
}

// Adiciona uma perícia nova com o nome e o bônus digitados
function adicionarPericia() {
    const nome = document.getElementById("pericia-nome").value.trim();
    const bonus = Number(document.getElementById("pericia-bonus").value) || 0;

    if (nome === "") return;

    pericias.push({ nome, bonus });
    salvarFicha();

    document.getElementById("pericia-nome").value = "";
    document.getElementById("pericia-bonus").value = 0;
    document.getElementById("pericia-nome").focus(); // cursor volta ao nome
    desenharPericias();
};

// Botão adicionar
document.getElementById("btn-add-pericia").addEventListener("click", adicionarPericia);

// Enter em qualquer um dos dois campos também adiciona
["pericia-nome", "pericia-bonus"].forEach((id) => {
    document.getElementById(id).addEventListener("keydown", (evento) => {
        if (evento.key === "Enter") adicionarPericia();
    });
});

// Foto escolhida pelo usuário (vazia = usa a imagem padrão)
let fotoPersonalizada = "";

// Nome do personagem (editável com dois cliques)
let nomePersonagem = "";

function desenharNome() {
    const area = document.getElementById("area-nome");
    area.innerHTML = "";

    const texto = document.createElement("span");
    texto.className = "nome-personagem";
    texto.title = "Dois cliques para editar";
    texto.textContent = nomePersonagem || "Nome do personagem";
    area.appendChild(texto);

    tornarEditavel(texto, "text", () => nomePersonagem, (valor) => {
        nomePersonagem = valor.trim();
    },  desenharNome);
}

// Reúne todos os dados da ficha em um objeto só
function montarFicha() {
    return {
        nome: nomePersonagem,
        valores,
        modificadores,
        pericias,
        recursos,
        foto: fotoPersonalizada,
    };
}

// Coloca os dados de uma ficha de volta nas variáveis e na tela
function aplicarFicha(ficha) {
    nomePersonagem = ficha.nome || "";

    Object.assign(valores, ficha.valores);
    Object.assign(modificadores, ficha.modificadores);
    Object.assign(recursos, ficha.recursos);

    pericias.lenght = 0;
    (ficha.pericias || []).forEach((p) => pericias.push(p));

    fotoPersonalizada = ficha.foto || "";
    fotoImg.src = fotoPersonalizada || FOTO_PADRAO;

    desenharAtributos();
    desenharPericias();
    atualizarBarras();
    desenharNome();
}

// Guarda a ficha no navegador
function salvarFicha() {
    try {
        localStorage.setItem("fichaRPG", JSON.stringify(montarFicha()));
    }   catch (erro) {
        alert("Não foi possível salvar. A foto pode ser grande demais.")
    }
}

// Lê a ficha guardada no navegador
function carregarFicha() {
    const texto = localStorage.getItem("fichaRPG");
    if (!texto) return;
    aplicarFicha(JSON.parse(texto));
}

// Apaga a ficha salva e recarrega a página com os valores iniciais
document.getElementById("btn-limpar").addEventListener("click", () => {
    if (!confirm("Apagar toda a ficha? Isso não pode desfeito.")) return;

    localStorage.removeItem("fichaRPG");
    location.reload();
});

// Baixa a ficha como .json, com o nome do personagem
document.getElementById("btn-exportar").addEventListener("click", () => {
    const ficha = montarFicha();
    const texto = JSON.stringify(ficha, null, 2);

    // Cria um arquivo na memória e um link temporário para ele
    const arquivo = new Blob([texto], { type: "application/json" });
    const url = URL.createObjectURL(arquivo);

    // Nome do arquivo sem caracteres que o Windows não aceita
    const nomeLimpo = ficha.nome.replace(/[\\/:*?"<>|]/g, "").trim();

    const link = document.createElement("a");
    link.href = url;
    const data = new Date().toLocaleDateString("pt-BR").replaceAll("/", "-"); // Formato dia/mês/ano
    link.download = (nomeLimpo || "personagem") + "-" + data + ".json";
    link.click();

    URL.revokeObjectURL(url);
});

// Lê um arquivo .json e substitui a ficha atual por ele
document.getElementById("input-importar").addEventListener("change", (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();
    leitor.onload = () => {
        try {
            const ficha = JSON.parse(leitor.result);

            // Confere se o arquivo tem o formato esperado
            if (!ficha.valores || !ficha.recursos) throw new Error("Formato não suportado");

            if (!confirm("Importar irá substituir a ficha atual. Continuar?")) return;

            aplicarFicha(ficha);
            salvarFicha();
        }   catch (erro) {
            alert("Arquivo inválido. Escolha um JSON que foi exportado por essa ficha.");
        }
    };
    leitor.readAsText(arquivo);

    evento.target.value = ""; // Permite importar o mesmo arquivo novamente
});

// Ao abrir a página: carrega os dados e redesenha a tela
carregarFicha();
desenharAtributos();
desenharPericias();
atualizarBarras();
desenharNome();

// Efeitos sonoros de dano e cura
const VOLUME_DANO = 0.2;
const VOLUME_CURA = 0.2;

const somDano = new Audio("audio/dano.mp3");
const somCura = new Audio("audio/cura.mp3");
somDano.volume = VOLUME_DANO;
somCura.volume = VOLUME_CURA;

const caixaMutar = document.getElementById("mutar-efeitos");
let efeitosMutados = false;

// Toca um efeito desde o início
function tocarSom(som) {
    if (efeitosMutados) return;
    som.currentTime = 0;
    som.play().catch(() => {});
}

// Marcar ou desmarcar a caixinha liga e desliga os efeitos
caixaMutar.addEventListener("change", (evento) => {
    efeitosMutados = evento.target.checked;
    salvarAudio();
});

// Música de fundo 
const musicas = {
    groovy: new Audio("audio/groovy.mp3"),
    ambience: new Audio("audio/ambience.mp3"),
};

// As músicas repetem sem parar
Object.values(musicas).forEach((m) => {
    m.loop = true
});

const seletorMusica = document.getElementById("musica");
const botaoMusica = document.getElementById("btn-musica");
const controleVolume = document.getElementById("volume");

let musicaAtual = ""; // "", "groovy" ou "ambience"
let volumeMusica = 0.5;

// Guarda a escolha e o volume (separado da ficha do personagem)
function salvarAudio() {
    localStorage.setItem(
        "audioRPG",
        JSON.stringify({ 
            musica: musicaAtual, 
            volume: volumeMusica,
            efeitosMutados: efeitosMutados,
        })
    );
}

// Mostra "tocar" ou "pausar" conforme o estado
function atualizarBotaoMusica() {
    const tocando = musicaAtual !== "" && !musicas[musicaAtual].paused;
    botaoMusica.textContent = tocando ? "Pausar" : "Tocar";
}

function tocarMusica() {
    const musica = musicas[musicaAtual];
    musica.volume = volumeMusica;
    musica.play().catch(() => {});
}

function pararMusicas() {
    Object.values(musicas).forEach((m) => m.pause());
}

// Trocar de música: para a anterior e toca a escolhida
seletorMusica.addEventListener("change", (evento) => {
    pararMusicas();
    musicaAtual = evento.target.value;
    if (musicaAtual !== "") tocarMusica();
    atualizarBotaoMusica();
    salvarAudio();
});

// Botão tocar/pausar
botaoMusica.addEventListener("click", () => {
    if (musicaAtual === "") return;

    if (musicas[musicaAtual].paused) {
        tocarMusica();
    }   else {
        musicas[musicaAtual].pause();
    }
    atualizarBotaoMusica();
});

// Deslizante de volume: vai de 0 a 100, e o áudio usa 0 a 1
controleVolume.addEventListener("input", (evento) => {
    volumeMusica = Number(evento.target.value) / 100;
    Object.values(musicas).forEach((m) => {
        m.volume = volumeMusica;
    });
    salvarAudio();
});

// Ao abrir a página: recupera a escolha anterior (sem tocar sozinha)
function carregarAudio() {
    const texto = localStorage.getItem("audioRPG");
    if (!texto) return;

    const config = JSON.parse(texto);
    musicaAtual = musicas[config.musica] ? config.musica : "";
    volumeMusica =typeof config.volume === "number" ? config.volume : 0.5
    efeitosMutados = config.efeitosMutados === true

    seletorMusica.value = musicaAtual;
    controleVolume.value = volumeMusica * 100;
    caixaMutar.checked = efeitosMutados;
}

carregarAudio();
atualizarBotaoMusica();

// Modo combinado: bandeja de dados
const DADOS_PADRAO = [4, 6, 8, 10, 12, 20, 100];

// Quantos dados de cada tipo estão na jogada EX: 1D10 + 4D20 + 1D100
const bandeja = {};

// Adiciona um dado do tipo escolhido (até 100 de cada)
function adicionarDado(faces) {
    bandeja[faces] = Math.min(100, (bandeja[faces] || 0) + 1);
    desenharBandeja();
}

// Remove um dado do tipo escolhido
function removerDado(faces) {
    if (!bandeja[faces]) return;
    bandeja[faces]--;
    if (bandeja[faces] === 0) delete bandeja[faces];
    desenharBandeja();
}

// Desenha os dados, os contadores e o botão "+"
function desenharBandeja() {
    const area = document.getElementById("bandeja");
    area.innerHTML = "";

    // Dados padrão primeiro, depois os personalizados que estão na jogada
    const personalizados = Object.keys(bandeja)
        .map(Number)
        .filter((faces) => !DADOS_PADRAO.includes(faces))
        .sort((a, b) => a - b);

    DADOS_PADRAO.concat(personalizados).forEach((faces) => {
        const caixa = document.createElement("div");
        caixa.className = "dado-wrap";

        const botao = document.createElement("button");
        const padrao = DADOS_PADRAO.includes(faces);
        botao.className = "dado " + (padrao ? "d" + faces : "dcustom");
        botao.textContent = faces;
        botao.title = "Clique para adicionar, botão direito para remover";

        botao.addEventListener("click", () => adicionarDado(faces));
        botao.addEventListener("contextmenu", (evento) => {
            evento.preventDefault();
            removerDado(faces);
        });
        caixa.appendChild(botao);

        // Contador: só aparece se há dados desse tipo na jogada
        if (bandeja[faces]) {
            const contador = document.createElement("span");
            contador.className = "badge";
            contador.textContent = bandeja[faces];
            contador.title = "Clique para remover um"
            contador.addEventListener("click", () => removerDado(faces));
            caixa.appendChild(contador);
        }

        area.appendChild(caixa);
    });

    // Botão "+": pede o número de lados e adiciona um dado desse tipo
    const mais = document.createElement("button");
    mais.className = "dado-mais";
    mais.textContent = "+";
    mais.title = "Adicionar um dado com outro número de lados";
    mais.addEventListener("click", () => {
        const resposta = prompt("Quantos lados tem o dado? (2 a 1000)");
        const faces = Math.floor(Number(resposta));
        if (!faces || faces < 2 || faces > 1000) return;
        adicionarDado(faces);
    });
    area.appendChild(mais);
}

// Rola tudo o que está na bandeja, somando o bônus
function rolarBandeja() {
    const tipos = Object.keys(bandeja).map(Number).sort((a, b) => a - b);

    if (tipos.length === 0) {
        document.getElementById("detalhe").textContent =
            "Clique nos dados para montar a jogada";
        return;
    }

    const grupos = tipos.map((faces) => ({ faces: faces, quantidade: bandeja[faces] }));
    rolarVarios(grupos, lerBonus(), "");
}

document.getElementById("btn-rolar-bandeja").addEventListener("click", rolarBandeja);

// Limpar: esvazia a bandeja
document.getElementById("btn-limpar-bandeja").addEventListener("click", () => {
    Object.keys(bandeja).forEach((faces) => delete bandeja[faces]);
    desenharBandeja();
});

// Liga e desliga o modo combinado
const caixaModo = document.getElementById("modo-combinado");

function aplicarModo() {
    document.getElementById("dados").classList.toggle("combinado", caixaModo.checked);
}

caixaModo.addEventListener("change", aplicarModo);

// Ao abrir, sincroniza (O navegador pode lembrar da caixa marcada)
aplicarModo();
desenharBandeja();
