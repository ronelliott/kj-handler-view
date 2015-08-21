'use strict';

var is = require('is');

module.exports = function(params) {
    var contentType = params.contentType || 'text/html',
        context = params.context || [],
        rendererName = params.renderer || 'render',
        templateName = params.template;

    return function(caller, resolver, res, next, finish) {
        var renderer = resolver(rendererName);

        if (!renderer) {
            throw new Error('Undefined renderer: ' + rendererName);
        }

        if (is.array(context)) {
            context = context
                .reduce(function(ctx, name) {
                    ctx[name] = resolver(name);
                    return ctx;
                }, {});
        }

        function callback(err, data) {
            if (err) {
                next(err);
                return;
            }

            res.header('Content-Type', contentType);
            res.write(data);
            finish();
        }

        caller(renderer, null, {
            template: templateName,
            context: context,
            callback: callback
        });
    };
};
