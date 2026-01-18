export function addEventListener(eventName, callbackFunction) {
  const eventCallbacks = this.callbacks.get(eventName) ?? [];
  eventCallbacks.push(callbackFunction);
  this.callbacks.set(eventName, eventCallbacks);
}
export function removeEventListener(eventName, callbackFunction) {
  const eventCallbacks = this.callbacks.get(eventName) ?? [];
  const updatedCallbacks = eventCallbacks.filter((func) => {
    return func !== callbackFunction;
  });
  this.callbacks.set(eventName, updatedCallbacks);
}
export function emitEvent(eventName, ...args) {
  const eventCallbacks = this.callbacks.get(eventName) ?? [];
  for (const thisEvent of eventCallbacks) {
    thisEvent(...args);
  }
}
/**
 * PROXY HANDLERS
 */
export function setHandler(target, property, value, receiver) {
  //console.log('set',{target, property, value, receiver});
  const add = typeof this[property] == "undefined" && typeof value !== "undefined";
  const change = this[property] !== value;
  const returnValue = Reflect.set(target, property, value, receiver);
  const valueIsArray = target instanceof Array;
  //const valueIsFunction = (typeof returnValue == 'function');
  // for [].push(), The emit event will fire twice - due to new value index and again due to length change
  const suppressEvent = valueIsArray && property === "length";
  if (receiver.emitEvent) {
    receiver.emitEvent("set", property, value);
    receiver.emitEvent(property, value); 
    if (add && !suppressEvent) {
      receiver.emitEvent("add", property, value);
    }
    if (change && !suppressEvent) {
      receiver.emitEvent("change", property, value);
    }
  }
  return returnValue;
}
export function deleteHandler(target, property) {
  const del = target[property] !== undefined;
  const returnValue = Reflect.deleteProperty(target, property);
  if (this.emitEvent) {
    if (del) {
      this.emitEvent("delete", property, { target });
    }
    this.emitEvent("change", undefined, property);
  }
  return returnValue;
}
export function constructHandler(target, argArray, newTarget) {
  const returnValue = Reflect.construct(target, argArray, newTarget);
  const proxyReturnValue = makeObservable(returnValue);
  target.emitEvent("create", returnValue);
  return proxyReturnValue;
}
export function keysHandler(target) {
  let result = Reflect.ownKeys(target);
  if (target instanceof Array) {
    const removeAttrs = ["callbacks", "addEventListener", "removeEventListener", "emitEvent"];
    result = result.filter((key) =>
      typeof key == "symbol" ||
      removeAttrs.indexOf(key) === -1
    );
  }
  return result;
}
export const defaultHandler = {
  set: setHandler,
  deleteProperty: deleteHandler,
  construct: constructHandler,
  ownKeys: keysHandler,
};
/**
 * DECORATORS
 */
export function makeObservable(obj, handler = defaultHandler) {
  const objProxy = new Proxy(obj, handler);
  makeEventEmitter(objProxy);
  return objProxy;
}
export function makeEventEmitter(obj) {
  obj.callbacks = obj.callbacks || new Map();
  obj.addEventListener = addEventListener;
  obj.removeEventListener = removeEventListener;
  obj.emitEvent = emitEvent;
  return obj;
}
export function EventEmitter(constructor) {
  return class extends constructor {
    constructor() {
      super(...arguments);
      this.callbacks = new Map();
      this.addEventListener = addEventListener;
      this.removeEventListener = removeEventListener;
      this.emitEvent = emitEvent;
    }
  };
}