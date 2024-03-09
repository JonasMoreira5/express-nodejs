// Inportação do Modulo MySQL2
const mysql = require('mysql2');

// configuração do Banco de Dados
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'projeto'
});

// Teste de conexão do própio express
conexao.connect(function (erro) {
    if (erro) throw erro;
    console.log("Sua conexao foi realizada com sucesso!")
})

// exportando o modulo de conexao
module.exports=conexao;