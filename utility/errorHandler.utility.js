const errorHandler = (statusCode = 500, message = 'Internal Server Error') => {
    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
    error.success = false;
  
    console.log(error)
    return error;
  };
  
export default errorHandler;