require('dotenv').config();

const app = require('./src/app');

const port = process.env.PORT || 3005;

app.listen(port, () => {
  console.log(`[Notification] Server running on port ${port}`);
});
