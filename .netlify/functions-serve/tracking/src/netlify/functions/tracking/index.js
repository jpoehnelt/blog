var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/uuid/dist/rng.js
var require_rng = __commonJS({
  "node_modules/uuid/dist/rng.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = rng;
    var _crypto = _interopRequireDefault(require("crypto"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var rnds8Pool = new Uint8Array(256);
    var poolPtr = rnds8Pool.length;
    function rng() {
      if (poolPtr > rnds8Pool.length - 16) {
        _crypto.default.randomFillSync(rnds8Pool);
        poolPtr = 0;
      }
      return rnds8Pool.slice(poolPtr, poolPtr += 16);
    }
  }
});

// node_modules/uuid/dist/regex.js
var require_regex = __commonJS({
  "node_modules/uuid/dist/regex.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/validate.js
var require_validate = __commonJS({
  "node_modules/uuid/dist/validate.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _regex = _interopRequireDefault(require_regex());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function validate(uuid) {
      return typeof uuid === "string" && _regex.default.test(uuid);
    }
    var _default = validate;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/stringify.js
var require_stringify = __commonJS({
  "node_modules/uuid/dist/stringify.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var byteToHex = [];
    for (let i = 0; i < 256; ++i) {
      byteToHex.push((i + 256).toString(16).substr(1));
    }
    function stringify(arr, offset = 0) {
      const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
      if (!(0, _validate.default)(uuid)) {
        throw TypeError("Stringified UUID is invalid");
      }
      return uuid;
    }
    var _default = stringify;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/v1.js
var require_v1 = __commonJS({
  "node_modules/uuid/dist/v1.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _rng = _interopRequireDefault(require_rng());
    var _stringify = _interopRequireDefault(require_stringify());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var _nodeId;
    var _clockseq;
    var _lastMSecs = 0;
    var _lastNSecs = 0;
    function v1(options, buf, offset) {
      let i = buf && offset || 0;
      const b = buf || new Array(16);
      options = options || {};
      let node = options.node || _nodeId;
      let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
      if (node == null || clockseq == null) {
        const seedBytes = options.random || (options.rng || _rng.default)();
        if (node == null) {
          node = _nodeId = [seedBytes[0] | 1, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
        }
        if (clockseq == null) {
          clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
        }
      }
      let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
      let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
      const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
      if (dt < 0 && options.clockseq === void 0) {
        clockseq = clockseq + 1 & 16383;
      }
      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
        nsecs = 0;
      }
      if (nsecs >= 1e4) {
        throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
      }
      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq;
      msecs += 122192928e5;
      const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
      b[i++] = tl >>> 24 & 255;
      b[i++] = tl >>> 16 & 255;
      b[i++] = tl >>> 8 & 255;
      b[i++] = tl & 255;
      const tmh = msecs / 4294967296 * 1e4 & 268435455;
      b[i++] = tmh >>> 8 & 255;
      b[i++] = tmh & 255;
      b[i++] = tmh >>> 24 & 15 | 16;
      b[i++] = tmh >>> 16 & 255;
      b[i++] = clockseq >>> 8 | 128;
      b[i++] = clockseq & 255;
      for (let n = 0; n < 6; ++n) {
        b[i + n] = node[n];
      }
      return buf || (0, _stringify.default)(b);
    }
    var _default = v1;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/parse.js
var require_parse = __commonJS({
  "node_modules/uuid/dist/parse.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function parse(uuid) {
      if (!(0, _validate.default)(uuid)) {
        throw TypeError("Invalid UUID");
      }
      let v;
      const arr = new Uint8Array(16);
      arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
      arr[1] = v >>> 16 & 255;
      arr[2] = v >>> 8 & 255;
      arr[3] = v & 255;
      arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
      arr[5] = v & 255;
      arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
      arr[7] = v & 255;
      arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
      arr[9] = v & 255;
      arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
      arr[11] = v / 4294967296 & 255;
      arr[12] = v >>> 24 & 255;
      arr[13] = v >>> 16 & 255;
      arr[14] = v >>> 8 & 255;
      arr[15] = v & 255;
      return arr;
    }
    var _default = parse;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/v35.js
var require_v35 = __commonJS({
  "node_modules/uuid/dist/v35.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = _default;
    exports.URL = exports.DNS = void 0;
    var _stringify = _interopRequireDefault(require_stringify());
    var _parse = _interopRequireDefault(require_parse());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function stringToBytes(str) {
      str = unescape(encodeURIComponent(str));
      const bytes = [];
      for (let i = 0; i < str.length; ++i) {
        bytes.push(str.charCodeAt(i));
      }
      return bytes;
    }
    var DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
    exports.DNS = DNS;
    var URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
    exports.URL = URL;
    function _default(name, version, hashfunc) {
      function generateUUID(value, namespace, buf, offset) {
        if (typeof value === "string") {
          value = stringToBytes(value);
        }
        if (typeof namespace === "string") {
          namespace = (0, _parse.default)(namespace);
        }
        if (namespace.length !== 16) {
          throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
        }
        let bytes = new Uint8Array(16 + value.length);
        bytes.set(namespace);
        bytes.set(value, namespace.length);
        bytes = hashfunc(bytes);
        bytes[6] = bytes[6] & 15 | version;
        bytes[8] = bytes[8] & 63 | 128;
        if (buf) {
          offset = offset || 0;
          for (let i = 0; i < 16; ++i) {
            buf[offset + i] = bytes[i];
          }
          return buf;
        }
        return (0, _stringify.default)(bytes);
      }
      try {
        generateUUID.name = name;
      } catch (err) {
      }
      generateUUID.DNS = DNS;
      generateUUID.URL = URL;
      return generateUUID;
    }
  }
});

// node_modules/uuid/dist/md5.js
var require_md5 = __commonJS({
  "node_modules/uuid/dist/md5.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _crypto = _interopRequireDefault(require("crypto"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function md5(bytes) {
      if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
      } else if (typeof bytes === "string") {
        bytes = Buffer.from(bytes, "utf8");
      }
      return _crypto.default.createHash("md5").update(bytes).digest();
    }
    var _default = md5;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/v3.js
var require_v3 = __commonJS({
  "node_modules/uuid/dist/v3.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _v = _interopRequireDefault(require_v35());
    var _md = _interopRequireDefault(require_md5());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var v3 = (0, _v.default)("v3", 48, _md.default);
    var _default = v3;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/v4.js
var require_v4 = __commonJS({
  "node_modules/uuid/dist/v4.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _rng = _interopRequireDefault(require_rng());
    var _stringify = _interopRequireDefault(require_stringify());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function v4(options, buf, offset) {
      options = options || {};
      const rnds = options.random || (options.rng || _rng.default)();
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      if (buf) {
        offset = offset || 0;
        for (let i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }
        return buf;
      }
      return (0, _stringify.default)(rnds);
    }
    var _default = v4;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/sha1.js
var require_sha1 = __commonJS({
  "node_modules/uuid/dist/sha1.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _crypto = _interopRequireDefault(require("crypto"));
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function sha1(bytes) {
      if (Array.isArray(bytes)) {
        bytes = Buffer.from(bytes);
      } else if (typeof bytes === "string") {
        bytes = Buffer.from(bytes, "utf8");
      }
      return _crypto.default.createHash("sha1").update(bytes).digest();
    }
    var _default = sha1;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/v5.js
var require_v5 = __commonJS({
  "node_modules/uuid/dist/v5.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _v = _interopRequireDefault(require_v35());
    var _sha = _interopRequireDefault(require_sha1());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var v5 = (0, _v.default)("v5", 80, _sha.default);
    var _default = v5;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/nil.js
var require_nil = __commonJS({
  "node_modules/uuid/dist/nil.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _default = "00000000-0000-0000-0000-000000000000";
    exports.default = _default;
  }
});

// node_modules/uuid/dist/version.js
var require_version = __commonJS({
  "node_modules/uuid/dist/version.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _validate = _interopRequireDefault(require_validate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function version(uuid) {
      if (!(0, _validate.default)(uuid)) {
        throw TypeError("Invalid UUID");
      }
      return parseInt(uuid.substr(14, 1), 16);
    }
    var _default = version;
    exports.default = _default;
  }
});

// node_modules/uuid/dist/index.js
var require_dist = __commonJS({
  "node_modules/uuid/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    Object.defineProperty(exports, "v1", {
      enumerable: true,
      get: function() {
        return _v.default;
      }
    });
    Object.defineProperty(exports, "v3", {
      enumerable: true,
      get: function() {
        return _v2.default;
      }
    });
    Object.defineProperty(exports, "v4", {
      enumerable: true,
      get: function() {
        return _v3.default;
      }
    });
    Object.defineProperty(exports, "v5", {
      enumerable: true,
      get: function() {
        return _v4.default;
      }
    });
    Object.defineProperty(exports, "NIL", {
      enumerable: true,
      get: function() {
        return _nil.default;
      }
    });
    Object.defineProperty(exports, "version", {
      enumerable: true,
      get: function() {
        return _version.default;
      }
    });
    Object.defineProperty(exports, "validate", {
      enumerable: true,
      get: function() {
        return _validate.default;
      }
    });
    Object.defineProperty(exports, "stringify", {
      enumerable: true,
      get: function() {
        return _stringify.default;
      }
    });
    Object.defineProperty(exports, "parse", {
      enumerable: true,
      get: function() {
        return _parse.default;
      }
    });
    var _v = _interopRequireDefault(require_v1());
    var _v2 = _interopRequireDefault(require_v3());
    var _v3 = _interopRequireDefault(require_v4());
    var _v4 = _interopRequireDefault(require_v5());
    var _nil = _interopRequireDefault(require_nil());
    var _version = _interopRequireDefault(require_version());
    var _validate = _interopRequireDefault(require_validate());
    var _stringify = _interopRequireDefault(require_stringify());
    var _parse = _interopRequireDefault(require_parse());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
  }
});

// node_modules/universal-analytics/lib/utils.js
var require_utils = __commonJS({
  "node_modules/universal-analytics/lib/utils.js"(exports, module2) {
    module2.exports.isUuid = function(uuid) {
      if (!uuid)
        return false;
      uuid = uuid.toString().toLowerCase();
      return /[0-9a-f]{8}\-?[0-9a-f]{4}\-?4[0-9a-f]{3}\-?[89ab][0-9a-f]{3}\-?[0-9a-f]{12}/.test(uuid);
    };
    module2.exports.isCookieCid = function(cid) {
      return /^[0-9]+\.[0-9]+$/.test(cid);
    };
    module2.exports.ensureValidCid = function(uuid) {
      if (!this.isUuid(uuid)) {
        if (!this.isCookieCid(uuid)) {
          return false;
        }
        return uuid;
      }
      uuid = uuid.replace(/\-/g, "");
      return "" + uuid.substring(0, 8) + "-" + uuid.substring(8, 12) + "-" + uuid.substring(12, 16) + "-" + uuid.substring(16, 20) + "-" + uuid.substring(20);
    };
  }
});

// node_modules/universal-analytics/lib/config.js
var require_config = __commonJS({
  "node_modules/universal-analytics/lib/config.js"(exports, module2) {
    module2.exports = {
      protocolVersion: "1",
      hostname: "https://www.google-analytics.com",
      path: "/collect",
      batchPath: "/batch",
      batching: true,
      batchSize: 10,
      acceptedParameters: [
        "v",
        "tid",
        "aip",
        "ds",
        "qt",
        "z",
        "cid",
        "uid",
        "sc",
        "uip",
        "ua",
        "geoid",
        "dr",
        "cn",
        "cs",
        "cm",
        "ck",
        "cc",
        "ci",
        "gclid",
        "dclid",
        "sr",
        "vp",
        "de",
        "sd",
        "ul",
        "je",
        "fl",
        "t",
        "ni",
        "dl",
        "dh",
        "dp",
        "dt",
        "cd",
        "linkid",
        "an",
        "aid",
        "av",
        "aiid",
        "ec",
        "ea",
        "el",
        "ev",
        "ti",
        "ta",
        "tr",
        "ts",
        "tt",
        "in",
        "ip",
        "iq",
        "ic",
        "iv",
        "cu",
        "pa",
        "tcc",
        "pal",
        "cos",
        "col",
        "promoa",
        "sn",
        "sa",
        "st",
        "utc",
        "utv",
        "utt",
        "utl",
        "plt",
        "dns",
        "pdt",
        "rrt",
        "tcp",
        "srt",
        "dit",
        "clt",
        "exd",
        "exf",
        "xid",
        "xvar"
      ],
      acceptedParametersRegex: [
        /^cm[0-9]+$/,
        /^cd[0-9]+$/,
        /^cg(10|[0-9])$/,
        /pr[0-9]{1,3}id/,
        /pr[0-9]{1,3}nm/,
        /pr[0-9]{1,3}br/,
        /pr[0-9]{1,3}ca/,
        /pr[0-9]{1,3}va/,
        /pr[0-9]{1,3}pr/,
        /pr[0-9]{1,3}qt/,
        /pr[0-9]{1,3}cc/,
        /pr[0-9]{1,3}ps/,
        /pr[0-9]{1,3}cd[0-9]{1,3}/,
        /pr[0-9]{1,3}cm[0-9]{1,3}/,
        /il[0-9]{1,3}nm/,
        /il[0-9]{1,3}pi[0-9]{1,3}id/,
        /il[0-9]{1,3}pi[0-9]{1,3}nm/,
        /il[0-9]{1,3}pi[0-9]{1,3}br/,
        /il[0-9]{1,3}pi[0-9]{1,3}ca/,
        /il[0-9]{1,3}pi[0-9]{1,3}va/,
        /il[0-9]{1,3}pi[0-9]{1,3}ps/,
        /il[0-9]{1,3}pi[0-9]{1,3}pr/,
        /il[0-9]{1,3}pi[0-9]{1,3}cd[0-9]{1,3}/,
        /il[0-9]{1,3}pi[0-9]{1,3}cm[0-9]{1,3}/,
        /promo[0-9]{1,3}id/,
        /promo[0-9]{1,3}nm/,
        /promo[0-9]{1,3}cr/,
        /promo[0-9]{1,3}ps/
      ],
      parametersMap: {
        "protocolVersion": "v",
        "trackingId": "tid",
        "webPropertyId": "tid",
        "anonymizeIp": "aip",
        "dataSource": "ds",
        "queueTime": "qt",
        "cacheBuster": "z",
        "clientId": "cid",
        "userId": "uid",
        "sessionControl": "sc",
        "ipOverride": "uip",
        "userAgentOverride": "ua",
        "documentReferrer": "dr",
        "campaignName": "cn",
        "campaignSource": "cs",
        "campaignMedium": "cm",
        "campaignKeyword": "ck",
        "campaignContent": "cc",
        "campaignId": "ci",
        "googleAdwordsId": "gclid",
        "googleDisplayAdsId": "dclid",
        "screenResolution": "sr",
        "viewportSize": "vp",
        "documentEncoding": "de",
        "screenColors": "sd",
        "userLanguage": "ul",
        "javaEnabled": "je",
        "flashVersion": "fl",
        "hitType": "t",
        "non-interactionHit": "ni",
        "documentLocationUrl": "dl",
        "documentHostName": "dh",
        "documentPath": "dp",
        "documentTitle": "dt",
        "screenName": "cd",
        "linkId": "linkid",
        "applicationName": "an",
        "applicationId": "aid",
        "applicationVersion": "av",
        "applicationInstallerId": "aiid",
        "eventCategory": "ec",
        "eventAction": "ea",
        "eventLabel": "el",
        "eventValue": "ev",
        "transactionId": "ti",
        "transactionAffiliation": "ta",
        "transactionRevenue": "tr",
        "transactionShipping": "ts",
        "transactionTax": "tt",
        "itemName": "in",
        "itemPrice": "ip",
        "itemQuantity": "iq",
        "itemCode": "ic",
        "itemCategory": "iv",
        "currencyCode": "cu",
        "socialNetwork": "sn",
        "socialAction": "sa",
        "socialActionTarget": "st",
        "userTimingCategory": "utc",
        "userTimingVariableName": "utv",
        "userTimingTime": "utt",
        "userTimingLabel": "utl",
        "pageLoadTime": "plt",
        "dnsTime": "dns",
        "pageDownloadTime": "pdt",
        "redirectResponseTime": "rrt",
        "tcpConnectTime": "tcp",
        "serverResponseTime": "srt",
        "domInteractiveTime": "dit",
        "contentLoadTime": "clt",
        "exceptionDescription": "exd",
        "isExceptionFatal": "exf",
        "isExceptionFatal?": "exf",
        "experimentId": "xid",
        "experimentVariant": "xvar"
      }
    };
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module2) {
    var s = 1e3;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;
    var w = d * 7;
    var y = d * 365.25;
    module2.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error("val is not a non-empty string or a valid number. val=" + JSON.stringify(val));
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
      if (!match) {
        return;
      }
      var n = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n * y;
        case "weeks":
        case "week":
        case "w":
          return n * w;
        case "days":
        case "day":
        case "d":
          return n * d;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n * h;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n * m;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n * s;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n;
        default:
          return void 0;
      }
    }
    function fmtShort(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return Math.round(ms / d) + "d";
      }
      if (msAbs >= h) {
        return Math.round(ms / h) + "h";
      }
      if (msAbs >= m) {
        return Math.round(ms / m) + "m";
      }
      if (msAbs >= s) {
        return Math.round(ms / s) + "s";
      }
      return ms + "ms";
    }
    function fmtLong(ms) {
      var msAbs = Math.abs(ms);
      if (msAbs >= d) {
        return plural(ms, msAbs, d, "day");
      }
      if (msAbs >= h) {
        return plural(ms, msAbs, h, "hour");
      }
      if (msAbs >= m) {
        return plural(ms, msAbs, m, "minute");
      }
      if (msAbs >= s) {
        return plural(ms, msAbs, s, "second");
      }
      return ms + " ms";
    }
    function plural(ms, msAbs, n, name) {
      var isPlural = msAbs >= n * 1.5;
      return Math.round(ms / n) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module2) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i = 0; i < namespace.length; i++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self = debug;
          const curr = Number(new Date());
          const ms = curr - (prevTime || curr);
          self.diff = ms;
          self.prev = prevTime;
          self.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self, args);
          const logFn = self.log || createDebug.log;
          logFn.apply(self, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v) => {
            enableOverride = v;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        let i;
        const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
        const len = split.length;
        for (i = 0; i < len; i++) {
          if (!split[i]) {
            continue;
          }
          namespaces = split[i].replace(/\*/g, ".*?");
          if (namespaces[0] === "-") {
            createDebug.skips.push(new RegExp("^" + namespaces.substr(1) + "$"));
          } else {
            createDebug.names.push(new RegExp("^" + namespaces + "$"));
          }
        }
      }
      function disable() {
        const namespaces = [
          ...createDebug.names.map(toNamespace),
          ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        if (name[name.length - 1] === "*") {
          return true;
        }
        let i;
        let len;
        for (i = 0, len = createDebug.skips.length; i < len; i++) {
          if (createDebug.skips[i].test(name)) {
            return false;
          }
        }
        for (i = 0, len = createDebug.names.length; i < len; i++) {
          if (createDebug.names[i].test(name)) {
            return true;
          }
        }
        return false;
      }
      function toNamespace(regexp) {
        return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
      }
      function coerce(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module2.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module2) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = require_common()(exports);
    var { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/has-flag/index.js
var require_has_flag = __commonJS({
  "node_modules/has-flag/index.js"(exports, module2) {
    "use strict";
    module2.exports = (flag, argv) => {
      argv = argv || process.argv;
      const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
      const pos = argv.indexOf(prefix + flag);
      const terminatorPos = argv.indexOf("--");
      return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
    };
  }
});

// node_modules/supports-color/index.js
var require_supports_color = __commonJS({
  "node_modules/supports-color/index.js"(exports, module2) {
    "use strict";
    var os = require("os");
    var hasFlag = require_has_flag();
    var env = process.env;
    var forceColor;
    if (hasFlag("no-color") || hasFlag("no-colors") || hasFlag("color=false")) {
      forceColor = false;
    } else if (hasFlag("color") || hasFlag("colors") || hasFlag("color=true") || hasFlag("color=always")) {
      forceColor = true;
    }
    if ("FORCE_COLOR" in env) {
      forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
    }
    function translateLevel(level) {
      if (level === 0) {
        return false;
      }
      return {
        level,
        hasBasic: true,
        has256: level >= 2,
        has16m: level >= 3
      };
    }
    function supportsColor(stream) {
      if (forceColor === false) {
        return 0;
      }
      if (hasFlag("color=16m") || hasFlag("color=full") || hasFlag("color=truecolor")) {
        return 3;
      }
      if (hasFlag("color=256")) {
        return 2;
      }
      if (stream && !stream.isTTY && forceColor !== true) {
        return 0;
      }
      const min = forceColor ? 1 : 0;
      if (process.platform === "win32") {
        const osRelease = os.release().split(".");
        if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
          return Number(osRelease[2]) >= 14931 ? 3 : 2;
        }
        return 1;
      }
      if ("CI" in env) {
        if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
          return 1;
        }
        return min;
      }
      if ("TEAMCITY_VERSION" in env) {
        return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
      }
      if (env.COLORTERM === "truecolor") {
        return 3;
      }
      if ("TERM_PROGRAM" in env) {
        const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
        switch (env.TERM_PROGRAM) {
          case "iTerm.app":
            return version >= 3 ? 3 : 2;
          case "Apple_Terminal":
            return 2;
        }
      }
      if (/-256(color)?$/i.test(env.TERM)) {
        return 2;
      }
      if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
        return 1;
      }
      if ("COLORTERM" in env) {
        return 1;
      }
      if (env.TERM === "dumb") {
        return min;
      }
      return min;
    }
    function getSupportLevel(stream) {
      const level = supportsColor(stream);
      return translateLevel(level);
    }
    module2.exports = {
      supportsColor: getSupportLevel,
      stdout: getSupportLevel(process.stdout),
      stderr: getSupportLevel(process.stderr)
    };
  }
});

// node_modules/debug/src/node.js
var require_node = __commonJS({
  "node_modules/debug/src/node.js"(exports, module2) {
    var tty = require("tty");
    var util = require("util");
    exports.init = init;
    exports.log = log;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util.deprecate(() => {
    }, "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = require_supports_color();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} [0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return new Date().toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.format(...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug) {
      debug.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module2.exports = require_common()(exports);
    var { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  }
});

// node_modules/debug/src/index.js
var require_src = __commonJS({
  "node_modules/debug/src/index.js"(exports, module2) {
    if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
      module2.exports = require_browser();
    } else {
      module2.exports = require_node();
    }
  }
});

// node_modules/universal-analytics/lib/request.js
var require_request = __commonJS({
  "node_modules/universal-analytics/lib/request.js"(exports, module2) {
    var http = require("http");
    var https = require("https");
    var url = require("url");
    var debug = require_src()("universal-analytics");
    function getProtocol(path) {
      return url.parse(path).protocol === "http:" ? http : https;
    }
    function post(path, data, headers, callback) {
      request(path, "POST", data, headers, callback);
    }
    function request(path, method, body, headers = {}, callback) {
      const { hostname, port, pathname } = url.parse(path);
      const options = {
        hostname,
        port,
        path: pathname,
        method,
        headers
      };
      const req = getProtocol(path).request(options, function(response) {
        handleResponse(response, callback);
      });
      req.on("error", function(error) {
        callback(error);
        debug("Request error", error);
      });
      req.write(body);
      req.end();
    }
    function handleResponse(response, callback) {
      let body = "";
      const { headers, statusCode } = response;
      const hasError = statusCode >= 300;
      response.setEncoding("utf8");
      response.on("data", function(data) {
        body += data;
      });
      response.on("end", function() {
        callback(hasError ? body : null, hasError ? null : body, statusCode, headers);
      });
    }
    module2.exports = {
      post
    };
  }
});

// node_modules/universal-analytics/lib/index.js
var require_lib = __commonJS({
  "node_modules/universal-analytics/lib/index.js"(exports, module2) {
    var uuid = require_dist();
    var querystring = require("querystring");
    var url = require("url");
    var utils = require_utils();
    var config = require_config();
    var request = require_request();
    var debug = require_src()("universal-analytics");
    module2.exports = init;
    function init(tid, cid, options) {
      return new Visitor(tid, cid, options);
    }
    var Visitor = module2.exports.Visitor = function(tid, cid, options, context, persistentParams) {
      if (typeof tid === "object") {
        options = tid;
        tid = cid = null;
      } else if (typeof cid === "object") {
        options = cid;
        cid = null;
      }
      this._queue = [];
      this.options = options || {};
      if (this.options.hostname) {
        config.hostname = this.options.hostname;
      }
      if (this.options.path) {
        config.path = this.options.path;
      }
      if (this.options.http) {
        var parsedHostname = url.parse(config.hostname);
        config.hostname = "http://" + parsedHostname.host;
      }
      if (this.options.enableBatching !== void 0) {
        config.batching = options.enableBatching;
      }
      if (this.options.batchSize) {
        config.batchSize = this.options.batchSize;
      }
      this._context = context || {};
      this._persistentParams = persistentParams || {};
      this.tid = tid || this.options.tid;
      this.cid = this._determineCid(cid, this.options.cid, this.options.strictCidFormat !== false);
      if (this.options.uid) {
        this.uid = this.options.uid;
      }
    };
    module2.exports.middleware = function(tid, options) {
      this.tid = tid;
      this.options = options || {};
      var cookieName = this.options.cookieName || "_ga";
      var instanceName = this.options.instanceName || "visitor";
      delete this.options.instanceName;
      return function(req, res, next) {
        req[instanceName] = module2.exports.createFromSession(req.session);
        if (req[instanceName])
          return next();
        var cid;
        if (req.cookies && req.cookies[cookieName]) {
          var gaSplit = req.cookies[cookieName].split(".");
          cid = gaSplit[2] + "." + gaSplit[3];
        }
        req[instanceName] = init(tid, cid, options);
        if (req.session) {
          req.session.cid = req[instanceName].cid;
        }
        next();
      };
    };
    module2.exports.createFromSession = function(session) {
      if (session && session.cid) {
        return init(this.tid, session.cid, this.options);
      }
    };
    Visitor.prototype = {
      debug: function(d) {
        debug.enabled = arguments.length === 0 ? true : d;
        debug("visitor.debug() is deprecated: set DEBUG=universal-analytics to enable logging");
        return this;
      },
      reset: function() {
        this._context = null;
        return this;
      },
      set: function(key, value) {
        this._persistentParams = this._persistentParams || {};
        this._persistentParams[key] = value;
      },
      pageview: function(path, hostname, title, params, fn) {
        if (typeof path === "object" && path != null) {
          params = path;
          if (typeof hostname === "function") {
            fn = hostname;
          }
          path = hostname = title = null;
        } else if (typeof hostname === "function") {
          fn = hostname;
          hostname = title = null;
        } else if (typeof title === "function") {
          fn = title;
          title = null;
        } else if (typeof params === "function") {
          fn = params;
          params = null;
        }
        params = this._translateParams(params);
        params = Object.assign({}, this._persistentParams || {}, params);
        params.dp = path || params.dp || this._context.dp;
        params.dh = hostname || params.dh || this._context.dh;
        params.dt = title || params.dt || this._context.dt;
        this._tidyParameters(params);
        if (!params.dp && !params.dl) {
          return this._handleError("Please provide either a page path (dp) or a document location (dl)", fn);
        }
        return this._withContext(params)._enqueue("pageview", params, fn);
      },
      screenview: function(screenName, appName, appVersion, appId, appInstallerId, params, fn) {
        if (typeof screenName === "object" && screenName != null) {
          params = screenName;
          if (typeof appName === "function") {
            fn = appName;
          }
          screenName = appName = appVersion = appId = appInstallerId = null;
        } else if (typeof appName === "function") {
          fn = appName;
          appName = appVersion = appId = appInstallerId = null;
        } else if (typeof appVersion === "function") {
          fn = appVersion;
          appVersion = appId = appInstallerId = null;
        } else if (typeof appId === "function") {
          fn = appId;
          appId = appInstallerId = null;
        } else if (typeof appInstallerId === "function") {
          fn = appInstallerId;
          appInstallerId = null;
        } else if (typeof params === "function") {
          fn = params;
          params = null;
        }
        params = this._translateParams(params);
        params = Object.assign({}, this._persistentParams || {}, params);
        params.cd = screenName || params.cd || this._context.cd;
        params.an = appName || params.an || this._context.an;
        params.av = appVersion || params.av || this._context.av;
        params.aid = appId || params.aid || this._context.aid;
        params.aiid = appInstallerId || params.aiid || this._context.aiid;
        this._tidyParameters(params);
        if (!params.cd || !params.an) {
          return this._handleError("Please provide at least a screen name (cd) and an app name (an)", fn);
        }
        return this._withContext(params)._enqueue("screenview", params, fn);
      },
      event: function(category, action, label, value, params, fn) {
        if (typeof category === "object" && category != null) {
          params = category;
          if (typeof action === "function") {
            fn = action;
          }
          category = action = label = value = null;
        } else if (typeof label === "function") {
          fn = label;
          label = value = null;
        } else if (typeof value === "function") {
          fn = value;
          value = null;
        } else if (typeof params === "function") {
          fn = params;
          params = null;
        }
        params = this._translateParams(params);
        params = Object.assign({}, this._persistentParams || {}, params);
        params.ec = category || params.ec || this._context.ec;
        params.ea = action || params.ea || this._context.ea;
        params.el = label || params.el || this._context.el;
        params.ev = value || params.ev || this._context.ev;
        params.p = params.p || params.dp || this._context.p || this._context.dp;
        delete params.dp;
        this._tidyParameters(params);
        if (!params.ec || !params.ea) {
          return this._handleError("Please provide at least an event category (ec) and an event action (ea)", fn);
        }
        return this._withContext(params)._enqueue("event", params, fn);
      },
      transaction: function(transaction, revenue, shipping, tax, affiliation, params, fn) {
        if (typeof transaction === "object") {
          params = transaction;
          if (typeof revenue === "function") {
            fn = revenue;
          }
          transaction = revenue = shipping = tax = affiliation = null;
        } else if (typeof revenue === "function") {
          fn = revenue;
          revenue = shipping = tax = affiliation = null;
        } else if (typeof shipping === "function") {
          fn = shipping;
          shipping = tax = affiliation = null;
        } else if (typeof tax === "function") {
          fn = tax;
          tax = affiliation = null;
        } else if (typeof affiliation === "function") {
          fn = affiliation;
          affiliation = null;
        } else if (typeof params === "function") {
          fn = params;
          params = null;
        }
        params = this._translateParams(params);
        params = Object.assign({}, this._persistentParams || {}, params);
        params.ti = transaction || params.ti || this._context.ti;
        params.tr = revenue || params.tr || this._context.tr;
        params.ts = shipping || params.ts || this._context.ts;
        params.tt = tax || params.tt || this._context.tt;
        params.ta = affiliation || params.ta || this._context.ta;
        params.p = params.p || this._context.p || this._context.dp;
        this._tidyParameters(params);
        if (!params.ti) {
          return this._handleError("Please provide at least a transaction ID (ti)", fn);
        }
        return this._withContext(params)._enqueue("transaction", params, fn);
      },
      item: function(price, quantity, sku, name, variation, params, fn) {
        if (typeof price === "object") {
          params = price;
          if (typeof quantity === "function") {
            fn = quantity;
          }
          price = quantity = sku = name = variation = null;
        } else if (typeof quantity === "function") {
          fn = quantity;
          quantity = sku = name = variation = null;
        } else if (typeof sku === "function") {
          fn = sku;
          sku = name = variation = null;
        } else if (typeof name === "function") {
          fn = name;
          name = variation = null;
        } else if (typeof variation === "function") {
          fn = variation;
          variation = null;
        } else if (typeof params === "function") {
          fn = params;
          params = null;
        }
        params = this._translateParams(params);
        params = Object.assign({}, this._persistentParams || {}, params);
        params.ip = price || params.ip || this._context.ip;
        params.iq = quantity || params.iq || this._context.iq;
        params.ic = sku || params.ic || this._context.ic;
        params.in = name || params.in || this._context.in;
        params.iv = variation || params.iv || this._context.iv;
        params.p = params.p || this._context.p || this._context.dp;
        params.ti = params.ti || this._context.ti;
        this._tidyParameters(params);
        if (!params.ti) {
          return this._handleError("Please provide at least an item transaction ID (ti)", fn);
        }
        return this._withContext(params)._enqueue("item", params, fn);
      },
      exception: function(description, fatal, params, fn) {
        if (typeof description === "object") {
          params = description;
          if (typeof fatal === "function") {
            fn = fatal;
          }
          description = fatal = null;
        } else if (typeof fatal === "function") {
          fn = fatal;
          fatal = 0;
        } else if (typeof params === "function") {
          fn = params;
          params = null;
        }
        params = this._translateParams(params);
        params = Object.assign({}, this._persistentParams || {}, params);
        params.exd = description || params.exd || this._context.exd;
        params.exf = +!!(fatal || params.exf || this._context.exf);
        if (params.exf === 0) {
          delete params.exf;
        }
        this._tidyParameters(params);
        return this._withContext(params)._enqueue("exception", params, fn);
      },
      timing: function(category, variable, time, label, params, fn) {
        if (typeof category === "object") {
          params = category;
          if (typeof variable === "function") {
            fn = variable;
          }
          category = variable = time = label = null;
        } else if (typeof variable === "function") {
          fn = variable;
          variable = time = label = null;
        } else if (typeof time === "function") {
          fn = time;
          time = label = null;
        } else if (typeof label === "function") {
          fn = label;
          label = null;
        } else if (typeof params === "function") {
          fn = params;
          params = null;
        }
        params = this._translateParams(params);
        params = Object.assign({}, this._persistentParams || {}, params);
        params.utc = category || params.utc || this._context.utc;
        params.utv = variable || params.utv || this._context.utv;
        params.utt = time || params.utt || this._context.utt;
        params.utl = label || params.utl || this._context.utl;
        this._tidyParameters(params);
        return this._withContext(params)._enqueue("timing", params, fn);
      },
      send: function(fn) {
        var self = this;
        var count = 1;
        var fn = fn || function() {
        };
        debug("Sending %d tracking call(s)", self._queue.length);
        var getBody = function(params) {
          return params.map(function(x) {
            return querystring.stringify(x);
          }).join("\n");
        };
        var onFinish = function(err) {
          debug("Finished sending tracking calls");
          fn.call(self, err || null, count - 1);
        };
        var iterator = function() {
          if (!self._queue.length) {
            return onFinish(null);
          }
          var params = [];
          if (config.batching) {
            params = self._queue.splice(0, Math.min(self._queue.length, config.batchSize));
          } else {
            params.push(self._queue.shift());
          }
          var useBatchPath = params.length > 1;
          var path = config.hostname + (useBatchPath ? config.batchPath : config.path);
          debug("%d: %o", count++, params);
          var body = getBody(params);
          request.post(path, body, self.options.headers, nextIteration);
        };
        function nextIteration(err) {
          if (err)
            return onFinish(err);
          iterator();
        }
        iterator();
      },
      _enqueue: function(type, params, fn) {
        if (typeof params === "function") {
          fn = params;
          params = {};
        }
        params = this._translateParams(params) || {};
        Object.assign(params, {
          v: config.protocolVersion,
          tid: this.tid,
          cid: this.cid,
          t: type
        });
        if (this.uid) {
          params.uid = this.uid;
        }
        this._queue.push(params);
        if (debug.enabled) {
          this._checkParameters(params);
        }
        debug("Enqueued %s (%o)", type, params);
        if (fn) {
          this.send(fn);
        }
        return this;
      },
      _handleError: function(message, fn) {
        debug("Error: %s", message);
        fn && fn.call(this, new Error(message));
        return this;
      },
      _determineCid: function() {
        var args = Array.prototype.splice.call(arguments, 0);
        var id;
        var lastItem = args.length - 1;
        var strict = args[lastItem];
        if (strict) {
          for (var i = 0; i < lastItem; i++) {
            id = utils.ensureValidCid(args[i]);
            if (id !== false)
              return id;
            if (id != null)
              debug("Warning! Invalid UUID format '%s'", args[i]);
          }
        } else {
          for (var i = 0; i < lastItem; i++) {
            if (args[i])
              return args[i];
          }
        }
        return uuid.v4();
      },
      _checkParameters: function(params) {
        for (var param in params) {
          if (config.acceptedParameters.indexOf(param) !== -1 || config.acceptedParametersRegex.filter(function(r) {
            return r.test(param);
          }).length) {
            continue;
          }
          debug("Warning! Unsupported tracking parameter %s (%s)", param, params[param]);
        }
      },
      _translateParams: function(params) {
        var translated = {};
        for (var key in params) {
          if (config.parametersMap.hasOwnProperty(key)) {
            translated[config.parametersMap[key]] = params[key];
          } else {
            translated[key] = params[key];
          }
        }
        return translated;
      },
      _tidyParameters: function(params) {
        for (var param in params) {
          if (params[param] === null || params[param] === void 0) {
            delete params[param];
          }
        }
        return params;
      },
      _withContext: function(context) {
        var visitor2 = new Visitor(this.tid, this.cid, this.options, context, this._persistentParams);
        visitor2._queue = this._queue;
        return visitor2;
      }
    };
    Visitor.prototype.pv = Visitor.prototype.pageview;
    Visitor.prototype.e = Visitor.prototype.event;
    Visitor.prototype.t = Visitor.prototype.transaction;
    Visitor.prototype.i = Visitor.prototype.item;
  }
});

// node_modules/universal-analytics/index.js
var require_universal_analytics = __commonJS({
  "node_modules/universal-analytics/index.js"(exports, module2) {
    module2.exports = require_lib();
  }
});

// netlify/functions/tracking/index.ts
__export(exports, {
  handler: () => handler
});
var import_universal_analytics = __toModule(require_universal_analytics());
var visitor = (0, import_universal_analytics.default)("UA-224282906-1");
var handler = (event, _, callback) => {
  console.log("hello");
  callback(null, {
    statusCode: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate"
    },
    body: `<?xml version="1.0" encoding="iso-8859-1"?>
        <!-- Generator: Adobe Illustrator 17.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
        <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
        <svg version="1.1" fill="#eeeeee" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
             viewBox="0 0 229.5 229.5" style="enable-background:new 0 0 229.5 229.5;" xml:space="preserve">
        <path fill="#eeeeee"  d="M214.419,32.12c-0.412-2.959-2.541-5.393-5.419-6.193L116.76,0.275c-1.315-0.366-2.704-0.366-4.02,0L20.5,25.927
            c-2.878,0.8-5.007,3.233-5.419,6.193c-0.535,3.847-12.74,94.743,18.565,139.961c31.268,45.164,77.395,56.738,79.343,57.209
            c0.579,0.14,1.169,0.209,1.761,0.209s1.182-0.07,1.761-0.209c1.949-0.471,48.076-12.045,79.343-57.209
            C227.159,126.864,214.954,35.968,214.419,32.12z M174.233,85.186l-62.917,62.917c-1.464,1.464-3.384,2.197-5.303,2.197
            s-3.839-0.732-5.303-2.197l-38.901-38.901c-1.407-1.406-2.197-3.314-2.197-5.303s0.791-3.897,2.197-5.303l7.724-7.724
            c2.929-2.928,7.678-2.929,10.606,0l25.874,25.874l49.89-49.891c1.406-1.407,3.314-2.197,5.303-2.197s3.897,0.79,5.303,2.197
            l7.724,7.724C177.162,77.508,177.162,82.257,174.233,85.186z"/>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        <g>
        </g>
        </svg>
        `
  });
  const { queryStringParameters } = event;
  const DEC = {
    "-": "+",
    _: "/",
    ".": "="
  };
  try {
    if (queryStringParameters && queryStringParameters.q) {
      console.log(queryStringParameters);
      const data = JSON.parse(atob(queryStringParameters.q.replace(/[-_.]/g, (m) => DEC[m])));
      data.ds = "web";
      data.aip = "1";
      data.npa = "1";
      console.log(data);
      switch (data.t) {
        case "pageview":
          visitor.pageview(data).send();
          break;
        case "event":
          visitor.event(data).send();
          break;
        case "exception":
          visitor.exception(data).send();
          break;
        case "timing":
          visitor.timing(data).send();
          break;
      }
    }
  } catch (error) {
    console.log(error);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=index.js.map
