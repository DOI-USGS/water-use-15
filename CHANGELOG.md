# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

### Added
- Added a change log
- Added the deployed static site to `dist/`, as the original vizlab build pipeline can no longer be run

### Changed
- Replaced Google Tag Manager and legacy USGS analytics with the Vizlab GA4 tag and the federal DAP tag, matching `vue3-template`
- Replaced the "Related Visualizations" footer block with the Vizlab pre-footer links (See more visualizations / Get the code)
- Updated the USWDS banner, USGS header, and USGS footer markup and links to match `vue3-template`; upgraded bundled USWDS assets from v2.7 to v3.13
- Rewrote `README.md` to describe the `dist/` site, how to serve it locally, and how the site was originally built
- Updated `code.json` and `CONTRIBUTING.md` to point at the `DOI-USGS` GitHub organization and the new site URL, https://water.usgs.gov/vizlab/water-use-15
- Updated `og:url`, share links, and social media image URLs in `dist/index.html` and `dist/embed-water-use-15.html` for the new site URL and S3 image hosting

### Fixed

## [1.0.0] - 2018-06-19

### Added
- Initial public release of the U.S. Water Use, 2015 data visualization at https://labs.waterdata.usgs.gov/visualizations/water-use-15
