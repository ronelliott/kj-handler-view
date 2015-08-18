'use strict';

var should = require('should'),
    sinon = require('sinon'),
    factory = require('./view'),
    reflekt = require('reflekt');

describe('view', function() {
    it('should throw an error if no renderer is defined', function() {
        var params = {},
            res = { headers: sinon.spy(), write: sinon.spy() },
            resolver = new reflekt.ObjectResolver(),
            finish = sinon.spy();
        (function() {
            factory(params)(resolver, res, finish);
        }).should.throw('Undefined renderer: render');
    });

    it('should write the template data to the response', function(done) {
        var params = {},
            res = { headers: sinon.spy(), write: sinon.spy() },
            render = sinon.spy(function(name, ctx, callback) { callback(null, 'foo'); }),
            resolver = new reflekt.ObjectResolver({ render: render }),
            finish = sinon.spy(function() {
                res.write.calledWith('foo').should.equal(true);
                done();
            });
        factory(params)(resolver, res, finish);
        finish.called.should.equal(true);
    });

    it('should set the content type to `text/html` if no content type is defined', function(done) {
        var params = {},
            res = { headers: sinon.spy(), write: sinon.spy() },
            render = sinon.spy(function(name, ctx, callback) { callback(null, ''); }),
            resolver = new reflekt.ObjectResolver({ render: render }),
            finish = sinon.spy(function() {
                res.headers.calledWith('Content-Type', 'text/html').should.equal(true);
                done();
            });
        factory(params)(resolver, res, finish);
        finish.called.should.equal(true);
    });

    it('should set the defined content type', function(done) {
        var params = { contentType: 'ducks' },
            res = { headers: sinon.spy(), write: sinon.spy() },
            render = sinon.spy(function(name, ctx, callback) { callback(null, ''); }),
            resolver = new reflekt.ObjectResolver({ render: render }),
            finish = sinon.spy(function() {
                res.headers.calledWith('Content-Type', 'ducks').should.equal(true);
                done();
            });
        factory(params)(resolver, res, finish);
        finish.called.should.equal(true);
    });

    it('should pass the context directly if an object is given', function(done) {
        var context = { foo: 'bar' },
            params = { context: context },
            res = { headers: sinon.spy(), write: sinon.spy() },
            render = sinon.spy(function(name, ctx, callback) { ctx.should.eql(context); callback(null, ''); }),
            resolver = new reflekt.ObjectResolver({ render: render }),
            finish = sinon.spy(done);
        factory(params)(resolver, res, finish);
        finish.called.should.equal(true);
    });

    it('should resolve the items if an array is given', function(done) {
        var params = { context: [ 'foo', 'bar' ] },
            res = { headers: sinon.spy(), write: sinon.spy() },
            render = sinon.spy(function(name, ctx, callback) { ctx.should.eql({ foo: 'foo', bar: 'bar' }); callback(null, ''); }),
            resolver = new reflekt.ObjectResolver({ foo: 'foo', bar: 'bar', render: render }),
            finish = sinon.spy(done);
        factory(params)(resolver, res, finish);
        finish.called.should.equal(true);
    });

    it('should use the defined renderer', function(done) {
        var params = { renderer: 'ducks' },
            res = { headers: sinon.spy(), write: sinon.spy() },
            render = sinon.spy(function(name, ctx, callback) { callback(null, 'foo'); }),
            resolver = new reflekt.ObjectResolver({ ducks: render }),
            finish = sinon.spy(function() {
                res.write.calledWith('foo').should.equal(true);
                done();
            });
        factory(params)(resolver, res, finish);
        finish.called.should.equal(true);
    });
});
