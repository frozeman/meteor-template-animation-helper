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
The `Animate` Component.

@class AnimateTemplate
@constructor
**/



/**
Get the current template set in an `Session` or `View` key and place it inside the current template.

**Example usage**

    Template.myTemplate.myhelper = function(){
        return AnimateTemplate({placeholder: 'myKeyName'});
    };

    // Then you can render the template by calling
    View/Session.set('myKeyName','templateName');

You can also pass a template name to this helper, this will render the template in place,
and removes the `animate` form your elements to cause your css transition.
Additionally the data context of this template gets the `_templateAnimationKey`, so you can fade out the this template manually.
To do that call the following inside a helper or event of that template:

    View/Session.set(this._templateAnimationKey, false);


@method AnimateTemplate
@param {Object|String} values        When its a string its a template name, when an object it can have one or all of the following properties:

    {
        template: 'templateName',
        placeholder: 'myKeyName',
        delay: 200 // in milliseconds, will delay the animation a bit, so browser has time to plce it in the DOM
    }

@return {Object|undefined} The template to be placed inside the current template or undefined when no template was set to this key
**/
AnimateTemplate = function(values){
    var data = (this instanceof Window) ? {} : this;

    if(values && _.isObject(values.hash))
        data = _.extend(data, {
            _template: values.hash.template,
            _placeholder: values.hash.placeholder,
            _delay: values.hash.delay
        });


    return Wrapper.getTemplate('template-animation-helper', data);
};






/**
Helper: **See the `AnimateTemplate` method for details.**

**Example usage**

    // to render a animation template in place use:
    {{> AnimateTemplate template="myTemplateName" delay=200}}

    // or

    {{> AnimateTemplate placeholder="myKeyName" delay=200}}

    // Then you can render any template by calling
    View/Session.set('myKeyName','templateName');


@method ((AnimateTemplate))
@param {Object|String} values        When its a string its a template name, when an object it can have one or all of the following properties:

    {
        template: 'templateName',
        placeholder: 'myKeyName',
        delay: 200 // in milliseconds, will delay the animation a bit, so browser has time to plce it in the DOM
    }

@return {Object|undefined} The template to be placed inside the current template or undefined when no template was set to this key
**/
Handlebars.registerHelper('AnimateTemplate', AnimateTemplate);




/**
{{#Animate}} block helper, which will remove any `animate` class from its child elements when rendered.
Additionally you can provide an `delay` parameter to set a delay (in ms) for the animation to start.

    {{#Animate delay=200}}
        <div class="animate">
            animates this content here
            (you must provide some css transitions for the animate class)
        </div>
    {{/Animate}}

@class Animate
@constructor
**/

/**
Callback: When the `animateTemplates` rerenders it checks if the `templateKey` is set to a template or to FALSE
and animates it accordingly.

@method rendered
@return undefined
**/
Template['Animate'].rendered = function(){
    var delay = this.__component__.delay || 1,
        $element = $(this.findAll('.animate'));

    Meteor.setTimeout(function(){
        $element.removeClass('animate');
    }, delay);
};






