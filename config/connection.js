const mongoose = require("mongoose")

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

const connect = () => {
    mongoose.connect(`mongodb+srv://${dbUser}:${dbPassword}@cluster0.9cdm2.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0`)

    const connection = mongoose.connection;

    connection.on("err", () => {
        console.log("Erro ao se conectar ao mongoDB");
    })

    connection.on("open", () => {
        console.log("Conectado ao mongoDB com sucesso!")
    })
}

connect()

module.exports = mongoose;