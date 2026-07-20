require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5008;

app.listen(PORT, () => {
  console.log(`[${process.env.SERVICE_NAME}] running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
