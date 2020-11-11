# dolores
dolores is the abotkit react-based ui 

# quickstart

```zsh
npm i

# in development mode
export PORT=21520 # or any other port you prefer
npm start

# for production usage
npm run build
node dolores.js
```

# environment variables

(Use REACT_APP prefix in development - see .env.development file)

|         name        |        description             |    default                          |
|---------------------|--------------------------------|-------------------------------------|
| ABOTKIT_MAEVE_URL (production) | url of your running maeve instance  |   'http://localhost'   |
| ABOTKIT_MAEVE_PORT (production) | port of your running maeve instance  |   3000               |
| ABOTKIT_DOLORES_PORT | port for starting dolores  |   21520               |
| ABOTKIT_DOLORES_USE_KEYCLOAK | use keycloak as security mechanism | 'false' |
| ABOTKIT_DOLORES_KEYCLOAK_URL | host of a running keycloak instance | 'http://localhost' |
| ABOTKIT_DOLORES_KEYCLOAK_PORT | port of a running keycloak instance | '8080' |