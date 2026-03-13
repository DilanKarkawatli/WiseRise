import dotenv from "dotenv";
import express from "express";
import alarmRoutes from "./routes/alarmRoutes.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

// Create an instance of the Express application
const app = express();

// Enables the app to read JSON data from the request body
app.use(express.json());
// Register routes
app.use("/", alarmRoutes);

app.get("/", (req, res) => {
	res.send("API running");
});

// Start the server and listen on port 3000
app.listen(PORT, () => {
	  console.log(`Server is running on port ${PORT}`);
});