Package.describe({
    name: "mrt:template-animation-helper",
    summary: "Allows to animate templates by adding a 'animate' class with css transitions",
    version: "1.1.6",
    git: "https://github.com/frozeman/meteor-template-animation-helper.git"
});

Package.onUse(function (api) {
    api.versionsFrom('METEOR@0.9.0');

    // core
    api.use('underscore', 'client');
    api.use('templating', 'client');
    api.use('session', 'client');
    api.use('jquery', 'client');

    // thirdparty
    api.use('mrt:view-manager@0.1.6', 'client', {weak: true});

    // EXPORT
    api.export('AnimateTemplate');

    // FILES
    api.addFiles('animationTemplate.html', 'client');
    api.addFiles('animationTemplate.js', 'client');
});