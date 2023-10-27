const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			require: true,
			min: 8,
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		avatar: {
			type: String,
			required: false,
			default:
				"https://media.istockphoto.com/id/1393750072/vector/flat-white-icon-man-for-web-design-silhouette-flat-illustration-vector-illustration-stock.jpg?s=612x612&w=0&k=20&c=s9hO4SpyvrDIfELozPpiB_WtzQV9KhoMUP9R9gVohoU=",
		},
	},
	{ timestamps: true, strict: true }
);

module.exports = mongoose.model("User", usersSchema, "users");
