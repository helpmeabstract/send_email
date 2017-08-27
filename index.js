var Email = require('./email');
var path = require('path');
var fs = require('fs');

var Validator = {
    validEmail: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    validateRecipient: function (recipient) {
        if (typeof recipient.emailAddress === 'undefined') throw new Error("Recipient email address is required");
        if (!this.validEmail.test(recipient.emailAddress)) throw new Error("Recipient email address '" + recipient.emailAddress + "' does not pass validation");
        if (typeof recipient.name === 'undefined') throw new Error("Recipient name is required");
    },
    validateTemplateName: function (templateName) {
        if (typeof templateName === 'undefined') throw new Error("Template name is required");
        if (!fs.existsSync(path.join(__dirname, 'templates', templateName))) throw new Error("Template name '" + templateName + "' not found");
    },
    validateTemplateData: function (templateData) {
        if (typeof templateData !== "object") throw new Error("Template data must be an object. Got: ", templateData);
    },
    validateEvent: function (event) {
        this.validateRecipient(event.recipient);
        this.validateTemplateName(event.templateName);
        this.validateTemplateData(event.templateData);
    }
};

exports.handler = function (event, context) {
    try {
        Validator.validateEvent(event);
        (new Email(event.recipient, event.templateName, event.templateData)).send(function (err, result) {
            if (err) context.fail(err);
            context.succeed(result);
        });
    } catch (error) {
        context.fail(error);
    }
};
