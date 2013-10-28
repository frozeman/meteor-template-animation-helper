/**
Template helpers

@module package template-animation-helper
**/

// use the view-manager package or Session
var Layout = (Package['view-manager']) ? Package['view-manager'].View : Session;

// wrapper methods
var Wrapper = {};
Wrapper.isTemplate = function(templateName){
    if (Package['view-manager'])
        return Package['view-manager'].View.isTemplate(templateName)
    else
        return (Template[templateName]) ? true : false;
};
Wrapper.getTemplate = function(templateName, data){
    return (Package['view-manager'])
        ? Package['view-manager'].View.getTemplate(templateName, data)
        : Template[templateName].withData(data);
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
and removes the `animate` form your elements to cause your css transition.
Additionally the data context of this template gets the `_templateAnimationKey`, so you can fade out the this template manually.
To do that call the following inside a helper or event of that template:

    View/Session.set(this._templateAnimationKey, false);


@method AnimateTemplate
@param {String} keyName                 The `Session` key which holds a template, can also be a template name.
@return {Object|undefined} The template to be placed inside the current template or undefined when no template was set to this key
**/
AnimateTemplate = function(keyName){
    var templateObject = {},
        uniqueKeyName,
        data = (this instanceof Window) ? {} : this;


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
            templateKey: uniqueKeyName
        });


    } else {
        return '';
    }
};

/**
Helper: **See the `AnimateTemplate` method for details.**

**Example usage**

    {{> AnimateTemplate "myTemplateKeyOrName"}}

    // Then you can render the template by calling
    View/Session.set('myTemplateKey','templateName');


@method ((AnimateTemplate))
@param {String} keyName                 The `Session` key which holds a template, can also be a template name.
@return {Object|undefined} The template to be placed inside the current template or undefined when no template was set to this key
**/
Handlebars.registerHelper('AnimateTemplate', AnimateTemplate);


/**
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
    template.data.animationElements;
};


/**
Callback: When the `animateTemplates` rerenders it checks if the `templateKey` is set to a template or to FALSE
and animates it accordingly.

@method rendered
@return undefined
**/
Template['template-animation-helper'].rendered = function(){
};

/**
Callback: Called when the template gets destroyed.

@method destroyed
@return undefined
**/
Template['template-animation-helper'].destroyed = function(){
};


/**
Helper: Waits for `templateKey` to change and sets its brother `'_' + templateKey` to render the keys template.
This triggers the `templateAnimationHelperWrapper` `rendered` method to be called and animates the given template, by remving the `animate` class.

@method runAnimations
@return undefined
**/
Template['template-animation-helper'].runAnimations = function(test){
    var data = this,
        animateTemplate = Layout.get(data.templateKey);


    // clear previous timeouts, of last fades
    Meteor.clearTimeout(data.animationTimeout);


    // RELOADS the current template
    if(animateTemplate === 'reload') {
        var _animateTemplate = Layout.store['_'+ data.templateKey];

        Layout.set(data.templateKey, false);

        Meteor.defer(function(){
            Layout.set(data.templateKey, _animateTemplate);
        });

    // SHOW the template
    } else if(animateTemplate) {
        Layout.set('_'+ data.templateKey, animateTemplate);

        // the rendered callback of the "templateAnimationHelperWrapper" template
        // stores and animates in the elements with the class animate

    // HIDE and the unrender the template
    } else {

        // if an animation element exists, get its transition-duration and remove the template after this.
        if(data.animationElements) {
            var $elements = data.animationElements,
                duration = _.map($elements, function(element){
                    var values = $(element).css('transition-duration');

                    if(_.isString(values))
                        return values.split(',');
                });

            duration = _.flatten(duration);

            // get the highest duration in ms
            if(_.isArray(duration) && !_.isEmpty(duration)) {

                duration = _.max(_.map(duration, function(item){
                    if(_.isString(item)) {
                        var value = 0;
                        if(item.indexOf('ms') !== -1)
                            value = item.replace(/[ms| ]+/g ,'');
                        else
                            value = item.replace(/[s| ]+/g ,'') * 1000;

                        return parseInt(value);
                    }
                }))
            } else
                duration = 0;

            // start to animate elements backwards
            $(data.animationElements).addClass('animate');


            data.animationTimeout = Meteor.setTimeout(function(){
                Layout.set('_'+ data.templateKey, false);
                data.animationTimeout = null;
                data.animationElements = null;
            }, duration);
        }
    }
};


/**
Helper: When a template was set, render the wrapper template to start animation.

@method gotTemplate
@return {Boolean} check if a new template was set
**/
Template['template-animation-helper'].gotTemplate = function(test){
    if (Layout.get(this.templateKey))
        return true;
    else if(!Layout.get(this.templateKey) && Layout.get('_'+ this.templateKey))
        return true;
    else
        return false;
};



/**
The block helper template ro cause the rerendering.

@class template-animation-helper-wrapper
@constructor
**/


/**
Callback: When a template is set it will add and remove the hidden class, to cause the animation effect.

@method rendered
@return undefined
**/
Template['templateAnimationHelperWrapper'].rendered = function(){
    var template = this;

    // store the to animate elements
    template.data.animationElements = this.findAll('.animate');

    // removes the animate class to start animation
    Meteor.defer(function(){
        $(template.data.animationElements).removeClass('animate');
    });
};


/**
Helper: Shows the template to animate. This gets the template from `'_' + templateKey` set by the `reactiveAnimator` helper.

@method placeTemplate
@return {Object} the current template
**/
Template['templateAnimationHelperWrapper'].placeTemplate = function(){
    // use the view-manager package method
    if(typeof View !== 'undefined')
        return View.getTemplate(Layout.get('_'+ this.templateKey));
    // just return a template
    else if(Template[Layout.get('_'+ this.templateKey)]) {
        return Template[Layout.get('_'+ this.templateKey)];
    } else {
        return '';
    }
};
