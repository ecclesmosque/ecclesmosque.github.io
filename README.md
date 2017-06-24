<h1 align="center">Eccles Mosque</h1>
<p align="center">
     The Eccles and Salford Islāmic Society<br/>
    See http://ecclesmosque.org.uk/
</p>

[![Build Status](https://travis-ci.org/ecclesmosque/ecclesmosque.github.io.svg?branch=master)](https://travis-ci.org/ecclesmosque/ecclesmosque.github.io)


## What is this?

This is repo contains the soruce code for The Eccles and Salford Islāmic Society website. See the deployed website at [ecclesmosque.org.uk](https://ecclesmosque.org.uk/).

## Getting Started
The site is built using `Jekyll` and `github-pages` and hosted on [GitHub Pages](https://pages.github.com/).

Install Jekyll and Bundler gems through RubyGems
`gem install jekyll bundler`

Install ruby rependencies:
`bundle install`

Time time to time you may need to update reuby gems. For example when we need to update [GitHub Pages](https://pages.github.com/) gem.
`bundle update`

Install node dependencies:
* `npm i -g gulp`
* `npm i -g fontello-cli` -- to generate/update icons fonts.
* `gulp icons-download` --Download icons fonts
* `gulp` -- start development

## How To Preview a draft post
Once you run `gulp` command it should load the default browser with development site. If it does not visit `http://localhost:3000` to view the site.

## License

[The MIT License (MIT)](http://azizur.mit-license.org/)
