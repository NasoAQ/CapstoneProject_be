const express = require("express");
const users = express.Router();
const Users = require("../models/user");

users.get("/users", async (req, res) => {
	try {
		const utenti = await Users.find();
		res.status(200).send({
			statusCode: 200,
			utenti,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error: e,
		});
	}
});

module.exports = users;
