import {
  registerDecorator,
  ValidationOptions
} from "class-validator";
import logger from "./logger";

interface IsFileOptions {
  mime: ("image/jpg" | "image/png" | "image/jpeg")[];
}

export function IsFile(
  options: IsFileOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: Object, propertyName: string) {
    return registerDecorator({
      name: "isFile",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (
            value?.mimetype &&
            (options?.mime ?? []).includes(value?.mimetype)
          ) {
            return true;
          }
          return false;
        }
      }
    });
  };
}
