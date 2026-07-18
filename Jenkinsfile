pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'vinyassk'
        DOCKER_IMAGE = "${DOCKERHUB_USERNAME}/react-cicd-app"
        HOME = '/var/lib/jenkins'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '========================================='
                echo '  STAGE 1: Checkout Source Code'
                echo '========================================='
                echo 'Pulling code from GitHub repository...'
                git branch: 'main', url: 'https://github.com/vinyassk/Exam_lab.git'
                echo 'Checkout completed successfully!'
                sh 'ls -la'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '========================================='
                echo '  STAGE 2: Install Dependencies'
                echo '========================================='
                sh '''
                    echo "Installing npm packages..."
                    npm install
                    echo "Dependencies installed successfully!"
                '''
            }
        }

        stage('Lint') {
            steps {
                echo '========================================='
                echo '  STAGE 3: Lint Check'
                echo '========================================='
                sh '''
                    echo "Running linter..."
                    npm run lint || echo "Lint completed with warnings (non-blocking)"
                '''
            }
        }

        stage('Build') {
            steps {
                echo '========================================='
                echo '  STAGE 4: Build React App'
                echo '========================================='
                sh '''
                    echo "Building production bundle..."
                    npm run build
                    echo "Build completed successfully!"
                    echo "Build output:"
                    ls -la dist/
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo '========================================='
                echo '  STAGE 5: Build Docker Image'
                echo '========================================='
                sh """
                    echo "Building Docker image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                    docker build -t ${DOCKER_IMAGE}:${env.BUILD_NUMBER} .
                    docker tag ${DOCKER_IMAGE}:${env.BUILD_NUMBER} ${DOCKER_IMAGE}:latest
                    echo "Docker image built successfully!"
                    echo "Docker images:"
                    docker images | grep react-cicd-app
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo '========================================='
                echo '  STAGE 6: Kubernetes Deployment'
                echo '========================================='
                sh """
                    echo "Loading image into Minikube..."
                    minikube image load ${DOCKER_IMAGE}:${env.BUILD_NUMBER} || true
                    echo "Updating deployment manifest..."
                    sed -i 's|image: .*|image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}|g' k8s/deployment.yaml
                    echo "Applying Kubernetes manifests..."
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml
                    echo "Waiting for rollout to complete..."
                    kubectl rollout status deployment/react-cicd-app --timeout=300s
                    echo "Deployment completed successfully!"
                """
            }
        }
    }

    post {
        success {
            echo '========================================='
            echo '   PIPELINE COMPLETED SUCCESSFULLY!     '
            echo '========================================='
            sh """
                echo "--- Deployment Summary ---"
                echo "Docker Image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                echo "Docker Image: ${DOCKER_IMAGE}:latest"
                echo ""
                echo "--- Kubernetes Status ---"
                kubectl get pods -l app=react-cicd-app
                kubectl get svc react-cicd-service
                echo ""
                echo "--- Application URL ---"
                minikube service react-cicd-service --url || true
            """
        }
        failure {
            echo '========================================='
            echo '       PIPELINE FAILED!                  '
            echo '========================================='
            sh """
                echo "--- Debug Info ---"
                kubectl get pods || true
            """
        }
        always {
            echo 'Pipeline execution completed.'
        }
    }
}
