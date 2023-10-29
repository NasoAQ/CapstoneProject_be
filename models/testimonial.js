const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "userModel",
		},
		travel: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "travelModel",
		},
		testimonial: {
			type: String,
			required: true,
		},
		valutation: {
			type: Number,
			required: true,
			min: 1,
		},
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model(
	"testimonialModel",
	TestimonialSchema,
	"testimonials"
);
