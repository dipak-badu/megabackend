const asyncHandler = (requestHandler)=>{
  return (req, res, next) =>{
    Promise.resolve(requestHandler(req, res, next))
    .catch((err)=>next(err));
 }
}

export { asyncHandler };


/*
            //   using try catch 
            //  this is higher order funbcton  

const asyncHandler = (fn) = async(req, res, next)=>{           
    try {
    await fn(req, res, next);
    } catch (error) {
    res.status(error.code || 500).json({
    success:true,
    message:error.message
    })  
} 
} */