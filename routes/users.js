const express = require("express");
const users = express.Router();
const userModel = require("../models/user");
const bcrypt = require("bcrypt");

users.get("/users", async (req, res) => {
	try {
		const utenti = await userModel.find();
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

users.post("/users/create", async (req, res) => {
	try {
		const oldUser = await userModel.findOne({
			$or: [{ username: req.body.username }, { email: req.body.email }],
		});

		if (oldUser) {
			res.status(400).send({
				statusCode: 400,
				message: "Username o password non validi",
			});
		}
		const salt = await bcrypt.genSalt(10);

		const hashedPassword = await bcrypt.hash(req.body.password, salt);

		const newUser = new userModel({
			name: req.body.name,
			username: req.body.username,
			role: req.body.role,
			email: req.body.email,
			avatar: req.body.avatar,
			password: hashedPassword,
		});

		const userSaved = await newUser.save();
		res.status(201).send({
			statusCode: 200,
			message: "Utente salvato correttamente",
			payload: userSaved,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error: e,
		});
	}
});

users.patch("/users/update/:id", async (req, res) => {
	const { id } = req.params;
	const oldUser = await userModel.findById(id);

	if (!oldUser) {
		return res.status(404).send({
			statusCode: 404,
			message: "Autore insesistente",
		});
	}

	try {
		const dataToUpdate = req.body;
		const options = { new: true };
		const result = await userModel.findByIdAndUpdate(id, dataToUpdate, options);
		res.status(200).send({
			statusCode: 200,
			message: "Autore modificato correttamente",
			result,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error: e,
		});
	}
});

users.delete("/users/delete/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const user = await userModel.findByIdAndDelete(id);
		if (!user) {
			return res.status(400).send({
				statusCode: 404,
				message: "Utente insesistente",
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: "Utente cancellato",
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
