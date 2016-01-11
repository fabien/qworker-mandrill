# Qworker Mandrill

A PubSub enabled NodeJS worker for sending Mandrill mails.

## Configuration

Edit `config/datasources.local.json` as follows:

```
{
  "mandrill": {
    "name": "mandrill",
    "connector": "lb-connector-mandrill",
    "apikey": "<mandrill-api-key>",
    "defaults": {
      "subaccount": "<sub-account>"
    },
    "templates": {
      "path": "/path/to/templates",
      "options": {
        "juiceOptions": {
          "preserveMediaQueries": false,
          "removeStyleTags": false
        }
      }
    }
  }
}
```

## Payload

All Mandrill message options are supported [api docs](https://mandrillapp.com/api/docs/messages.nodejs.html):

## Usage

The following can be issued as a RESTful request:

POST http://localhost:3000/api/queue

```
{
  "name": "mandrill",
  "data": {
    "from": { "name": "Fabien Franzen", "email": "info@atelierfabien.be" },
    "to": "info@fabien.be",
    "subject": "Example",
    "text": "Plain text message",
    "html": "<b>Html message</b> here"
  }
}
```

Example of rendering local templates:

```
{
  "name": "mandrill",
  "data": {
    "from": { "name": "Fabien Franzen", "email": "info@atelierfabien.be" },
    "to": "info@fabien.be",
    "subject": "Example",
    "template": "alert",
    "content":  {
      "key": "value",
      "foo": "bar"
    }
  }
}
```

Finally, an example of rendering a stored Mandrill template:

```
{
  "name": "mandrill",
  "data": {
    "from": { "name": "Fabien Franzen", "email": "info@atelierfabien.be" },
    "to": "info@fabien.be",
    "subject": "Example",
    "template": {
      "name": "alert",
      "content": {
        "key": "value",
        "foo": "bar"
      }
    }
  }
}
```

All styles for Html will be inlined using [Juice](https://github.com/Automattic/juice).

## Templates

Templates are rendered by [node-email-templates-v2](https://github.com/snow01/node-email-templates-v2), and automatically have their styles inlined by Juice.

They are located in qworker-mandrill by default (the contents of this 
directory is ignored by Git).

A template is actually a directory, with the following files:

```
html.{{ext}}    (required)
text.{{ext}}    (optional)
style.{{ext}}   (optional)
subject.{{ext}} (optional)
```

Where `{{ext}}` refers to either .nunjucks (for templates) or .css/less.
