# Desire Path
Desire Path is a project that serves as a link shortener, developed using NodeJS. The term "Desire Path" references the concept of [desire paths](https://d.lumaa.fr/OWjnoR) — informal trails created as people repeatedly take preferred routes rather than the official paths provided. This analogy is fitting for a link shortener, as it creates the most direct and efficient way to access web content.

Before filling a new GitHub issue, please see if it isn't already mentionned in the [Issues](#issues) section.

## Cache
This link shortener contains a cache, it is unaccessible directly but, the cache adds a redirection when the API calls one or when someone gets redirected.\
If your database does not work or crashes, the cache will take the torch, and redirect the users to the cached link.

The cache gets cleared when this program stops or crashes.

## API
Desire Path also provides a small but leverageable API for a remote access to the database. Most of the request need to use the Authorization used in the [config.json](./api/config_TEMPLATE.json) file, except the [GET /api/link](#get-apilink) request.

### Available Requests
- [GET /api/links](#get-apilinks) - Get all the existing redirections
- [GET /api/link](#get-apilink) - Get a specific redirection using an `id`
- [POST /api/link](#post-apilink) - Create a new redirection using a `url` and, optionally, an `id`
- [DELETE /api/link](#delete-apilink) - Delete a redirection using an `id`


### GET /api/links
This does not need any parameters, but does need the Authorization from the [config.json](./api/config_TEMPLATE.json) file.

Returns:
```json
[
    {
        "id": "URL_ID",
        "url": "https://example.com/"
    },
    ...
]
```

### GET /api/link
This requires the `id` query used as such `/api/link?id=[URL_ID]`, and does **not** need the Authorization.

Returns:
```json
{
    "id": "URL_ID",
    "url": "https://example.com/"
}
```

### POST /api/link
This requires the `url` and optionally the `id` parameters in the **body** of the request, and does need the Authorization.

If you do not provide an `id` parameter, then Desire Path will create a 6 character code using only letters both lowercase and uppercase. Which makes a 0.00000000506% of having duplicates.

Returns: `Created /[URL_ID] redirection`

### DELETE /api/link
This requires the `id` query, and does need the Authorization.

Returns: `Success`

## Issues
- It is possible to be redirected to a URL even though only the last component matches.
- Currently, it is possible to create 2 redirections that uses the same `id`, which will be fixed later.

## License
<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/lumaa-dev/DesirePath">Desire Path</a> © 2024-2025 by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://lumaa.fr/">Lumaa</a> is licensed under <a href="https://creativecommons.org/licenses/by-nd/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">Creative Commons Attribution-NoDerivatives 4.0 International<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nd.svg?ref=chooser-v1" alt=""></a></p>