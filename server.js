const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const usersRoute = require("./routes/users");

const PORT = 5050;

const app = express();

app.use("/", usersRoute);

mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error during db connection"));
db.once("open", () => {
	console.log("Database connected");
});

app.listen(PORT, () => console.log(`Server up and running on port ${PORT}`));
