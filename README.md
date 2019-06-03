<h1 align="center">Eccles Mosque</h1>
<p align="center">
     The Eccles and Salford Islamic Society<br/>
    See http://ecclesmosque.org.uk/
</p>

[![Build Status](https://travis-ci.org/ecclesmosque/ecclesmosque.github.io.svg?branch=master)](https://travis-ci.org/ecclesmosque/ecclesmosque.github.io) [![Known Vulnerabilities](https://snyk.io/test/github/ecclesmosque/ecclesmosque.github.io/074eef445d6e8a31caf032bb9c11b95225f18114/badge.svg)](https://snyk.io/test/github/ecclesmosque/ecclesmosque.github.io/074eef445d6e8a31caf032bb9c11b95225f18114)


## What is this?

This is repository contains the source code for The Eccles and Salford Islamic Society website. See the deployed website at [https://ecclesmosque.org.uk](https://ecclesmosque.org.uk/).

## Prerequisite
- [Ruby Version Manager (RVM)](https://rvm.io/)
- [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm)

## Getting Started
The site is built using `Jekyll` and `github-pages` and hosted on [GitHub Pages](https://pages.github.com/).

Install Jekyll and Bundler gems through RubyGems
`gem install jekyll bundler`

Install ruby dependencies:
`bundle install`

Time time to time you may need to update ruby gems. For example when we need to update [GitHub Pages](https://pages.github.com/) gem.
`bundle update`

Install node dependencies:
* `npm i -g gulp`
* `npm i -g fontello-cli` -- to generate/update icons fonts.
* `gulp icons-download` --Download icons fonts
* `gulp` -- start development

## Production build
To build a production version of the site run:
`gulp build-prod`

## How To Preview a draft post
Once you run `gulp` command it should load the default browser with development site. If it does not visit `http://localhost:3000` to view the site.

## License

[The MIT License (MIT)](http://azizur.mit-license.org/)
