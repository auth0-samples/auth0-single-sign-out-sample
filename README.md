# Auth0 Single Sign-Out Sample

Enterprise users will typically have SSO enabled for multiple applications (eg: SharePoint, a few .NET applications, a few Java applications, Zendesk, ...). In this case it's very common that when users sign out this needs to happen for all of their applications.

The [logout endpoint](https://auth0.com/docs/logout) in Auth0 can work in 2 ways:

 - Clear the SSO cookie in Auth0
 - Clear the SSO cookie in Auth0 and sign out from the IdP (eg: ADFS)

By simply redirecting users to the logout endpoint this does not cover the scenario where users need to be signed out from all of the applications they used.

In the user's SSO session Auth0 will keep track of each application the user signed in to. This sample shows how to use this information to sign out from each application before clearing the SSO cookie in Auth0.

## Configuring Auth0

This sample is an Angular.js application which is also registered as an application in Auth0.

![Single Sign-Out Config](https://cdn.auth0.com/docs/img/single-sign-out-config.png)

All of the applications you are using, including the "logout application" need to be enabled for SSO. 

## How it works

When we call the `getSSOData` method on the client-side SDK we'll see the following:

```
{
 "err": null,
 "ssoData": {
  "sso": true,
  "sessionClients": [
   "ATqGIGvsX5d9AWiOypgPOEBGkOVbrf55",
   "ZDC7qh6mcXaQT6ilyiTWPmmfFI7L0aTs",
   "bOFty3tWgpijnwMcltysNFqHgO1ziz1I"
  ],
  "lastUsedClientID": "bOFty3tWgpijnwMcltysNFqHgO1ziz1I",
  "lastUsedUsername": "mary@fabrikamcorp.com",
  "lastUsedConnection": {
   "name": "FabrikamAD",
   "strategy": "ad"
  }
 }
}
```
 
This means the user logged in to 3 different applications (`sessionClients`). The sample application will render an iframe for all of the applications (it's the responsablity of the logout application to know the url of the logout endpoint, this information is not available in Auth0.

```js
  var clients = {
    'ATqGIGvsX5d9AWiOypgPOEBGkOVbrf55': {
      name: 'JWT Debugger',
      logout_url: 'http://fabrikam-jwt.azurewebsites.net/'
    },
    'bOFty3tWgpijnwMcltysNFqHgO1ziz1I': {
      name: 'SharePoint Intranet',
      logout_url: 'http://sp.fabrikamcorp.com/_layouts/15/SignOut.aspx'
    },
    'h2NE1kxhzzFgLpNBvcCuyefjfwFVGx49': {
      name: 'Timesheet SaaS',
      logout_url: 'http://fabrikam-timesheets.azurewebsites.net/account/logoff'
    }
  };
```

Once the users are logged out from all of the applications they'll be redirected to the logout endpoint in Auth0 to clear the SSO cookie. If any of the applications fail to respond within the configured timeout (5sec) an error will show on the screen.

*Note that for this to work, all of the applications need to have a logout endpoint accessible from a GET*

## Example

Mary logged in to all of the applications configured in the Fabrikam account (JWT Debugger, SharePoint Intranet and Timesheet SaaS). When she hits the "Sign-out" button in one of these applications it should redirect to the "Single-Logout application" which Fabrikam is hosting somewhere (eg: https://fabrikam-logout.azurewebsites.net).

The logout application will use Mary's SSO cookie to determine from which applications she needs to sign out and render iframes pointing to the logout endpoints for each of these applications.

![Logout Working](https://cdn.auth0.com/docs/img/single-sign-out-working.png)

Once logout is complete in all of these applications Mary can hit the continue button which will redirect to Auth0 and remove her SSO cookie there (and optionally also sign out from the IdP, like ADFS). Finally Mary is returned to the logout appliation which shows she's been logged out.

![Logout Complete](https://cdn.auth0.com/docs/img/single-sign-out-complete.png)

## Considerations

The complete single sign-out flow is based on the SSO cookie in Auth0 and rendering iframes. Take into account that:

 - For the IFRAMES, there's no way to detect if the IFRAME rendered correctly. You can only detect if it completed or not. For slow applications, if it takes more than 5 seconds to sign out the sample will show a red line instead of the green line.
 - Depending on specific browser settings there might be issues with the SSO cookie or the rendering of the IFRAME. 
  - In IE for example a setting called "Protected Mode" should be disabled or your applications will need a P3P header for this to work correctly (http://stackoverflow.com/questions/389456/cookie-blocked-not-saved-in-iframe-in-internet-explorer).
  - In Safari (depending on your settings) cookies might be restricted to a specific tab (and not shared over different tabs).

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Responsible Disclosure Program](https://auth0.com/whitehat) details the procedure for disclosing security issues.

## Author

[Auth0](auth0.com)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.


