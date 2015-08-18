'use strict';

var is = require('is');

module.exports = function(params) {
    var contentType = params.contentType || 'text/html',
        context = params.context || [],
        rendererName = params.renderer || 'render',
        templateName = params.template;

    return function(resolver, res, finish) {
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

        renderer(templateName, context, function(err, data) {
            if (!err) {
                res.headers('Content-Type', contentType);
                res.write(data);
            }

            finish(err);
        });
    };
};
