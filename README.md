The `animationTemplate` template helpers

This helper template makes it possible to animate templates.
Use the `{{AnimationTemplate}}` helper and pass it a `Layout` key name like {{AnimationTemplate "myKey"}}.
Then use the `Layout.set('keyName', 'templateName')` to render a template at the position of the `{{AnimationTemplate}}` helper.

You can also call `Layout.set('keyName', 'reload')` to reload the current template, which will call the `destroyed` and `created` method of this template again.

Additional you have to add a `animate` class to an element inside your template, which you want to animate.
The AnimationTemplate will then add and remove a `hidden` class to show the template.
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

    .myTemplate {
        opacity: 1:
        transition: opacity 2s;
    }
    .myTemplate.hidden {
        opacity: 0;
    }

To place a animation template spot for `myLayoutKey` do:

    {{AnimationTemplate "myLayoutKey"}}

To fade in the template from above at the position of the helper call

    Layout.set('myLayoutKey', 'myTemplate');

To fade out the template call

    Layout.set('myLayoutKey', false);