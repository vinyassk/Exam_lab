pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = 'vinyassk'
        DOCKER_IMAGE = "${DOCKERHUB_USERNAME}/react-cicd-app"
        NODE_VERSION = '20.19.0'
        PATH_NODE = "/home/mca/node20/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '========================================='
                echo '  STAGE 1: Checkout Source Code'
                echo '========================================='
                echo 'Pulling code from GitHub repository...'
                git branch: 'main', url: 'https://github.com/vinyassk/Exam_lab.git'
                echo 'Checkout completed!'
                sh 'ls -la'
            }
        }

        stage('Setup Node.js 20') {
            steps {
                echo '========================================='
                echo '  STAGE 2: Setup Node.js 20'
                echo '========================================='
                sh '''
                    export PATH="/home/mca/node20/bin:$PATH"
                    node --version
                    npm --version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '========================================='
                echo '  STAGE 3: Install Dependencies'
                echo '========================================='
                sh '''
                    export PATH="/home/mca/node20/bin:$PATH"
                    echo "Installing npm packages..."
                    npm install
                    echo "Dependencies installed!"
                '''
            }
        }

        stage('Lint') {
            steps {
                echo '========================================='
                echo '  STAGE 4: Lint Check'
                echo '========================================='
                sh '''
                    export PATH="/home/mca/node20/bin:$PATH"
                    echo "Running linter..."
                    npm run lint || echo "Lint completed with warnings"
                '''
            }
        }

        stage('Build') {
            steps {
                echo '========================================='
                echo '  STAGE 5: Build React App'
                echo '========================================='
                sh '''
                    export PATH="/home/mca/node20/bin:$PATH"
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
                echo '  STAGE 6: Build Docker Image'
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
                echo '  STAGE 7: Push to Docker Hub'
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
                echo '  STAGE 8: Kubernetes Deployment'
                echo '========================================='
                sh """
                    export KUBECONFIG=/home/mca/.kube/config
                    echo "Loading image into Minikube..."
                    minikube image load ${DOCKER_IMAGE}:${env.BUILD_NUMBER} || true
                    echo "Updating deployment manifest..."
                    sed -i 's|image: .*|image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}|g' k8s/deployment.yaml
                    echo "Applying Kubernetes manifests..."
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml
                    echo "Waiting for rollout..."
                    kubectl rollout status deployment/react-cicd-app --timeout=300s
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
                export KUBECONFIG=/home/mca/.kube/config
                echo "--- Deployment Summary ---"
                echo "Docker Image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
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
                export KUBECONFIG=/home/mca/.kube/config
                kubectl get pods || true
            """
        }
        always {
            echo 'Pipeline execution completed.'
        }
    }
}
