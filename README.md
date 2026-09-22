# Water use in the U.S., 2015

> _A newer version of the software may be available. See https://github.com/DOI-USGS/water-use-15/releases to view all releases._

This repo contains the source for a data visualization website exploring how water was used in every U.S. county in 2015. Water touches almost every aspect of American life: from food to electricity to consumer products. Understanding how we use water is crucial for learning how to be more responsible with water resources. This site displays the USGS national compilation of water use data for every U.S. county, letting users explore the variety of water use across the U.S. by category (public supply, irrigation, thermoelectric, industrial, and more).

**The data visualization website can be viewed at [https://water.usgs.gov/vizlab/water-use-15](https://water.usgs.gov/vizlab/water-use-15).**

The site was originally published on 2018-06-19 at `labs.waterdata.usgs.gov/visualizations/water-use-15` and developed at [github.com/USGS-VIZLAB/water-use-15](https://github.com/USGS-VIZLAB/water-use-15), which has since moved to this repository.

## Repository contents

The repository has two parts: the **deployed static site** in `dist/`, and the **original build pipeline** at the root, which is retained for the historical record but can no longer be run (see [How the site was built](#how-the-site-was-built)).

### `dist/` – the deployed website

`dist/` is a snapshot of the site as served in production. It is plain HTML/CSS/JS with no build step:

* `dist/index.html` – the full visualization page
* `dist/embed-water-use-15.html` – embeddable version of the map for use on other sites
* `dist/js/` – application code (`app.js`, `map.js`, `vizlab.js`) and vendored libraries (jQuery, jQuery UI, noUiSlider, SVG Injector, tooltipsy, USWDS)
* `dist/css/`, `dist/stylesheets/`, `dist/fonts/` – styles and Font Awesome web fonts
* `dist/data/` – county and state boundary GeoJSON (desktop, mobile, and zoom variants), county centroids, and 2015 water use summaries
* `dist/images/`, `dist/img/` – thumbnails, logos, and social media meta card images

Changes to the live site should be made directly to the files in `dist/`.

### Root – the original build pipeline

The remaining top-level files and folders (`viz.yaml`, `scripts/`, `layout/`, `data/`, `images/`, `js/`, `gifs/`, `*.yaml`/`*.yml`, `Dockerfile`, `docker-compose.yml`, `Jenkinsfile`) are the R-based pipeline that originally generated the contents of `dist/`. They are kept for provenance and are not maintained.

## Viewing the website locally

Because the site is plain HTML/CSS/JS, no dependencies need to be installed. Clone the repo and serve the `dist/` directory with any static file server, for example:

```sh
cd dist

# Python 3
python3 -m http.server 8000

# or with Node
npx serve .
```

Then open [http://localhost:8000](http://localhost:8000) in your browser. Opening `index.html` directly from the filesystem will not work, because the map data is loaded via HTTP requests.

## How the site was built

The site was built in 2018 with [vizlab](https://github.com/USGS-VIZLAB/vizlab) (v0.3.7), an R package developed by the USGS Vizlab team that assembled data visualization websites from a `viz.yaml` configuration. The `viz.yaml` at the root of this repo declares the fetch → process → visualize → publish pipeline, with the corresponding R scripts in `scripts/`. Running `vizlab::vizmake()` executed the pipeline, which:

1. **Fetched** county-level water use data for 2015 and 2010 from the USGS data release, along with county and state boundaries.
2. **Processed** the data into the summary and range JSON files and the simplified boundary GeoJSON used by the map.
3. **Visualized** the results by rendering the page from the templates in `layout/`, compiling the JavaScript and CSS, and generating the thumbnail and social media images.
4. **Published** the assembled site to a `target/` directory, which a Jenkins job (`Jenkinsfile`) built inside a Docker container (`Dockerfile`, `docker-compose.yml`) and synced to S3.

A separate set of configs (`national_gif.yml`, `state_gifs.yml`, `gif_globals.yml`, `piemap.yaml`) and scripts (`scripts/gifs/`, `scripts/piemap/`) produced animated GIFs and pie-map graphics for social media.

The pipeline depended on a pinned set of R packages, the vizlab framework (now archived), and internal USGS Docker and Jenkins infrastructure that no longer exist. **It cannot be re-run**, which is why the built output is now committed in `dist/`.

## Data sources

* Dieter, C.A., Maupin, M.A., Caldwell, R.R., Harris, M.A., Ivahnenko, T.I., Lovelace, J.K., Barber, N.L., and Linsey, K.S., 2018, Estimated use of water in the United States in 2015: U.S. Geological Survey Circular 1441, 65 p. [https://doi.org/10.3133/cir1441](https://doi.org/10.3133/cir1441)
* Dieter, C.A., Linsey, K.S., Caldwell, R.R., Harris, M.A., Ivahnenko, T.I., Lovelace, J.K., Maupin, M.A., and Barber, N.L., 2018, Estimated use of water in the United States county-level data for 2015: U.S. Geological Survey data release. [https://doi.org/10.5066/F7TB15V5](https://doi.org/10.5066/F7TB15V5)

## Citation

Carr, L., Appling, A., Watkins, D., Read, J., DeCicco, L., and Wernimont, M. 2018. Water use in the U.S., 2015. U.S. Geological Survey software release. Reston, VA. https://github.com/DOI-USGS/water-use-15

## Contributors

Lindsay Carr, Alison Appling, David Watkins, Jordan Read, Laura DeCicco, and Marty Wernimont.

## Additional information
* We welcome contributions from the community. See the [guidelines for contributing](CONTRIBUTING.md) to this repository.
* [Disclaimer](DISCLAIMER.md)
* [License](LICENSE.md)
