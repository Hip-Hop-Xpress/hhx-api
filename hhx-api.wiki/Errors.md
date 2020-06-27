# Errors

Errors can happen for multiple reasons - invalid parameters, wrong endpoint address, or even server-side issues. We will use conventional [HTTP response codes](#http-code-status-summary): `2xx` codes indicate success, `4xx` codes indicate errors in the information provided (typo in endpoint addresses, required attribute was omitted, etc.), and `5xx` codes indicate an error on our end.

We will also use specific [error types](#error-types) and [responses](#error-object) so you can better understand what happened and how to fix the issue.

## HTTP Code Status Summary
Code | Description
-|-
`200` - Ok! | Everything worked!
`404` - Not found | The resource requested was not found. For example, a requested object with a specific `id` can't be found, or an endpoint address does not exist.
`422` - Invalid parameters | The request body contains invalid attributes or omits reqiured ones.
`500` - Internal server error | Something went wrong on our end! This is also the "default" error code - if an unintentional or uncaught error occurs, this will be the error code.

## Error types
These types will be included in the [body](#error-object) of error responses so you can better understand the error that occurred.
Type | Description
-|-

## Error object
All error responses will contain an error object will look something like this:
```json
{
  // error will go here
}
```

