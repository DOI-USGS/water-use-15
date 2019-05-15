pipeline {
    agent none 
    stages {
        stage('Checkout repo') {
            agent any 
            steps {
                sh 'wget -O DOIRootCA2.cer http://sslhelp.doi.net/docs/DOIRootCA2.cer'
                git "https://github.com/wdwatkins/water-use-15"
            }
        }
        stage('build_viz') {
            agent {
                docker {
                    image 'code.chs.usgs.gov:5001/wwatkins/water-use-15-docker/water-use-15'
                } 
            }
            steps {
                sh 'Rscript -e "vizlab::vizmake()"'
            }
        }
        stage('push to S3') {
            agent any
            steps { 
               /* sh 'aws s3 sync ./target/ s3://beta-owi.usgs.gov-website/vizlab/water-use-15/ --exclude "*.svg" --exclude "*.json"; \
                    aws s3 sync ./target/ s3://beta-owi.usgs.gov-website/vizlab/water-use-15/ --exclude "*" --include "*.svg" --content-type "image/svg+xml"; \
                    aws s3 sync ./target/ s3://beta-owi.usgs.gov-website/vizlab/water-use-15/ --exclude "*" --include "*.json" --content-type "application/json"' */
		//just test access to prod s3 bucket
		sh 'touch empty.test; \
		    aws s3 cp empty.test s3://owi-usgs-gov/empty.test; \
		    aws s3 rm s3://owi-usgs-gov/empty.test;'
            }
        }
    }
}
