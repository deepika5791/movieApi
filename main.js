require("dotenv").config();
const app = require("./app");
const port = process.env.port;
app.listen(port, () => {
  console.log(`server is running ${port}`);
});
