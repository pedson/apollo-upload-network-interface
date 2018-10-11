'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.UploadNetworkInterface = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = createNetworkInterface;

var _apolloClient = require('apollo-client');

var _networkInterface = require('apollo-client/transport/networkInterface');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function createNetworkInterface(opts) {
    var uri = opts.uri;

    return new UploadNetworkInterface(uri, opts);
}

var UploadNetworkInterface = exports.UploadNetworkInterface = function (_HTTPFetchNetworkInte) {
    _inherits(UploadNetworkInterface, _HTTPFetchNetworkInte);

    function UploadNetworkInterface() {
        _classCallCheck(this, UploadNetworkInterface);

        return _possibleConstructorReturn(this, (UploadNetworkInterface.__proto__ || Object.getPrototypeOf(UploadNetworkInterface)).apply(this, arguments));
    }

    _createClass(UploadNetworkInterface, [{
        key: 'fetchFromRemoteEndpoint',
        value: function fetchFromRemoteEndpoint(req) {
            var options = this.isUpload(req) ? this.getUploadOptions(req) : this.getJSONOptions(req);
            return fetch(this._uri, options);
        }
    }, {
        key: 'isUpload',
        value: function isUpload(_ref) {
            var request = _ref.request;

            if (request.variables) {
                for (var key in request.variables) {
                    if (request.variables[key] instanceof FileList) {
                        return true;
                    }
                    if (request.variables[key] instanceof Array && request.variables[key].length > 0) {
                        return request.variables[key][0] instanceof File;
                    }
                }
            }
            return false;
        }
    }, {
        key: 'getJSONOptions',
        value: function getJSONOptions(_ref2) {
            var request = _ref2.request,
                options = _ref2.options;

            return Object.assign({}, this._opts, {
                body: JSON.stringify((0, _networkInterface.printRequest)(request)),
                method: 'POST'
            }, options, {
                headers: Object.assign({}, {
                    Accept: '*/*',
                    'Content-Type': 'application/json'
                }, options.headers)
            });
        }
    }, {
        key: 'getUploadOptions',
        value: function getUploadOptions(_ref3) {
            var request = _ref3.request,
                options = _ref3.options;

            var body = new FormData();
            var variables = {};
            var fileCount = 0;
            var map = {};
            var file = [];

            var _loop = function _loop(key) {
                var v = request.variables[key];
                var list = null;
                if (v instanceof FileList) {
                    list = Array.from(v);
                } else if (v instanceof Array && v.length > 0 && v[0] instanceof File) {
                    list = v;
                }
                if (list) {
                    variables[key] = [];
                    list.forEach(function (f, idx) {
                        // body.append(key, f)
                        variables[key].push(null);
                        map[fileCount++] = ['variables.' + key + '.' + idx];
                        file.push(f);
                    });
                } else {
                    variables[key] = v;
                }
            };

            for (var key in request.variables) {
                _loop(key);
            }

            // body.append('operationName', request.operationName)
            // body.append('query', printAST(request.query))
            // body.append('variables', JSON.stringify(variables))

            body.append('operations', JSON.stringify({ query: (0, _apolloClient.printAST)(request.query), variables: variables }));

            if (fileCount > 0) {
                body.append('map', JSON.stringify(map));
                file.forEach(function (f, idx) {
                    return body.append('' + idx, f);
                });
            }

            return Object.assign({}, this._opts, {
                body: body,
                method: 'POST'
            }, options, {
                headers: Object.assign({}, {
                    Accept: '*/*'
                }, options.headers)
            });
        }
    }]);

    return UploadNetworkInterface;
}(_networkInterface.HTTPFetchNetworkInterface);