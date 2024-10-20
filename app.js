// Carregando módulos
const express = require('express');
const handlebars = require('express-handlebars');
const app = express();
const path = require("path"); // inutil por enquanto
const admin = require('./routes/admin')
const mongoose = require ('mongoose');
const session = require("express-session");
const flash = require("connect-flash") // Middleware para exibir uma mensagem de erro ou sucesso na página no redirecionamento
require("./models/Postagem");
const Postagem = mongoose.model("postagens")
require("./models/Categoria");
const Categoria = mongoose.model("categorias")
const usuario = require('./routes/usuario')
const passport = require("passport")
require("./config/auth")(passport)
//const db = require("./config/db")
require("dotenv").config()
require("./config/connection")
//const mongoose = require('mongoose');
// Configurações
    // Sessão
        app.use(session({
            secret: "sessao_segura",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Middleware
        app.use((req,res,next)=>{
            res.locals.sucess_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null;
            next();
        })
    //Express
        app.use(express.urlencoded({extended: true}));
        app.use(express.json());
    //Handlebars
        app.engine('handlebars', handlebars.engine({
            defaultLayout: 'main',
            handlebars: require('handlebars'),
            runtimeOptions: {
                allowProtoPropertiesByDefault: true
            }
        }));
        app.set('view engine', 'handlebars');
    // Public
        app.use(express.static('public'));
    // se conectando ao banco mongoose
    /*mongoose.Promise = global.Promise;
    mongoose.connect(db.mongoURI).then(()=>{
        console.log('Conectado ao mongo')
    }).catch((err)=>{
        console.log(`Erro ao se conectar: ${err}`)
    })*/
// Rotas

app.use((req,res,next)=>{
    next()
})

app.use('/admin', admin)
app.use('/usuario', usuario)

app.get('/', function(req, res){
    Postagem.find().lean().populate("categoria").sort({date: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro interno")
        res.redirect('/404')
    })
})

app.get('/postagem/:id', (req,res) => {

    Postagem.findOne({slug: req.params.id}).lean().then((postagem) => {
        if(postagem){
            res.render("postagem/index", {postagem: postagem})
        } else{
            req.flash("error_msg", "Essa postagem não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível pesquisar a postagem")
        res.redirect("/")
    })
})

app.get('/categorias', (req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao listar categorias")
        res.redirect('/');
    })
})

app.get('/categorias/:slug', (req,res) => {
    Categoria.findOne({slug: req.params.slug }).lean().then((categoria) => {

        Postagem.find({categoria: categoria}).lean().then((postagens) => {
            console
            res.render("postagem/listapostagens", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Postagens não encontradas")
            res.redirect('/categorias')
        })

    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect('/categorias')
    })
})

app.get('/404', (req,res) => {
    res.send("Error 404")
})

// Outros
const PORT = process.env.PORT || 8081
app.listen(PORT, ()=>{
    console.log('Server ON!')
})