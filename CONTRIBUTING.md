Contributing
==============

If you find an issue, submitting a pull request is always better than a bug report! Please fork and submit your code fixes.

If you want to build some new features, we have a [roadmap.md](docs/roadmap.md) of features we want. You can add features you want there, or just code the feature and send a pull request.

### Cloning

```sh
$ git clone https://github.com/zeroclipboard/zeroclipboard.git
$ cd zeroclipboard/
$ npm install -g grunt-cli
$ npm install
$ grunt
```

### Developing

```sh
$ npm install
$ grunt
```

### Testing

```sh
$ grunt test
```

### Labels structure

It's not required to label your issue or pull request, but here is the structure of how we organize them.

- OS
  - All OSes _(may be implicit)_
  - Android
  - Windows
  - Mac OSX
  - Linux
  - iOS
- Browser
  - All Browsers _(may be implicit)_
  - IE
  - Firefox
  - Safari
  - Chrome/Opera
  - Android Browser
  - Other Browser
- Platform #207de5
  - Flash
  - JS
  - CSS
  - HTML
  - Events
  - API
- Type 
  - Security
  - Bug
  - Enhancement
  - Feature
  - Optimization
  - Infrastructure
  - Documentation
  - Question
  - Discussion
  - Testing
- Change Severity (SemVer)
  - Major
  - Minor
  - Patch
- Active Status
  - In Progress
- Inactive Status
  - More Info Required
  - Help Wanted
- Closed Status #d3d3d3
  - Resolved _(may be implicit by Closed state without other "Closed" labels but could be nice for querying)_
  - Invalid
  - Duplicate
  - WontFix
- Meta (???)
  - Easy Pickins
- Integration
  - jQuery UI
  - Bootstrap
  - Module Loaders
  - Other Integration
- External Limitations #000000
  - HTML TopLayer
  - Security Restriction
