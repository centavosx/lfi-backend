export type ParameterIdOptions = {
  mePattern?: boolean;
  customPattern?: string;
};
export class Parameter {
  static id(
    name = 'id',
    options: ParameterIdOptions = { mePattern: true },
  ): string {
    return `:${name}(${
      options.customPattern || '[0-f]{8}-[0-f]{4}-[0-f]{4}-[0-f]{4}-[0-f]{12}'
    }${options.mePattern ? '|me' : ''})`;
  }
}
