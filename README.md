

Deploy to Heroku
----------------

Set keys to .env:

	NNN=xyz

Set keys to Heroku dashboard app settings: https://dashboard.heroku.com/apps/

Run locally:

	heroku local

Deploy to Heroku:

	git push heroku master

Tail Heroku logs:

	heroku logs --tail


TODO
====

- Inserts with post (when closer to production use)
- Security:
    - Encode/validate user input before use
    - Headers: https://blog.risingstack.com/node-hero-node-js-security-tutorial/
- Throttling (ip?) - where to save? Use check-in data

Later:

- If places are imported & updated from external source(s), each must have an unique, persisten identifier. This then should be mapped into a short, human-readable identifiers, preferably capital letters.