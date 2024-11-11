import express from "express";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoute.js";

const app = express();

app.use(express.json());

app.use("/api/user", authRoutes);
app.use("/api/products", productRoutes);
export default app;
//app.use(express.json()) allows the server to understand JSON data in the body of incoming requests. This is useful for handling requests that send data in JSON format, like from APIs.
