Installation
-----------

    $ mrt add template-animation-helper

Usage
-----

This helper template makes it possible to animate templates.

It can either use `Session`, or the `View` class of the [view-manager][1] package (if available).

[1]: https://atmosphere.meteor.com/package/view-manager

Use the `{{AnimateTemplate}}` helper and pass it a `Session` or `View` key name like {{AnimateTemplate "myKey"}}.
Then use the `Session/View.set('keyName', 'templateName')` to render a template at the position of the `{{AnimateTemplate}}` helper.

Additional you have to add a `animate` class to element(s) inside your template, which you want to animate.
This element will then switch a `hidden` class to show/fadein the template and re-add the `hidden` class before removing the template.
This way the template fades in and out according to the transitions you set to the `hidden` class of that element.

**An example of dynaimcally showing/removing a template**

    // HTML

    <template name="myTemplate">
        <div class="animate myTemplate">
            ...
        </div>
    </template>

    // CSS

    .myTemplate {
        opacity: 1:
        transition: opacity 2s;
    }
    .myTemplate.hidden {
        opacity: 0;
    }

Place a template animation helper for `mytemplateKey` somewhere in your app:

    {{AnimateTemplate "mytemplateKey"}}

To fade in the template from above at the position of the helper call

    View/Session.set('mytemplateKey', 'myTemplate');

To fade out the template call

    View/Session.set('mytemplateKey', false);

Additional you can call

    View/Session.set('mytemplateKey', 'reload');

To reload the last template. This will call the destroyed and created method of that template again.


**Passing a template name to the {{AnimateTemplate}} helper**

You can also pass a template name to this helper, this will render the template in place,
switching a `hidden` class on the element(s) with the class `animate`.
Additionally the data context of this template gets the `_templateAnimationKey`, so you can manually fade the template out.
To do that call the following inside a helper or event of that template:

    View/Session.set(this._templateAnimationKey, false);