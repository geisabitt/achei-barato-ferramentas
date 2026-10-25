# Sistema de Ofertas — versão corrigida

Arquivos:
- `index.html`
- `style.css`
- `script.js`

## Configuração da planilha

A versão entregue já está apontando para a URL CSV que estava configurada no `script.js` original.

A primeira linha da planilha deve conter exatamente:

`nome,preco,preco_antigo,imagem,link,categoria,destaque`

Exemplo:

`Fone Bluetooth,R$ 39,90,R$ 79,90,https://.../imagem.jpg,https://.../seu-link-de-afiliado,Eletrônicos,SIM`

## Publicação

### GitHub Pages
1. Crie um repositório.
2. Envie os 3 arquivos para a raiz.
3. Vá em Settings > Pages.
4. Selecione a branch principal e a pasta `/root`.
5. Salve e abra o endereço gerado.

### Vercel
1. Crie um projeto/importação a partir do repositório.
2. Não é necessário build.
3. Use a raiz do projeto.
4. Faça o deploy.

## Correção principal

O `script.js` original lançava `Planilha não configurada` quando a URL CSV real era exatamente a URL configurada. Essa verificação foi removida.

Também foram adicionados:
- tratamento de BOM do CSV;
- validação das colunas obrigatórias;
- tratamento de CSV com campos entre aspas;
- tratamento de planilha vazia;
- mensagem de erro mais clara;
- tratamento de imagem ausente/quebrada;
- escape de conteúdo inserido nos cards;
- cache desabilitado na leitura do CSV para facilitar atualização da planilha.

## Observação

Se o Google Planilhas não estiver publicado como CSV, o navegador não conseguirá carregar os produtos. Nesse caso, publique a planilha na Web no formato CSV e substitua `PLANILHA_URL` em `script.js`.
