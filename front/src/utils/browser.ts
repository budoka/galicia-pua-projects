export function isIE() {
  const userAgent = window.navigator.userAgent;
  const msie = userAgent.indexOf('MSIE ') > -1;
  const msie11 = userAgent.indexOf('Trident/') > -1;

  // If you as a developer are testing using Edge InPrivate mode, please add "isEdge" to the if check
  // const isEdge = ua.indexOf("Edge/") > -1;

  return msie || msie11;
}
