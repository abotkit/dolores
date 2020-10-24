# dolores
dolores is the abotkit react-based ui 

# quickstart

```zsh
npm i

# in development mode
export PORT=21520 # or any other port you prefer
npm start

# for production usage
npm i -g serve

npm run build
serve -l $ABOTKIT_DOLORES_PORT -s build
```

# environment variables

|         name        |        description             |    default                          |
|---------------------|--------------------------------|-------------------------------------|
| REACT_APP_ABOTKIT_MAEVE_URL | url of your running maeve instance  |   'http://localhost'   |
| REACT_APP_ABOTKIT_MAEVE_PORT | port of your running maeve instance  |   3000               |
| ABOTKIT_DOLORES_PORT | port for starting dolores  |   21520               |