function errorhandler(err, req, res, next){
    if(err.name === "UnauthorizedError") {
        //jwt authentication error
       return res.status(401).json({message: "The user is not authorized"})
    }

    if(err.name === 'ValidationError'){
        //vallidation error
       return res.status(401).json({message: err})
    }
    
    // default error
    return res.status(500).json(err)
}

module.exports = {
    errorhandler
};