Installation
-----------

    $ mrt add template-animation-helper

Usage
-----

Note: as of some bug in weak dependecies, this package requires the [view-manager][1]. Remove the view manager package from the package.js, if you only want to use `Session` instead.

[1]: https://atmosphere.meteor.com/package/view-manager

This helper template makes it possible to animate templates.
Use the `{{AnimateTemplate}}` helper and pass it a `Layout` key name like {{AnimateTemplate "myKey"}}.
Then use the `Layout.set('keyName', 'templateName')` to render a template at the position of the `{{AnimateTemplate}}` helper.

Additional you have to add a `animate` class to an element inside your template, which you want to animate.
The AnimateTemplate will then add and remove a `hidden` class to show the template.
And re-add the `hidden` class before removing the template.
This way the template fades in and out according to the transitions you set to the `hidden` class of that element.

**An example template could look like this:**

    // HTML

    <template name="myTemplate">
        <div class="animate myTemplate">
            ...
        </div>
    </template>

    // CSS

    .animate {
        opacity: 1:
        transition: opacity 2s;
    }
    .animate.hidden {
        opacity: 0;
    }

To place a animation template spot for `myLayoutKey` do:

    {{AnimateTemplate "myLayoutKey"}}

To fade in the template from above at the position of the helper call

    Layout.set('myLayoutKey', 'myTemplate');

To fade out the template call

    Layout.set('myLayoutKey', false);

Additional you can call

    Session.set('mySessionKey', 'reload');

To reload the last template. This will call the destroyed and created method of that template again.