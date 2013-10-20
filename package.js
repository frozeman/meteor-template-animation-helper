Package.describe({
    summary: "Allows to animate template in and out"
});

Package.on_use(function (api) {
    api.use('session', 'client');
    api.use('underscore', 'client');
    api.use('handlebars', 'client');
    api.use('templating', 'client');
    api.use('jquery', 'client');


    // EXPORT
    api.export('Template');

    // FILES
    api.add_files('animationTemplate.html', 'client');
    api.add_files('animationTemplate.js', 'client');
});