/**
This package makes it possible to animate templates.

When using the `{{> AnimateTemplate ...}}` helper your template will wait for all animations to be finished on elements with the class `animate`.
When a template using this helper gets rendered, it will remove the `animate` class from your elements, causing your css transition to start.
When the template then gets removed, by setting its templateKey inside the `Session` or `View` object to FALSE, it re-adds the `animate` class to the respective elements,
causing them to animate back to its original state. After the animation happend, the template will be removed properly.


You can either use `Session`, or the `View` class of the [view-manager][1] package.
By default it uses `Session` to render templates at the position of the `{{> AnimateTemplateTemplate}}` helper,
but when the [view-manager][1] package is available it uses the `View` class.

[1]: https://atmosphere.meteor.com/package/view-manager

Usage
-----

Use the `{{> AnimateTemplate}}` helper or `AnimateTemplate` method and pass it a `Session` or `View` key name like {{> AnimateTemplate placeholder="myKey"}}.
Then use the `Session/View.set('keyName', 'templateName')` to render a template at this position.

Additional you have to add a `animate` class to element(s) inside your template, which you want to animate.
The `animate` class should put your elements in the state, before your template is visible.
So that when the `animate` class gets removed a transition to its visible state is happening.


An example of dynaimcally showing/removing a templates
----

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

    {{> AnimateTemplate placeholder="myKeyName"}}

To fade in the template from above at the position of the helper call

    View/Session.set('myKeyName', 'myTemplate');

To fade out the template call

    View/Session.set('mytemplateKey', false);

Additional you can call

    View/Session.set('mytemplateKey', 'reload');

To reload the last template. This will call the destroyed and created method of that template again.


Return an AnimateTemplate from inside a helper
----

    // HTML

    {{> myhelper}}

    // JS
    Template.myTemplate.myhelper = function(){
        return AnimateTemplate({placeholder: 'myTemplateKey'});
    };

    // Then you can render the template by calling
    View/Session.set('myTemplateKey','templateName');


Passing a template name to the {{> AnimateTemplate}} helper
----

    {{> AnimateTemplate template="myTemplate"}}

    // or when using the method

    return AnimateTemplate({template: 'myTemplate'});

You can also pass a template name to the helper, this will render and animate the template in place immediately,
The data context of this template gets additionally the `_templateAnimationKey`, so you can later manually animate the template out.
To do that call the following inside a helper or event of that specififc template:

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

    // set an animation timeout, used the by the timeout in the reactiveAnimator helper function.
    this.data._animationTimeout;
    this.data._animationElements;
    this.data._templateDataChanged = false;
};


/**
Callback: When the `animateTemplates` rerenders it checks if the `templateKey` is set to a template or to FALSE
and animates it accordingly.

@method rendered
@return undefined
**/
Template['template-animation-helper'].rendered = function(){
    var _this = this
        delay = this.data._delay || 0;

    this.data._animationElements = this.findAll('.animate');

    Meteor.setTimeout(function(){
        $(_this.data._animationElements).removeClass('animate');
    }, delay);

};


/**
Callback: Called when the template gets destroyed.

@method destroyed
@return undefined
**/
Template['template-animation-helper'].destroyed = function(){
    Meteor.clearTimeout(this.data._animationTimeout);
    this.data._animationTimeout = null;
};



/**
Helper: Waits for `templateKey` to change and sets its brother `'_' + templateKey` to render the keys template.
This triggers the `templateAnimationHelperWrapper` `rendered` method to be called and animates the given template, by remving the `animate` class.

@method runAnimations
@return undefined
**/
Template['template-animation-helper'].runAnimations = function(){
    var _this = this,
        placeholder = (this._placeholder) ? this._placeholder : this._templateAnimationKey,
        animateTemplate = Layout.get(placeholder);


    // clear previous timeouts, of last fades
    Meteor.clearTimeout(_this._animationTimeout);


    // RELOADS the current template
    if(animateTemplate === 'reload') {
        // var _animateTemplate = Layout.keys['_'+ placeholder];

        // Layout.set(placeholder, false);

        // Meteor.defer(function(){
        //     Layout.set(placeholder, _animateTemplate);
        // });

    // SHOW the template
    } else if(animateTemplate || this._template) {

        // console.log(!Layout.keys['_'+ _this.templateKey],
        // Wrapper.getTemplateName(Layout.keys[_this.templateKey]), Wrapper.getTemplateName(Layout.keys['_'+ _this.templateKey]));
        // console.log(animateTemplate, Layout.keys['_'+ _this.templateKey]);

        // when a template is given
        if(this._template) {
            var uniqueKeyName = Wrapper.getTemplateName(this._template) + _.uniqueId('_templateKey_');
            // set the keyName
            // Layout.setDefault(uniqueKeyName, template);
            this._templateAnimationKey = uniqueKeyName;
            // make this function reactive
            Layout.get(this._templateAnimationKey);
            // set the key immediately
            Layout.setDefault(uniqueKeyName, this._template);
            Layout.setDefault('_'+ uniqueKeyName, this._template);
            // remove the template as we set it already to the reactive Session.
            this._template = null;

        // check if there is not already a template rendered
        } else if(!Layout.keys['_'+ placeholder]) {

            Layout.set('_'+ placeholder, animateTemplate);

        // check if the template name hasn't changed
        } else if(Wrapper.getTemplateName(animateTemplate) === Wrapper.getTemplateName(Layout.keys['_'+ placeholder])) {

            // only remove the animate class immediately, when no fadeout process was started
            if(!_this._animationTimeout)
                _this._templateDataChanged = true;
            Layout.set('_'+ placeholder, animateTemplate);


        // otherwise fade out the old template and set the new
        } else if(_this._animationElements) {

            // start to animate elements backwards
            $(_this._animationElements).addClass('animate');


            _this._animationTimeout = Meteor.setTimeout(function(){
                Layout.set('_'+ placeholder, false);
                _this._animationElements = _this._animationTimeout = null;

                // set the new template
                Meteor.setTimeout(function(){
                    Layout.set('_'+ placeholder, animateTemplate);
                }, 10);
            }, getDuration(_this._animationElements));
        }



    // HIDE and the unrender the template
    } else {

        // if an animation element exists,
        // get its transition-duration and remove the template after this.
        if(_this._animationElements) {

            // start to animate elements backwards
            $(_this._animationElements).addClass('animate');

            _this._animationTimeout = Meteor.setTimeout(function(){
                Layout.set('_'+ placeholder, false);
                _this._animationElements = _this._animationTimeout = null;
            }, getDuration(_this._animationElements));

        // if there are not elements, or they are already gone, set to immediately
        } else {
            Layout.set('_'+ placeholder, false);
            _this._animationElements = _this._animationTimeout = null;
        }
    }
};


