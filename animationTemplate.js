/**
Template helpers

@module package template-animation-helper
**/

// use the view-manager package or Session
var Layout = (typeof View !== 'undefined') ? View : Session;

/**
The reactive View class is used to set and get the views of the app.

Be aware that they can only be used inside a handlebars template like:

    <div>
        {{myHelper}}
    <div>

@class template-animation-helper-Handlebars-helpers
@static
**/


/**
Get the current template set in an `Session` or `View` key and place it inside the current template.


@method AnimateTemplate
@param {String} keyName    The `Session` key which holds a template
@return {Object|undefined} The template to be placed inside the current template or undefined when no template was set to this key
**/
Handlebars.registerHelper('AnimateTemplate', function (keyName) {
    if(typeof View !== 'undefined')
        return View.getTemplate('template-animation-helper',{SessionKey: keyName});
    // just return a template
    else if(Template['template-animation-helper']) {
        return Template['template-animation-helper']({SessionKey: keyName});
    } else {
        return '';
    }
});




/**
This helper template makes it possible to animate templates.

It can either use `Session`, or the `View` class of the [view-manager][1] package (if available).

[1]: https://atmosphere.meteor.com/package/view-manager

Use the `{{AnimateTemplate}}` helper and pass it a `Session` or `View` key name like {{AnimateTemplate "myKey"}}.
Then use the `Session/View.set('keyName', 'templateName')` to render a template at the position of the `{{AnimateTemplate}}` helper.

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

    .myTemplate {
        opacity: 1:
        transition: opacity 2s;
    }
    .myTemplate.hidden {
        opacity: 0;
    }

Place a template animation helper for `mySessionKey` somewhere in your app:

    {{AnimateTemplate "mySessionKey"}}

To fade in the template from above at the position of the helper call

    Layout.set('mySessionKey', 'myTemplate');

To fade out the template call

    Layout.set('mySessionKey', false);

Additional you can call

    Session.set('mySessionKey', 'reload');

To reload the last template. This will call the destroyed and created method of that template again.

@class template-animation-helper
@constructor
**/


/**
Creates the `animationTimeout` data property,
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
When the `animateTemplates` rerenders it checks if the `SessionKey` is set to a template or to FALSE
and animates it accordingly.

@method rendered
@return undefined
**/
Template['template-animation-helper'].rendered = function(){
    var template = this,
        animateTemplate = Layout.get(template.data.SessionKey),
        $animateElement = $(template.findAll('.animate'));


    // set the current animating element, so its available in the helpers
    template.data.animationElement = $animateElement;

    // add the hidden class onlye when the template was hidden before
    if(template.data.animationTimeout === null)
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

Template['template-animation-helper'].destroyed = function(){
};


/**
Waits for `SessionKey` to change and sets its brother `'_' + SessionKey` to render the keys template.
This triggers the `animateTemplates` `rerendered` method to be called and animates the given template in or out.

@method reactiveAnimator
@return undefined
**/
Template['template-animation-helper'].reactiveAnimator = function(){
    var data = this,
        animateTemplate = Layout.get(data.SessionKey);

    // clear previous timeouts, of last fades
    Meteor.clearTimeout(data.animationTimeout);


    // reloads the current template
    if(animateTemplate === 'reload') {
        var _animateTemplate = Layout.store['_'+ data.SessionKey];

        Layout.set(data.SessionKey, false);

        Meteor.defer(function(){
            Layout.set(data.SessionKey, _animateTemplate);
        });

    // render and show the template
    } else if(animateTemplate) {
        Layout.set('_'+ data.SessionKey, animateTemplate);
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
                Layout.set('_'+ data.SessionKey, false);
                data.animationTimeout = null;
            }, duration);
        }
    }

};


/**
Shows the template to animate. This gets the template from `'_' + SessionKey` set by the `reactiveAnimator` helper.

@method template
@return {Object} the current template
**/
Template['template-animation-helper'].template = function(){
    // use the view-manager package method
    if(typeof View !== 'undefined')
        return View.getTemplate(Layout.get('_'+ this.SessionKey));
    // just return a template
    else if(Template[Layout.get('_'+ this.SessionKey)]) {
        return Template[Layout.get('_'+ this.SessionKey)]();
    } else {
        return '';
    }
};