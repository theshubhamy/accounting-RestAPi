export const corsError = (req, res, next) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Origin, X-Requested-With, X-Callback-Type, Accept",
    "Cache-Control": "no-cache",
  });
  next();
};
