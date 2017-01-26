

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

Call
----

Populate db with sample data (replace host & apikey):

    curl -H "Content-Type: application/json" -X POST -d '{"placeId": "FM", "type":"tower","name":"Fiskarsinmäen lintutorni", "ornithologicalSociety":"tringa", "lat": 60.176438, "lon": 24.571117}' 'BOWERBIRD_HOST/post?apikey=BOWERBIRD_APIKEY&bowerbird_set=cit_places'

TODO
====

- Security
- Throttling (ip?)
- Spead into different collections?
