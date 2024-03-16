# About

Administration pages for supercharge.info

## Run Locally

### Localhost only

`npm start`

http://localhost:9292/

### Running an open development server (choose port and comma-separated list of allowed hostnames)

`npm start -- --env open --env port=9393 --env hosts=mydevsite,mydevsite.dev.supercharge.info`

http://mydevsite:9393/ or http://mydevsite.dev.supercharge.info:9393/

## Other Tools

### Fix linting issues

`npm run lint`

### Package

`npm run prodbuild`

### Release version and push to origin/master

`npm run release`

### Deploy

`./deploy.sh <test|prod>`

