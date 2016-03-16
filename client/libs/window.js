define('libs/window', function (require) {
  'use strict';

  let domBuilder = require('libs/dombuilder');
  let drag = require('libs/drag-helper');

  let windowWidth = window.innerWidth,
      windowHeight = window.innerHeight;

  let windows = [];

  window.addEventListener('resize', function () {
    let newWidth = window.innerWidth;
    let newHeight = window.innerHeight;
    if (newWidth === windowWidth && newHeight === windowHeight) { return; }
    windowWidth = newWidth;
    windowHeight = newHeight;
    windows.forEach(function (window) {
      window.refresh();
    });
  });

  return makeWindow;

  function makeWindow(left, top, width, height, title) {

    let northProps = drag(north);
    let northEastProps = drag(northEast);
    let eastProps = drag(east);
    let southEastProps = drag(southEast);
    let southProps = drag(south);
    let southWestProps = drag(southWest);
    let westProps = drag(west);
    let northWestProps = drag(northWest);
    let titleBarProps = drag(titleBar);

    let win = {
      get width() { return width; },
      get height() { return height; },
      get title() { return title; },
      set title(newTitle) {
        title = newTitle;
        refresh();
        return title;
      },
      close: close,
      focus: focus,
    };

    windows.push(win);

    let maximized = false;
    let isDark = false;
    let focused = false;

    domBuilder(['$el',
      {
        onmousedown: focus, ontouchstart: focus,
      },
      ['article.content$container'],
      ['.resize.n', northProps],
      ['.resize.ne', northEastProps],
      ['.resize.e', eastProps],
      ['.resize.se', southEastProps],
      ['.resize.s', southProps],
      ['.resize.sw', southWestProps],
      ['.resize.w', westProps],
      ['.resize.nw', northWestProps],
      ['.title-bar', titleBarProps, title],
      ['.max-box$maxBox', {onclick:onMaxClick}],
      ['.close-box', {onclick:onCloseClick},'✖'],
    ], win);
    refresh();

    return win;

    function refresh() {
      // Manually run constraints that edges must be inside desktop and
      // window must be at least 200x100
      let right = left + width;
      if (right < 10) { right = 10; }
      if (left > windowWidth - 10) { left = windowWidth - 10; }
      let mid = ((left + right) / 2) | 0;
      if (mid < ((windowWidth / 2) | 0)) {
        if (right < left + 200) { right = left + 200; }
        width = right - left;
        if (width > windowWidth) {
          left += width - windowWidth;
          width = windowWidth;
        }
      }
      else {
        if (left > right - 200) { left = right - 200; }
        width = right - left;
        if (width > windowWidth) { width = windowWidth; }
      }

      let bottom = top + height;
      if (bottom < 10) { bottom = 10; }
      if (top > windowHeight - 10) { top = windowHeight - 10; }
      mid = ((top + bottom) / 2) | 0;
      if (mid < ((windowHeight / 2) | 0)) {
        if (bottom < top + 100) { bottom = top + 100; }
        height = bottom - top;
        if (height > windowHeight) {
          top += height - windowHeight;
          height = windowHeight;
        }
      }
      else {
        if (top > bottom - 100) { top = bottom - 100; }
        height = bottom - top;
        if (height > windowHeight) { height = windowHeight; }
      }

      let style = maximized ? (
        'top: -10px;' +
        'left: -10px;' +
        'right: -10px;' +
        'bottom: -10px;'
      ) : (
        'width: ' + width + 'px;' +
        'height: ' + height + 'px;' +
        'transform: translate3d(' + left + 'px,' + top + 'px,0);' +
        'webkitTransform: translate3d(' + left + 'px,' + top + 'px,0);'
      );
      let classes = ['window', isDark ? 'dark' : 'light'];
      if (focused) { classes.push('focused'); }


      win.maxBox.textContent = maximized ? '▼' : '▲';
      win.el.setAttribute('style', style);
      win.el.setAttribute('class', classes.join(' '));
    }

    function focus() {
    }

    function destroy() {

    }

    function onMaxClick(evt) {
      evt.stopPropagation();
      maximized = !maximized;
      refresh();
      focus();
    }

    function onCloseClick(evt) {
      evt.stopPropagation();
      destroy();
    }

    function north(dx, dy) {
      height -= dy;
      top += dy;
      refresh();
    }
    function northEast(dx, dy) {
      height -= dy;
      top += dy;
      width += dx;
      refresh();
    }
    function east(dx) {
      width += dx;
      refresh();
    }
    function southEast(dx, dy) {
      height += dy;
      width += dx;
      refresh();
    }
    function south(dx, dy) {
      height += dy;
      refresh();
    }
    function southWest(dx, dy) {
      height += dy;
      width -= dx;
      left += dx;
      refresh();
    }
    function west(dx) {
      width -= dx;
      left += dx;
      refresh();
    }
    function northWest(dx, dy) {
      height -= dy;
      top += dy;
      width -= dx;
      left += dx;
      refresh();
    }
    function titleBar(dx, dy) {
      top += dy;
      left += dx;
      refresh();
    }
  }
});