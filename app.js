// Inportação do Modulo Express
const express = require('express');

// importar modulo fileupload
const fileupload = require('express-fileupload');

// Importando express-handlebars
const { engine } = require('express-handlebars');

// Inportação do Modulo MySQL2
const mysql = require('mysql2');

const fs = require('fs');

// ------------------------------------------------------------------------------ //

// inicializando a rota
const app = express();

// habilitando o oploadfile
app.use(fileupload());

// adicionar bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));

// adicionar css
app.use('/css', express.static('./css'));

// referenciar a pasta de imagem
app.use('/imagens', express.static('./imagens'));

// configuração do express-handlebars
app.engine('handlebars', engine());

// configuração express-handlebars
app.engine('handlebars', engine({
    helpers: {
        // Função auxiliar para verificar igualdade
        condicionalIgualdade: function (parametro1, parametro2, options) {
            return parametro1 === parametro2 ? options.fn(this) : options.inverse(this);
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Manipulação de conexao de dados via rotas...
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// rota padrão
app.get('/', (req, res) => {
    res.render('formulario');
});

// configuração do Banco de Dados
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'projeto'
});

// rota principal
app.get('/', function (req, res) {
    // sql
    let sql = 'SELECT * FROM produto'

    // Executar comando SQL
    conexao.query(sql, function (erro, retorno) {
        res.render('formulario', { produtos: retorno });
    });
});

// Rota principal contendo a situação
app.get('/:situacao', function (req, res) {
    // SQL
    let sql = 'SELECT * FROM produto';

    // Executar comando SQL
    conexao.query(sql, function (erro, retorno) {
        res.render('formulario', { produtos: retorno, situação: req.params.situacao });
    });
});

// Teste de conexão do própio express
conexao.connect(function (erro) {
    if (erro) throw erro;
    console.log("Sua conexao foi realizada com sucesso!")
})

//rota de de cadastro de produtos no formulario
app.post('/cadastrar', function (req, res) {
    try {
        // Obter os dados que serão utiliados para o cadastro
        let nome = req.body.nome;
        let valor = req.body.valor;
        let imagem = req.files.imagem.name;

        // Validar o nome do produto e o valor
        if (nome == '' || valor == '' || isNaN(valor)) {
            res.redirect('/falhaCadastro');
        } else {
            // SQL
            let sql = `INSERT INTO produto (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagem}')`;

            // Executar comando SQL
            conexao.query(sql, function (erro, retorno) {
                // Caso ocorra algum erro
                if (erro) throw erro;

                // Caso ocorra o cadastro
                req.files.imagem.mv(__dirname + '/imagens/' + req.files.imagem.name);
                console.log(retorno);
            });

            // Retornar para a rota principal
            res.redirect('/okCadastro');
        }
    } catch (erro) {
        res.redirect('/falhaCadastro');
    }
});

// Rota para remover produtos
app.get('/remover/:codigo&:imagem', function (req, res) {
    // tratamento de exeção
    try {
        let sql = `DELETE FROM produto WHERE codigo = ${req.params.codigo}`;

        // executar o comando sql
        conexao.query(sql, function (erro, retorno) {
            // caso falhe o comando SQL
            if (erro) throw erro;

            // caso o comando SQl funcione
            fs.unlink(__dirname + '/imagens/' + req.params.imagem, (erro_imagem) => {
                console.log('Falha ao remover a imagem');
            });
        });

        // re
        res.redirect('/okRemover');
    } catch (erro) {
        res.redirect('/falhaRemover');
    }

});

//rotas para edicao

// Rota para redirecionar para o formulário de alteração/edição
app.get('/formularioEditar/:codigo', function(req, res){
   
    // SQL
    let sql = `SELECT * FROM produto WHERE codigo = ${req.params.codigo}`;

    // Executar o comando SQL
    conexao.query(sql, function(erro, retorno){
        // Caso haja falha no comando SQL
        if(erro) throw erro;

        // Caso consiga executar o comando SQL
        res.render('formularioEditar', {produto:retorno[0]});
    });

});


// Rota para editar produtos
app.post('/editar', function(req, res){

    // Obter os dados do formulário
    let nome = req.body.nome;
    let valor = req.body.valor;
    let codigo = req.body.codigo;
    let nomeImagem = req.body.nomeImagem;

    // Validar nome do produto e valor
    if(nome == '' || valor == '' || isNaN(valor)){
        res.redirect('/falhaEdicao');
    }else {

        // Definir o tipo de edição
        try{
            // Objeto de imagem
            let imagem = req.files.imagem;

            // SQL
            let sql = `UPDATE produto SET nome='${nome}', valor=${valor}, imagem='${imagem.name}' WHERE codigo=${codigo}`;
   
            // Executar comando SQL
            conexao.query(sql, function(erro, retorno){
                // Caso falhe o comando SQL
                if(erro) throw erro;

                // Remover imagem antiga
                fs.unlink(__dirname+'/imagens/'+nomeImagem, (erro_imagem)=>{
                    console.log('Falha ao remover a imagem.');
                });

                // Cadastrar nova imagem
                imagem.mv(__dirname+'/imagens/'+imagem.name);
            });
        }catch(erro){
           
            // SQL
            let sql = `UPDATE produto SET nome='${nome}', valor=${valor} WHERE codigo=${codigo}`;
       
            // Executar comando SQL
            conexao.query(sql, function(erro, retorno){
                // Caso falhe o comando SQL
                if(erro) throw erro;
            });
        }

        // Redirecionamento
        res.redirect('/okEdicao');
    }
});



// servidor rodando na porta
app.listen(8080);