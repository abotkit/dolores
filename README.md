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
| ABOTKIT_MAEVE_URL | url of your running maeve instance  |   'http://localhost'   |
| ABOTKIT_MAEVE_PORT | port of your running maeve instance  |   3000               |
| ABOTKIT_DOLORES_PORT | port for starting dolores  |   21520               |
| ABOTKIT_DOLORES_USE_KEYCLOAK | use keycloak as security mechanism | 'false' |
| ABOTKIT_DOLORES_KEYCLOAK_URL | host of a running keycloak instance | 'http://localhost' |
| ABOTKIT_DOLORES_KEYCLOAK_PORT | port of a running keycloak instance | '8080' |
| ABOTKIT_DOLORES_KEYCLOAK_CLIENT_ID | your keycloak abotkit client id | 'abotkit-local' |
| ABOTKIT_DOLORES_KEYCLOAK_REALM | the keycloak abotkit realm | 'abotkit' |

# Issues

We use our [main repository](https://github.com/abotkit/abotkit) to track our issues. Please use [this site](https://github.com/abotkit/abotkit/issues) to report an issue. Thanks! :blush:
