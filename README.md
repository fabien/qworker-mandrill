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
    }
  }
}
```

## Payload

All Mandrill message options are supported:

https://mandrillapp.com/api/docs/messages.nodejs.html

## Example

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