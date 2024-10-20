const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {ehAdmin} = require("../helpers/ehAdmin")

router.get('/', ehAdmin, (req,res)=>{
    res.send("Esta é a rota admin")
})

router.get('/categorias', ehAdmin, (req, res)=>{
    Categoria.find().sort({ date: 'desc' }).lean().then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err)=>{
        res.flash("error_msg", "Erro ao Listar as categorias")
        res.redirect('admin')
    })
})

router.get('/categorias/add', ehAdmin, (req,res) => {
    res.render('admin/addcategorias')
})

router.get('/categorias/edit/:id', ehAdmin, (req,res)=>{
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) =>{
        req.flash("success_msg", "Categoria editada com sucesso")
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Essa categoria não existe")
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/nova', ehAdmin, (req,res) => {
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"}) // texto é importante para resgatar a informação no handlebars e exibir para o usuário
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválida"})
    }
    if(req.body.nome.length < 3){
        erros.push({texto: "Nome da categoria é muito curto"})
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    } else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(()=>{
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
        })
    }
})

router.post('/categorias/edit', ehAdmin, (req,res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
    var erros = [];

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválida"})
    }
    if(req.body.nome.length < 3){
        erros.push({texto: "Nome da categoria é muito curto"})
    }
    if(erros.length > 0){

        res.render('admin/editcategorias', {categoria: categoria, erros: erros})

    } else{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg", `Categoria Editada com sucesso`)
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            req.flash("error_msg", `Ocorreu um erro ao editar categoria`)
            res.redirect('/admin/categorias')
        })
    }

    }).catch((err)=>{
        console.error(err);
        req.flash("error_msg", `Categoria não encontrada`)
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/delete', ehAdmin, (req,res) => {
    Categoria.deleteOne({_id: req.body.id}).lean().then(()=>{
        req.flash("success_msg", "Apagada com sucesso")
        res.redirect('/admin/categorias');
    })
})

router.get('/postagens', ehAdmin, (req,res) => {

    Postagem.find().lean().populate("categoria").sort({date: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Não foi possível encontrar as categorias")
        res.redirect("/admin")
    })
})

router.get('/postagens/add', ehAdmin, (req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err)=>{
        res.flash("error_msg", "Houve um erro ao carregar o formulário")
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', ehAdmin, (req,res) =>{
    let erros = []
    // Tratando inputs
    if(req.body.categorias == 0){
        erros.push({texto: "Para criar uma postagem, primeiro crie uma categoria"})
    }
    if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Título inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválida"})
    }
    if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição inválida"})
    }
    if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo inválido"})
    }
    // Tratando inputs
    if(erros.length > 0){
        // Corrige o bug das categorias pararem de ser exibidas após o flash message
        Categoria.find().lean().then((categorias) => {
            res.render("admin/addpostagens", {erros: erros, categorias: categorias})
        }).catch((err)=>{
            res.flash("error_msg", "Houve um erro ao carregar o formulário")
            res.redirect('/admin')
        })
    } else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categorias
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", `Postagem ${req.body.titulo} criada com sucesso`)
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Ocorreu um erro ao criar postagem")
            res.redirect("/admin/postagens")
        })
    }
})


router.get('/postagens/edit/:id', ehAdmin, (req,res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err)=>{
            req.flash("error_msg", "Não foi possível encontrar as categorias");
            res.redirect("/admin/postagens");
        })
    }).catch((err) => {
        req.flash("error_msg", "Não foi possível encontrar o id da postagem")
        res.redirect("/admin/postagens");
    })
})

router.post('/postagens/edit', ehAdmin, (req,res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        console.log(req.body.categoria)
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("msg_success", `Postagem ${postagem.titulo} com sucesso`)
            res.redirect("/admin/postagens")
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro interno")
        res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "não foi possível localizar o id da postagem")
        res.redirect("/admin/postagens")
    })
})

router.post('/postagens/deletar', ehAdmin, (req,res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Postagem não identificada")
        res.redirect("/admin/postagens")
    })
})


module.exports = router;