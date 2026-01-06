
# AgilStore

Aplicação de **linha de comando** (CLI) em **Node.js** para gestão do inventário da AgilStore.
Permite **adicionar, listar (com filtro/ordenação), atualizar, excluir** e **buscar** produtos, com **persistência em arquivo JSON**.

## ✅ Funcionalidades

1. **Adicionar Produto**
   - Campos: `Nome`, `Categoria`, `Quantidade`, `Preço`.
   - **ID único** gerado automaticamente (inteiro sequencial).
   - Validações: nome/categoria não vazios; quantidade inteira ≥ 0; preço ≥ 0.

2. **Listar Produtos**
   - Exibe tabela com: `ID | Nome | Categoria | Quantidade | Preço`.
   - **Filtro por categoria** (opcional).
   - **Ordenação** por `nome`, `quantidade` ou `preco` (opcional).

3. **Atualizar Produto**
   - Localiza pelo **ID**.
   - Permite escolher quais campos atualizar.
   - Valida dados antes de salvar.

4. **Excluir Produto**
   - Remove pelo **ID**.
   - Solicita **confirmação** antes de excluir.

5. **Buscar Produto**
   - Busca por **ID** ou por **parte do nome**.
   - Exibe **detalhes completos** ou tabela de resultados.

6. **Persistência de Dados**
   - Salvamento automático em `data/products.json` no formato:

```json
{
  "nextId": 1,
  "products": []
}

```

# 🛠️ Tecnologias Utilizadas




JavaScript (ES6+)
Linguagem principal utilizada no desenvolvimento da aplicação.


Node.js
Ambiente de execução utilizado para rodar JavaScript fora do navegador.


Módulos nativos do Node.js:

fs – manipulação de arquivos (leitura e gravação do JSON)
path – gerenciamento de caminhos do sistema
readline – interação com o usuário via terminal


# ▶️ Como Rodar a Aplicação Localmente


Siga os passos abaixo:


1️⃣ Clone ou baixe o projeto:


**git clone git@github.com:Lilianvieiramoura/agilStore.git**

2️⃣ Acesse a pasta do projeto


**cd agilStore**

3️⃣ Execute a aplicação


**node index.js**

Ou, se preferir usar o script do package.json: npm start

4️⃣ Utilize o menu no terminal


Ao iniciar, a aplicação exibirá o menu: AgilStore

[1] Adicionar Produto
[2] Listar Produtos
[3] Atualizar Produto
[4] Excluir Produto
[5] Buscar Produto
[0] Sair

**Basta escolher a opção desejada e seguir as instruções exibidas no terminal**


Arquivo JSON


Utilizado como mecanismo de persistência de dados do inventário.
