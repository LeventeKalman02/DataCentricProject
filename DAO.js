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

module.exports = {findAll};