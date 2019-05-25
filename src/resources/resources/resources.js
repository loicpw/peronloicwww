/**
 * Resources
 *
 * component:    Resources
 * description:  global mapping for accessing various resources
 *
 * @exports Resources (default)
 * @exports Resource
 */


/**
 * Resource
 *  
 * Resource allows to both get the value of a particular resource and
 * to set its value. The resource user is expected to be decoupled from
 * the resource provider (setting the value).
 *
 * Getting the value: Resource provides two ways of getting the value:
 * - Synchronously using the 'value' property
 * - Asynchronously using the 'load' method, which returns a Promise
 * 
 * The resource user knows how the resource should be accessed. When
 * the resource needs to be loaded (ex: HTTP request) then the 'value'
 * property can contain a placeholder if needed.
 *
 * Setting the value: Resource contains two properties to set the value:
 * - 'value', which can be used synchronously by resource users
 * - 'loader', which is either undefined or a function returning a
 *   Promise (sending the value when it resolves). If it's undefined
 *   then a call to 'load' method will return a Promise that will
 *   resolve immediately with the 'value' property. When the Promise
 *   resolves Resource automatically sets the 'value' property with the
 *   given value.
 * 
 * @example
 * const r = new Resource('value');
 * expect(r.value).toEqual('value');
 * r.value = 'value2';
 *
 * @example
 * const r = new Resource('default value');
 * let val;
 * r.loader = () => {
 *   if (typeof(val) != 'undefined')
 *      return Promise.resolve(val);
 *   return new Promise((resolve, reject) => {
 *      const loader = new Loader('my resource');
 *      loader.onLoad((value) => {
 *          val = value;
 *          resolve(value);
 *      });
 *      loader.load(); // async
 *   }); 
 * };
 * r.load().then((value) => {
 *   expect(r.value).toEqual(value);
 * });
 * 
 */
export class Resource {
    /**
     * @constructs Resource
     *
     * @param {String}  [value] initial value for the 'value' property.
     */
    constructor(value) {
        this.value = value;
        this.loader = undefined;
    }

    /**
     * load the resource asynchronously using "loader" property
     * If "loader" is undefined then creates a Promise that resolves
     * immediately with the current "value".
     *
     * Sets "value" property when the "loader" resolves.
     *
     * @returns Promise
     *
     * @example
     * r.load().then((value) => {
     *    console.log("resource loaded:", value);
     * });
     */
    load() {
        // return a resolved Promise if loader is undefined
        if (typeof(this.loader) == 'undefined')
            return Promise.resolve(this.value);
        // set the "value" property when the loader Promise resolves
        return this.loader().then((value) => {
            this.value = value;
            return value;
        });
    }
}


/**
 * oneTimeLoader
 *  
 * This is intended to be used to set "loader" attribute on "Resource":
 *
 * Helper function decorator that calls the given loader function only
 * once. The loaded value is memorized and then a resolved Promise is
 * returned for subsequent calls.
 * 
 * @example
 * const r = new Resource('default value');
 * r.loader = oneTimeLoader(() => {
 *   // will be called once
 *   return new Promise((resolve, reject) => {
 *      const loader = new Loader('my resource');
 *      loader.onLoad(resolve);
 *      loader.load(); // async
 *   }); 
 * });
 * 
 * @param {function}    loader  a function returning a Promise.
 */
export const oneTimeLoader = (loader) => {
    let loaded = false;
    let loadedValue;
    return () => {
        // already loaded
        if (loaded)
            return Promise.resolve(loadedValue);
        // first load
        return loader().then((value) => {
            loaded = true;
            loadedValue = value;
            return value;
        });
    };
};


/**
 * httpOneTimeLoader
 *  
 * This is intended to be used to set "loader" attribute on "Resource":
 *
 * load a resource using a XMLHttpRequest object, the request will be
 * performed only one time. See also oneTimeLoader.
 *
 * The value will be the XMLHttpRequest.response property, whose type
 * depends on the body type (text, object...)
 *
 * @todo the value will never be loaded if the request fails.
 *
 * @example
 * const r = new Resource('placeholder');
 * r.loader = httpOneTimeLoader('https://example.com/test.txt');
 * 
 * @param {string}    request  the HTTP request to get the resource.
 */
export const httpOneTimeLoader = (request) => {
    // the request will be performed only one time
    return oneTimeLoader(() => {
        return new Promise((resolve, reject) => {
            // make request, resolve when complete
            const Http = new XMLHttpRequest();
            Http.open("GET", request);
            Http.onload = () => {
                // TODO: will never resolve if error => use reject
                resolve(Http.response);
            };
            Http.send();
        });
    });
}; 


/**
 * Resources
 *  
 * provides a global mapping to getting resources, such as urls,
 * text or other data obtained from various sources.
 * 
 * Resources provides a Resource instance for a given key, and this
 * Resource instance allows to access the resource value, synchronously
 * or asynchronously.
 *
 * A single Resources instance is expected to be stored in the global
 * state so the mapping is accessible everywhere, and resource users
 * can be decoupled from the provider (the value or the loader that
 * gives the resource's value - which knows how to get the value -).
 *
 * @example
 * r = Resources();
 * res1 = r.get('res1');  // create and return the Resource object
 * res1.value = 'res1Value';
 * res1.loader = res1Loader;  // see also Resource
 *
 * @example
 * r = Resources({
 *      res1: {
 *          value: 'res1Value',
 *          loader: res1Loader
 *      },
 *      res2: {
 *          value: 'res2Value'
 *      },
 *      res3: 'res3Value',
 *      res4: {},
 * })
 */
export class Resources {
    /**
     * @constructs Resources
     *
     * If a mapping is provided, then the specified resources
     * will be initialized with the provided properties.
     * Resources are specified either by a string, in which case the
     * string will be used to initialize the 'value' property, or by
     * an object, in which case the 'value' and 'loader' properties
     * will be used if present (otherwise undefined).
     *
     * @param {object}  mapping initialize the specified resources
     */
    constructor(mapping) {
        this._mapping = {};
        if (typeof(mapping) == 'undefined')
            return;

        // initialize the provided resources
        for (let key in mapping) {
            const res = this.get(key);
            const obj = mapping[key];
            if (typeof(obj) == 'string') {
                // use provided string as resource's value
                res.value = obj;
            } else {
                // assumes javascript object
                // uses relevant properties, undefined by default
                res.value = obj.value;
                res.loader = obj.loader;
            }
        }
    }

    /**
     * get a Resource object associated to a specific key,
     * creating it if doesn't exist.
     *
     * @param {string}  key the unique key identifying the resource 
     */
    get(key) {
        if (key in this._mapping)
            return this._mapping[key];
        // create new Resource object
        const res = new Resource();
        this._mapping[key] = res;
        return res;
    }
}
