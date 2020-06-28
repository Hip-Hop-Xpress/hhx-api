# Errors

Errors can happen for multiple reasons - invalid parameters, wrong endpoint address, or even server-side issues. We will use conventional [HTTP response codes](#http-code-status-summary): `2xx` codes indicate success, `4xx` codes indicate errors in the information provided (typo in endpoint addresses, required attribute was omitted, etc.), and `5xx` codes indicate an error on our end.

We will also use specific [error types](#error-types) and [responses](#error-object) so you can better understand what happened and how to fix the issue.

## HTTP Code Status Summary
Code | Description
-|-
`200` - Ok! | Everything worked!
`404` - Not found | The resource endpoint requested was not found. Usually due to an incorrect HTTP verb for requested endopint, or a typo in the endpoint address
`422` - Invalid parameters | The request body contains invalid attributes or omits reqiured ones.
`500` - Internal server error | Something went wrong on our end! This is also the "default" error code - if an unintentional or uncaught error occurs, this will be the error code.

## Error types
These types will be included in the [body](#error-object) of error responses so you can better understand the error that occurred.

Type | Description
-|-
api_error | an error popped up on our end - if persistent, contact us!
invalid_endpoint_error | the requested endpoint doesn't exist - usually due to an incorrect HTTP verb or typo in the endpoint address
invalid_request_error | the endpoint was reached, but data in the body request was invalid or omitted and is required
id_not_found_error | the endpoint was reached, but the document/object with specified ID was not found
rate_limit_error | too many requests in a short amount of time

## Error object
All error responses will contain an error object that looks something like this:
```json
{
  "type": "specific error type",
  "code": "HTTP error code",
  "message": "human-readable message explaining the error",
  "param": "if applicable, the invalid/omitted parameter",
}
```
### Attributes
Name | Data type | Description
-|-|-
`type` | `string` | the specific error type, as defined [here](#error-types)
`code` | `string` | the [HTTP error response code](#http-code-status-summary)
`message` | `string` | a human-readable message explaining the error
`param` | `string` | the invalid/omitted parameter in the request body, if applicable
