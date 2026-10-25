// ============================================
// CONFIGURAÇÃO
// ============================================

// URL CSV publicada pelo Google Planilhas.
const PLANILHA_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7OerHZse6jCJXyUQ_g0lMQ01qoyMQtL7f0i2LZVwHKdKZDq-G8-Jt8PVwJlp2Og/pub?output=csv";


// ============================================
// ELEMENTOS
// ============================================

const produtosContainer = document.getElementById("produtos");
const loading = document.getElementById("loading");
const erro = document.getElementById("erro");
const semProdutos = document.getElementById("semProdutos");
const busca = document.getElementById("busca");
const categoriasContainer = document.getElementById("categorias");
const contadorProdutos = document.getElementById("contadorProdutos");

document.getElementById("ano").textContent =
  new Date().getFullYear();


// ============================================
// DADOS
// ============================================

let produtos = [];
let categoriaAtual = "Todos";


// ============================================
// BUSCAR PLANILHA
// ============================================

async function carregarProdutos() {

  try {

    if (
      !PLANILHA_URL ||
      !PLANILHA_URL.includes("output=csv")
    ) {
      throw new Error(
        "URL CSV da planilha não configurada."
      );
    }


    const resposta = await fetch(PLANILHA_URL, {
      method: "GET",
      cache: "no-store"
    });


    if (!resposta.ok) {

      throw new Error(
        `Erro HTTP ${resposta.status} ao carregar a planilha.`
      );

    }


    const csv = await resposta.text();


    if (!csv.trim()) {

      throw new Error(
        "A planilha retornou um CSV vazio."
      );

    }


    produtos = converterCSV(csv);


    loading.classList.add("hidden");


    criarCategorias();

    renderizarProdutos();


  } catch (error) {

    console.error(
      "Erro ao carregar produtos:",
      error
    );


    loading.classList.add("hidden");

    erro.classList.remove("hidden");


    const mensagem =
      erro.querySelector("p");


    if (mensagem) {

      mensagem.textContent =
        "Não foi possível carregar os produtos. Verifique a publicação da planilha CSV.";

    }

  }

}


// ============================================
// CONVERTER CSV
// ============================================

function converterCSV(texto) {

  const linhas = texto
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .filter(
      linha => linha.trim() !== ""
    );


  if (linhas.length < 2) {

    return [];

  }


  const cabecalhos =
    separarLinhaCSV(linhas[0])
      .map(item =>
        limparCampo(item).toLowerCase()
      );


  const obrigatorias = [
    "nome",
    "link"
  ];


  const faltando =
    obrigatorias.filter(
      campo =>
        !cabecalhos.includes(campo)
    );


  if (faltando.length) {

    throw new Error(
      `Colunas obrigatórias ausentes: ${faltando.join(", ")}`
    );

  }


  return linhas
    .slice(1)
    .map(linha => {

      const valores =
        separarLinhaCSV(linha);


      const produto = {};


      cabecalhos.forEach(
        (cabecalho, index) => {

          produto[cabecalho] =
            limparCampo(
              valores[index] || ""
            );

        }
      );


      return produto;

    })
    .filter(
      produto =>
        produto.nome &&
        produto.link
    );

}


// ============================================
// LIMPAR CAMPO
// ============================================

function limparCampo(valor) {

  return String(valor)

    .replace(/^\uFEFF/, "")

    .trim()

    .replace(
      /^"(.*)"$/s,
      "$1"
    )

    .replace(
      /""/g,
      '"'
    );

}


// ============================================
// SEPARAR CSV
// ============================================

function separarLinhaCSV(linha) {

  const resultado = [];

  let atual = "";

  let dentroDeAspas = false;


  for (
    let i = 0;
    i < linha.length;
    i++
  ) {

    const caractere =
      linha[i];


    if (caractere === '"') {

      if (
        dentroDeAspas &&
        linha[i + 1] === '"'
      ) {

        atual += '"';

        i++;

      } else {

        dentroDeAspas =
          !dentroDeAspas;

      }


    } else if (
      caractere === "," &&
      !dentroDeAspas
    ) {

      resultado.push(atual);

      atual = "";


    } else {

      atual += caractere;

    }

  }


  resultado.push(atual);


  return resultado;

}


// ============================================
// CRIAR CATEGORIAS
// ============================================

function criarCategorias() {

  const categorias = [

    ...new Set(

      produtos

        .map(
          produto =>
            produto.categoria
        )

        .filter(Boolean)

    )

  ];


  categoriasContainer.innerHTML = `

    <button
      class="category active"
      data-categoria="Todos"
    >
      Todos
    </button>

  `;


  categorias.forEach(
    categoria => {

      const botao =
        document.createElement(
          "button"
        );


      botao.className =
        "category";


      botao.dataset.categoria =
        categoria;


      botao.textContent =
        categoria;


      categoriasContainer.appendChild(
        botao
      );

    }
  );

}


// ============================================
// RENDERIZAR PRODUTOS
// ============================================