/**
Helper: When a template was set, render the wrapper template to start animation.

@method hasTemplate
@return {Boolean} check if a new template was set
**/
Template['template-animation-helper'].hasTemplate = function(){
    var placeholder = (this._templateAnimationKey) ? this._templateAnimationKey : this._placeholder;

    if(Layout.get(placeholder) && Layout.get('_'+ placeholder))
        return true;
    else if(!Layout.get(placeholder) && Layout.get('_'+ placeholder))
        return true;
    else
        return false;
};


/**
Helper: Adds the template and animates it by removing the `animate` class(es).
This gets the template from `'_' + templateKey` set by the `reactiveAnimator` helper.

This helper hijacks the `rendered` callback of the template to remove the `animate` class(es).

@method placeTemplate
@return {Object} the current template
**/
Template['template-animation-helper'].placeTemplate = function(){
    var _this = this,
        placeholder = (this._templateAnimationKey) ? this._templateAnimationKey : this._placeholder,
        animateTemplate = Layout.get('_'+ placeholder),
        instance = '',
        delay = this._delay || 0;
        templateDataChanged = this._templateDataChanged;


    // clear timeout, as everything should have happend by now
    this._animationTimeout = null;

    // reset this._templateDataChanged
    this._templateDataChanged = false;

    if(Wrapper.isTemplate(animateTemplate)) {
        // clean up data context
        var data = _.clone(this);
        delete data._template;
        delete data._templateDataChanged;
        delete data._delay;
        delete data._placeholder;

        instance = Wrapper.getTemplate(animateTemplate, data);
    }

    // OVERWRITE the RENDERED FUNCTION of the template, to remove the animate classes
    if(instance.guid) {
        // HIJACK the rendered callback
        instance.rendered = (function(rendered, templateDataChanged) {
            function extendsRendered() {

                // call the original rendered callback
                if(rendered)
                    rendered.call(this);

                // and store the elements to the outer animateTemplate instance
                _this._animationElements = this.findAll('.animate');


                if(templateDataChanged)
                    $(_this._animationElements).removeClass('animate');
                else {
                    Meteor.setTimeout(function(){
                        $(_this._animationElements).removeClass('animate');
                    }, delay);
                }
            }
            return extendsRendered;
        })(instance.rendered, templateDataChanged);
    }

    return instance;
};


// METHODs

/**
Returns the transition duration of the given element(s) in milliseconds.

@method getDuration
@private
@return {Number} the duration in milliseconds
**/
var getDuration = function(animationElements){
    var $elements = animationElements,
        duration = _.flatten(_.map($elements, function(element){
            var values = $(element).css('transition-duration');

            if(_.isString(values))
                return values.split(',');
        }));

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

    return duration;
};