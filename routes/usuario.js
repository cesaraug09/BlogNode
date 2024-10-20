const express = require("express");
const router = express.Router();
mongoose = require("mongoose");
require("../models/Usuario");
const Usuario = mongoose.model("usuarios");
const bcrypt = require("bcryptjs")
const passport = require("passport")

router.get("/registro", (req,res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req,res) => {
    let nome = req.body.nome;
    let email = req.body.email;
    let senha = req.body.senha;
    let senha2 = req.body.senha2;
    let erros = [];

    if(!nome || nome == '' || nome == null || typeof nome == 'undefined'){
        erros.push({texto: "Nome inválido"});
    }
    if(!email || email == '' || email == null || typeof email == 'undefined'){
        erros.push({texto: "Email inválido"});
    }
    if(!senha || senha == '' || senha == null || typeof senha == 'undefined'){
        erros.push({texto: "Senha inválido"});
    } else if(senha.length < 4 ){
        erros.push({texto: "Senha muito curta"});
    } else if(senha != senha2){
        erros.push({texto: "As senhas não coincidem"});
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    } else{

        Usuario.findOne({email: email}).lean().then((usuario) => {

            if(usuario){
                req.flash("error_msg", "Email já cadastrado")
                res.redirect('/usuario/registro')
            }
            else{

                /// "criptografia" da senha
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(senha, salt);

                const novoUsuario = {
                    nome: nome,
                    email: email,
                    senha: hash
                }

                new Usuario(novoUsuario).save().then(() => {
                    req.flash("success_msg", "Usuário cadastrado com sucesso")
                    res.redirect("/")
                }).catch((err) => {
                    req.flash("error_msg", "Erro interno");
            res.redirect('/')
                })
            }

        }).catch((err) => {
            req.flash("error_msg", "Erro ao buscar usuarios no banco de dados");
            res.redirect('/')
        })

    }

})

router.get('/login', (req,res) => {
    res.render("usuarios/login")
})

router.post('/login', (req,res,next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuario/login/",
        failureFlash: true
    })(req,res,next)
})

router.get("/logout", (req,res,next) => {
    req.logout((err) => {
        if(err){
            return next(err)
        }
        req.flash('success_msg', "Deslogado com sucesso!")
        res.redirect("/")
    })
})

module.exports = router