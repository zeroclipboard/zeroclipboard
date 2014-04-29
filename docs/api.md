# ZeroClipboard API

This documents details the ZeroClipboard API, including various types of properties, methods, and events.


## Static

### Static Properties

#### `ZeroClipboard.version`

_[`String`]_ The version of the ZeroClipboard library being used, e.g. `"v2.0.0"`.


### Static Methods

#### `ZeroClipboard.config(...)`
_[`Object`]_ Set the active configuration for ZeroClipboard, or get a copy of it.
This configuration is globally shared by all ZeroClipboard client instances.


#### `ZeroClipboard.destroy()`
_[`undefined`]_ Destroy all ZeroClipboard client instances, as well as the Flash bridge.


### Static Events

#### _{Incoming...}_




## Instance

The following properties and methods are accessible via a `ZeroClipboard` client instance, e.g.

```js
var client = new ZeroClipboard();
```


### Instance Properties

#### `client.id`

_[`String`]_ A unique identifier for this ZeroClipboard client instance.


#### _{Incoming...}_



### Instance Methods

#### `client.on(...)`

_[`this`]_ Add an event listener to handle ZeroClipboard instance events.


#### _{Incoming...}_



### Instance Events

#### _{Incoming...}_

