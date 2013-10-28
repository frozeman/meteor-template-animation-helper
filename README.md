Installation
-----------

    $ mrt add template-animation-helper

Description
-----------

This package makes it possible to animate templates.

When using the `{{> AnimateTemplate "..."}}` helper your template will wait for all animations to be finished on elements with the class `animate`.
When a template using this helper gets rendered, it will remove the `animate` class from your elements, causing your css transition to happen.
When the template then gets removed, by setting its templateKey inside the `Session` or `View` object to false, it re-adds the `animate` class to the respective elements,
causing them to animate back to its original state. After the animation happend, them template will get removed properly.


You can either use `Session`, or the `View` class of the [view-manager][1] package.
By default it uses `Session` to render templates at the position of the `{{> AnimateTemplate}}` helper,
but when the [view-manager][1] package is available it uses the `View` class.

[1]: https://atmosphere.meteor.com/package/view-manager

Usage
-----

Use the `{{> AnimateTemplate}}` helper or `AnimateTemplate` method and pass it a `Session` or `View` key name like {{> AnimateTemplate "myKey"}}.
Then use the `Session/View.set('keyName', 'templateName')` to render a template at this position.

Additional you have to add a `animate` class to element(s) inside your template, which you want to animate.
The `animate` class should put your elements in the state, before your template is visible.
So that when the `animate` class gets removed a transition to its visible state is happening.


**An example of dynaimcally showing/removing a templates**

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

    {{> AnimateTemplate "mytemplateKey"}}

To fade in the template from above at the position of the helper call

    View/Session.set('mytemplateKey', 'myTemplate');

To fade out the template call

    View/Session.set('mytemplateKey', false);

Additional you can call

    View/Session.set('mytemplateKey', 'reload');

To reload the last template. This will call the destroyed and created method of that template again.


**Return an AnimateTemplate from inside a helper**

    // HTML

    {{> myhelper}}

    // JS
    Template.myTemplate.myhelper = function(){
        return AnimateTemplate('myTemplateKey');
    };

    // Then you can render the template by calling
    View/Session.set('myTemplateKey','templateName');


**Passing a template name to the {{> AnimateTemplate}} helper**

You can also pass a template name to the helper, this will render and animate the template in place immediately,
The data context of this template gets additionally the `_templateAnimationKey`, so you can later manually animate the template out.
To do that call the following inside a helper or event of that specififc template:

    View/Session.set(this._templateAnimationKey, false);

Passing a template name also applies when using the `AnimateTemplate` function inside a helper function.

    Template.myTemplate.myhelper = function(){
        return AnimateTemplate('myTemplateName');
    };
