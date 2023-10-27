const mongoose = require("mongoose");

const travelSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: false,
		},
		cover: {
			type: String,
			required: false,
			default:
				"https://www.orbitaltravel.co.uk/application/files/2215/4809/3160/panarama.jpg",
		},
		price: {
			type: Number,
			required: true,
			min: 1,
		},
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model("travelModel", travelSchema, "travels");
