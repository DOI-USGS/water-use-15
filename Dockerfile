# tagged version, not latest! 
FROM rocker/geospatial:3.5.0 

# install node and npm (see https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
RUN sudo apt-get install -y curl &&\
  sudo apt-get install -y gnupg &&\
  sudo apt-get update 

#bring in DOI root cert.  Remove this statement for non-USGS persons
RUN /usr/bin/wget -O /usr/lib/ssl/certs/DOIRootCA.crt http://sslhelp.doi.net/docs/DOIRootCA2.cer && \
ln -sf /usr/lib/ssl/certs/DOIRootCA.crt /usr/lib/ssl/certs/`openssl x509 -hash -noout -in /usr/lib/ssl/certs/DOIRootCA.crt`.0 && \
echo "\\n\\nca-certificate = /usr/lib/ssl/certs/DOIRootCA.crt" >> /etc/wgetrc; 
WORKDIR /home/rstudio/ 
RUN Rscript -e 'installed.packages()'
#Note that version rocker images are already set up to use the MRAN mirror corresponding to the 
#date of the R version, so package dates are already set (unless forcing another repo)
RUN Rscript -e  'devtools::install_github("richfitz/remake")' && \
    Rscript -e  'install.packages("grithub", repos = c(getOption("repos"), "https://owi.usgs.gov/R"))' && \
    Rscript -e 	'devtools::install_github("USGS-VIZLAB/vizlab@v0.3.7")' 
    #note that most packages will already be installed as part of the geospatial image	
RUN    install2.r --error \
	aws.s3 \
	aws.signature \
	sbtools \
	geojsonio \
	js\
	dataRetrieval
	 		                    
RUN mkdir -p water-use-15 &&\
    chown rstudio water-use-15
WORKDIR water-use-15 

