const { accessKey } = require("./config.json");
const { app, pool } = require("../index");

/**@type {{ id: string, url: string }[]} */
const cache = []

app.get("/api/links", (req, res) => {
	const auth = req.headers.authorization;

	if (auth !== accessKey)
		return res.status(401).send("Incorrect Authorization");

	pool.query("SELECT id, url FROM links", (error, results) => {
		if (error) {
			console.error(error);
			res.status(500).send(error);
		} else {
			res.status(200).send(results);
		}
	});
});

app.get("/api/link", (req, res) => {
	const { id } = req.query;

	console.log(`getting ${id}`);

	const cached = fetchCache(id)
	if (cached !== null) {
		res.status(200).send(cached.url);
	} else {
		pool.query(
			"SELECT url FROM links WHERE id = '" + id + "'",
			(error, results) => {
				if (error) {
					console.error(error);
					res.status(500).send(error);
				} else {
					if (results.length > 0) {
						addCache(id, results[0])
						res.status(200).send(results[0]);
					} else {
						res.status(404).json({error: "Unknown"});
					}
				}
			}
		)
	}
});

app.post("/api/link", (req, res) => {
	const { id, url } = req.body;
	const auth = req.headers.authorization;
	
	if (auth !== accessKey)
		return res.status(401).send("Incorrect Authorization");
	if (!url)
		return res.status(500).send("Missing URL")

	var urlId = typeof id == "string" ? (id.length > 0 ? id.toLowerCase() : generateRandomCode()) : generateRandomCode()
	console.log(`adding ${urlId}`);

	if (fetchCache(urlId) !== null)
		return res.status(300).send("ID already used in cache")

	pool.query(
		`INSERT INTO links (id, url) VALUES ('${urlId}', '${url}')`,
		(error, _) => {
			if (error) {
				console.error(error);
				res.status(500).send(error);
			} else {
				res.status(200).send(`Created /${urlId} redirection`);
			}
		}
	);
});

app.delete("/api/link", (req, res) => {
	const { id } = req.query;
	const auth = req.headers.authorization;

	if (auth !== accessKey)
		return res.status(401).send("Incorrect Authorization");

	console.log(`deleting ${id}`);
	removeCache(id)

	pool.query(`DELETE FROM links WHERE id = '${id}'`, (error, _) => {
		if (error) {
			console.error(error);
			res.status(500).send(error);
		} else {
			res.status(200).send("Success");
		}
	});
});

/**
 * Creates a random code from A to Z, both lowercase and uppercase.
 * @param {number} length For a 6 character code, there are 0.00000000506% chances to have duplicates; better gamble then.
 * @returns {string} The character code
 */
function generateRandomCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let randomCode = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomCode += characters[randomIndex];
    }

    return randomCode;
}

function addCache(id, url) {
	cache.push({ id, url })
}

/**
 * @param {string} id 
 * @returns {{ id: string; url: string } | null}
 */
function fetchCache(id) {
	let res = cache.filter((tab) => { tab.id == id })
	return res.length > 0 ? res[0] : null
}

function removeCache(id) {
	let res = cache.filter((tab) => { tab.id == id })
	if (res.length > 0) {
		let tab = res[0]
		cache.splice(cache.indexOf(tab), 1)
		console.log(`Removed /${tab.id} of cache`);
	}
}