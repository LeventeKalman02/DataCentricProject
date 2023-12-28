var findAll = function (coll) {
    return new Promise((resolve, reject) => {
        var cursor = coll.find()
        cursor.toArray()
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

var addManager = function (coll, manager) {
    return new Promise((resolve, reject) => {
        coll.insertOne(manager)
        .then((result) => {
            resolve(result)
        })
        .catch((error) => {
            reject(error)
        })
    })
}

module.exports = {findAll, addManager};