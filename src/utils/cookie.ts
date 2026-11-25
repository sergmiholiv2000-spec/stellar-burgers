export function getCookie(name: string): string | undefined {
  const cookie = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : undefined;
}

export function setCookie(
  name: string,
  value: string,
  props: Record<string, string | number | Date | boolean> = {}
): void {
  props = {
    path: '/',
    ...props,
  };

  let exp = props.expires;
  if (exp && typeof exp === 'number') {
    const d = new Date();
    d.setTime(d.getTime() + exp * 1000);
    exp = props.expires = d;
  }

  if (exp && exp instanceof Date) {
    props.expires = exp.toUTCString();
  }
  value = encodeURIComponent(value);
  let updatedCookie = name + '=' + value;
  for (const propName in props) {
    updatedCookie += '; ' + propName;
    const propValue = props[propName];
    if (propValue !== true) {
      updatedCookie += '=' + String(propValue);
    }
  }
  document.cookie = updatedCookie;
}

export function deleteCookie(name: string): void {
  setCookie(name, '', { expires: -1 });
}
