Installation
-----------

    $ mrt add template-animation-helper

Usage
-----

This helper template makes it possible to animate templates.

What it basically does: It adds a `hidden` class to each element with the class `animate` when the template gets created
and removes this `hidden` class immediately so that an animation caused by the `hidden` class can happen.
When the template then gets removed, by setting its templateKey inside the Session or View object to false, it re-adds the `hidden` class.
Waits until the animation caused by it happened and removes then the template.


You can either use `Session`, or the `View` class of the [view-manager][1] package.
By default it uses `Session` to render templates at the position of the `{{AnimateHelper}}` helper,
but when the [view-manager][1] package is available it uses the `View` class.

[1]: https://atmosphere.meteor.com/package/view-manager

Use the `{{AnimateTemplate}}` helper or `AnimateTemplate` method and pass it a `Session` or `View` key name like {{AnimateTemplate "myKey"}}.
Then use the `Session/View.set('keyName', 'templateName')` to render a template at the position of the `{{AnimateTemplate}}` helper.

Additional you have to add a `animate` class to element(s) inside your template, which you want to animate.
This element will then switch a `hidden` class to show/fadein the template and re-add the `hidden` class before removing the template.
This way the template fades in and out according to the transitions you set to the `hidden` class of that element.

**The `AnimateTemplate` method and helper accepts a second parameter `animateOnRerender`**

When the second parameter is TRUE, it will animate on all rerenders, otherwise only on the first, when the template is created.


**An example of dynaimcally showing/removing a templates**

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


**You can also return an AnimateTemplate from inside a helper**

    Template.myTemplate.myhelper = function(){
        return AnimateTemplate('myTemplateKeyOrName');
    };

    // Then you can render the template by calling
    View/Session.set('myTemplateKey','templateName');


**Passing a template name to the {{AnimateTemplate}} helper**

You can also pass a template name to this helper, this will render the template in place,
switching a `hidden` class on the element(s) with the class `animate`.
Additionally the data context of this template gets the `_templateAnimationKey`, so you can manually fade the template out.
To do that call the following inside a helper or event of that template:

    View/Session.set(this._templateAnimationKey, false);