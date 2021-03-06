// Generated by CoffeeScript 1.9.1
(function() {
  var RetryTest, Runnable;

  RetryTest = function(times, title, fn) {
    Runnable.call(this, title, fn);
    this.times = times;
    this.pending = !fn;
    return this.type = "test";
  };

  RetryTest.prototype.run = function(fn) {
    var done, emitted, finished, multiple, runTimes, start;
    finished = emitted = void 0;
    runTimes = 1;
    multiple = (function(_this) {
      return function(err) {
        if (emitted) {
          return;
        }
        emitted = true;
        return _this.emit("error", err || new Error("done() called multiple times"));
      };
    })(this);
    done = (function(_this) {
      return function(err) {
        var start;
        if (_this.timedOut) {
          return;
        }
        if (finished) {
          return multiple(err);
        }
        if ((err != null) && runTimes !== _this.times) {
          runTimes++;
          start = new Date;
          return _this._run(fn, done);
        }
        _this.clearTimeout();
        _this.duration = new Date - start;
        finished = true;
        return fn(err);
      };
    })(this);
    start = new Date;
    return this._run(fn, done);
  };

  RetryTest.prototype._run = function(fn, done) {
    var callFn, ctx, err, ms;
    ms = this.timeout();
    ctx = this.ctx;
    if (ctx) {
      ctx.runnable(this);
    }
    this.callback = done;
    if (this.async) {
      this.resetTimeout();
      try {
        this.fn.call(ctx, function(err) {
          if (err instanceof Error || toString.call(err) === "[object Error]") {
            return done(err);
          }
          if (err != null) {
            return done(new Error("done() invoked with non-Error: " + err));
          }
          return done();
        });
      } catch (_error) {
        err = _error;
        done(err);
      }
      return;
    }
    if (this.asyncOnly) {
      return done(new Error("--async-only option in use without declaring `done()`"));
    }
    callFn = (function(_this) {
      return function(fn) {
        var result;
        result = fn.call(ctx);
        if (result && typeof result.then === "function") {
          _this.resetTimeout();
          return result.then((function() {
            return done();
          }), done);
        } else {
          return done();
        }
      };
    })(this);
    try {
      if (this.pending) {
        return done();
      } else {
        return callFn(this.fn);
      }
    } catch (_error) {
      err = _error;
      return done(err);
    }
  };

  Runnable = require("mocha").Runnable;

  RetryTest.prototype.__proto__ = Runnable.prototype;

  module.exports = RetryTest;

}).call(this);
