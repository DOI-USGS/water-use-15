# water-use-15
USGS water use data visualization emphasizing the newly added 2015 dataset.

# Contributing
In your PRs: include a screenshot with changes (if applicable). Also check that your changes still work on a mobile view before submitting a PR, and make notes in your PR comment about any usability aspects that need attention.

When you create a PR: Request a peer review when you submit a PR. Reviewee alerts reviewer when comments have been responded to. Reviewer merges. 

When closing an issue or submitting a PR that will close an issue, please include the actual number of hours it took you in a issue comment.

Please track your time on this vizzy and distinguish specifically water-use-15 hours from general vizlab-framework hours.

# Vizlab documentation
The vizlab wiki at https://github.com/USGS-VIZLAB/vizlab/wiki has help pages on 
* Collaborating
* Using vizlab
* Specific concepts (timestamps and SVG inject)

# Docker
 This project now has a `Dockerfile` included, to try out Docker to standardize our development and build environments.  There are a few simple steps to build the docker **image** , start up the docker **container**, and then set up the git repository and Rstudio project.  
 
## Docker basics
  The Dockerfile is a text file that contains the instructions to build the docker **image** --- a layered binary file that contains everything you installed. The image has everything needed for docker to start up a docker **container**, inside of which you run the commands/programs you want to use. Once a container is created and has run what you need it to, you can stop the container, and either remove it or restart it later.  Containers are meant to be ephemeral --- anything you create in the container that is important should either be scripted so it can be recreated, or saved to a **volume**.  Volumes are docker storage centers on your hard drive that persist beyond the life of a container, but they are _not_ normal directories that you can access outside of docker.  
  
  Docker commands all either start with `docker` or `docker-compose`.  They can generally do the same things, but `docker` accepts command-line flags (e.g. `docker run -t tag`) while `docker-compose` uses the `docker-compose.yml` for options.  We mostly use `docker-compose` here so the options can be easily source-controlled.

## To build/work on a viz
  First, you need to get the `Dockerfile` and `docker-compose.yml` onto your machine, so the docker image can be built.  You can manually download the files through the github UI, or you can use the script in [this gist](https://gist.github.com/wdwatkins/55d84030bf3e60b513cf1a1d0da76798) to do it programatically. Run the script from terminal in a directory you want to contain the two files with the command `bash get_repo_dockerfiles.sh <repo_name>`, and the two files will be pulled down automatically.  Now, still in your terminal, go into the directory containing the `Dockerfile` and `docker-compose.yml` that was just created, and run `docker-compose build`. (Non-USGS people should first delete or comment out lines 10-12 in the `Dockerfile` where the root certificate is retrieved.) This builds the docker image using the image name and other options specified in `docker-compose.yml`.  Next, run `docker-compose up`.  This creates and starts the docker container and leaves it running, with Rstudio exposed on port 8787.  Go to your web browser and you can log in to Rstudio at `localhost:8787`.  The username is `rstudio`, and password is `mypass`.  Now you can use Rstudio the same as on a native operating system.  Create a new project from the `File` menu, select Version Control and Git, and enter the URL of your fork of the repository.  Note the container does not contain any of your credentials, for Github or elsewhere.  However, the container already contains the DOI root certificate, so HTTPS will work over the network. (Note that you should **not** upload an **image** containing the DOI cert to a public repo.) Files you save in Rstudio will be contained in a docker volume, and will persist beyond the life of the container (unless you delete the volume, of course).  When you are done, log out of Rstudio and run `docker-compose down` in your terminal to stop the docker container.      

##  Package management
  The Dockerfile has a few Docker-specific commands, but largely consists of shell commands to install packages that you have likely seen before.  The Dockerfile here starts with the [rocker geospatial image](https://hub.docker.com/r/rocker/geospatial), which already has R/Rstudio, geospatial libraries, and many standard packages already installed, so we really only need to add vizlab-specific packages on top of it.  You can go look at the Dockerfiles for the various rocker images to see exactly what is installed and from where.
  R packages that come installed in the rocker images come from [MRAN's daily CRAN snapshots](https://mran.microsoft.com/documents/rro/reproducibility#snapshots),  corresponding to the date the rocker image was updated.  The `repos` option in R is already set to that same snapshot, so any package you install with `install.packages` without setting a repo will come from the same snapshot.  This obviously isn't the case for packages that are only on GRAN or other repositories, so any non-CRAN packages should be installed from GitHub with a release or commit specified.  Note that any package _dependencies_ installed by `devtools::install_github` will still come from the same MRAN date (i.e. CRAN clone) as all the other packages.

# Jenkins
  The repo also contains a Jenkinsfile now.  This file defines the steps of the Jenkins build, rather than just defining them through the Jenkins UI.  This allows the Jenkins build process to be source-controlled, changes to be reviewed, etc, and better reproducibility between vizzies.  There is extensive documentation on the [Jenkins website](https://jenkins.io/doc/book/pipeline/jenkinsfile/).
