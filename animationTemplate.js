/**
Template helpers

@module package template-animation-helper
**/

// use the view-manager package or Session
var Layout = (Package['view-manager']) ? Package['view-manager'].View : Session;

// wrapper methods
var Wrapper = {};
Wrapper.isTemplate = function(templateName){
    return (Package['view-manager'])
        ? Package['view-manager'].View.isTemplate(templateName)
        : Template[templateName];
};
Wrapper.getTemplate = function(templateName, data){
    return (Package['view-manager'])
        ? Package['view-manager'].View.getTemplate(templateName, data)
        : Template[templateName](data);
};
Wrapper.getTemplateName = function(templateName){
    return (Package['view-manager'])
        ? Package['view-manager'].View.getTemplateName(templateName)
        : templateName;
};


/**
Contains methods and helpers for animating templates.

@class template-animation-helper
@static
**/


/**
Get the current template set in an `Session` or `View` key and place it inside the current template.

**Example usage**

    Template.myTemplate.myhelper = function(){
        return AnimateTemplate('myTemplateKeyOrName');
    };

    // Then you can render the template by calling
    View/Session.set('myTemplateKey','templateName');

You can also pass a template name to this helper, this will render the template in place,
switching a `hidden` class on the element(s) with the class `animate`.
Additionally the data context of this template gets the `_templateAnimationKey`., so you can fade out the this template manually.
To do that call the following inside a helper or event of that template:

    View/Session.set(this._templateAnimationKey, false);


@method AnimateTemplate
@param {String} keyName                 The `Session` key which holds a template, can also be a template name.
@param {Boolean} animateOnRerender      When TRUE, it will animate on all rerenders, otherwise only on the first, when the template is created.
@return {Object|undefined} The template to be placed inside the current template or undefined when no template was set to this key
**/
AnimateTemplate = function(keyName, animateOnRerender){
    var templateObject = {},
        uniqueKeyName,
        data = (this instanceof Window) ? {} : this;

    animateOnRerender = (_.isBoolean(animateOnRerender)) ? animateOnRerender : false;

    if(Template['template-animation-helper']) {

        // transform when given a template into a View key
        if(Wrapper.isTemplate(keyName)) {

            uniqueKeyName = Wrapper.getTemplateName(keyName) + _.uniqueId('_templateKey_');

            templateObject = {
                template: Wrapper.getTemplateName(keyName),
                // extend the current data context and add the template key
                data: _.extend(data, {
                    _templateAnimationKey: uniqueKeyName
                // add the given data
                },keyName.data || {})
            };


            Meteor.defer(function(){
                Layout.set(uniqueKeyName, templateObject);
            });
        } else
            uniqueKeyName = keyName;

        return Wrapper.getTemplate('template-animation-helper',{
            templateKey: uniqueKeyName,
            animateOnRerender: animateOnRerender
        });


    } else {
        return '';
    }
};

/**
Helper: **See the `AnimateTemplate` method for details.**

**Example usage**

    {{AnimateTemplate "myTemplateKeyOrName"}}

    // Then you can render the template by calling
    View/Session.set('myTemplateKey','templateName');


@method ((AnimateTemplate))
@param {String} keyName                 The `Session` key which holds a template, can also be a template name.
@param {Boolean} animateOnRerender      When TRUE, it will animate on all rerenders, otherwise only on the first, when the template is created.
@return {Object|undefined} The template to be placed inside the current template or undefined when no template was set to this key
**/
Handlebars.registerHelper('AnimateTemplate', AnimateTemplate);


/**
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

@class template-animation-helper
@constructor
**/


/**
Callback: Creates the `animationTimeout` data property,
which will be used to store the timeOut ID of the fade out animation duration.

@method created
@return undefined
**/
Template['template-animation-helper'].created = function(){
    var template = this;

    // set an animation timeout, used the by the timeout in the reactiveAnimator helper function.
    template.data.animationTimeout = null;
};


/**
Callback: When the `animateTemplates` rerenders it checks if the `templateKey` is set to a template or to FALSE
and animates it accordingly.

@method rendered
@return undefined
**/
Template['template-animation-helper'].rendered = function(){
    var template = this,
        animateTemplate = Layout.get(template.data.templateKey),
        $animateElement = $(template.findAll('.animate'));


    // set the current animating element, so its available in the helpers
    template.data.animationElement = $animateElement;

    // add the hidden class only when the template was hidden before, or animateOnRerender is TRUE
    if(template.data.animationTimeout === null || template.data.animateOnRerender)
        $animateElement.addClass('hidden');


    Meteor.defer(function(){
        // remove the hidden template to start fade in animation
        if(animateTemplate) {
            $animateElement.removeClass('hidden');
        // if template was set to FALSE, add the hidden class, to trigger the hide animation
        } else {
            $animateElement.addClass('hidden');
        }
    });
};


/**
Helper: Waits for `templateKey` to change and sets its brother `'_' + templateKey` to render the keys template.
This triggers the `animateTemplates` `rerendered` method to be called and animates the given template in or out.

@method reactiveAnimator
@return undefined
**/
Template['template-animation-helper'].reactiveAnimator = function(){
    var data = this,
        animateTemplate = Layout.get(data.templateKey);

    // clear previous timeouts, of last fades
    Meteor.clearTimeout(data.animationTimeout);


    // reloads the current template
    if(animateTemplate === 'reload') {
        var _animateTemplate = Layout.store['_'+ data.templateKey];

        Layout.set(data.templateKey, false);

        Meteor.defer(function(){
            Layout.set(data.templateKey, _animateTemplate);
        });

    // render and show the template
    } else if(animateTemplate) {
        Layout.set('_'+ data.templateKey, animateTemplate);
        Meteor.defer(function(){
            data.animationTimeout = 0;
        });

    // hide and the unrender the template
    } else {

        // if an animation element exists, get its transition-duration and remove the template after this.
        if(data.animationElement) {
            var $element = $(data.animationElement),
                duration = _.map($element, function(element){
                    var values = $(element).css('transition-duration');

                    if(_.isString(values))
                        return values.split(',');
                });

            duration = _.flatten(duration);

            // get the highest duration in ms
            if(_.isArray(duration) && !_.isEmpty(duration)) {

                duration = _.max(_.map(duration, function(item){
                    var value = 0;
                    if(item.indexOf('ms') !== -1)
                        value = item.replace(/[ms| ]+/g ,'');
                    else
                        value = item.replace(/[s| ]+/g ,'') * 1000;

                    return parseInt(value);
                }))
            } else
                duration = 0;

            data.animationTimeout = Meteor.setTimeout(function(){
                Layout.set('_'+ data.templateKey, false);
                data.animationTimeout = null;
            }, duration);
        }
    }

};


/**
Helper: Shows the template to animate. This gets the template from `'_' + templateKey` set by the `reactiveAnimator` helper.

@method template
@return {Object} the current template
**/
Template['template-animation-helper'].template = function(){
    // use the view-manager package method
    if(typeof View !== 'undefined')
        return View.getTemplate(Layout.get('_'+ this.templateKey));
    // just return a template
    else if(Template[Layout.get('_'+ this.templateKey)]) {
        return Template[Layout.get('_'+ this.templateKey)]();
    } else {
        return '';
    }
};