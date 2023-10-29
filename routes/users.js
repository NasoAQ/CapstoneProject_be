const express = require("express");
const users = express.Router();
const userModel = require("../models/user");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const crypto = require("crypto");
const multer = require("multer");
require("dotenv").config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "users_avatar",
		format: async (req, res) => "jpeg",
		public_id: (req, file) => file.name,
	},
});

const internalStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "./uploads");
	},

	filename: (req, file, cb) => {
		const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;

		const fileExtension = file.originalname.split(".").pop();
		cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
	},
});

const upload = multer({ storage: internalStorage });
const cloudUpload = multer({ storage: cloudStorage });

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

users.post("/users/upload", upload.single("avatar"), async (req, res) => {
	const url = `${req.protocol}://${req.get("host")}`;

	try {
		const imgUrl = req.file.filename;
		res.status(200).json({ cover: `${url}/uploads/${imgUrl}` });
	} catch (error) {
		res.status(500).json({
			statusCode: 500,
			message: "Errore interno del server",
		});
	}
});

users.post(
	"/users/cloudUpload",
	cloudUpload.single("avatar"),
	async (req, res) => {
		try {
			res.status(200).json({ avatar: req.file.path });
		} catch (error) {
			res.status(500).json({
				statusCode: 500,
				message: "Errore interno del server",
			});
		}
	}
);

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
