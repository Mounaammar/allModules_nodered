"use strict";

/**
 * Module dependencies.
 */
var util = require('util');

var Stream = require('stream');

var ResponseBase = require('../response-base');
/**
 * Expose `Response`.
 */


module.exports = Response;
/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * @param {Request} req
 * @param {Object} options
 * @constructor
 * @extends {Stream}
 * @implements {ReadableStream}
 * @api private
 */

function Response(req) {
  Stream.call(this);
  this.res = req.res;
  var res = this.res;
  this.request = req;
  this.req = req.req;
  this.text = res.text;
  this.body = res.body === undefined ? {} : res.body;
  this.files = res.files || {};
  this.buffered = req._resBuffered;
  this.headers = res.headers;
  this.header = this.headers;

  this._setStatusProperties(res.statusCode);

  this._setHeaderProperties(this.header);

  this.setEncoding = res.setEncoding.bind(res);
  res.on('data', this.emit.bind(this, 'data'));
  res.on('end', this.emit.bind(this, 'end'));
  res.on('close', this.emit.bind(this, 'close'));
  res.on('error', this.emit.bind(this, 'error'));
}
/**
 * Inherit from `Stream`.
 */


util.inherits(Response, Stream); // eslint-disable-next-line new-cap

ResponseBase(Response.prototype);
/**
 * Implements methods of a `ReadableStream`
 */

Response.prototype.destroy = function (err) {
  this.res.destroy(err);
};
/**
 * Pause.
 */


Response.prototype.pause = function () {
  this.res.pause();
};
/**
 * Resume.
 */


Response.prototype.resume = function () {
  this.res.resume();
};
/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */


Response.prototype.toError = function () {
  var req = this.req;
  var method = req.method;
  var path = req.path;
  var msg = "cannot ".concat(method, " ").concat(path, " (").concat(this.status, ")");
  var err = new Error(msg);
  err.status = this.status;
  err.text = this.text;
  err.method = method;
  err.path = path;
  return err;
};

Response.prototype.setStatusProperties = function (status) {
  console.warn('In superagent 2.x setStatusProperties is a private method');
  return this._setStatusProperties(status);
};
/**
 * To json.
 *
 * @return {Object}
 * @api public
 */


