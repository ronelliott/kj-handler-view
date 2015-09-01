'use strict';

var is = require('is');

module.exports = function($opts, $$resolver) {
    var contentType = $opts.contentType || 'text/html',
        context = $opts.context || [],
        rendererName = $opts.renderer || '$render',
        renderer = rendererName,
        templateName = $opts.template;

    return function($caller, $res, $next, $finish) {
        if (is.string(renderer)) {
            renderer = $$resolver(rendererName);
        }

        if (!renderer) {
            $next(new Error('Undefined renderer: ' + rendererName));
            return;
        }

        if (is.array(context)) {
            context = context
                .reduce(function(ctx, name) {
                    ctx[name] = $caller.resolver(name) || $$resolver(name);
                    return ctx;
                }, {});
        }

        if (is.function(context)) {
            context = $caller(context);
        }

        function callback(err, data) {
            if (err) {
                $next(err);
                return;
            }

            $res.header('Content-Type', contentType);
            $res.write(data);
            $finish();
        }

        $caller(renderer, null, {
            template: templateName,
            context: context,
            callback: callback
        });
    };
};
