```groovy
pipeline {
    agent any

    environment {
        IMAGE = "digital-clock:${BUILD_NUMBER}"
        CONTAINER_NAME = "digital-clock-${BUILD_NUMBER}"
    }

    stages {
        stage('Build image') {
            steps {
                bat 'docker build --tag "%IMAGE%" .'
            }
        }

        stage('Smoke test') {
            steps {
                bat '''
                    @echo off
                    docker run -d --rm --name "%CONTAINER_NAME%" -p 127.0.0.1:18080:8080 "%IMAGE%"
                    if errorlevel 1 exit /b 1

                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ready=$false; for($i=0;$i -lt 30;$i++){ try { $r=Invoke-WebRequest -Uri 'http://127.0.0.1:18080/health' -TimeoutSec 2; if($r.StatusCode -eq 200){$ready=$true;break} } catch {}; Start-Sleep -Seconds 1 }; if(-not $ready){exit 1}"

                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$r=Invoke-WebRequest -Uri 'http://127.0.0.1:18080/' -TimeoutSec 5; if($r.Content -notmatch 'Digital Clock'){exit 1}"

                    powershell -NoProfile -ExecutionPolicy Bypass -Command "$r=Invoke-WebRequest -Uri 'http://127.0.0.1:18080/styles.css' -TimeoutSec 5; if($r.Content -notmatch 'clock-app'){exit 1}"
                '''
            }
        }
    }

    post {
        always {
            bat 'docker rm --force "%CONTAINER_NAME%" 2>nul || exit /b 0'
        }
    }
}
```