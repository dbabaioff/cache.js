var Storage = (function() {
    var Storage = function(type) {
        if (!(this instanceof Storage)) {
            return new Storage(type);
        }

        return this.init(type);
    },
	
    storageMap = {local: 'localStorage', session: 'sessionStorage'},
    storageKey = 'StorageJS',
    unitTime = {'ms': 1, 's': 1000, 'm': 1000 * 60, 'h': 1000 * 60 * 60, 'd': 1000 * 60 * 60 * 24};

    Storage.prototype = {
        storageType: '',
        
        support: {},
        
        expireMap: {},
        
        init: function(type) {
            // Check browse support
            this.checkSupport();
    
            if (typeof type === 'string') {
                if (Object.prototype.hasOwnProperty.call(storageMap, type)) {
					if (this.support[storageMap[type]] === true) {
						this.storageType = storageMap[type];
					}
                    else {
                         throw storageMap[type] + ' unavailable!'
                    }

                }
                else {
					throw 'Invalid argument.';
				}
            }
            else {
                throw 'Invalid argument.';
            }

            return this;
        },
        
        set: function(key, value, expire) {
            window[this.storageType].setItem(key, JSON.stringify(value));

            this.setExpiry(key, expire);
            
            return this;
        },
        
        get: function(key) {
            if (this.isExpired(key)) {
				this.remove(key);
				return null;
			}
			
			var data = JSON.parse(window[this.storageType].getItem(key));
			return (data || null);
        },
		
		getAll: function() {
            var i,
                length = length = window[this.storageType].length,
                key,
                storageAll = {};
            for (i = 0; i < length; i++) {
                key = window[this.storageType].key(i);
                storageAll[key] = this.get(key);
            }
            
            return storageAll;
		},
        
        remove: function(key) {
			window[this.storageType].removeItem(key);
            this.setExpiry(key, false);
            return this;
        },
        
        removeAll: function() {
            window[this.storageType].clear();
            return this;
        },
        
        // If you set the expire to false, you remove the expire from this item
        setExpiry: function(key, expire) {
            this.expireMap = JSON.parse(window[this.storageType].getItem(storageKey)) || {};
            
            if (expire === false) {
                delete this.expireMap[key];
            }
            else {
                var expire_key;
                for (expire_key in expire) {}

                if (Object.prototype.hasOwnProperty.call(unitTime, expire_key)) {
                    this.expireMap[key] = (new Date).getTime() + unitTime[expire_key] * expire[expire_key];
                }
            }

            window[this.storageType][storageKey] = JSON.stringify(this.expireMap);
            return this;
		},
		
		isExpired: function(key) {
            return (this.expireMap[key] < (new Date).getTime());
		},
		
		hasKey: function(key) {
			return !!window[this.storageType].getItem(key);
        },
        
        isEmptyObject: function(obj) {
            for (var name in obj) {
                return false;
            }
            return true;
        },

        checkSupport: function() {
            if (this.isEmptyObject(this.support)) {
                // Requires json
				if (!JSON) throw 'JSON unavailable!';
				
				// localStorage
                try {
                    this.support.localStorage = !!localStorage.getItem;
                } catch(e) {
                    this.support.localStorage = false;
                }
                // sessionStorage
                try {
                    this.support.sessionStorage = !!sessionStorage.getItem;
                } catch(e){
                    this.support.sessionStorage = false;
                }
            }
        }
    };

    return Storage;
}());
