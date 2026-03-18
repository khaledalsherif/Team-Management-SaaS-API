import AppError from '../utils/appError';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Somthing went wrong!',
    });
  }
};
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate fields value: "${err.meta?.driverAdapterError?.cause?.originalMessage}".Please try another one.`;
  return new AppError(message, 400);
};
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };

  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (error.code === 'P2002') {
      error = handleDuplicateFieldsDB(error);
    }

    sendProdError(error, res);
  }
};

export default globalErrorHandler;
