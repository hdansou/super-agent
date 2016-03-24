/*
  Cell is Split or Window

  Split
  - el: Root Element
  - first: Cell
  - second: Cell
  - parent: Cell
  - width: Int
  - height: Int
  - orientation: "vertical" or "horizontal"
  - split: Int

  Window
  - el: Root Element
  - title: Element
  - body: Element


*/
define('main-tiled', function (require) {
  'use strict';
  // var run = require('libs/run');
  // var rpc = require('libs/rpc');
  var domBuilder = require('libs/dombuilder');
  var drag = require('libs/drag-helper');

  var last = null;
  function setHover(win) {
    if (win === last) { return; }
    if (last) {
      var style = last.hoverEl.style;
      style.top = 0;
      style.left = 0;
      style.right = 'auto';
      style.bottom = 'auto';
      style.width = 0;
      style.height = 0;
      last.quadrant = 'none';
    }
    last = win;
  }

  var hoverback = null;
  function selectQuadrant(callback) {
    if (hoverback) {
      throw new Error('already in hover select mode');
    }
    hoverback = callback;
  }

  function Window(title) {
    this.title = title;
    this.width = 0;
    this.height = 0;
    domBuilder(['.cell.window$el',
      {
        onmousemove: this.onMove.bind(this),
      },
      ['.title$titleEl', title],
      ['.close$closeEl', '✖'],
      ['.content$contentEl'],
      ['.hover$hoverEl', {
        onclick: this.onClick.bind(this),
      }],
    ], this);
  }
  Window.prototype.setTitle = function (title) {
    if (title === this.title) { return; }
    this.title = title;
    this.titleEl.textContent = title;
  };
  Window.prototype.resize = function (w, h) {
    this.width = w;
    this.height = h;
    // TODO: forward down to apps
  };
  Window.prototype.onMove = function (evt) {
    if (!hoverback) { return; }
    setHover(this);
    var rect = this.el.getBoundingClientRect();
    var x = (evt.pageX - rect.left) / (rect.right - rect.left),
        y = (evt.pageY - rect.top) / (rect.bottom - rect.top);
    var quadrant = (x > (1 - y)) ?
      ((x > y) ? 'right' : 'bottom') :
      ((x > y) ? 'top' : 'left');
    if (quadrant === this.quadrant) { return; }
    this.quadrant = quadrant;
    var style = this.hoverEl.style;
    switch (quadrant) {
      case 'left':
        style.left = 0;
        style.right = 'auto';
        style.top = 0;
        style.bottom = 0;
        style.width = '50%';
        style.height = 'auto';
        break;
      case 'right':
        style.left = 'auto';
        style.right = 0;
        style.top = 0;
        style.bottom = 0;
        style.width = '50%';
        style.height = 'auto';
        break;
      case 'top':
        style.left = 0;
        style.right = 0;
        style.top = 0;
        style.bottom = 'auto';
        style.width = 'auto';
        style.height = '50%';
        break;
      case 'bottom':
        style.left = 0;
        style.right = 0;
        style.top = 'auto';
        style.bottom = 0;
        style.width = 'auto';
        style.height = '50%';
        break;
    }
  };
  Window.prototype.onClick = function () {
    if (!hoverback) { return; }
    var cb = hoverback;
    hoverback = null;
    cb(null, this);
    setHover(null);
  };

  function Split(first, second, isVertical) {
    this.first = first;
    this.second = second;
    this.parent = parent;
    first.parent = this;
    second.parent = this;
    this.isVertical = isVertical;
    this.width = 0;
    this.height = 0;
    this.firstSize = 0;
    var orientation = isVertical ? 'vertical' : 'horizontal';
    domBuilder(['.cell.split.' + orientation + '$el',
      ['.first$firstEl', first.el],
      ['.second$secondEl', second.el],
      ['.slider$sliderEl', drag(this.onDrag.bind(this))],
    ], this);
  }

  Split.prototype.onDrag = function (dx, dy) {
    this.resize(this.width, this.height, this.firstSize +=
      this.isVertical ? dy : dx);
  };

  Split.prototype.resize = function (w, h, firstSize) {
    // if (w === this.width && h === this.height &&
    //     (firstSize === undefined || firstSize === this.firstSize)) {
    //   return;
    // }

    this.firstSize = firstSize === undefined ? (this.firstSize ?
      (this.firstSize /
        (this.isVertical ? this.height : this.width) *
        (this.isVertical ? h : w)) :
        (((this.isVertical ? h : w) - 10) / 2)) : firstSize;
    this.width = w;
    this.height = h;
    firstSize = Math.floor(this.firstSize);
    if (this.isVertical) {
      var height = Math.floor(this.height);
      this.firstEl.style.height = firstSize + 'px';
      this.secondEl.style.height = (height - 10 - firstSize) + 'px';
      this.sliderEl.style.top = firstSize + 'px';
      this.first.resize(this.width, this.firstSize);
      this.second.resize(this.width, this.height - 10 - this.firstSize);
    }
    else {
      var width = Math.floor(this.width);
      this.firstEl.style.width = firstSize + 'px';
      this.secondEl.style.width = (width - 10 - firstSize) + 'px';
      this.sliderEl.style.left = firstSize + 'px';
      this.first.resize(this.firstSize, this.height);
      this.second.resize(this.width - 10 - this.firstSize, this.height);
    }
  };
  Split.prototype.replace = function (oldChild, newChild) {
    var parentEl;
    if (oldChild === this.first) {
      this.first = newChild;
      parentEl = this.firstEl;
    }
    else if (oldChild === this.second) {
      this.second = newChild;
      parentEl = this.secondEl;
    }
    // TODO: are there ever cases where we need to remove the old child?
    parentEl.appendChild(newChild.el);
    newChild.parent = this;
  };

  // run(function* () {
    // var call = yield* rpc();
    // console.log(call);
  // });

  document.body.textContent = '';
  var a = new Window('Window A');
  var b = new Window('Window B');
  var s = new Split(a, b, false);
  a.contentEl.appendChild(domBuilder(['button', {
    onclick: addWindow
  }, 'New Window']));
  window.onresize = onResize;
  onResize();
  document.body.appendChild(s.el);
  function onResize() {
    s.resize(window.innerWidth, window.innerHeight);
  }

  var next = 'C'.charCodeAt(0);
  function addWindow() {
    selectQuadrant(function (err, win) {
      var w = new Window('Window ' + String.fromCharCode(next++));
      // var w2 = new Window('Window ' + String.fromCharCode(next++));
      var s;
      var p = win.parent;
      switch (win.quadrant) {
        case 'top':
          s = new Split(w, win, true);
          break;
        case 'bottom':
          s = new Split(win, w, true);
          break;
        case 'left':
          s = new Split(w, win, false);
          break;
        case 'right':
          s = new Split(win, w, false);
          break;
      }
      p.replace(win, s);
      onResize();
    });
  }

});
