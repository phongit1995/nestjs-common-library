import { Transform } from 'class-transformer';
import { isArray, map, trim, isNil, castArray, toNumber } from 'lodash';

export function Trim(): PropertyDecorator {
  return Transform((params) => {
    const value = params.value as string[] | string;

    if (isArray(value)) {
      return map(value, (v) => trim(v).replace(/\s\s+/g, ' '));
    }

    return trim(value).replace(/\s\s+/g, ' ');
  });
}
export function ToLowerCase(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value;

      if (!value) {
        return;
      }

      if (!Array.isArray(value)) {
        return value.toLowerCase();
      }

      return value.map((v) => v.toLowerCase());
    },
    {
      toClassOnly: true,
    },
  );
}

export function ToUpperCase(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value;

      if (!value) {
        return;
      }

      if (!Array.isArray(value)) {
        return value.toUpperCase();
      }

      return value.map((v) => v.toUpperCase());
    },
    {
      toClassOnly: true,
    },
  );
}

export function ToArray(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value;

      if (isNil(value)) {
        return [];
      }

      return castArray(value);
    },
    { toClassOnly: true },
  );
}
export function ToLongLat(): PropertyDecorator {
  return Transform(
    (params) => {
      const value = params.value;

      if (isNil(value)) {
        return [];
      }

      return (params.value as string[]).reverse().map((i) => toNumber(i));
    },
    { toClassOnly: true },
  );
}