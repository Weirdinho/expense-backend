const mongoose = require("mongoose")

const db = async()=>{
    try {
        mongoose.set('strictQuery', false)
        await mongoose.connect("mongodb+srv://ruruwhygee:V8YBjcvRYn9vczmo@cluster-saigono.ood1v.mongodb.net/")
        console.log('witnessing passed')
    } catch (error) {
        console.log('witnessing failed')
    }
}

module.exports = db  