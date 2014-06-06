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
Wrapper.getTemplate = function(templateName){
    return (_.isObject(templateName))
        ? Template[templateName.template]
        : Template[templateName];
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
    var delay = (this.data && this.data.delay) ? this.data.delay : 1,
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
Template['AnimateTemplate'].created = function(){
    var template = this;
    
    this.properties = {};

    // set an animation timeout, used the by the timeout in the reactiveAnimator helper function.
    this.data._animationTimeout;
    this.data._animationElements;
    this.data._templateAnimationKey;


    /**
    Helper: Waits for `templateKey` to change and sets its brother `'_' + templateKey` to render the keys template.
    This triggers the `templateAnimationHelperWrapper` `rendered` method to be called and animates the given template, by remving the `animate` class.

    @method runAnimationsReactiveFunctions
    @return undefined
    **/
    this.properties.runAnimationsReactiveFunctions = Deps.autorun(function(c){
        var _this = template.data,
            placeholder = (_this.template) ? getUniqueKey(_this.template, template.__component__.guid) : _this.placeholder,
            animateTemplate = (placeholder) ? Layout.get(placeholder) : false;

        Meteor.clearTimeout(_this._animationTimeout);

        if(_this.template && !animateTemplate) {
            var uniqueKeyName = getUniqueKey(_this.template, template.__component__.guid);
            // set the keyName
            _this.placeholder = uniqueKeyName;
            // set the key immediately
            Layout.set(uniqueKeyName, _this.template);

            // remove the template as we set it already to the reactive Session.
            _this.template = null;

        } else if(animateTemplate) {


            // make sure the animate class gets removed, when switching templates
            if(_this._animationElements) {


                _this._animationTimeout = Meteor.setTimeout(function(){
                    Layout.set('_'+ placeholder, animateTemplate);
                }, getDuration(_this._animationElements));


                // animate after, to the getDuration wont be affected
                $(_this._animationElements).addClass('animate');

            } else {
                // set the template
                Layout.set('_'+ placeholder, animateTemplate);
            }
                    
        // hide template
        } else {
            // if an animation element exists,
            // get its transition-duration and remove the template after this.
            if(_this._animationElements) { //&& !_this._animationTimeout

                _this._animationTimeout = Meteor.setTimeout(function(){
                    Layout.set('_'+ placeholder, false);
                    _this._animationElements = _this._animationTimeout = null;
                }, getDuration(_this._animationElements));


                // animate after, to the getDuration wont be affected
                $(_this._animationElements).addClass('animate');


            // if there are not elements, or they are already gone, set to immediately
            } else {
                Layout.set('_'+ placeholder, false);
                _this._animationElements = _this._animationTimeout = null;
            }
        }
    });
};


/**
Callback: When the `animateTemplates` rerenders it checks if the `templateKey` is set to a template or to FALSE
and animates it accordingly.

@method rendered
@return undefined
**/
Template['AnimateTemplate'].rendered = function(){
    this.data._animationElements = this.findAll('.animate');
};


/**
Callback: Called when the template gets destroyed.

@method destroyed
@return undefined
**/
Template['AnimateTemplate'].destroyed = function(){
    Meteor.clearTimeout(this.data._animationTimeout);
    this.data._animationTimeout = null;

    if(this.properties.runAnimationsReactiveFunctions)
        this.properties.runAnimationsReactiveFunctions.stop();
    
    // clean properties
    this.properties = null
};




/**
Helper: Adds the template and animates it by removing the `animate` class(es).
This gets the template from `'_' + templateKey` set by the `reactiveAnimator` helper.

This helper hijacks the `rendered` callback of the template to remove the `animate` class(es).

@method getTemplate
@return {Object} the current template
**/
Template['AnimateTemplate'].getTemplate = function(guid){
    var _this = this,
        placeholder = (this.template) ? getUniqueKey(_this.template, guid) : this.placeholder,
        animateTemplate = Layout.get('_'+ placeholder),
        instance = null,
        delay = this.delay || 0,
        context = {};

    if(Wrapper.isTemplate(animateTemplate)) {

        // add template given context
        if(this.context)
            context = this.context;

        // // add animationkey
        context._templateAnimationKey = placeholder;

        // add dynamic given context
        if(animateTemplate.context)
            context = _.extend(context, animateTemplate.context);

        // // get template
        instance = Wrapper.getTemplate(animateTemplate);


        // make sure animate class always gets removed, when changing the template
        if(_this._animationElements)
            Meteor.defer(function(){
                $(_this._animationElements).removeClass('animate');
            });


        // OVERWRITE the RENDERED FUNCTION of the template, to remove the animate classes
        if(instance && instance.guid) {
            // HIJACK the rendered callback
            instance.rendered = (function(rendered) {
                function extendsRendered() {

                    // call the original rendered callback
                    if(rendered)
                        rendered.call(this);

                    // and store the elements to the outer animateTemplate instance
                    _this._animationElements = this.findAll('.animate');
                }
                return extendsRendered;
            })(instance.rendered);
        }

        return (instance) ? {
            template: instance,
            context: context,
            delay: delay
        } : null;

    } else
        return false;
};


// METHODs
var getUniqueKey = function(template, guid) {
    return Wrapper.getTemplateName(template) + '_templateKey_' + guid;
};


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
                return values.split(' ');
        }));

    duration = _.flatten(duration);


    // get the highest duration in ms
    if(_.isArray(duration) && !_.isEmpty(duration)) {

        duration = _.max(_.map(duration, function(item){
            if(_.isString(item)) {
                var value = 0;
                if(item.indexOf('ms') !== -1)
                    value = Number(item.replace(/[ms|\,| ]+/g ,''));
                else
                    value = Number(item.replace(/[s|\,| ]+/g ,'')) * 1000;
                return value;
            }
        }))
    } else
        duration = 0;

    return duration;
};