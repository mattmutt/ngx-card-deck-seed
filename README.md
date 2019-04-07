# ngx card deck seed application


[![ngx card deck](http://i.postimg.cc/kGm8vJWs/card-deck.png)](http://i.postimg.cc/kGm8vJWs/card-deck.png)

[//]: # (remove https://postimg.cc/delete/fGwX2thh/d73f604c )


## Summary
[![dependencies Status](https://david-dm.org/mattmutt/ngx-card-deck/status.svg)](https://david-dm.org/mattmutt/ngx-card-deck-seed)
[![build status](https://travis-ci.com/mattmutt/ngx-card-deck-seed.svg?branch=master)](https://travis-ci.com/mattmutt/ngx-card-deck-seed)
[![downloads](https://img.shields.io/npm/dm/ngx-card-deck.svg)](https://www.npmjs.com/package/ngx-card-deck)


### Introduction

Want flexible, composible dashboards from a dynamic layout structure? 

[![grid layout](http://i.postimg.cc/x8rLRTvy/ngx-card-deck-grid-layout.png)](http://i.postimg.cc/x8rLRTvy/ngx-card-deck-grid-layout.png)

[//]: # (remove 0Tv7HJsT/e41e308a )

Want to extend with accessible, comprehensive linking for real time diagrams? (Coming in an update release)

[![nodeflow diagram layout](https://i.postimg.cc/gJb0tw7J/ngx-card-deck-nodeflow-layout.png)](http://i.postimg.cc/x8rLRTvy/ngx-card-deck-grid-layout.png)

[//]: # (remove 0LPNTGz0/e9e2cfa5 )

Then this component may offer a head start for scaling up to the demands of UI projects. 

## Quick start

* Clone repo with `git clone git@github.com:mattmutt/ngx-card-deck-sample.git`
* Install [Angular CLI](https://angular.io/cli) if necessary, with `npm install -g @angular/cli`
* Grab all tooling and library dependencies `npm install`
* Start the development server with `npm start`, then visit _[http://localhost:4200](http://localhost:4200)_ in browser


## Platform dependencies versions
* Angular 7 (version 8 would require refactoring as this component uses some internal Angular APIs)
* Clarity 1
* RxJS 6
* Node.js 10+ ( Angular CLI requirements)
* ES2015 ( no need to support IE11 going forward? )


### Feature set matrix
| Feature                   | Category   | Description  |
|:--------------------------|------------|:-------------|
| Themes                    | experience | Can swap in various color or branded color themes, for example dark mode. Able to extend to other UI libraries, like Material
| Accessibility             | experience | Using keyboard alone, user can use `<tab>`, `<enter>` and four arrows keys to rearrange cards. The `<esc>` key can break out focus traps.
| Zoom                      | experience    | For very complicated layouts, showing a scaled thumbnail can help visualize 
| Pan                       | experience    | When resolution or container viewport size is limited, scrolling around can help show other cards easily
| Layers                    | ui    | Can program additional content above or behind the cards, for example diagrams and connectors
| Localization              | ui    | Ability to render text in other languages. Could alternatively leverage Angular's official i18n build-time mechanism
| Lazy loading              | ui    | Custom card components can be eagerly or loaded on demand, for example heavy views should be split to separate bundles for performance gains
| Remote plugin views       | ui    | Easy to point to remotely served components. _Todo_: build library to synchronize theme changes
| Metadata driven           | developer  | Two modular JSON-based formats for configuring a deck layout: a simplified and advanced (verbose, fine-grained) model.
| Library packaged          | developer  | Code shipped as full source (for learning) or preferably consumed as a single library for clients in Angular Package Format.

## Tutorial
Follow the [developer guide](INSTALL.md) to integrate this library into a dashboard app. Walks through design, provisioning and component installation.

* [ngx-card-deck source](https://github.com/mattmutt/ngx-card-deck) on github ( opening later )

## Server local startup

Run `npm start` *or* `ng serve --configuration` for a local development server. Navigate to `http://localhost:4200`. The app will automatically reload if you change 
any of the source code files.


## Build full component

Run `ng build` to build a production grade package of the project. The build artifacts will be stored in the `dist/` directory. 

## Unit tests

Run `npm test` to execute the unit tests of the component (in continuous watch mode loop) via [Karma](https://karma-runner.github.io).
To validate the tests and exit upon completion, type `npm test --no-watch`

## End-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org). Closest in terms of automating and detecting what front end steps actually happen.
Advised to write more unit tests as they can explore more scenarios and define the scope of the test at a more granular level.

## Shout outs 🎉
Credits and inspirations:
[Tiberiu](https://github.com/tiberiuzuld/angular-gridster2), [Clarity Design](http://clarity.design) @ vmw, [Angular Core](https://angular.io/about) Team @ google, [NoFloJs](http://noflojs.org/) tool, [Flow-based programming](http://www.jpaulmorrison.com/fbp) @ ibm 
