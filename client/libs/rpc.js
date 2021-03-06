define('libs/rpc', function (require) {
  'use strict';

  var msgpack = require('libs/msgpack');

  var url = window.location.href.split('#')[1] ||
    (location.protocol.replace('http', 'ws') + '//' + location.host + '/');

  return rpc;

  function* rpc(runCommand) {
    var socket = new WebSocket(url, ['schema-rpc']);
    socket.binaryType = 'arraybuffer';
    socket.onmessage = onMessage;

    var fns = {};
    var nextId = 1;
    var waiting = {};
    return yield function (callback) {
      socket.onopen = function () {
        callback(null, call);
      };
      socket.onerror = function () {
        callback('Connection error');
      };
    };

    function getId() {
      var id = nextId;
      while (fns[id] || waiting[id]) {
        id++;
      }
      nextId = id + 1;
      return id;
    }

    function onMessage(evt) {
      var message;
      if (typeof evt.data === 'string') {
        message = JSON.parse(evt.data);
      }
      else {
        message = msgpack.decode(evt.data);
      }
      console.log('<- ' + JSON.stringify(message));
      if (!(Array.isArray(message) && typeof message[0] === 'number')) {
        console.error('Invalid message from socket', message);
        return;
      }
      message = thaw(message);
      var id = message[0];
      if (id < 0) {
        id = -id;
        var callback = waiting[id];
        if (callback) {
          delete waiting[id];
          nextId = id;
          message[0] = null;
          return callback.apply(null, message);
        }
        var emitter = fns[id];
        if (emitter) {
          return emitter.apply(null, message.slice(1));
        }
        console.error('Unknown response id received', id);
        return;
      }
      if (id > 0) {
        return runCommand.apply(null, message.slice(1));
      }
      if (id === 0) {
        write(message);
        socket.close();
        return;
      }
    }

    function thaw(value) {
      var type = typeof value;
      if (!value || type !== 'object') { return value; }
      if (Array.isArray(value)) {
        return value.map(thaw);
      }
      if (value instanceof ArrayBuffer) {
        return new Uint8Array(value);
      }
      if (Object.getPrototypeOf(value) !== Object.prototype) {
        return value;
      }
      var keys = Object.keys(value);
      var l = keys.length;
      if (l === 1 && keys[0] === '') {
        var id = -value[''];
        return function (...args) {
          write([id, ...args]);
        };
      }
      var copy = {};
      for (var i = 0; i < l; ++i) {
        var key = keys[i];
        copy[key] = thaw(value[key]);
      }
      return copy;
    }

    function freeze(value) {
      var type = typeof value;
      if (type === 'function') {
        var id = getId();
        fns[id] = value;
        return {'': id};
      }
      if (!value || type !== 'object') { return value; }
      if (Array.isArray(value)) {
        return value.map(freeze);
      }
      if (value instanceof Uint8Array) {
        return value.buffer;
      }
      if (Object.getPrototypeOf(value) !== Object.prototype) {
        return value;
      }
      var copy = {};
      var keys = Object.keys(value);
      for (var i = 0, l = keys.length; i < l; ++i) {
        var key = keys[i];
        var item = value[key];
        if (item !== undefined) {
          copy[key] = freeze(item);
        }
      }
      return copy;
    }

    function write(message) {
      message = freeze(message);
      console.log('-> ' + JSON.stringify(message));
      socket.send(msgpack.encode(message));
    }

    function* call(name, ...args) {
      var id = getId();
      return yield function (callback) {
        write([id, name, ...args]);
        waiting[id] = function (err, ...args) {
          if (args.length === 0) {
            return callback(err);
          }
          else if (args.length === 1) {
            return callback(err, args[0]);
          }
          return callback(err, args);
        };
      };
    }
  }
});
