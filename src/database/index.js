const mongoose = require('mongoose')

class Database {
    constructor() {
        this.init()
    }

    init() {
        console.log('Mongo: ', process.env.LOCAL_MONGO)
        try {
            mongoose.connect(process.env.LOCAL_MONGO, {
                useCreateIndex: true,
                useNewUrlParser: true,
                useFindAndModify: true,
                useUnifiedTopology: true,
            })

            console.log('Database connected!')
        } catch (e) {
            console.log("Database didn't connect!")
        }
    }
}

module.exports = new Database()
