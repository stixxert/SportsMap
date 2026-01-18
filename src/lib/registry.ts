export type Callback<I, O> = (input: I) => O;

export type SubscribeFn<I, O> = (callback: Callback<I, O>) => () => void;

export interface IRegistry<I, O> {
  subscribe: SubscribeFn<I, O>;
  callbacks: Callback<I, O>[];
}

export function createSubscribeRegistry<I = undefined, O = void>(): IRegistry<
  I,
  O
> {
  const registry: IRegistry<I, O> = {
    callbacks: [],
    subscribe: (callback: Callback<I, O>) => {
      registry.callbacks.push(callback);

      return () => {
        registry.callbacks = registry.callbacks.filter((cb) => cb !== callback);
      };
    },
  };

  return registry;
}

export type TObject = { [key: string]: unknown };

export type ExtendFn = (extension: TObject) => void;

export interface IObjectExtension {
  extend: ExtendFn;
  object: TObject;
}

export function createObjectExtension(): IObjectExtension {
  const extension: IObjectExtension = {
    object: {},
    extend: (appendExtension: TObject) => {
      extension.object = Object.assign({}, extension.object, appendExtension);
    },
  };

  return extension;
}
