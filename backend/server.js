// 1. Importando as ferramentas que instalamos
const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Isso faz o Node ler o nosso arquivo .env secreto
const { GoogleGenerativeAI } = require('@google/generative-ai');
const mongoose = require('mongoose'); // <-- adicionando Mongoose para conectar ao MongoDB


// 2. Criando o servidor
const app = express();
app.use(cors()); // Permite que o Angular converse com o Node depois
app.use(express.json()); // Permite que o servidor entenda dados no formato JSON

// 3. Conectando ao Banco de Dados MongoDB na Nuvem
// Preferir URI direta se fornecida (algumas redes bloqueiam resolução SRV)
const mongoUri = process.env.MONGODB_URI_DIRECT || process.env.MONGODB_URI;
const usingDirect = !!process.env.MONGODB_URI_DIRECT;

console.log('mongoose: attempting connection, usingDirect=' + usingDirect);

mongoose.connect(mongoUri)
    .then(() => console.log('📦 Banco de Dados conectado com sucesso! (usingDirect=' + usingDirect + ')'))
    .catch((err) => console.log('❌ Erro ao conectar no Banco:', err));
// Adicionando listeners adicionais para debug
mongoose.connection.on('connected', () => console.log('mongoose: connection event - connected'));
mongoose.connection.on('error', (err) => console.log('mongoose: connection event - error', err));

// 4. Inicializando a Inteligência Artificial (Gemini)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 4. Criando a nossa primeira Rota (A porta de entrada do servidor)
app.get('/', (req, res) => {
    res.send('🚀 Servidor do FinancIA está VIVO e respirando!');
});

// 5. Criando uma Rota de Teste para o Gemini
app.get('/testar-ia', async (req, res) => {
    try {
        // Vamos usar o modelo flash, que é rápido e ótimo para textos e imagens
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // Dando um comando simples para a IA
        const result = await model.generateContent("Diga olá para o criador do app FinancIA em apenas uma frase criativa!");
        
        // Devolvendo a resposta da IA para o navegador
        res.send(result.response.text());
    } catch (error) {
        res.status(500).send("Deu erro na IA: " + error.message);
    }
});

// 6. Ligando o servidor na tomada (porta 3000)
app.listen(3000, () => {
    console.log('✅ Servidor online rodando na porta 3000!');
    console.log('👉 Segure CTRL e clique aqui para abrir: http://localhost:3000');
});