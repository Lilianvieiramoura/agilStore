
'use strict';
const fs = require('fs');
const path = require('path'); 
const readline = require('readline');

//pasta
const DATA_DIR = path.join(__dirname, 'data');

//arquivo
const DATA_FILE = path.join(DATA_DIR, 'products.json');

//
function checkDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { nextId: 1, products: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function loadData() {
  checkDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object' || !Array.isArray(data.products)) {
      throw new Error('Formato inválido');
    }
    if (typeof data.nextId !== 'number' || data.nextId < 1) {
      const maxId = data.products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0);
      data.nextId = maxId + 1;
    }
    return data;
  } catch (err) {
    console.error('Erro ao carregar dados. Recriando arquivo...', err.message);
    const initial = { nextId: 1, products: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function formatCurrencyBRL(value) {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  } catch {
    return `R$ ${Number(value).toFixed(2)}`;
  }
}

function printLine() {
  console.log(''.padEnd(80, '-'));
}

function printTable(products) {
  if (!products || products.length === 0) {
    console.log('Nenhum produto para exibir.');
    return;
  }
  const headers = ['ID', 'Nome do Produto', 'Categoria', 'Quantidade', 'Preço'];
  console.log(headers.join(' | '));
  printLine();
  for (const p of products) {
    console.log(`${p.id} | ${p.name} | ${p.category} | ${p.quantity} | ${formatCurrencyBRL(p.price)}`);
  }
  printLine();
}

function createInterface() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function isEmpty(str) {
  return !str || str.trim().length === 0;
}

function parseNonNegativeInteger(input) {
  const n = Number.parseInt(input, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

function parseNonNegativeNumber(input) {
  // aceita vírgula como decimal
  const normalized = String(input).replace(',', '.');
  const n = Number.parseFloat(normalized);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

async function addProduct(rl, data) {
  console.log('\n=== Adicionar Produto ===');
  const name = await ask(rl, 'Nome do Produto: ');
  if (isEmpty(name)) { console.log('Nome inválido. Operação cancelada.'); return; }

  const category = await ask(rl, 'Categoria: ');
  if (isEmpty(category)) { console.log('Categoria inválida. Operação cancelada.'); return; }

  const qStr = await ask(rl, 'Quantidade em Estoque (inteiro >= 0): ');
  const quantity = parseNonNegativeInteger(qStr);
  if (quantity === null) { console.log('Quantidade inválida. Operação cancelada.'); return; }

  const pStr = await ask(rl, 'Preço (>= 0, use \',\' para decimais se preferir): ');
  const price = parseNonNegativeNumber(pStr);
  if (price === null) { console.log('Preço inválido. Operação cancelada.'); return; }

  const id = data.nextId++;
  const product = { id, name: name.trim(), category: category.trim(), quantity, price };
  data.products.push(product);
  saveData(data);
  console.log(`Produto adicionado com sucesso (ID: ${id}).`);
}

async function listProducts(rl, data) {
  console.log('\n=== Listar Produtos ===');
  let products = [...data.products];

  const filterCat = await ask(rl, 'Filtrar por categoria (deixe vazio para não filtrar): ');
  if (!isEmpty(filterCat)) {
    const query = filterCat.toLowerCase();
    products = products.filter(p => (p.category || '').toLowerCase() === query);
  }

  const sortOpt = await ask(rl, 'Ordenar por (nome|quantidade|preco) ou vazio para nenhum: ');
  const sortKey = sortOpt.toLowerCase();
  if (['nome', 'quantidade', 'preco'].includes(sortKey)) {
    const keyMap = { 'nome': 'name', 'quantidade': 'quantity', 'preco': 'price' };
    const key = keyMap[sortKey];
    products.sort((a, b) => {
      const va = a[key];
      const vb = b[key];
      if (typeof va === 'string' && typeof vb === 'string') {
        return va.localeCompare(vb, 'pt-BR', { sensitivity: 'base' });
      }
      return (va < vb) ? -1 : (va > vb) ? 1 : 0;
    });
  }

  printTable(products);
}

function findProductById(data, id) {
  return data.products.find(p => p.id === id);
}

async function updateProduct(rl, data) {
  console.log('\n=== Atualizar Produto ===');
  const idStr = await ask(rl, 'Informe o ID do produto: ');
  const id = parseNonNegativeInteger(idStr);
  if (id === null) { console.log('ID inválido.'); return; }

  const product = findProductById(data, id);
  if (!product) { console.log('Produto não encontrado.'); return; }

  console.log('Produto atual:', product);

  const upName = await ask(rl, 'Atualizar Nome? (s/N): ');
  if (upName.toLowerCase() === 's') {
    const name = await ask(rl, 'Novo Nome: ');
    if (isEmpty(name)) { console.log('Nome inválido. Mantendo o anterior.'); }
    else { product.name = name.trim(); }
  }

  const upCat = await ask(rl, 'Atualizar Categoria? (s/N): ');
  if (upCat.toLowerCase() === 's') {
    const cat = await ask(rl, 'Nova Categoria: ');
    if (isEmpty(cat)) { console.log('Categoria inválida. Mantendo a anterior.'); }
    else { product.category = cat.trim(); }
  }

  const upQty = await ask(rl, 'Atualizar Quantidade? (s/N): ');
  if (upQty.toLowerCase() === 's') {
    const qStr = await ask(rl, 'Nova Quantidade (inteiro >= 0): ');
    const q = parseNonNegativeInteger(qStr);
    if (q === null) { console.log('Quantidade inválida. Mantendo a anterior.'); }
    else { product.quantity = q; }
  }

  const upPrice = await ask(rl, 'Atualizar Preço? (s/N): ');
  if (upPrice.toLowerCase() === 's') {
    const pStr = await ask(rl, 'Novo Preço (>= 0): ');
    const p = parseNonNegativeNumber(pStr);
    if (p === null) { console.log('Preço inválido. Mantendo o anterior.'); }
    else { product.price = p; }
  }

  saveData(data);
  console.log('Produto atualizado com sucesso.');
}

async function deleteProduct(rl, data) {
  console.log('\n=== Excluir Produto ===');
  const idStr = await ask(rl, 'Informe o ID do produto: ');
  const id = parseNonNegativeInteger(idStr);
  if (id === null) { console.log('ID inválido.'); return; }

  const idx = data.products.findIndex(p => p.id === id);
  if (idx === -1) { console.log('Produto não encontrado.'); return; }

  const p = data.products[idx];
  console.log('Produto selecionado:', p);
  const confirm = await ask(rl, 'Confirmar exclusão? (s/N): ');
  if (confirm.toLowerCase() === 's') {
    data.products.splice(idx, 1);
    saveData(data);
    console.log('Produto excluído com sucesso.');
  } else {
    console.log('Operação cancelada.');
  }
}

async function searchProduct(rl, data) {
  console.log('\n=== Buscar Produto ===');
  const mode = await ask(rl, 'Buscar por (id|nome): ');
  if (mode.toLowerCase() === 'id') {
    const idStr = await ask(rl, 'Informe o ID: ');
    const id = parseNonNegativeInteger(idStr);
    if (id === null) { console.log('ID inválido.'); return; }
    const p = findProductById(data, id);
    if (p) {
      printLine();
      console.log('Detalhes do Produto');
      printLine();
      console.log(`ID: ${p.id}`);
      console.log(`Nome: ${p.name}`);
      console.log(`Categoria: ${p.category}`);
      console.log(`Quantidade: ${p.quantity}`);
      console.log(`Preço: ${formatCurrencyBRL(p.price)}`);
      printLine();
    } else {
      console.log('Nenhum produto encontrado com esse ID.');
    }
  } else if (mode.toLowerCase() === 'nome') {
    const term = await ask(rl, 'Parte do nome do produto: ');
    const q = term.toLowerCase();
    const results = data.products.filter(p => (p.name || '').toLowerCase().includes(q));
    if (results.length > 0) {
      printTable(results);
    } else {
      console.log('Nenhum produto encontrado com esse critério.');
    }
  } else {
    console.log('Opção inválida. Use "id" ou "nome".');
  }
}

function showMenu() {
  printLine();
  console.log('Bem-vindos à AgilStore');
  printLine();
  console.log('[1] Adicionar Produto');
  console.log('[2] Listar Produtos');
  console.log('[3] Atualizar Produto');
  console.log('[4] Excluir Produto');
  console.log('[5] Buscar Produto');
  console.log('[0] Sair');
  printLine();
}

async function main() {
  const rl = createInterface();
  const data = loadData();

  let running = true;
  while (running) {
    showMenu();
    const opt = await ask(rl, 'Escolha uma opção: ');
    switch ((opt || '').trim()) {
      case '1':
        await addProduct(rl, data);
        break;
      case '2':
        await listProducts(rl, data);
        break;
      case '3':
        await updateProduct(rl, data);
        break;
      case '4':
        await deleteProduct(rl, data);
        break;
      case '5':
        await searchProduct(rl, data);
        break;
      case '0':
        running = false;
        break;
      default:
        console.log('Opção inválida. Tente novamente.');
    }
  }

  rl.close();
  console.log('Encerrando aplicação. Até logo!');
}

main();
``

