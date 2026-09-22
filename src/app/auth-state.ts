let authenticated = false;

export function isAuthenticated() {
  return authenticated;
}

export function setAuthenticated(value: boolean) {
  authenticated = value;
}