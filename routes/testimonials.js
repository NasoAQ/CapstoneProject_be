const express = require("express");
const testimonialModel = require("../models/testimonial");
const travelModel = require("../models/travel");
const testimonials = express.Router();

testimonials.get("/testimonials", async (req, res) => {
	try {
		const allTestimonials = await testimonialModel.find().populate("user");

		if (!allTestimonials || allTestimonials.length === 0) {
			return res.status(404).json({
				statusCode: 404,
				message: "Nessuna testimonianza trovata",
			});
		}

		res.status(200).json({
			statusCode: 200,
			testimonials: allTestimonials,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error,
		});
	}
});

testimonials.get("/travels/:id/testimonials", async (req, res) => {
	const { id } = req.params;
	try {
		const travel = await travelModel.findById(id);

		if (!travel) {
			return res.status(404).json({
				statusCode: 404,
				message: "Travel non trovato",
			});
		}
		const testimonials = await testimonialModel.find({ travel: id });

		if (!testimonials || testimonials.length === 0) {
			return res.status(404).json({
				statusCode: 404,
				message: "Nessuna testimonianza per questo travel",
			});
		}
		res.status(200).json({
			statusCode: 200,
			testimonials,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error,
		});
	}
});

testimonials.post("/travels/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const travel = await travelModel.findById(id);
		if (!travel) {
			return res.status(404).json({
				statusCode: 404,
				message: "Travel non trovato",
			});
		}
		const { testimonial, valutation } = req.body;
		const newTestimonial = new testimonialModel({
			testimonial,
			valutation,
			travel: id,
		});

		const savedTestimonial = await newTestimonial.save();
		res.status(201).send({
			statusCode: 200,
			message: "Testimonial creata",
			payload: savedTestimonial,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore durante la creazione",
			error,
		});
	}
});

testimonials.get("/travels/:id/testimonials/:testId", async (req, res) => {
	const { id, testId } = req.params;
	try {
		const travel = await travelModel.findById(id);
		if (!travel) {
			return res.status(404).json({
				statusCode: 404,
				message: "Travel non trovato",
			});
		}
		const testimonial = await testimonialModel.findOne({
			_id: testId,
			travel: id,
		});

		if (!testimonial) {
			return res.status(404).json({
				statusCode: 404,
				message: "Testimonianza non trovata",
			});
		}

		res.status(200).send({
			statusCode: 200,
			testimonial,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error,
		});
	}
});

testimonials.put("/travels/:id/testimonials/:testId", async (req, res) => {
	const { id, testId } = req.params;
	try {
		const travel = await travelModel.findById(id);
		if (!travel) {
			return res.status(404).json({
				statusCode: 404,
				message: "Travel non trovato",
			});
		}
		const verifyTestimonial = await testimonialModel.findOne({
			_id: testId,
			travel: id,
		});

		if (!verifyTestimonial) {
			return res.status(404).json({
				statusCode: 404,
				message: "Testimonianza non trovata",
			});
		}

		const { testimonial, valutation } = req.body;

		await testimonialModel.findByIdAndUpdate(testId, {
			testimonial,
			valutation,
		});

		const updatedTest = await testimonialModel.findById(testId);

		res.status(200).send({
			statusCode: 200,
			updatedTest,
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error,
		});
	}
});

testimonials.delete("/travels/:id/testimonials/:testId", async (req, res) => {
	const { id, testId } = req.params;
	try {
		const travel = await travelModel.findById(id);
		if (!travel) {
			return res.status(404).json({
				statusCode: 404,
				message: "Travel non trovato",
			});
		}
		const verifyTestimonial = await testimonialModel.findOne({
			_id: testId,
			travel: id,
		});

		if (!verifyTestimonial) {
			return res.status(404).json({
				statusCode: 404,
				message: "Testimonianza non trovata",
			});
		}
		await testimonialModel.findByIdAndDelete(testId);
		res.status(200).send({
			statusCode: 200,
			message: "Testimonianza eliminata",
		});
	} catch (error) {
		res.status(500).send({
			statusCode: 500,
			message: "Errore interno",
			error,
		});
	}
});

module.exports = testimonials;
