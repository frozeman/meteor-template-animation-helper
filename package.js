Package.describe({
    summary: "Allows to animate templates by adding a 'hidden' class with css transitions"
});

Package.on_use(function (api) {
    api.use('underscore', 'client');
    api.use('handlebars', 'client');
    api.use('templating', 'client');
    api.use('session', 'client');
    api.use('jquery', 'client');

    // thirdparty
    api.use('view-manager', 'client', {weak: true});

    // EXPORT
    api.export('AnimateTemplate');

    // FILES
    api.add_files('animationTemplate.html', 'client');
    api.add_files('animationTemplate.js', 'client');
});