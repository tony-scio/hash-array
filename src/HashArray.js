var JClass = require('jclass');

var HashArray = JClass.extend({
	init: function(keyFields, callback) {
		this._map = {};
		this._list = [];
		this.callback = callback;

		this.keyFields = keyFields;

		if (callback) {
			callback('construct');
		}
	},
	add: function() {
		for (var i = 0; i < arguments.length; i++) {
			var obj = arguments[i],
        needsDupCheck = false;
			for (var key in this.keyFields) {
				key = this.keyFields[key];
				var inst = this.find(obj, key);
				if (inst) {
					if (this._map[inst]) {
						if (this._map[inst].indexOf(obj) != -1) {
							// Cannot add the same item twice
              needsDupCheck = true;
							continue;
						}
						this._map[inst].push(obj);
					} else this._map[inst] = [obj];
				}
			}

      if (!needsDupCheck || this._list.indexOf(obj) == -1)
			  this._list.push(obj);
		}
		if (this.callback) {
			this.callback('add', Array.prototype.slice.call(arguments, 0));
		}
	},
	addMap: function(key, obj) {
		this._map[key] = obj;
		if (this.callback) {
			this.callback('addMap', {
				key: key,
				obj: obj
			});
		}
	},
	get: function(key) {
		return (!(this._map[key] instanceof Array) || this._map[key].length != 1) ? this._map[key] : this._map[key][0];
	},
  getAll: function(keys) {
    var res = new HashArray(this.keyFields);
    for (var key in keys)
      res.add.apply(res, this.getAsArray(keys[key]));

    return res.all;
  },
  getAsArray: function(key) {
    return this._map[key] || [];
  },
	has: function(key) {
		return this._map.hasOwnProperty(key);
	},
	hasMultiple: function(key) {
		return this._map[key] instanceof Array;
	},
	removeByKey: function() {
		var removed = [];
		for (var i = 0; i < arguments.length; i++) {
			var key = arguments[i];
			var items = this._map[key].concat();
			if (items) {
				removed = removed.concat(items);
				for (var j in items) {
					var item = items[j];
					for (var ix in this.keyFields) {
						var key2 = this.find(item, this.keyFields[ix]);
						if (key2 && this._map[key2]) {
							var ix = this._map[key2].indexOf(item);
							if (ix != -1) {
								this._map[key2].splice(ix, 1);
							}

							if (this._map[key2].length == 0)
								delete this._map[key2];
						}
					}

					this._list.splice(this._list.indexOf(item), 1);
				}
			}
			delete this._map[key];
		}

		if (this.callback) {
			this.callback('removeByKey', removed);
		}
	},
	remove: function() {
		for (var i = 0; i < arguments.length; i++) {
			var item = arguments[i];
			for (var ix in this.keyFields) {
				var key = this.find(item, this.keyFields[ix]);
				if (key) {
					var ix = this._map[key].indexOf(item);
					if (ix != -1)
						this._map[key].splice(ix, 1);

					if (this._map[key].length == 0)
						delete this._map[key];
				}
			}

			this._list.splice(this._list.indexOf(item), 1);
		}

		if (this.callback) {
			this.callback('remove', arguments);
		}
	},
	removeAll: function() {
		var old = this._list.concat();
		this._map = {};
		this._list = [];

		if (this.callback) {
			this.callback('remove', old);
		}
	},
	find: function(obj, path) {
		if (typeof path === 'string') {
			return obj[path];
		}

		var dup = path.concat();
		// else assume array.
		while (dup.length && obj) {
			obj = obj[dup.shift()];
		}

		return obj;
	},
	clone: function(callback) {
		var n = new HashArray(this.keyFields.concat(), callback ? callback : this.callback);
		n.add.apply(n, this.all.concat());
		return n;
	}
});

Object.defineProperty(HashArray.prototype, 'all', {
	get: function () {
		return this._list;
	}
});

Object.defineProperty(HashArray.prototype, 'map', {
	get: function () {
		return this._map;
	}
});

module.exports = HashArray;

if (typeof window !== 'undefined')
	window.HashArray = HashArray;