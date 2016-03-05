module.exports = function(options, imports, register) {
  'use strict';
  /*jshint validthis: true */
  var debug = require('debug');

  var log = debug('plugins:debug');
  var error = debug('error');
  var warn = debug('warn');
  log('start');

  function debugLog(){
    // Create a normal debugger
    return debug.apply(debug, arguments);
  }

  function tempFormatArgs() {
    function setOptions(){
      var options = {};
      options.prefix = this._prefix;
      if (options._prefix === undefined) {
        options._prefix = '';
      }
      options.name = this.tempNamespace;
      if (options.tempNamespace === undefined) {
        options.tempNamespace = options.namespace;
      }
    }

    var args = arguments;
    var options = setOptions();

    if (this.useColors) {
      var c = this.color;

      args[0] = '  \u001b[9' + c + 'm' + options.prefix + options.name + ' ' +
        '\u001b[0m' + args[0] + '\u001b[3' + c + 'm' + ' +' +
        debug.humanize(this.diff) + '\u001b[0m';
    } else {
      args[0] = new Date().toUTCString() + ' ' + options.name + ' ' + args[0];
    }
    return args;
  }

  function setUpTemps(){
    this.log = console[this._consoleType]['bind'](console);
    debug.formatArgs = tempFormatArgs;
  }

  var previousFormat = debug.formatArgs;
  function removeTemps(){
    debug.formatArgs = previousFormat;
    this.log = console.log.bind(console);
  }

  function debugError(){
    error._prefix = this._prefix = 'ERROR ';
    error._consoleType = this._consoleType = 'error';
    var args = Array.prototype.slice.call(arguments);
    // If the namespace is enabled, log the error through that namespace
    if (this.enabled) {
      // Temporarily switch the console
      setUpTemps.call(this);
      this.apply(this, args);
      // Switch is back to normal
      removeTemps.apply(this);
    } else {
      // If the namespace is not enabled,
      // maybe the error namespace is, so echo the error there
      error.tempNamespace = this.namespace;
      setUpTemps.call(error);
      error.apply(error, args);
      removeTemps.apply(error);
    }
  }

  function debugWarn(){
    warn._prefix = this._prefix = 'WARNING ';
    warn._consoleType = this._consoleType = 'warn';
    var args = Array.prototype.slice.call(arguments);
    // If the namespace is enabled, log the error through that namespace
    if (this.enabled) {
      // Temporarily switch the console
      setUpTemps.call(this);
      this.apply(this, args);
      // Switch is back to normal
      removeTemps.apply(this);
    } else {
      // If the namespace is not enabled,
      // maybe the warn namespace is, so echo the warning there
      warn.tempNamespace = this.namespace;
      setUpTemps.call(warn);
      warn.apply(warn, args);
      removeTemps.apply(warn);
    }
  }

  function setUpLogger(){
    var logger = debugLog.apply(debug, arguments);
    logger.error = debugError.bind(logger);
    logger.warn = debugWarn.bind(logger);
    return logger;
  }

  var api = {
    debug: setUpLogger
  };

  log('register');
  register(null, api);
};
