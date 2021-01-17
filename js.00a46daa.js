// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"js/index.js":[function(require,module,exports) {
var box = document.querySelector('.DnD__draggable');
var DnD = document.querySelector('.DnD');
var DnD__origin = document.querySelector('.DnD__origin');
var dropBacklight = 'pink';
var dropzoneColor = '#a6e0be';

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

box.addEventListener('pointerdown', function (e) {
  return pointerDownDnD(e);
});

function pointerDownDnD(event) {
  // shift - чтобы при drag курсор находился над местом клика на квадрате.
  var shiftX = event.clientX - event.target.getBoundingClientRect().left;
  var shiftY = event.clientY - event.target.getBoundingClientRect().top; // создаем новый бокс если прошлый был в ориджине (рандомим цвет и вешаем этот же обработчик действий):

  if (event.target.parentElement == DnD__origin) {
    var newBox = event.target.cloneNode();
    newBox.addEventListener('pointerdown', function (e) {
      return pointerDownDnD(e);
    });
    newBox.style.background = randomColor();
    DnD__origin.appendChild(newBox);
  }

  event.target.style.position = 'absolute'; //кладем перетаскиваемый элемент на верхний уровень DOM

  DnD.append(event.target);
  moveAt(event.pageX, event.pageY);

  function moveAt(pageX, pageY) {
    event.target.style.left = pageX - shiftX + 'px';
    event.target.style.top = pageY - shiftY + 'px';
  }

  var currentDroppable = null;

  function onPointerMove(event) {
    //при движении курсором - передвигаем квадрат за курсором.
    moveAt(event.pageX, event.pageY); //получаем элемент под переносимым квадратом

    event.target.hidden = true;
    var elemBelow = document.elementFromPoint(event.clientX, event.clientY);
    event.target.hidden = false; //получаем ближайшего родителя элемента под переносимым квадратом с классом droppable (если есть)

    var droppableBelow = elemBelow.closest('.droppable'); // хочу, чтобы в гриде нельзя было положить box на box:

    if (droppableBelow != null && droppableBelow.classList.contains('dropzone__grid-block') && !elemBelow.classList.contains('dropzone__grid-block')) {
      droppableBelow = null;
    }

    if (currentDroppable != droppableBelow) {
      if (currentDroppable) {
        // вылетаем из droppable
        leaveDroppable(currentDroppable);
      }

      currentDroppable = droppableBelow;

      if (currentDroppable) {
        // влетаем в droppable
        enterDroppable(currentDroppable);
      }
    } // подсветка элемента, в который можно вставить квадрат


    function enterDroppable(elem) {
      elem.style.background = dropBacklight;
    } // меняем background обратно


    function leaveDroppable(elem) {
      elem.style.background = dropzoneColor;
    }
  } // листнер перемещения по экрану


  document.addEventListener('pointermove', onPointerMove); // кладем квадрат, удаляем более ненужные обработчики событий

  event.target.onpointerup = function () {
    document.removeEventListener('pointermove', onPointerMove);
    event.target.onpointerup = null;

    if (currentDroppable) {
      currentDroppable.append(event.target); //убираем подсветку droppable зоны

      currentDroppable.style.background = dropzoneColor;

      if (currentDroppable.classList.contains('dropzone__grid-block')) {
        //кладем в зону с сеткой, делаем поправку на бордер
        event.target.style.left = -1 + 'px';
        event.target.style.top = -1 + 'px';
      } else if (currentDroppable.classList.contains('dropzone__nogrid')) {
        //кладем в зону без сетки, меняем позицию квадрата в соответстви с новым родителем
        event.target.style.left = parseInt(event.target.style.left) - currentDroppable.getBoundingClientRect().left + 'px';
        event.target.style.top = parseInt(event.target.style.top) - currentDroppable.getBoundingClientRect().top + 'px';
      }
    } else {
      //произошло исчезновение
      event.target.classList.add('DnD__draggable_disapearing');
      setTimeout(function () {
        return DnD.removeChild(event.target);
      }, 1000);
    }
  };
}
},{}],"../../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "49374" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../.config/yarn/global/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","js/index.js"], null)
//# sourceMappingURL=/js.00a46daa.js.map