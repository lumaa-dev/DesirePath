const mysql = require("mysql");
const express = require("express");
const { api: port, sql } = require("./general.json");
const { accessKey } = require("./api/config.json");
const fs = require("fs");

const pool = mysql.createPool(sql);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.all(/^\/(?!api\/).*/, (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    
	let path = req.url.toLowerCase().split("?")[0];
	let queries = req.url.split("?")[1];
	
	const splitPath = path.split(/\/+/g)
	const urlId = splitPath[splitPath.length - 1]
	
	if (path.endsWith("list") && queries) {
		var obj = {};
		for (let i = 0; i < queries.split("&").length; i++) {
			const q = queries.split("&")[i];
			obj[q.split("=")[0].toLowerCase()] = q.split("=")[1];
		}

		if (obj["key"] == accessKey) {
			let html = fs.readFileSync(`${__dirname}/link/list.html`, {
				encoding: "utf-8",
			});
			res.status(200).send(html);
		} else {
			let html = fs.readFileSync(`${__dirname}/link/nothing.html`, {
				encoding: "utf-8",
			});
			res.status(200).send(html);
		}
	} else {
		pool.query(
			`SELECT url FROM links WHERE id = '${urlId}'`,
			(error, results) => {
				if (error) {
					console.error(error);
					res.status(500).send(error);
				} else {
					let first = results[0];
					if (first) {
					    res.redirect(first["url"])
					} else {
						let html = fs.readFileSync(`${__dirname}/link/nothing.html`, {
							encoding: "utf-8",
						});
						res.status(200).send(html);
					}
				}
			}
		);
	}
});

app.listen(port, () => {
	console.log("Hello API");
	require("./api/api") // call other paths
});

module.exports = {
	pool,
	app,
};
