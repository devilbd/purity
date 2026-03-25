type Signal<T> = {
  (): T; // The "Getter"
  set(value: T): void;
  update(fn: (val: T) => T): void;
};

const context: Function[] = [];

export const signal = <T>(initialValue: T): Signal<T> => {
  let value = initialValue;
  const subscriptions = new Set<Function>();

  // 1. Define the getter function
  const getter = (() => {
    const running = context[context.length - 1];
    if (running) subscriptions.add(running);
    return value;
  }) as Signal<T>;

  // 2. Attach the "set" method
  getter.set = (nextValue: T) => {
    if (Object.is(value, nextValue)) return; // Angular-like optimization
    value = nextValue;
    subscriptions.forEach((sub) => sub());
  };

  // 3. Attach the "update" method (syntax sugar)
  getter.update = (fn: (val: T) => T) => {
    getter.set(fn(value));
  };

  return getter;
};

export const effect = (fn: Function) => {
  const execute = () => {
    context.push(execute);
    try {
      fn();
    } finally {
      context.pop();
    }
  };
  execute();
};

export const updateTargets = (
  elements: HTMLElement[],
  newValue: string | null,
  ifNullValue = ''
) => {
  if (elements) {
    elements.forEach((element) => {
      element.innerHTML = newValue ?? ifNullValue;
    });
  }
};

export const updateStyles = (elements: HTMLElement[], newValue: string) => {
  if (elements) {
    elements.forEach((element) => {
      element.className = newValue;
    });
  }
};

export const updateValues = (
  elements: HTMLInputElement[],
  newValue: string | null,
  ifNullValue = ''
) => {
  if (elements) {
    elements.forEach((element) => {
      element.value = newValue ?? ifNullValue;
    });
  }
};

export const getElement = (selector: string): HTMLElement | null => {
  const result = document.querySelector(selector);
  return result as HTMLElement;
};
