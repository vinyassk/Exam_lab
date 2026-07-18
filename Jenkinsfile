pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'vinyassk'
        DOCKER_IMAGE = "${DOCKERHUB_USERNAME}/react-cicd-app"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '========================================='
                echo '  STAGE 1: Checkout Source Code'
                echo '========================================='
                git branch: 'main', url: 'https://github.com/vinyassk/Exam_lab.git'
                echo 'Checkout completed!'
                sh 'ls -la'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '========================================='
                echo '  STAGE 2: Install Dependencies'
                echo '========================================='
                sh '''
                    export PATH="/tmp/node-v20.19.0-linux-x64/bin:$PATH"
                    node --version
                    npm --version
                    echo "Installing npm packages..."
                    npm install
                    echo "Dependencies installed!"
                '''
            }
        }

        stage('Lint') {
            steps {
                echo '========================================='
                echo '  STAGE 3: Lint Check'
                echo '========================================='
                sh '''
                    export PATH="/tmp/node-v20.19.0-linux-x64/bin:$PATH"
                    echo "Running linter..."
                    npm run lint
                '''
            }
        }

        stage('Build') {
            steps {
                echo '========================================='
                echo '  STAGE 4: Build React App'
                echo '========================================='
                sh '''
                    export PATH="/tmp/node-v20.19.0-linux-x64/bin:$PATH"
                    echo "Building production bundle..."
                    npm run build
                    echo "Build completed!"
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
                    echo "Docker image built!"
                    docker images | grep react-cicd-app
                """
            }
        }

        stage('Docker Push') {
            steps {
                echo '========================================='
                echo '  STAGE 6: Push to Docker Hub'
                echo '========================================='
                sh """
                    echo "Pushing to Docker Hub..."
                    echo "vinu@1234" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                    docker push ${DOCKER_IMAGE}:${env.BUILD_NUMBER}
                    docker push ${DOCKER_IMAGE}:latest
                    echo "Push completed!"
                """
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo '========================================='
                echo '  STAGE 7: Kubernetes Deployment'
                echo '========================================='
                sh """
                    export PATH="/tmp/node-v20.19.0-linux-x64/bin:\$PATH"
                    export KUBECONFIG=/tmp/kubeconfig_fixed
                    echo "Loading image into Minikube..."
                    minikube image load ${DOCKER_IMAGE}:${env.BUILD_NUMBER} || true
                    echo "Updating deployment manifest..."
                    sed -i 's|image: .*|image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}|g' k8s/deployment.yaml
                    echo "Applying Kubernetes manifests..."
                    /tmp/kubectl apply -f k8s/deployment.yaml
                    /tmp/kubectl apply -f k8s/service.yaml
                    echo "Waiting for rollout..."
                    /tmp/kubectl rollout status deployment/react-cicd-app --timeout=300s
                    echo "Deployment completed!"
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
                export PATH="/tmp/node-v20.19.0-linux-x64/bin:\$PATH"
                export KUBECONFIG=/tmp/kubeconfig_fixed
                echo "--- Deployment Summary ---"
                echo "Docker Image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                echo ""
                echo "--- Kubernetes Status ---"
                /tmp/kubectl get pods -l app=react-cicd-app
                /tmp/kubectl get svc react-cicd-service
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
                export KUBECONFIG=/tmp/kubeconfig_fixed
                /tmp/kubectl get pods || true
            """
        }
        always {
            echo 'Pipeline execution completed.'
        }
    }
}