function renderizarProdutos() {

  const termo =
    busca.value
      .toLowerCase()
      .trim();


  const produtosFiltrados =
    produtos.filter(
      produto => {

        const correspondeBusca =
          produto.nome
            .toLowerCase()
            .includes(termo);


        const correspondeCategoria =
          categoriaAtual === "Todos" ||
          produto.categoria ===
            categoriaAtual;


        return (
          correspondeBusca &&
          correspondeCategoria
        );

      }
    );


  produtosContainer.innerHTML =
    "";


  contadorProdutos.textContent =
    `${produtosFiltrados.length} produto(s)`;


  if (
    produtosFiltrados.length === 0
  ) {

    semProdutos.classList.remove(
      "hidden"
    );

    return;

  }


  semProdutos.classList.add(
    "hidden"
  );


  produtosFiltrados.forEach(
    produto => {

      produtosContainer.appendChild(
        criarCardProduto(produto)
      );

    }
  );

}


// ============================================
// CONVERTER LINK DO GOOGLE DRIVE
// ============================================

function converterImagemDrive(url) {

  if (!url) {
    return "";
  }


  url = String(url).trim();


  // ========================================
  // FORMATO:
  //
  // https://drive.google.com/file/d/ID/view
  // ========================================

  const matchFile =
    url.match(
      /drive\.google\.com\/file\/d\/([^/?#]+)/
    );


  if (matchFile) {

    const id =
      matchFile[1];


    return (
      "https://drive.google.com/uc?export=view&id=" +
      encodeURIComponent(id)
    );

  }


  // ========================================
  // FORMATO:
  //
  // https://drive.google.com/open?id=ID
  // ========================================

  const matchOpen =
    url.match(
      /drive\.google\.com\/open\?id=([^&]+)/
    );


  if (matchOpen) {

    const id =
      matchOpen[1];


    return (
      "https://drive.google.com/uc?export=view&id=" +
      encodeURIComponent(id)
    );

  }


  // ========================================
  // FORMATO:
  //
  // https://drive.google.com/uc?id=ID
  // ========================================

  const matchUC =
    url.match(
      /drive\.google\.com\/uc\?(?:export=view&)?id=([^&]+)/
    );


  if (matchUC) {

    const id =
      matchUC[1];


    return (
      "https://drive.google.com/uc?export=view&id=" +
      encodeURIComponent(id)
    );

  }


  // ========================================
  // SE NÃO FOR DRIVE
  //
  // Mantém a URL original.
  // ========================================

  return url;

}


// ============================================
// CRIAR IMAGEM
// ============================================

function criarImagemProduto(produto) {

  const urlOriginal =
    produto.imagem || "";


  const urlImagem =
    converterImagemDrive(
      urlOriginal
    );


  // Se não tiver imagem
  if (!urlImagem) {

    return `

      <div
        class="image-placeholder"
        aria-label="Imagem não disponível"
      >
        📦
      </div>

    `;

  }


  return `

    <img
      src="${escaparAtributo(urlImagem)}"
      alt="${escaparAtributo(produto.nome)}"
      loading="lazy"
      referrerpolicy="no-referrer"

      onerror="
        this.style.display='none';
        this.parentElement.classList.add('image-error');
      "
    >

  `;

}


// ============================================
// CRIAR CARD
// ============================================

function criarCardProduto(produto) {

  const artigo =
    document.createElement(
      "article"
    );


  artigo.className =
    "product-card";


  // ========================================
  // DESTAQUE
  // ========================================

  const destaque =
    produto.destaque
      ?.toUpperCase() === "SIM"

      ? `

        <span
          class="product-highlight"
        >
          🔥 DESTAQUE
        </span>

      `

      : "";


  // ========================================
  // PREÇO ANTIGO
  // ========================================

  const precoAntigo =
    produto.preco_antigo

      ? `

        <span
          class="price-old"
        >
          ${escaparHTML(
            produto.preco_antigo
          )}
        </span>

      `

      : "";


  // ========================================
  // IMAGEM
  // ========================================

  const imagem =
    criarImagemProduto(
      produto
    );


  // ========================================
  // HTML DO CARD
  // ========================================

  artigo.innerHTML = `

    <div class="product-image">

      ${imagem}

      ${destaque}

    </div>


    <div class="product-info">


      <span
        class="product-category"
      >
        ${escaparHTML(
          produto.categoria ||
          "Oferta"
        )}
      </span>


      <h3
        class="product-name"
      >
        ${escaparHTML(
          produto.nome
        )}
      </h3>


      ${precoAntigo}


      <div class="price">

        ${escaparHTML(
          produto.preco || ""
        )}

      </div>


      <a
        href="${escaparAtributo(
          produto.link
        )}"

        target="_blank"

        rel="noopener noreferrer sponsored"

        class="buy-button"
      >

        VER OFERTA 🔥

      </a>


    </div>

  `;


  return artigo;

}


// ============================================
// SEGURANÇA
// ============================================

function escaparHTML(valor) {

  return String(valor)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


function escaparAtributo(valor) {

  return escaparHTML(valor);

}


// ============================================
// BUSCA
// ============================================

busca.addEventListener(
  "input",
  renderizarProdutos
);


// ============================================
// CATEGORIAS
// ============================================

categoriasContainer.addEventListener(
  "click",
  event => {

    const botao =
      event.target.closest(
        ".category"
      );


    if (!botao) {
      return;
    }


    categoriaAtual =
      botao.dataset.categoria;


    document
      .querySelectorAll(
        ".category"
      )
      .forEach(
        item =>
          item.classList.remove(
            "active"
          )
      );


    botao.classList.add(
      "active"
    );


    renderizarProdutos();

  }
);


// ============================================
// INICIAR
// ============================================

carregarProdutos();