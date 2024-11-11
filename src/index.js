import { configDotenv } from "dotenv";
import app from "./app.js";
configDotenv();

app.get("/", (req, res) => {
  res.json({ message: "Hello World" });
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
