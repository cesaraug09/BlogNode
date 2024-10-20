module.exports = {
    ehAdmin: (req,res,next) => {
        if(req.isAuthenticated() && req.user.ehAdmin == 1){
            return next();
        }
        req.flash("error_msg", "Você precisa ser um Admin para acessar essa rota!")
        res.redirect("/")
    }
}