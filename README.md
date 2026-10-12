# Fieldtime Digital Clock

A lightweight, responsive digital clock served by a dependency-free Java 21 HTTP server. Choose 12- or 24-hour time, show or hide seconds, switch time zones, and enter full screen. Display preferences are saved in the browser.

## Run with Docker

```sh
docker build -t digital-clock .
docker run --rm -p 8080:8080 digital-clock
```

Open <http://localhost:8080>. Set `PORT` to use a different container port.

## Build locally

Requires JDK 21 and Maven 3.9 or later.

```sh
mvn package
java -jar target/digital-clock-1.0.0.jar
```

## Jenkins

The declarative `Jenkinsfile` builds the Docker image and smoke-tests the health endpoint and served assets. The Jenkins agent needs Docker CLI access to a running daemon, plus `curl`, `sed`, and `seq`. No registry credentials or extra Jenkins plugins are required.
