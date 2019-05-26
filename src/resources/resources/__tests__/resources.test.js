import React from 'react';
import ReactDOM from 'react-dom';
import { Resources, oneTimeLoader, httpOneTimeLoader, Resource, withResources } from 'resources';
import HttpMock from 'xhr-mock';
import { render, cleanup } from 'react-testing-library';


describe('test Resource', () => {
    it('value and loader should be undefined by default', () => {
        const r = new Resource();
        expect(r.value).toBeUndefined();
        expect(r.loader).toBeUndefined();
    });

    it('should be able to init the value when creating the Resource', () => {
        const r = new Resource('value');
        expect(r.value).toEqual('value');
    });

    it('value should be writeable and readable', () => {
        const r = new Resource();
        r.value = 'value';
        expect(r.value).toEqual('value');
    });

    it('should be able to set the loader', () => {
        const r = new Resource();
        const loader = () => {};
        r.loader = loader;
        expect(r.loader).toStrictEqual(loader);
    });

    it('should use the loader to asynchronously return the value', () => {
        const r = new Resource();
        const loader = () => Promise.resolve('LOADED');
        r.loader = loader;
        return r.load().then((result) => {
            expect(result).toEqual('LOADED');
        });
    });

    it('should automatically set "value" property when using loader', () => {
        const r = new Resource();
        const loader = () => {
            return new Promise((resolve, reject) => {
                resolve('LOADED');
            });
        };
        r.loader = loader;
        return r.load().then((result) => {
            expect(result).toEqual('LOADED');
            expect(r.value).toEqual('LOADED');
        });
    });

    it('should return a Promise with "value" if loader is undefined', () => {
        const r = new Resource('VALUE');
        return r.load().then((result) => { 
            expect(result).toEqual('VALUE');
        });
    });
});


describe('test oneTimeLoader', () => {
    it('should load the value once for all', (done) => {
        const r = new Resource('default');

        const fn = jest.fn();
        r.loader = oneTimeLoader(() => {
            fn(); 
            return Promise.resolve('LOADED');
        });

        r.load().then((result) => {
            expect(result).toEqual('LOADED');
        }).then(() => {
            r.load().then((result) => {
                expect(result).toEqual('LOADED');
                expect(fn).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });
});


describe('test httpOneTimeLoader', () => {
    beforeEach(() => {
        // mock HTTP requests
        HttpMock.setup();
    });

    afterEach(() => {
        HttpMock.teardown();
    });

    it('should load the value one time from HTTP', (done) => {
        const r = new Resource('placeholder');
        r.loader = httpOneTimeLoader('https://example.com/test.txt');

        // setup mock request
        const fn = jest.fn();
        HttpMock.get(
            'https://example.com/test.txt', (req, res) => {
                fn();
                return res.status(201)
                    .headers({ 'Content-Type': 'text/plain' })
                    .body('LOADED');
            }
        );

        r.load().then((result) => {
            expect(result).toEqual('LOADED');
        }).then(() => {
            r.load().then((result) => {
                expect(result).toEqual('LOADED');
                expect(fn).toHaveBeenCalledTimes(1);
                done();
            });
        });
    });
});


describe('test Resources', () => {
    it('should create Resource object when accessed if not exist', () => {
        const res = new Resources();
        const res1 = res.get('res1');
        expect(res1).toBeInstanceOf(Resource);
        expect(res.get('res1')).toStrictEqual(res1);
    });

    it('should create Resources when initialized with a mapping', () => {
        const res = new Resources({
            res1: {
                value: 'res1Value',
                loader: 'res1Loader',
            },
            res2: {
                value: 'res2Value',
                loader: 'res2Loader',
            },
        });
        const res1 = res.get('res1');
        expect(res1.value).toEqual('res1Value');
        expect(res1.loader).toEqual('res1Loader');
        const res2 = res.get('res2');
        expect(res2.value).toEqual('res2Value');
        expect(res2.loader).toEqual('res2Loader');
    });

    it('should only use defined properties when initialized with a mapping', () => {
        const res = new Resources({
            res1: {
                value: 'res1Value',
            },
            res2: {
            },
        });
        const res1 = res.get('res1');
        expect(res1.value).toEqual('res1Value');
        expect(res1.loader).toBeUndefined();
        const res2 = res.get('res2');
        expect(res2.value).toBeUndefined();
        expect(res2.loader).toBeUndefined();
    });

    it('should use a string as value property when initialized with a mapping', () => {
        const res = new Resources({
            res1: 'res1Value',
        });
        const res1 = res.get('res1');
        expect(res1.value).toEqual('res1Value');
        expect(res1.loader).toBeUndefined();
    });

    it('getValue method should return value property of Resource object', () => {
        const res = new Resources({
            res1: 'res1Value',
        });
        
        expect(res.getValue('res1')).toEqual('res1Value');
        // just check still creates the resource:
        expect(res.getValue('res2')).toBeUndefined();
    });

    it('getValue method should create Resource if needed', () => {
        const res = new Resources();
        expect(res.getValue('res1')).toBeUndefined();
    });

    it('load method should load the resource and return the promise', () => {
        const res = new Resources({
            res1: {
                loader: () => Promise.resolve('LOADED')
            },
        });
        
        return res.load('res1').then((result) => {
            expect(result).toEqual('LOADED');
            expect(res.get('res1').value).toEqual('LOADED');
        });
    });

    it('load method should create Resource if needed', () => {
        const res = new Resources();
        
        return res.load('res1').then((result) => {
            expect(result).toBeUndefined();
            expect(res.get('res1').value).toBeUndefined();
        });
    });
});


describe('test withResources HOC', () => {
    afterEach(() => {
        cleanup();
    });

    it('should load and provide the resources to the wrapped component', () => {
        const source = new Resources({
            res1: {
                value: 'loading',
                loader: () => Promise.resolve('res1Value'),
            },
            res2: 'res2Value',
        });

        const resources = { r1: 'res1', r2: 'res2' };
        const _MyComp = (props) => {
            return (
                  <div>
                    <label>{props.r1}</label>
                    <label>{props.r2}</label>
                  </div>
            );
        };
        const MyComp = withResources(_MyComp, resources, () => source);

        const {getByText, rerender} = render(<MyComp />);
        getByText('loading');
        getByText('res2Value');

        // eventually check the loaded value is provided when available
        return Promise.resolve().then(() => {
            rerender(<MyComp />);
            getByText('res1Value');
        });
    });

    it('should override resource value by specifically passing a prop', () => {
        const source = new Resources({
            res1: 'res1Value',
            res2: 'res2Value',
        });
        const resources = { r1: 'res1', r2: 'res2' };
        const _MyComp = (props) => {
            return (
                  <div>
                    <label>{props.r1}</label>
                    <label>{props.r2}</label>
                  </div>
            );
        };
        const MyComp = withResources(_MyComp, resources, () => source);

        const {getByText} = render(<MyComp r1='override'/>);
        getByText('override');
        getByText('res2Value');
    });
});
