import React from 'react';
import ReactDOM from 'react-dom';
import { Resources, oneTimeLoader, Resource } from 'resources/resources';


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


describe('test Resources', () => {
    it('should create Resource object when accessed if not exist', () => {
        const res = new Resources();
        const res1 = res.get('res1');
        expect(res1).toBeInstanceOf(Resource);
        expect(res.get('res1')).toStrictEqual(res1);
    });
});