Response.prototype.toJSON = function () {
  return {
    req: this.request.toJSON(),
    header: this.header,
    status: this.status,
    text: this.text
  };
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ub2RlL3Jlc3BvbnNlLmpzIl0sIm5hbWVzIjpbInV0aWwiLCJyZXF1aXJlIiwiU3RyZWFtIiwiUmVzcG9uc2VCYXNlIiwibW9kdWxlIiwiZXhwb3J0cyIsIlJlc3BvbnNlIiwicmVxIiwiY2FsbCIsInJlcyIsInJlcXVlc3QiLCJ0ZXh0IiwiYm9keSIsInVuZGVmaW5lZCIsImZpbGVzIiwiYnVmZmVyZWQiLCJfcmVzQnVmZmVyZWQiLCJoZWFkZXJzIiwiaGVhZGVyIiwiX3NldFN0YXR1c1Byb3BlcnRpZXMiLCJzdGF0dXNDb2RlIiwiX3NldEhlYWRlclByb3BlcnRpZXMiLCJzZXRFbmNvZGluZyIsImJpbmQiLCJvbiIsImVtaXQiLCJpbmhlcml0cyIsInByb3RvdHlwZSIsImRlc3Ryb3kiLCJlcnIiLCJwYXVzZSIsInJlc3VtZSIsInRvRXJyb3IiLCJtZXRob2QiLCJwYXRoIiwibXNnIiwic3RhdHVzIiwiRXJyb3IiLCJzZXRTdGF0dXNQcm9wZXJ0aWVzIiwiY29uc29sZSIsIndhcm4iLCJ0b0pTT04iXSwibWFwcGluZ3MiOiI7O0FBQUE7OztBQUlBLElBQU1BLElBQUksR0FBR0MsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O0FBQ0EsSUFBTUMsTUFBTSxHQUFHRCxPQUFPLENBQUMsUUFBRCxDQUF0Qjs7QUFDQSxJQUFNRSxZQUFZLEdBQUdGLE9BQU8sQ0FBQyxrQkFBRCxDQUE1QjtBQUVBOzs7OztBQUlBRyxNQUFNLENBQUNDLE9BQVAsR0FBaUJDLFFBQWpCO0FBRUE7Ozs7Ozs7Ozs7Ozs7O0FBY0EsU0FBU0EsUUFBVCxDQUFrQkMsR0FBbEIsRUFBdUI7QUFDckJMLEVBQUFBLE1BQU0sQ0FBQ00sSUFBUCxDQUFZLElBQVo7QUFDQSxPQUFLQyxHQUFMLEdBQVdGLEdBQUcsQ0FBQ0UsR0FBZjtBQUZxQixNQUdiQSxHQUhhLEdBR0wsSUFISyxDQUdiQSxHQUhhO0FBSXJCLE9BQUtDLE9BQUwsR0FBZUgsR0FBZjtBQUNBLE9BQUtBLEdBQUwsR0FBV0EsR0FBRyxDQUFDQSxHQUFmO0FBQ0EsT0FBS0ksSUFBTCxHQUFZRixHQUFHLENBQUNFLElBQWhCO0FBQ0EsT0FBS0MsSUFBTCxHQUFZSCxHQUFHLENBQUNHLElBQUosS0FBYUMsU0FBYixHQUF5QixFQUF6QixHQUE4QkosR0FBRyxDQUFDRyxJQUE5QztBQUNBLE9BQUtFLEtBQUwsR0FBYUwsR0FBRyxDQUFDSyxLQUFKLElBQWEsRUFBMUI7QUFDQSxPQUFLQyxRQUFMLEdBQWdCUixHQUFHLENBQUNTLFlBQXBCO0FBQ0EsT0FBS0MsT0FBTCxHQUFlUixHQUFHLENBQUNRLE9BQW5CO0FBQ0EsT0FBS0MsTUFBTCxHQUFjLEtBQUtELE9BQW5COztBQUNBLE9BQUtFLG9CQUFMLENBQTBCVixHQUFHLENBQUNXLFVBQTlCOztBQUNBLE9BQUtDLG9CQUFMLENBQTBCLEtBQUtILE1BQS9COztBQUNBLE9BQUtJLFdBQUwsR0FBbUJiLEdBQUcsQ0FBQ2EsV0FBSixDQUFnQkMsSUFBaEIsQ0FBcUJkLEdBQXJCLENBQW5CO0FBQ0FBLEVBQUFBLEdBQUcsQ0FBQ2UsRUFBSixDQUFPLE1BQVAsRUFBZSxLQUFLQyxJQUFMLENBQVVGLElBQVYsQ0FBZSxJQUFmLEVBQXFCLE1BQXJCLENBQWY7QUFDQWQsRUFBQUEsR0FBRyxDQUFDZSxFQUFKLENBQU8sS0FBUCxFQUFjLEtBQUtDLElBQUwsQ0FBVUYsSUFBVixDQUFlLElBQWYsRUFBcUIsS0FBckIsQ0FBZDtBQUNBZCxFQUFBQSxHQUFHLENBQUNlLEVBQUosQ0FBTyxPQUFQLEVBQWdCLEtBQUtDLElBQUwsQ0FBVUYsSUFBVixDQUFlLElBQWYsRUFBcUIsT0FBckIsQ0FBaEI7QUFDQWQsRUFBQUEsR0FBRyxDQUFDZSxFQUFKLENBQU8sT0FBUCxFQUFnQixLQUFLQyxJQUFMLENBQVVGLElBQVYsQ0FBZSxJQUFmLEVBQXFCLE9BQXJCLENBQWhCO0FBQ0Q7QUFFRDs7Ozs7QUFJQXZCLElBQUksQ0FBQzBCLFFBQUwsQ0FBY3BCLFFBQWQsRUFBd0JKLE1BQXhCLEUsQ0FDQTs7QUFDQUMsWUFBWSxDQUFDRyxRQUFRLENBQUNxQixTQUFWLENBQVo7QUFFQTs7OztBQUlBckIsUUFBUSxDQUFDcUIsU0FBVCxDQUFtQkMsT0FBbkIsR0FBNkIsVUFBVUMsR0FBVixFQUFlO0FBQzFDLE9BQUtwQixHQUFMLENBQVNtQixPQUFULENBQWlCQyxHQUFqQjtBQUNELENBRkQ7QUFJQTs7Ozs7QUFJQXZCLFFBQVEsQ0FBQ3FCLFNBQVQsQ0FBbUJHLEtBQW5CLEdBQTJCLFlBQVk7QUFDckMsT0FBS3JCLEdBQUwsQ0FBU3FCLEtBQVQ7QUFDRCxDQUZEO0FBSUE7Ozs7O0FBSUF4QixRQUFRLENBQUNxQixTQUFULENBQW1CSSxNQUFuQixHQUE0QixZQUFZO0FBQ3RDLE9BQUt0QixHQUFMLENBQVNzQixNQUFUO0FBQ0QsQ0FGRDtBQUlBOzs7Ozs7OztBQU9BekIsUUFBUSxDQUFDcUIsU0FBVCxDQUFtQkssT0FBbkIsR0FBNkIsWUFBWTtBQUFBLE1BQy9CekIsR0FEK0IsR0FDdkIsSUFEdUIsQ0FDL0JBLEdBRCtCO0FBQUEsTUFFL0IwQixNQUYrQixHQUVwQjFCLEdBRm9CLENBRS9CMEIsTUFGK0I7QUFBQSxNQUcvQkMsSUFIK0IsR0FHdEIzQixHQUhzQixDQUcvQjJCLElBSCtCO0FBS3ZDLE1BQU1DLEdBQUcsb0JBQWFGLE1BQWIsY0FBdUJDLElBQXZCLGVBQWdDLEtBQUtFLE1BQXJDLE1BQVQ7QUFDQSxNQUFNUCxHQUFHLEdBQUcsSUFBSVEsS0FBSixDQUFVRixHQUFWLENBQVo7QUFDQU4sRUFBQUEsR0FBRyxDQUFDTyxNQUFKLEdBQWEsS0FBS0EsTUFBbEI7QUFDQVAsRUFBQUEsR0FBRyxDQUFDbEIsSUFBSixHQUFXLEtBQUtBLElBQWhCO0FBQ0FrQixFQUFBQSxHQUFHLENBQUNJLE1BQUosR0FBYUEsTUFBYjtBQUNBSixFQUFBQSxHQUFHLENBQUNLLElBQUosR0FBV0EsSUFBWDtBQUVBLFNBQU9MLEdBQVA7QUFDRCxDQWJEOztBQWVBdkIsUUFBUSxDQUFDcUIsU0FBVCxDQUFtQlcsbUJBQW5CLEdBQXlDLFVBQVVGLE1BQVYsRUFBa0I7QUFDekRHLEVBQUFBLE9BQU8sQ0FBQ0MsSUFBUixDQUFhLDJEQUFiO0FBQ0EsU0FBTyxLQUFLckIsb0JBQUwsQ0FBMEJpQixNQUExQixDQUFQO0FBQ0QsQ0FIRDtBQUtBOzs7Ozs7OztBQU9BOUIsUUFBUSxDQUFDcUIsU0FBVCxDQUFtQmMsTUFBbkIsR0FBNEIsWUFBWTtBQUN0QyxTQUFPO0FBQ0xsQyxJQUFBQSxHQUFHLEVBQUUsS0FBS0csT0FBTCxDQUFhK0IsTUFBYixFQURBO0FBRUx2QixJQUFBQSxNQUFNLEVBQUUsS0FBS0EsTUFGUjtBQUdMa0IsSUFBQUEsTUFBTSxFQUFFLEtBQUtBLE1BSFI7QUFJTHpCLElBQUFBLElBQUksRUFBRSxLQUFLQTtBQUpOLEdBQVA7QUFNRCxDQVBEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbmNvbnN0IHV0aWwgPSByZXF1aXJlKCd1dGlsJyk7XG5jb25zdCBTdHJlYW0gPSByZXF1aXJlKCdzdHJlYW0nKTtcbmNvbnN0IFJlc3BvbnNlQmFzZSA9IHJlcXVpcmUoJy4uL3Jlc3BvbnNlLWJhc2UnKTtcblxuLyoqXG4gKiBFeHBvc2UgYFJlc3BvbnNlYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBAcGFyYW0ge1JlcXVlc3R9IHJlcVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMge1N0cmVhbX1cbiAqIEBpbXBsZW1lbnRzIHtSZWFkYWJsZVN0cmVhbX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIFJlc3BvbnNlKHJlcSkge1xuICBTdHJlYW0uY2FsbCh0aGlzKTtcbiAgdGhpcy5yZXMgPSByZXEucmVzO1xuICBjb25zdCB7IHJlcyB9ID0gdGhpcztcbiAgdGhpcy5yZXF1ZXN0ID0gcmVxO1xuICB0aGlzLnJlcSA9IHJlcS5yZXE7XG4gIHRoaXMudGV4dCA9IHJlcy50ZXh0O1xuICB0aGlzLmJvZHkgPSByZXMuYm9keSA9PT0gdW5kZWZpbmVkID8ge30gOiByZXMuYm9keTtcbiAgdGhpcy5maWxlcyA9IHJlcy5maWxlcyB8fCB7fTtcbiAgdGhpcy5idWZmZXJlZCA9IHJlcS5fcmVzQnVmZmVyZWQ7XG4gIHRoaXMuaGVhZGVycyA9IHJlcy5oZWFkZXJzO1xuICB0aGlzLmhlYWRlciA9IHRoaXMuaGVhZGVycztcbiAgdGhpcy5fc2V0U3RhdHVzUHJvcGVydGllcyhyZXMuc3RhdHVzQ29kZSk7XG4gIHRoaXMuX3NldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLnNldEVuY29kaW5nID0gcmVzLnNldEVuY29kaW5nLmJpbmQocmVzKTtcbiAgcmVzLm9uKCdkYXRhJywgdGhpcy5lbWl0LmJpbmQodGhpcywgJ2RhdGEnKSk7XG4gIHJlcy5vbignZW5kJywgdGhpcy5lbWl0LmJpbmQodGhpcywgJ2VuZCcpKTtcbiAgcmVzLm9uKCdjbG9zZScsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdjbG9zZScpKTtcbiAgcmVzLm9uKCdlcnJvcicsIHRoaXMuZW1pdC5iaW5kKHRoaXMsICdlcnJvcicpKTtcbn1cblxuLyoqXG4gKiBJbmhlcml0IGZyb20gYFN0cmVhbWAuXG4gKi9cblxudXRpbC5pbmhlcml0cyhSZXNwb25zZSwgU3RyZWFtKTtcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuZXctY2FwXG5SZXNwb25zZUJhc2UoUmVzcG9uc2UucHJvdG90eXBlKTtcblxuLyoqXG4gKiBJbXBsZW1lbnRzIG1ldGhvZHMgb2YgYSBgUmVhZGFibGVTdHJlYW1gXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoZXJyKSB7XG4gIHRoaXMucmVzLmRlc3Ryb3koZXJyKTtcbn07XG5cbi8qKlxuICogUGF1c2UuXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnJlcy5wYXVzZSgpO1xufTtcblxuLyoqXG4gKiBSZXN1bWUuXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLnJlc3VtZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5yZXMucmVzdW1lKCk7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24gKCkge1xuICBjb25zdCB7IHJlcSB9ID0gdGhpcztcbiAgY29uc3QgeyBtZXRob2QgfSA9IHJlcTtcbiAgY29uc3QgeyBwYXRoIH0gPSByZXE7XG5cbiAgY29uc3QgbXNnID0gYGNhbm5vdCAke21ldGhvZH0gJHtwYXRofSAoJHt0aGlzLnN0YXR1c30pYDtcbiAgY29uc3QgZXJyID0gbmV3IEVycm9yKG1zZyk7XG4gIGVyci5zdGF0dXMgPSB0aGlzLnN0YXR1cztcbiAgZXJyLnRleHQgPSB0aGlzLnRleHQ7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci5wYXRoID0gcGF0aDtcblxuICByZXR1cm4gZXJyO1xufTtcblxuUmVzcG9uc2UucHJvdG90eXBlLnNldFN0YXR1c1Byb3BlcnRpZXMgPSBmdW5jdGlvbiAoc3RhdHVzKSB7XG4gIGNvbnNvbGUud2FybignSW4gc3VwZXJhZ2VudCAyLnggc2V0U3RhdHVzUHJvcGVydGllcyBpcyBhIHByaXZhdGUgbWV0aG9kJyk7XG4gIHJldHVybiB0aGlzLl9zZXRTdGF0dXNQcm9wZXJ0aWVzKHN0YXR1cyk7XG59O1xuXG4vKipcbiAqIFRvIGpzb24uXG4gKlxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHJlcTogdGhpcy5yZXF1ZXN0LnRvSlNPTigpLFxuICAgIGhlYWRlcjogdGhpcy5oZWFkZXIsXG4gICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICB0ZXh0OiB0aGlzLnRleHRcbiAgfTtcbn07XG4iXX0=