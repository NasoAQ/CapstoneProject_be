const express = require("express");
const travelModel = require("../models/travel");
const travels = express.Router();
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const crypto = require("crypto");
require("dotenv").config();

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: "travels",
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

travels.get("/travels", async (req, res) => {
	const { page = 1, pageSize = 12 } = req.query;
	try {
		const travels = await travelModel
			.find()
			.limit(pageSize)
			.skip((page - 1) * pageSize);

		const totalTravels = await travelModel.count();
		res.status(200).send({
			statusCode: 200,
			currentPage: Number(page),
			totalPages: Math.ceil(totalTravels / pageSize),
			totalTravels,
			travels,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			e,
		});
	}
});

travels.get("/travels/category/:category", async (req, res) => {
	const { page = 1, pageSize = 12 } = req.query;
	const { category } = req.params;
	try {
		const travels = await travelModel
			.find({ category })
			.limit(pageSize)
			.skip((page - 1) * pageSize);

		const totalTravels = await travelModel.count({ category });
		res.status(200).send({
			statusCode: 200,
			currentPage: Number(page),
			totalPages: Math.ceil(totalTravels / pageSize),
			totalTravels,
			travels,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			e,
		});
	}
});

travels.get("/travels/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const travel = await travelModel.findById(id);
		if (!travel) {
			return res.status(404).send({
				statusCode: 404,
				message: "Travel post inesistente",
			});
		}
		res.status(200).send({
			statusCode: 200,
			travel,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			e,
		});
	}
});

travels.post(
	"/travels/cloudUpload",
	cloudUpload.single("cover"),
	async (req, res) => {
		try {
			res.status(200).json({ cover: req.file.path });
		} catch (error) {
			res.status(500).json({
				statusCode: 500,
				message: "Errore interno del server",
			});
		}
	}
);

travels.post("/travels/upload", upload.single("cover"), async (req, res) => {
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

travels.post("/travels/create", async (req, res) => {
	const newTravel = new travelModel({
		category: req.body.category,
		title: req.body.title,
		cover: req.body.cover,
		content: req.body.content,
		price: req.body.price,
	});
	try {
		const travel = await newTravel.save();
		res.status(201).send({
			statusCode: 201,
			message: "Nuovo travel salvato correttamente",
			payload: travel,
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error: e,
		});
	}
});

travels.delete("/travels/delete/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const travel = await travelModel.findByIdAndDelete(id);
		if (!travel) {
			return res.status(404).send({
				statusCode: 404,
				message: "Travel non esistente",
			});
		}
		res.status(200).send({
			statusCode: 200,
			message: "Travel eliminato correttamente",
		});
	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error: e,
		});
	}
});

travels.patch("/travels/update/:id", async (req, res) => {
	const { id } = req.params;
	const travelExist = await travelModel.findById(id);

	if (!travelExist) {
		return res.status(404).send({
			statusCode: 404,
			message: "Il travel non esiste",
		});
	}

	try {
		const dataToUpdate = req.body;
		const options = { new: true };
		const result = await travelModel.findByIdAndUpdate(
			id,
			dataToUpdate,
			options
		);

		res.status(200).send({
			statusCode: 200,
			message: "Travel post modificato correttamente",
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

module.exports = travels;
