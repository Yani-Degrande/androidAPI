## Requirements

We expect that the following software is already installed:

- [NodeJS](https://nodejs.org)
- [Yarn](https://yarnpkg.com)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- ...

# Securtity Backend

## Start the application

First install the dependencies using `yarn install`.

To start the React app, create a `.env` file in the root of this folder with the following contents:

```sh
NODE_ENV=development
PORT=9000
DATABASE_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
JWT_SECRET=
FRONTEND_URL=
EMAIL_USERNAME=
EMAIL_PASSWORD=
MFA_JWT_EXPIRES_IN='4m'
```

Then run `yarn start`.
