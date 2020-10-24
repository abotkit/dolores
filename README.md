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

|         name        |        description             |    default                          |
|---------------------|--------------------------------|-------------------------------------|
| REACT_APP_ABOTKIT_MAEVE_URL (develop) | url of your running maeve instance  |   'http://localhost'   |
| REACT_APP_ABOTKIT_MAEVE_PORT (develop) | port of your running maeve instance  |   3000               |
| ABOTKIT_MAEVE_URL (production) | url of your running maeve instance  |   'http://localhost'   |
| ABOTKIT_MAEVE_PORT (production) | port of your running maeve instance  |   3000               |
| ABOTKIT_DOLORES_PORT | port for starting dolores  |   21520               |