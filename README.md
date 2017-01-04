# jeslopalo.github.io

This is my website ([sandbox.es](http://sandbox.es)), created using [Jekyll](https://jekyllrb.com/) + [Foundation](http://foundation.zurb.com/) and hosted in [Github Pages](https://pages.github.com/)

## Instructions

### Updating gems

```sh
$ bundle install
$ bundle update
```

### Updating bower

```sh
$ bower update --force --save
```

If bower needs to be updated:

```sh
$ npm install -g bower
```

### Run Jekyll

To run the server:

```sh
$ development.sh
```

To stop the server, press Ctrl+c:

```sh
$ ^C
```

### Viewing the result

Go to your favourite browser and visit [the site url in localhost](127.0.0.1:4000)

## Release a new version

### Bump version number

```sh
$ ./bump_version
usage: bump_version [ <newversion> | major | minor | patch ]
```

Given a version number _MAJOR_._MINOR_._PATCH_:

- **\<newversion\>**: new version using [semver](http://semver.org/)
- **major**: increase major version number
- **minor**: increase minor version number
- **patch**: increase patch version number

