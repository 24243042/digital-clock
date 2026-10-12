pipeline {
    agent any

    environment {
        IMAGE = "digital-clock:${BUILD_NUMBER}"
        CONTAINER_NAME = "digital-clock-${BUILD_NUMBER}"
    }

    stages {
        stage('Build image') {
            steps {
                sh 'docker build --tag "$IMAGE" .'
            }
        }
        stage('Smoke test') {
            steps {
                sh '''
                    set -eu
                    docker run --detach --rm --name "$CONTAINER_NAME" \\
                        --publish 127.0.0.1::8080 "$IMAGE"
                    port=$(docker port "$CONTAINER_NAME" 8080/tcp | sed 's/.*://')
                    ready=false
                    for attempt in $(seq 1 30); do
                        if curl --fail --silent "http://127.0.0.1:$port/health" >/dev/null; then
                            ready=true
                            break
                        fi
                        sleep 1
                    done
                    test "$ready" = true
                    curl --fail --silent "http://127.0.0.1:$port/" | grep -q 'Digital Clock'
                    curl --fail --silent "http://127.0.0.1:$port/styles.css" | grep -q 'clock-app'
                '''
            }
        }
    }

    post {
        always {
            sh 'docker rm --force "$CONTAINER_NAME" >/dev/null 2>&1 || true'
        }
    }
}
