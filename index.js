const mysql = require("mysql2");
const express = require("express");
const { api: port, sql } = require("./general.json");
const { accessKey } = require("./api/config.json");
const { cache, fetchCache, addCache } = require("./api/api");
const fs = require("fs");

const listHtmlRep = `<!-- [DP_REPLACE] -->`

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
			// doesn't work
			pool.query(
				`SELECT id, url FROM links`,
				(error, results) => {
					if (error) {
						console.error(error);
						res.status(500).send(error);
					} else {
						if (results.length < 1) {
							let html = fs.readFileSync(`${__dirname}/link/nothing.html`, {
								encoding: "utf-8",
							});
							res.status(200).send(html);
						} else {
							let html = fs.readFileSync(`${__dirname}/link/list.html`, {
								encoding: "utf-8",
							});
							
							const htmlList = results.map((reslt) => listElm(reslt.id, reslt.url))
							html.replace(listHtmlRep, htmlList.joined("\n"))
							
							res.status(200).send(html);
						}
					}
				}
			);
			res.status(200).send(html);
		} else {
			let html = fs.readFileSync(`${__dirname}/link/nothing.html`, {
				encoding: "utf-8",
			});
			res.status(200).send(html);
		}
	} else {
		let cached = fetchCache(urlId);
		if (cached !== null) {
			res.redirect(cached.url);
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
							addCache(urlId, first["url"]);
							res.redirect(first["url"]);
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
	}
});

function listElm(id, url) {
	let html = ```
	<span class="link"><p class="id">${id}</p><p> | </p><a href="${url}">${url}</a></span>
	```

	return html
}

app.listen(port, () => {
	console.log("Hello API");
	require("./api/api") // call other paths
});

module.exports = {
	pool,
	app,
};
