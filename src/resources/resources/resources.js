/**
 * Resources
 *
 * component:    Resources
 * description:  global mapping for accessing various resources
 *
 * @exports Resources (default)
 * @exports Resource
 */
import React, { Component } from 'react';


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
     * @returns Resource object
     */
    get(key) {
        if (key in this._mapping)
            return this._mapping[key];
        // create new Resource object
        const res = new Resource();
        this._mapping[key] = res;
        return res;
    }

    /**
     * get the value of the Resource object associated to a specific
     * key, creating it if needed.
     * Convenience method, equivalen to 'get(key).value'
     *
     * @param {string}  key the unique key identifying the resource 
     * @returns Resource.value property
     */
    getValue(key) {
        return this.get(key).value;
    }

    /**
     * load the Resource object associated to a specific key, creating
     * it if needed. Returns the Promise.
     * Convenience method, equivalen to 'get(key).load()'
     *
     * @param {string}  key the unique key identifying the resource 
     * @returns the Promise returned by Resource.load
     */
    load(key) {
        return this.get(key).load();
    }
}


/**
 * withResources
 *  
 * HOC that automatically loads specified resources from a Resources
 * object and provide them in as props to the Wrapped component.
 *
 * The resources to load are specified through a javascript object,
 * which contains a mapping of 'props_key': 'resource_key' where
 * 'props_key' is the property that will be used to provide the value 
 * to the wrapped component (the component will use 'props.<props_key>')
 * and 'resource_key' is the key to use for retrieving the resource in
 * the Resource object.
 *
 * @example
 * const source = new Resources({ res1, res2 });
 * const resources =  { r1: 'res1', r2: 'res2' };
 * const _MyComp = (props) => {
 *    <div>
 *      <label>{props.r1}</label>
 *      <label>{props.r2}</label>
 *    </div>
 * };
 * const MyComp = withResources(_MyComp, resources, (props) => source);
 * 
 * @param {Component}    WrappedComponent  the component to wrap
 * @param {object}    resources  the resources to load (props_key: resource_key)
 * @param {function}    source  (props) => Resources object
 */
export const withResources = (WrappedComponent, resources, source) => {
    return class extends Component {
        /**
         * The resources are loaded into the constructor. Note the
         * resources are loaded asynchronously, so the value may not
         * be loaded when the component is rendered.
         *
         * For each resource, once the value is loaded a forceUpdate
         * will be performed on the component to ensure it renders.
         * 
         * @todo is forceUpdate the best way to do this
         */
        constructor(props) {
            super(props);
            const res = source(props);
            const render = this.forceUpdate.bind(this);
            for (let key in resources)
                res.load(resources[key]).then(() => render());
        }

        /**
         * render the wrapped component, providing the values of the
         * specified resources as props. The values will be overriden
         * by any property specifically given to the component with the
         * same key as a specified resource (through 'resources' param).
         */
        render() {
            const res = source(this.props);
            const values = {};
            for (let key in resources)
                values[key] = res.getValue(resources[key]);
            // be able to override values with props
            const props = {
                ...values,
                ...this.props
            };
            return <WrappedComponent {...props} />;
        }
    };
};
