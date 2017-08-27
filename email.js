require('dotenv').config();
var aws = require('aws-sdk');
var ses = new aws.SES({region: process.env.AWS_REGION});
var path = require('path');
var EmailTemplate = require('email-templates').EmailTemplate;

function Email(recipient, templateName, templateData) {
    this.recipient = recipient;
    this.templateName = templateName;
    this.templateData = templateData;
    this.templateData['recipient'] = this.recipient;
}

Email.prototype.send = function send(callback) {
    var recipient = this.recipient;
    var templateName = this.templateName;
    var templateData = this.templateData;
    (new EmailTemplate(path.join(__dirname, 'templates', templateName))).render(templateData, function (error, result) {
        if (error) return callback(error);

        var subject = {Data: result.subject};
        var body = "";
        switch (templateData.recipient.emailFormat) {
            case 'text':
                body = {Text: {Data: result.text}};
                break;
            default:
                body = {Html: {Data: result.html}};
        }

        var payload = {
            Destination: {ToAddresses: [recipient.emailAddress]},
            Message: {
                Body: body,
                Subject: subject
            },
            Source: process.env.FROM_ADDRESS
        };

        ses.sendEmail(payload, function (error, result) {
            if (error) return callback(error);
            return callback(null, {payload: payload, result: result});
        });
    });
};

module.exports = Email;