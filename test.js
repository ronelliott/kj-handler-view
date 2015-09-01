'use strict';

var should = require('should'),
    sinon = require('sinon'),
    handler = require('./handler'),
    reflekt = require('reflekt');

describe('view', function() {
    it('should call the $next with an error if no renderer is defined', function() {
        var params = {},
            res = { header: sinon.spy(), write: sinon.spy() },
            resolver = new reflekt.ObjectResolver(),
            caller = reflekt.caller(resolver),
            finish = sinon.spy(),
            next = sinon.spy();
        handler(params, resolver)(caller, res, next, finish);
        next.called.should.equal(true);
        next.lastCall.args[0].message.should.equal('Undefined renderer: $render');
    });

    it('should write the template data to the response', function(done) {
        var params = {},
            res = { header: sinon.spy(), write: sinon.spy() },
            render = function(template, context, callback) { callback(null, 'foo'); },
            resolver = new reflekt.ObjectResolver({ $render: render }),
            caller = reflekt.caller(resolver),
            finish = sinon.spy(function() {
                res.write.calledWith('foo').should.equal(true);
                done();
            }),
            next = sinon.spy();
        handler(params, resolver)(caller, res, next, finish);
        finish.called.should.equal(true);
    });

    it('should set the content type to `text/html` if no content type is defined', function(done) {
        var params = {},
            res = { header: sinon.spy(), write: sinon.spy() },
            render = function(template, context, callback) { callback(null, ''); },
            resolver = new reflekt.ObjectResolver({ $render: render }),
            caller = reflekt.caller(resolver),
            finish = sinon.spy(function() {
                res.header.calledWith('Content-Type', 'text/html').should.equal(true);
                done();
            }),
            next = sinon.spy();
        handler(params, resolver)(caller, res, next, finish);
        finish.called.should.equal(true);
    });

    it('should set the defined content type', function(done) {
        var params = { contentType: 'ducks' },
            res = { header: sinon.spy(), write: sinon.spy() },
            render = function(template, context, callback) { callback(null, ''); },
            resolver = new reflekt.ObjectResolver({ $render: render }),
            caller = reflekt.caller(resolver),
            finish = sinon.spy(function() {
                res.header.calledWith('Content-Type', 'ducks').should.equal(true);
                done();
            }),
            next = sinon.spy();
        handler(params, resolver)(caller, res, next, finish);
        finish.called.should.equal(true);
    });

    it('should pass the context directly if an object is given', function(done) {
        var context = { foo: 'bar' },
            params = { context: context },
            res = { header: sinon.spy(), write: sinon.spy() },
            render = function(template, context, callback) { context.should.eql(context); callback(null, ''); },
            resolver = new reflekt.ObjectResolver({ $render: render }),
            caller = reflekt.caller(resolver),
            finish = sinon.spy(done),
            next = sinon.spy();
        handler(params, resolver)(caller, res, next, finish);
        finish.called.should.equal(true);
    });

    it('should resolve the items if an array is given', function(done) {
        var params = { context: [ 'foo', 'bar' ] },
            res = { header: sinon.spy(), write: sinon.spy() },
            render = function(template, context, callback) { context.should.eql({ foo: 'foo', bar: 'bar' }); callback(null, ''); },
            resolver = new reflekt.ObjectResolver({ foo: 'foo', bar: 'bar', $render: render }),
            caller = reflekt.caller(resolver),
            finish = sinon.spy(done),
            next = sinon.spy();
        handler(params, resolver)(caller, res, next, finish);
        finish.called.should.equal(true);
    });

    it('should use the defined renderer', function(done) {
        var params = { renderer: 'ducks' },
            res = { header: sinon.spy(), write: sinon.spy() },
            render = function(template, context, callback) { callback(null, 'foo'); },
            resolver = new reflekt.ObjectResolver({ ducks: render }),
            caller = reflekt.caller(resolver),
            finish = sinon.spy(function() {
                res.write.calledWith('foo').should.equal(true);
                done();
            }),
            next = sinon.spy();
        handler(params, resolver)(caller, res, next, finish);
        finish.called.should.equal(true);
    });
});
