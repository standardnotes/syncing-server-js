# Standard Notes Syncing Server

You can run your own Standard Notes server and use it with any Standard Notes app. This allows you to have 100% control of your data. This server is built with TypeScript and can be deployed in minutes.

**Requirements**

- Docker

**Data persistency**

Your MySQL Data will be written to your local disk in the `data` folder to keep it persistent between server runs.

### Getting started

1. Clone the project:

	```
	git clone --branch main https://github.com/standardnotes/syncing-server-js.git
	```

1. Setup the server by running:
```
./server.sh setup
```

1. Run the server by typing:
```
./server.sh start
```

Your server should now be available under http://localhost:3000

**Note**: When running the server locally it is by default ran in a Hot Reload Mode. This means that every time you change any of the source files locally the server is restarted to reflect the changes. This is in particular helpful when doing local development.

### Logs

You can check the logs of the running server by typing:

```
./server.sh logs
```

### Stopping the Server

In order to stop the server type:
```
./server.sh stop
```

### Updating to latest version

In order to update to the latest version of our software type:

```
./server.sh update
```

### Checking Status

You can check the status of running services by typing:
```
./server.sh status
```

### Cleanup Data

Please use this step with caution. In order to remove all your data and start with a fresh environment please type:
```
./server.sh cleanup
```

### Tests

To execute all of the test specs, run the following command at the root of the project directory:

```bash
yarn test
```
