pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'vinyassk'
        DOCKER_IMAGE = "${DOCKERHUB_USERNAME}/react-cicd-app"
        KUBERNETES_NAMESPACE = 'default'
        KUBECONFIG = credentials('kubeconfig')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code from GitHub...'
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: [[
                        url: 'https://github.com/vinyassk/Exam_lab.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                sh '''
                    cd react-cicd-app
                    npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                echo 'Running tests...'
                sh '''
                    cd react-cicd-app
                    npm run lint || true
                '''
            }
        }

        stage('Build React App') {
            steps {
                echo 'Building React application...'
                sh '''
                    cd react-cicd-app
                    npm run build
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building Docker image...'
                script {
                    docker.build("${DOCKER_IMAGE}:${env.BUILD_NUMBER}")
                    docker.build("${DOCKER_IMAGE}:latest")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Logging in to Docker Hub and pushing image...'
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'dockerhub-credentials') {
                        docker.image("${DOCKER_IMAGE}:${env.BUILD_NUMBER}").push()
                        docker.image("${DOCKER_IMAGE}:latest").push()
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes cluster...'
                script {
                    sh '''
                        # Update the image tag in deployment manifest
                        sed -i "s|image: .*|image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}|g" k8s/deployment.yaml

                        # Apply Kubernetes manifests
                        kubectl apply -f k8s/deployment.yaml
                        kubectl apply -f k8s/service.yaml

                        # Wait for deployment to be ready
                        kubectl rollout status deployment/react-cicd-app -n ${KUBERNETES_NAMESPACE} --timeout=300s
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
            script {
                sh '''
                    echo "=== Deployment Summary ==="
                    echo "Docker Image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                    echo "Docker Image: ${DOCKER_IMAGE}:latest"
                    echo ""
                    echo "=== Kubernetes Status ==="
                    kubectl get pods -l app=react-cicd-app
                    kubectl get svc react-cicd-service
                '''
            }
        }
        failure {
            echo 'Pipeline failed!'
            script {
                sh '''
                    echo "=== Debug Information ==="
                    echo "Docker Image: ${DOCKER_IMAGE}:${env.BUILD_NUMBER}"
                    echo ""
                    echo "=== Kubernetes Status ==="
                    kubectl get pods
                    kubectl describe deployment react-cicd-app
                '''
            }
        }
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
