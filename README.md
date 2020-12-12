![E2E Testing](https://github.com/abotkit/dolores/workflows/E2E%20Testing/badge.svg?branch=main)

# dolores
dolores is the abotkit react-based ui 

# Quickstart

```zsh
npm i

# in development mode
export PORT=21520 # or any other port you prefer
npm start

# for production usage
npm run build
node dolores.js
```

# Environment variables

:exclamation: Use REACT_APP prefix in development - see [.env.development](.env.development) file :exclamation:

|         name        |        description             |    default                          |
|---------------------|--------------------------------|-------------------------------------|
| ABOTKIT_MAEVE_URL | Url of your running maeve instance  |   'http://localhost:3000'   |
| ABOTKIT_DOLORES_PORT | Port for starting dolores  |   21520               |
| ABOTKIT_DOLORES_USE_KEYCLOAK | Use keycloak as security mechanism | 'false' |
| ABOTKIT_DOLORES_KEYCLOAK_URL | Host of a running keycloak instance | 'http://localhost:8080' |
| ABOTKIT_DOLORES_KEYCLOAK_CLIENT_ID | Your keycloak abotkit client id | 'abotkit-local' |
| ABOTKIT_DOLORES_KEYCLOAK_REALM | The keycloak abotkit realm | 'abotkit' |
| ABOTKIT_DOLORES_PROXY_KEYCLOAK | Allow dolores to use /auth endpoint to proxy the keycloak instance | false |
| ABOTKIT_DOLORES_PROXY_MAEVE | Allow dolores to use /api endpoint to proxy the maeve instance | false |

# Issues

We use our [main repository](https://github.com/abotkit/abotkit) to track our issues. Please use [this site](https://github.com/abotkit/abotkit/issues) to report an issue. Thanks! :blush:
