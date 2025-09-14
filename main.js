require("dotenv").config();
const app = require("./app");
const Port = process.env.Port || 3000;
app.listen(Port, () => {
  console.log(`server is running ${port}`);
});
