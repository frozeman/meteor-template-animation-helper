Installation
-----------

    $ mrt add template-animation-helper

**Warning!** this version works only with the new render engine! (use `$ meteor --release template-engine-preview-10.1`)

Description
-----------

This package makes it possible to animate templates.

When using the `{{> AnimateTemplate ...}}` helper your template will wait for all animations to be finished on elements with the class `animate`.
When a template using this helper gets rendered, it will remove the `animate` class from your elements, causing your css transition to start.
When the template then gets removed, by setting its templateKey inside the `Session` or `View` object to FALSE, it re-adds the `animate` class to the respective elements,
causing them to animate back to its original state. After the animation happend, the template will be removed properly.


You can either use `Session`, or the `View` class of the [view-manager][1] package.
By default it uses `Session` to render templates at the position of the `{{> AnimateTemplate}}` helper,
but when the [view-manager][1] package is available it uses the `View` class.

[1]: https://atmosphere.meteor.com/package/view-manager

Usage
-----

Use the `{{> AnimateTemplate}}` helper or `AnimateTemplate` method and pass it a `Session` or `View` key name like {{> Animate placeholder="myKey"}}.
Then use the `Session/View.set('keyName', 'templateName')` to render a template at this position.

Additional you have to add a `animate` class to element(s) inside your template, which you want to animate.
The `animate` class should put your elements in the state, before your template is visible.
So that when the `animate` class gets removed a transition to its visible state is happening.


An example of dynaimcally showing/removing a templates
-----

    // HTML

    <template name="myTemplate">
        <div class="animate myTemplateWrapper">
            ...
        </div>
    </template>

    // CSS

    .myTemplateWrapper {
        opacity: 1:
        transition: opacity 2s;
    }
    .myTemplateWrapper.animate {
        opacity: 0;
    }

Place a template animation helper for `mytemplateKey` somewhere in your app:

    {{> Animate placeholder="myKeyName"}}

To fade in the template from above at the position of the helper call

    View/Session.set('myKeyName', 'myTemplate');

To fade out the template call

    View/Session.set('mytemplateKey', false);


Return an AnimateTemplate from inside a helper
-----

    // HTML

    {{> myhelper}}

    // JS
    Template.myTemplate.myhelper = function(){
        return AnimateTemplate({placeholder: 'myTemplateKey'});
    };

    // Then you can render the template by calling
    View/Session.set('myTemplateKey','templateName');


Passing a template name to the `{{> AnimateTemplate}}` helper
-----

    {{> AnimateTemplate template="myTemplate"}}

    // or when using the method

    return AnimateTemplate({template: 'myTemplate'});

You can also pass a template name to the helper, this will render and animate the template in place immediately,
The data context of this template gets additionally the `_templateAnimationKey`, so you can later manually animate the template out.
To do that call the following inside a helper or event of that specififc template:

    View/Session.set(this._templateAnimationKey, false);


The {{#Animate}} block helper
----

`{{#Animate}}` block helper, which will remove any `animate` class from its child elements when rendered.
Additionally you can provide an `delay` parameter to set a delay (in ms) for the animation to start.

    {{#Animate delay=200}}
        <div class="animate">
            animates this content here
            (you must provide some css transitions for the animate class)
        </div>
    {{/Animate}}
