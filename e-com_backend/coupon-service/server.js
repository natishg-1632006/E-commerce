require("dotenv").config();

const app = require("./src/app");

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`
====================================================
🚀 Coupon Service Started Successfully
====================================================
Service : ${process.env.SERVICE_NAME}
Port    : ${PORT}
Mode    : ${process.env.NODE_ENV}
Health  : http://localhost:${PORT}/health
API     : http://localhost:${PORT}/api/coupons
====================================================
  `);
});